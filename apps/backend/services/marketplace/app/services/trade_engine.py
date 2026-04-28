from __future__ import annotations

import logging
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.credit_repo import CreditRepository
from ..repositories.order_repo import MarketOrderRepository, TradeRepository
from ..schemas.market import OrderType, PlaceOrderRequest, TradeReceiptResponse

logger = logging.getLogger(__name__)


# ─── Trade Engine — Pure Functions ────────────────────────────────────────────


async def _settle_trade(
    buyer_org_id: str,
    seller_org_id: str,
    quantity: int,
    price_per_unit: Decimal,
    buy_order_id: str,
    sell_order_id: str,
    db: Session,
    redis: aioredis.Redis,
    lock_ttl: int = 30,
) -> TradeReceiptResponse:
    """
    Reserve-then-Commit settlement:
    1. Acquire Redis distributed lock on seller
    2. Reserve credits (PENDING_TRANSFER)
    3. Transfer ownership + persist trade
    4. Mark orders FILLED
    5. Always release lock
    """
    lock_key = f"trade_lock:{seller_org_id}"
    acquired = await redis.set(lock_key, "1", nx=True, ex=lock_ttl)
    if not acquired:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A trade is in progress for this seller. Retry shortly.",
        )

    credit_repo = CreditRepository(db)
    order_repo = MarketOrderRepository(db)
    trade_repo = TradeRepository(db)
    reserved_ids: list[str] = []

    try:
        available = credit_repo.find_available_for_seller(seller_org_id, quantity)
        if len(available) < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient credits: requested {quantity}, available {len(available)}.",
            )

        reserved_ids = [str(c.id) for c in available]
        serial_numbers = [c.serial_number for c in available]

        credit_repo.set_status_bulk(reserved_ids, "PENDING_TRANSFER")
        credit_repo.transfer_ownership(reserved_ids, buyer_org_id)

        total_value = Decimal(quantity) * price_per_unit
        trade = trade_repo.create(
            buyer_org_id=UUID(buyer_org_id),
            seller_org_id=UUID(seller_org_id),
            quantity=quantity,
            price_per_unit=price_per_unit,
            total_value=total_value,
        )

        order_repo.mark_filled(buy_order_id)
        order_repo.mark_filled(sell_order_id)

        logger.info("Trade %s settled: %d credits @ %.2f each", trade.id, quantity, price_per_unit)

        return TradeReceiptResponse(
            trade_id=trade.id,
            buyer_org_id=UUID(buyer_org_id),
            seller_org_id=UUID(seller_org_id),
            quantity=quantity,
            price_per_unit=price_per_unit,
            total_value=total_value,
            serial_numbers=serial_numbers,
        )

    except Exception:
        if reserved_ids:
            credit_repo.set_status_bulk(reserved_ids, "ISSUED")
            logger.warning("Trade rolled back — %d credits restored to ISSUED.", len(reserved_ids))
        raise

    finally:
        await redis.delete(lock_key)


async def place_order(
    req: PlaceOrderRequest, user_id: str, db: Session, redis: aioredis.Redis
) -> dict[str, Any]:
    """Place a buy/sell order. Auto-matches and settles if a counterparty exists."""
    order_repo = MarketOrderRepository(db)
    match = order_repo.find_open_counterparty(
        req.order_type.value, req.price_per_unit,
        vintage_year=req.vintage_year, project_type=req.project_type,
    )

    if match:
        if req.order_type == OrderType.BUY:
            buyer_id, seller_id = str(req.organization_id), str(match.organization_id)
            buy_oid, sell_oid = str(_new_order_id()), str(match.id)
        else:
            buyer_id, seller_id = str(match.organization_id), str(req.organization_id)
            buy_oid, sell_oid = str(match.id), str(_new_order_id())

        receipt = await _settle_trade(
            buyer_org_id=buyer_id,
            seller_org_id=seller_id,
            quantity=min(req.quantity, match.quantity),
            price_per_unit=req.price_per_unit,
            buy_order_id=buy_oid,
            sell_order_id=sell_oid,
            db=db,
            redis=redis,
        )
        return {"matched": True, "trade": receipt.model_dump(mode="json")}

    order = order_repo.create(
        organization_id=req.organization_id,
        order_type=req.order_type.value,
        quantity=req.quantity,
        price_per_unit=req.price_per_unit,
        status="OPEN",
        vintage_year=req.vintage_year,
        project_type=req.project_type,
    )
    return {"matched": False, "order_id": str(order.id), "status": "OPEN"}


def list_credits(org_id: str, db: Session) -> list[dict]:
    """Return all carbon credits owned by an organization."""
    credits = CreditRepository(db).find_by_owner(org_id)
    return [
        {
            "id": str(c.id),
            "serial_number": c.serial_number,
            "vintage_year": c.vintage_year,
            "project_type": c.project_type,
            "status": c.status,
            "current_owner_id": str(c.current_owner_id),
        }
        for c in credits
    ]


def retire_credits(credit_ids: list[str], user_id: str, db: Session) -> dict:
    """Permanently retire carbon credits (CCTS compliance action)."""
    CreditRepository(db).set_status_bulk(credit_ids, "RETIRED")
    logger.info("User %s retired %d credits.", user_id, len(credit_ids))
    return {"retired_count": len(credit_ids), "credit_ids": credit_ids}


def cancel_order(order_id: str, user_id: str, db: Session) -> dict:
    """Cancel an open market order."""
    order = MarketOrderRepository(db).mark_cancelled(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    return {"order_id": order_id, "status": "CANCELLED"}


def _new_order_id() -> str:
    import uuid
    return str(uuid.uuid4())
