from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Optional
from uuid import UUID

import redis.asyncio as aioredis
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.credit_repo import CreditRepository
from ..repositories.order_repo import MarketOrderRepository, ProposalRepository, TradeRepository
from ..schemas.market import CreateProposalRequest, OrderType, PlaceOrderRequest, ProposalResponse, TradeReceiptResponse
from . import wallet_service

logger = logging.getLogger(__name__)


# ─── Settlement Engine ─────────────────────────────────────────────────────────


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
    4. Mark both orders FILLED
    5. Commit the transaction atomically
    6. Always release lock in finally
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

        # Debit buyer wallet before settlement
        wallet_service.debit_buyer(buyer_org_id, total_value, UUID("00000000-0000-0000-0000-000000000000"), db)

        trade = trade_repo.create(
            buyer_org_id=UUID(buyer_org_id),
            seller_org_id=UUID(seller_org_id),
            quantity=quantity,
            price_per_unit=price_per_unit,
            total_value=total_value,
        )

        # Update the wallet transaction reference to the real trade id
        from ..repositories.wallet_repo import WalletTransactionRepository
        wtxn_repo = WalletTransactionRepository(db)
        buyer_txns = wtxn_repo.list_by_org(buyer_org_id, limit=1)
        if buyer_txns and buyer_txns[0].txn_type == "TRADE_DEBIT":
            buyer_txns[0].reference_id = trade.id

        # Credit seller wallet
        wallet_service.credit_seller(seller_org_id, total_value, trade.id, db)

        order_repo.mark_filled(buy_order_id)
        order_repo.mark_filled(sell_order_id)

        db.commit()

        logger.info(
            "Trade %s settled: %d credits @ %.2f each (buyer=%s seller=%s)",
            trade.id, quantity, price_per_unit, buyer_org_id, seller_org_id,
        )

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
        db.rollback()
        logger.warning("Trade settlement failed — transaction rolled back.")
        raise

    finally:
        await redis.delete(lock_key)


# ─── Order Placement ───────────────────────────────────────────────────────────


async def place_order(
    req: PlaceOrderRequest, user_id: str, db: Session, redis: aioredis.Redis
) -> dict[str, Any]:
    """
    Place a buy/sell order. If a compatible counterparty already exists the
    trade is settled immediately (Reserve-then-Commit). Otherwise the order
    is persisted as OPEN and waits for a future match.
    """
    order_repo = MarketOrderRepository(db)

    # Persist the new order first so it gets a real DB id before any matching.
    new_order = order_repo.create(
        organization_id=req.organization_id,
        order_type=req.order_type.value,
        quantity=req.quantity,
        price_per_unit=req.price_per_unit,
        status="OPEN",
        vintage_year=req.vintage_year,
        project_type=req.project_type,
    )
    new_order_id = str(new_order.id)

    match = order_repo.find_open_counterparty(
        req.order_type.value,
        req.price_per_unit,
        vintage_year=req.vintage_year,
        project_type=req.project_type,
    )

    if match:
        if req.order_type == OrderType.BUY:
            buyer_id, seller_id = str(req.organization_id), str(match.organization_id)
            buy_oid, sell_oid = new_order_id, str(match.id)
        else:
            buyer_id, seller_id = str(match.organization_id), str(req.organization_id)
            buy_oid, sell_oid = str(match.id), new_order_id

        settle_qty = min(req.quantity, match.quantity)
        receipt = await _settle_trade(
            buyer_org_id=buyer_id,
            seller_org_id=seller_id,
            quantity=settle_qty,
            price_per_unit=req.price_per_unit,
            buy_order_id=buy_oid,
            sell_order_id=sell_oid,
            db=db,
            redis=redis,
        )
        return {"matched": True, "order_id": new_order_id, "trade": receipt.model_dump(mode="json")}

    db.commit()
    return {"matched": False, "order_id": new_order_id, "status": "OPEN"}


# ─── Credit Queries ────────────────────────────────────────────────────────────


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
            "current_owner_id": str(c.current_owner_id) if c.current_owner_id else None,
        }
        for c in credits
    ]


