from __future__ import annotations

from datetime import date
from decimal import Decimal
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class GHGScope(str, Enum):
    SCOPE_1 = "SCOPE_1"
    SCOPE_2 = "SCOPE_2"
    SCOPE_3 = "SCOPE_3"


class EmissionCategory(str, Enum):
    STATIONARY_COMBUSTION = "stationary_combustion"
    MOBILE_COMBUSTION = "mobile_combustion"
    ELECTRICITY = "electricity"
    BUSINESS_TRAVEL = "business_travel"
    SUPPLY_CHAIN = "supply_chain"
    WASTE = "waste"


class EmissionReportCreate(BaseModel):
    organization_id: UUID
    reporting_period_start: date
    reporting_period_end: date
    scope_type: GHGScope
    raw_quantity: Decimal = Field(..., gt=0, description="Quantity of activity (e.g. kWh, litres)")
    activity_unit: str = Field(..., description="Unit of measurement e.g. 'kWh', 'litre'")
    document_evidence_id: Optional[UUID] = None
    factor_key: Optional[str] = None


class EmissionReportResponse(BaseModel):
    id: UUID
    organization_id: UUID
    reporting_period_start: date
    reporting_period_end: date
    scope_type: str
    raw_quantity: Decimal
    activity_unit: str
    calculated_tco2e: Optional[Decimal] = None
    factor_used_id: Optional[UUID] = None
    audit_status: str
    document_evidence_id: Optional[UUID] = None


class EmissionSummaryResponse(BaseModel):
    organization_id: str
    period_start: date
    period_end: date
    scope_totals_tco2e: dict[str, float]
    grand_total_tco2e: float
    report_count: int


class EmissionFactorResponse(BaseModel):
    id: UUID
    factor_key: str
    factor_value: Decimal
    unit: str
    vintage_year: int
    source_agency: Optional[str] = None
    is_active: bool


class BRSRReportResponse(BaseModel):
    organization_id: str
    period_start: date
    period_end: date
    scope1_total_tco2e: float
    scope2_total_tco2e: float
    scope3_total_tco2e: float
    grand_total_tco2e: float
    intensity_per_revenue_crore: Optional[float] = None
