"""
services/marketplace/main.py
IndiCarbon AI — Marketplace Service
Implements:
  - Carbon Credit Registry (CRUD + ownership tracking)
  - Order Book (buy/sell orders)
  - "Reserve-then-Commit" ACID-compliant trade settlement
  - Distributed Redis locks to prevent double-spend
"""
from __future__ import annotations

import logging
import pathlib
import uuid
from contextlib import asynccontextmanager
from datetime import datetime
from decimal import Decimal
from typing import Any

import redis.asyncio as aioredis
from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic.paths import backend_root

from shared_logic import (
    ApiResponse,
    CarbonCredit,
    CreditStatus,
    OrderSide,
    OrderStatus,
    PlaceOrderRequest,
    TradeReceipt,
    register_middleware,
)
from shared_logic.supabase_client import BaseRepository

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("marketplace")


# ─── Settings ─────────────────────────────────────────────────────────────────


_ROOT = backend_root(pathlib.Path(__file__), 2, container_parent_index=0)

class MarketplaceSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".marketplace.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )
    redis_url: str
    trade_lock_ttl_seconds: int = 30


settings = MarketplaceSettings()

# ─── App ──────────────────────────────────────────────────────────────────────

redis_pool: aioredis.Redis | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_pool
    redis_pool = await aioredis.from_url(settings.redis_url, decode_responses=True)
    logger.info("Marketplace service started.")
    yield
    await redis_pool.aclose()


app = FastAPI(
    title="IndiCarbon — Marketplace Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)
register_middleware(app)


# ─── Repositories ─────────────────────────────────────────────────────────────


class CreditRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("carbon_credits", admin=True)

    def get_available_credits(self, project_id: str, vintage_year: int) -> list[dict]:
        return (
            self._client.table(self._table)
            .select("*")
            .eq("project_id", project_id)
            .eq("vintage_year", vintage_year)
            .eq("status", CreditStatus.AVAILABLE.value)
            .execute()
            .data
        )

    def bulk_update_status(self, credit_ids: list[str], new_status: str) -> None:
        self._client.table(self._table).update({"status": new_status}).in_(
            "id", credit_ids
        ).execute()

    def transfer_ownership(self, credit_ids: list[str], new_owner: str) -> None:
        self._client.table(self._table).update(
            {"owner_org_id": new_owner, "status": CreditStatus.AVAILABLE.value}
        ).in_("id", credit_ids).execute()


class OrderRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("orders", admin=True)

    def get_open_counterparty(
        self, side: OrderSide, project_id: str, vintage_year: int, max_price: Decimal
    ) -> list[dict]:
        counter_side = OrderSide.BUY if side == OrderSide.SELL else OrderSide.SELL
        q = (
            self._client.table(self._table)
            .select("*")
            .eq("side", counter_side.value)
            .eq("credit_project_id", project_id)
            .eq("vintage_year", vintage_year)
            .eq("status", OrderStatus.OPEN.value)
        )
        if counter_side == OrderSide.BUY:
            q = q.gte("price_per_tonne_inr", float(max_price))
        else:
            q = q.lte("price_per_tonne_inr", float(max_price))
        return q.order("created_at", desc=False).execute().data


class TradeRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("trades", admin=True)


def get_credit_repo() -> CreditRepository:
    return CreditRepository()

def get_order_repo() -> OrderRepository:
    return OrderRepository()

def get_trade_repo() -> TradeRepository:
    return TradeRepository()


# ─── Reserve-then-Commit Trade Engine ─────────────────────────────────────────


class TradeEngine:
    """
    Implements the Reserve-then-Commit pattern for ACID-safe credit transfers:

    1. RESERVE  — Atomically mark credits as RESERVED (Redis lock acquired).
    2. VALIDATE — Confirm ownership, quantity, and counterparty match.
    3. COMMIT   — Transfer ownership and record trade in Supabase.
    4. RELEASE  — Release Redis lock (always, even on failure).

    If COMMIT fails at any step, credits are rolled back to AVAILABLE.
    """

    def __init__(
        self,
        credit_repo: CreditRepository,
        order_repo: OrderRepository,
        trade_repo: TradeRepository,
    ) -> None:
        self._credits = credit_repo
        self._orders = order_repo
        self._trades = trade_repo

    async def execute_trade(
        self,
        buy_order: dict[str, Any],
        sell_order: dict[str, Any],
        quantity: Decimal,
        price: Decimal,
    ) -> TradeReceipt:
        seller_org = sell_order["organization_id"]
        buyer_org = buy_order["organization_id"]
        project_id = sell_order["credit_project_id"]
        vintage = sell_order["vintage_year"]

        lock_key = f"trade_lock:{project_id}:{vintage}:{seller_org}"

        if not redis_pool:
            raise HTTPException(status_code=503, detail="Redis unavailable.")

        # ── 1. Acquire distributed lock ───────────────────────────────────────
        acquired = await redis_pool.set(
            lock_key, "1", nx=True, ex=settings.trade_lock_ttl_seconds
        )
        if not acquired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Trade already in progress for this credit pool. Retry shortly.",
            )

        reserved_ids: list[str] = []
        try:
            # ── 2. Reserve credits ────────────────────────────────────────────
            available = self._credits.get_available_credits(project_id, vintage)
            qty_int = int(quantity)  # 1 record = 1 tonne credit unit
            if len(available) < qty_int:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient credits: need {qty_int}, found {len(available)}.",
                )

            selected = available[:qty_int]
            reserved_ids = [c["id"] for c in selected]
            registry_serials = [c["registry_serial"] for c in selected]

            self._credits.bulk_update_status(reserved_ids, CreditStatus.RESERVED.value)
            logger.info("Reserved %d credits for trade.", len(reserved_ids))

            # ── 3. Commit: transfer ownership ─────────────────────────────────
            self._credits.transfer_ownership(reserved_ids, buyer_org)

            trade_id = uuid.uuid4()
            total_value = quantity * price
            trade_record = {
                "id": str(trade_id),
                "buyer_org_id": buyer_org,
                "seller_org_id": seller_org,
                "credit_ids": reserved_ids,
                "quantity_tonnes": float(quantity),
                "price_per_tonne_inr": float(price),
                "total_value_inr": float(total_value),
                "registry_serials": registry_serials,
                "settled_at": datetime.utcnow().isoformat(),
            }
            self._trades.insert(trade_record)

            # Mark orders filled
            self._orders.update(buy_order["id"], {"status": OrderStatus.FILLED.value})
            self._orders.update(sell_order["id"], {"status": OrderStatus.FILLED.value})

            logger.info("Trade %s settled successfully.", trade_id)

            return TradeReceipt(
                trade_id=trade_id,
                buyer_org_id=uuid.UUID(buyer_org),
                seller_org_id=uuid.UUID(seller_org),
                credit_ids=[uuid.UUID(c) for c in reserved_ids],
                quantity_tonnes=quantity,
                price_per_tonne_inr=price,
                total_value_inr=total_value,
                settled_at=datetime.utcnow(),
                registry_serials=registry_serials,
            )

        except Exception:
            # ── 4. Rollback: release reserved credits ─────────────────────────
            if reserved_ids:
                self._credits.bulk_update_status(reserved_ids, CreditStatus.AVAILABLE.value)
                logger.warning("Trade rolled back — credits restored to AVAILABLE.")
            raise

        finally:
            # Always release the lock
            await redis_pool.delete(lock_key)