def retire_credits(credit_ids: list[str], user_id: str, db: Session) -> dict:
    """Permanently retire carbon credits (CCTS compliance action)."""
    CreditRepository(db).set_status_bulk(credit_ids, "RETIRED")
    db.commit()
    logger.info("User %s retired %d credits.", user_id, len(credit_ids))
    return {"retired_count": len(credit_ids), "credit_ids": credit_ids}


# ─── Order Queries ─────────────────────────────────────────────────────────────


def cancel_order(order_id: str, user_id: str, db: Session) -> dict:
    """Cancel an open market order."""
    order = MarketOrderRepository(db).mark_cancelled(order_id)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")
    db.commit()
    return {"order_id": order_id, "status": "CANCELLED"}


def list_orders(org_id: str, db: Session) -> list[dict]:
    """Return all market orders placed by an organization."""
    orders = MarketOrderRepository(db).list_by_organization(org_id)
    return [
        {
            "id": str(o.id),
            "organization_id": str(o.organization_id),
            "order_type": o.order_type,
            "quantity": o.quantity,
            "price_per_unit": float(o.price_per_unit),
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "vintage_year": o.vintage_year,
            "project_type": o.project_type,
        }
        for o in orders
    ]


def list_trades(org_id: str, db: Session) -> list[dict]:
    """Return all trades involving an organization (as buyer or seller)."""
    trades = TradeRepository(db).list_by_organization(org_id)
    return [
        {
            "id": str(t.id),
            "buyer_org_id": str(t.buyer_org_id),
            "seller_org_id": str(t.seller_org_id),
            "quantity": t.quantity,
            "price_per_unit": float(t.price_per_unit),
            "total_value": float(t.total_value),
            "settled_at": t.settled_at.isoformat() if t.settled_at else None,
        }
        for t in trades
    ]


def get_market_book(db: Session) -> list[dict]:
    """Return all open SELL orders across the platform (the public order book)."""
    orders = MarketOrderRepository(db).list_market_orders()
    return [
        {
            "id": str(o.id),
            "organization_id": str(o.organization_id),
            "order_type": o.order_type,
            "quantity": o.quantity,
            "price_per_unit": float(o.price_per_unit),
            "status": o.status,
            "created_at": o.created_at.isoformat() if o.created_at else None,
            "vintage_year": o.vintage_year,
            "project_type": o.project_type,
        }
        for o in orders
    ]


# ─── Proposal / RFQ Flow ─────────────────────────────────────────────────────


def _proposal_to_dict(p) -> dict:
    return {
        "id": str(p.id),
        "sell_order_id": str(p.sell_order_id),
        "buyer_org_id": str(p.buyer_org_id),
        "seller_org_id": str(p.seller_org_id),
        "quantity": p.quantity,
        "asking_price": float(p.asking_price),
        "proposed_price": float(p.proposed_price),
        "total_value": float(p.total_value),
        "status": p.status,
        "buyer_note": p.buyer_note,
        "rejection_reason": p.rejection_reason,
        "trade_id": str(p.trade_id) if p.trade_id else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "responded_at": p.responded_at.isoformat() if p.responded_at else None,
        "expires_at": p.expires_at.isoformat() if p.expires_at else None,
        "project_type": p.project_type,
        "vintage_year": p.vintage_year,
    }


def create_proposal(req: CreateProposalRequest, user_id: str, db: Session) -> dict:
    """Buyer creates a price proposal against an open SELL order."""
    proposal_repo = ProposalRepository(db)

    from ..models.order import MarketOrder
    sell_order = db.query(MarketOrder).filter(
        MarketOrder.id == str(req.sell_order_id),
        MarketOrder.status == "OPEN",
        MarketOrder.order_type == "SELL",
    ).first()

    if not sell_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sell order not found or no longer open.",
        )

    if str(sell_order.organization_id) == str(req.buyer_org_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot propose on your own listing.",
        )

    if req.quantity > sell_order.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Requested quantity ({req.quantity}) exceeds available ({sell_order.quantity}).",
        )

    total_value = Decimal(req.quantity) * req.proposed_price

    from datetime import timedelta
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    proposal = proposal_repo.create(
        sell_order_id=req.sell_order_id,
        buyer_org_id=req.buyer_org_id,
        seller_org_id=sell_order.organization_id,
        quantity=req.quantity,
        asking_price=sell_order.price_per_unit,
        proposed_price=req.proposed_price,
        total_value=total_value,
        status="PENDING",
        buyer_note=req.buyer_note,
        project_type=sell_order.project_type,
        vintage_year=sell_order.vintage_year,
        expires_at=expires_at,
    )

    db.commit()
    logger.info("Proposal %s created by org %s for order %s", proposal.id, req.buyer_org_id, req.sell_order_id)
    return _proposal_to_dict(proposal)


