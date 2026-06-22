from __future__ import annotations

from enum import Enum
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class CreditStatus(str, Enum):
    ISSUED = "ISSUED"
    PENDING_TRANSFER = "PENDING_TRANSFER"
    RETIRED = "RETIRED"


class OrderType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"


class OrderStatus(str, Enum):
    OPEN = "OPEN"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class CreditResponse(BaseModel):
    id: UUID
    serial_number: str
    vintage_year: int
    project_type: Optional[str] = None
    current_owner_id: Optional[UUID] = None
    status: str


class PlaceOrderRequest(BaseModel):
    organization_id: UUID
    order_type: OrderType
    quantity: int = Field(..., gt=0)
    price_per_unit: Decimal = Field(..., gt=0)
    vintage_year: Optional[int] = None
    project_type: Optional[str] = None


class OrderResponse(BaseModel):
    id: UUID
    organization_id: UUID
    order_type: str
    quantity: int
    price_per_unit: Decimal
    status: str


class TradeReceiptResponse(BaseModel):
    trade_id: UUID
    buyer_org_id: UUID
    seller_org_id: UUID
    quantity: int
    price_per_unit: Decimal
    total_value: Decimal
    serial_numbers: list[str]


# ─── Proposal (RFQ / Negotiated Order) ──────────────────────────────────────────


class ProposalStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class CreateProposalRequest(BaseModel):
    sell_order_id: UUID
    buyer_org_id: UUID
    quantity: int = Field(..., gt=0)
    proposed_price: Decimal = Field(..., gt=0)
    buyer_note: Optional[str] = None


class RespondProposalRequest(BaseModel):
    rejection_reason: Optional[str] = None


class ProposalResponse(BaseModel):
    id: UUID
    sell_order_id: UUID
    buyer_org_id: UUID
    seller_org_id: UUID
    quantity: int
    asking_price: Decimal
    proposed_price: Decimal
    total_value: Decimal
    status: str
    buyer_note: Optional[str] = None
    rejection_reason: Optional[str] = None
    trade_id: Optional[UUID] = None
    created_at: Optional[str] = None
    responded_at: Optional[str] = None
    expires_at: Optional[str] = None
    project_type: Optional[str] = None
    vintage_year: Optional[int] = None