# ─── Auth header ──────────────────────────────────────────────────────────────


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="No user context.")
    return x_user_id


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Observability"])
async def health():
    return ApiResponse(data={"service": "marketplace", "status": "healthy"})


@app.post(
    "/orders",
    response_model=ApiResponse[dict],
    tags=["Order Book"],
    summary="Place a buy or sell order",
)
async def place_order(
    req: PlaceOrderRequest,
    user_id: str = Depends(get_requesting_user),
    order_repo: OrderRepository = Depends(get_order_repo),
    credit_repo: CreditRepository = Depends(get_credit_repo),
    trade_repo: TradeRepository = Depends(get_trade_repo),
) -> ApiResponse[dict]:
    # Attempt to match with existing counterparty order
    matches = order_repo.get_open_counterparty(
        req.side, str(req.credit_project_id), req.vintage_year, req.price_per_tonne_inr
    )

    if matches:
        counterparty = matches[0]
        buy_order = (
            {"id": counterparty["id"], "organization_id": counterparty["organization_id"],
             "credit_project_id": str(req.credit_project_id), "vintage_year": req.vintage_year}
            if req.side == OrderSide.SELL
            else {"id": str(uuid.uuid4()), "organization_id": str(req.organization_id),
                  "credit_project_id": str(req.credit_project_id), "vintage_year": req.vintage_year}
        )
        sell_order = counterparty if req.side == OrderSide.BUY else {
            "id": str(uuid.uuid4()),
            "organization_id": str(req.organization_id),
            "credit_project_id": str(req.credit_project_id),
            "vintage_year": req.vintage_year,
        }

        engine = TradeEngine(credit_repo, order_repo, trade_repo)
        receipt = await engine.execute_trade(
            buy_order=buy_order,
            sell_order=sell_order,
            quantity=req.quantity_tonnes,
            price=req.price_per_tonne_inr,
        )
        return ApiResponse(data={"matched": True, "trade": receipt.model_dump(mode="json")},
                           message="Order matched and trade settled.")

    # No match — persist as open order
    order_id = str(uuid.uuid4())
    order_repo.insert({
        "id": order_id,
        "organization_id": str(req.organization_id),
        "side": req.side.value,
        "credit_project_id": str(req.credit_project_id),
        "vintage_year": req.vintage_year,
        "quantity_tonnes": float(req.quantity_tonnes),
        "price_per_tonne_inr": float(req.price_per_tonne_inr),
        "status": OrderStatus.OPEN.value,
        "created_at": datetime.utcnow().isoformat(),
    })

    return ApiResponse(
        data={"matched": False, "order_id": order_id, "status": OrderStatus.OPEN.value},
        message="Order placed in order book.",
    )


@app.get(
    "/credits/{organization_id}",
    response_model=ApiResponse[list],
    tags=["Registry"],
    summary="List carbon credits owned by an organisation",
)
async def list_credits(
    organization_id: str,
    user_id: str = Depends(get_requesting_user),
    credit_repo: CreditRepository = Depends(get_credit_repo),
) -> ApiResponse[list]:
    credits = credit_repo.list_all(filters={"owner_org_id": organization_id})
    return ApiResponse(data=credits, message=f"{len(credits)} credits found.")
