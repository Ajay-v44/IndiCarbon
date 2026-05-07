from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class OrganizationResponse(BaseModel):
    id: UUID
    legal_name: str
    trade_name: Optional[str] = None
    industry_sector: Optional[str] = None
    registration_number: Optional[str] = None
    subscription_status: str