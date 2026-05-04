"""
libs/shared-logic/schemas.py
Shared Pydantic schemas used across all Python microservices.
These are the canonical data contracts for IndiCarbon AI.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Generic, Optional, TypeVar
from uuid import UUID

from pydantic import BaseModel, Field

# ─── Generic Response Wrapper ─────────────────────────────────────────────────

DataT = TypeVar("DataT")


class ApiResponse(BaseModel, Generic[DataT]):
    """Unified API response envelope — all endpoints return this."""

    success: bool = True
    data: Optional[DataT] = None
    message: str = "OK"
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None
    meta: Optional[dict[str, Any]] = None


class ApiErrorResponse(BaseModel):
    """Standardised error response envelope."""

    success: bool = False
    error: ErrorDetail
    request_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ─── GHG / Compliance ─────────────────────────────────────────────────────────


class GHGScope(str, Enum):
    SCOPE_1 = "scope_1"
    SCOPE_2 = "scope_2"
    SCOPE_3 = "scope_3"


class EmissionCategory(str, Enum):
    STATIONARY_COMBUSTION = "stationary_combustion"
    MOBILE_COMBUSTION = "mobile_combustion"
    ELECTRICITY = "electricity"
    BUSINESS_TRAVEL = "business_travel"
    SUPPLY_CHAIN = "supply_chain"
    WASTE = "waste"


class EmissionEntryRequest(BaseModel):
    organization_id: UUID
    fiscal_year: int = Field(..., ge=2000, le=2100)
    scope: GHGScope
    category: EmissionCategory
    activity_data: Decimal = Field(..., gt=0, description="Quantity of activity")
    activity_unit: str = Field(..., description="Unit of activity e.g. 'kWh', 'litre'")
    emission_factor: Optional[Decimal] = Field(None, description="Override default factor")
    notes: Optional[str] = None


class EmissionResult(BaseModel):
    entry_id: UUID
    organization_id: UUID
    scope: GHGScope
    category: EmissionCategory
    activity_data: Decimal
    activity_unit: str
    emission_factor_used: Decimal
    co2e_tonnes: Decimal
    fiscal_year: int
    calculated_at: datetime


class BRSRReport(BaseModel):
    organization_id: UUID
    fiscal_year: int
    scope1_total_tco2e: Decimal
    scope2_total_tco2e: Decimal
    scope3_total_tco2e: Decimal
    total_tco2e: Decimal
    intensity_per_revenue_crore: Optional[Decimal] = None
    generated_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Marketplace ──────────────────────────────────────────────────────────────


class CreditStatus(str, Enum):
    AVAILABLE = "available"
    RESERVED = "reserved"
    RETIRED = "retired"
    CANCELLED = "cancelled"


class OrderSide(str, Enum):
    BUY = "buy"
    SELL = "sell"


class OrderStatus(str, Enum):
    OPEN = "open"
    FILLED = "filled"
    PARTIALLY_FILLED = "partially_filled"
    CANCELLED = "cancelled"


class CarbonCredit(BaseModel):
    credit_id: UUID
    registry_serial: str = Field(..., description="Unique registry serial number")
    project_id: UUID
    vintage_year: int
    standard: str = Field(..., description="e.g. Verra VCS, Gold Standard")
    quantity_tonnes: Decimal
    status: CreditStatus
    owner_org_id: UUID
    issued_at: datetime
    retired_at: Optional[datetime] = None


class PlaceOrderRequest(BaseModel):
    organization_id: UUID
    side: OrderSide
    credit_project_id: UUID
    vintage_year: int
    quantity_tonnes: Decimal = Field(..., gt=0)
    price_per_tonne_inr: Decimal = Field(..., gt=0)


class TradeReceipt(BaseModel):
    trade_id: UUID
    buyer_org_id: UUID
    seller_org_id: UUID
    credit_ids: list[UUID]
    quantity_tonnes: Decimal
    price_per_tonne_inr: Decimal
    total_value_inr: Decimal
    settled_at: datetime
    registry_serials: list[str]


# ─── AI Agent ─────────────────────────────────────────────────────────────────


class AgentType(str, Enum):
    AUDITOR = "auditor"
    STRATEGIST = "strategist"


class AgentRunRequest(BaseModel):
    organization_id: UUID
    agent_type: AgentType
    query: str = Field(..., min_length=10, max_length=2000)
    fiscal_year: Optional[int] = None
    context_documents: Optional[list[str]] = None


class AgentRunResponse(BaseModel):
    run_id: UUID
    agent_type: AgentType
    organization_id: UUID
    query: str
    answer: str
    sources: list[str] = []
    tool_calls: list[dict[str, Any]] = []
    trace_url: Optional[str] = None
    duration_ms: int
    completed_at: datetime = Field(default_factory=datetime.utcnow)


class Message(BaseModel):
    message:str