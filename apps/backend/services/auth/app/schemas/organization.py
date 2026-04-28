from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class OrganizationCreate(BaseModel):
    legal_name: str
    trade_name: Optional[str] = None
    industry_sector: Optional[str] = None
    registration_number: Optional[str] = None
    tax_id: Optional[str] = None
    headquarters_address: Optional[str] = None
    employee_count_bracket: Optional[str] = None
    annual_turnover_bracket: Optional[str] = None
    sustainability_contact_email: Optional[str] = None


class OrganizationResponse(BaseModel):
    id: UUID
    legal_name: str
    trade_name: Optional[str] = None
    industry_sector: Optional[str] = None
    registration_number: Optional[str] = None
    subscription_status: str