async def accept_proposal(
    proposal_id: str, user_id: str, db: Session, redis: aioredis.Redis
) -> dict:
    """Seller accepts a proposal — settles the trade atomically."""
    from datetime import datetime as dt
    proposal_repo = ProposalRepository(db)
    proposal = proposal_repo.get_by_id(proposal_id)

    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")
    if proposal.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Proposal is already {proposal.status}.")

    from ..models.order import MarketOrder
    sell_order = db.query(MarketOrder).filter(
        MarketOrder.id == str(proposal.sell_order_id),
        MarketOrder.status == "OPEN",
    ).first()

    if not sell_order:
        proposal_repo.update_status(proposal_id, "CANCELLED", responded_at=datetime.now(timezone.utc))
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sell order is no longer open.")

    order_repo = MarketOrderRepository(db)
    buy_order = order_repo.create(
        organization_id=proposal.buyer_org_id,
        order_type="BUY",
        quantity=proposal.quantity,
        price_per_unit=proposal.proposed_price,
        status="OPEN",
        vintage_year=proposal.vintage_year,
        project_type=proposal.project_type,
    )

    receipt = await _settle_trade(
        buyer_org_id=str(proposal.buyer_org_id),
        seller_org_id=str(proposal.seller_org_id),
        quantity=proposal.quantity,
        price_per_unit=proposal.proposed_price,
        buy_order_id=str(buy_order.id),
        sell_order_id=str(proposal.sell_order_id),
        db=db,
        redis=redis,
    )

    proposal_repo.update_status(
        proposal_id,
        "ACCEPTED",
        responded_at=datetime.now(timezone.utc),
        trade_id=receipt.trade_id,
    )

    db.commit()
    logger.info("Proposal %s accepted — trade %s settled", proposal_id, receipt.trade_id)
    return {
        "proposal": _proposal_to_dict(proposal_repo.get_by_id(proposal_id)),
        "trade": receipt.model_dump(mode="json"),
    }


def reject_proposal(proposal_id: str, rejection_reason: Optional[str], user_id: str, db: Session) -> dict:
    """Seller rejects a proposal."""
    proposal_repo = ProposalRepository(db)
    proposal = proposal_repo.get_by_id(proposal_id)

    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")
    if proposal.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Proposal is already {proposal.status}.")

    proposal_repo.update_status(
        proposal_id,
        "REJECTED",
        responded_at=datetime.now(timezone.utc),
        rejection_reason=rejection_reason,
    )
    db.commit()
    logger.info("Proposal %s rejected by seller", proposal_id)
    return _proposal_to_dict(proposal_repo.get_by_id(proposal_id))


def cancel_proposal(proposal_id: str, user_id: str, db: Session) -> dict:
    """Buyer cancels their own pending proposal."""
    proposal_repo = ProposalRepository(db)
    proposal = proposal_repo.get_by_id(proposal_id)

    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found.")
    if proposal.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Proposal is already {proposal.status}.")

    proposal_repo.update_status(proposal_id, "CANCELLED", responded_at=datetime.now(timezone.utc))
    db.commit()
    logger.info("Proposal %s cancelled by buyer", proposal_id)
    return _proposal_to_dict(proposal_repo.get_by_id(proposal_id))


def list_proposals(org_id: str, role: Optional[str], db: Session) -> list[dict]:
    """List proposals for an org. role=buyer|seller|None (all)."""
    proposal_repo = ProposalRepository(db)
    if role == "buyer":
        proposals = proposal_repo.list_by_buyer(org_id)
    elif role == "seller":
        proposals = proposal_repo.list_by_seller(org_id)
    else:
        proposals = proposal_repo.list_by_organization(org_id)
    return [_proposal_to_dict(p) for p in proposals]
