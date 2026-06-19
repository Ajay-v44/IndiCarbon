from __future__ import annotations

from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class WalletResponse(BaseModel):
    id: UUID
    organization_id: UUID
    balance: Decimal
    currency: str


class WalletTransactionResponse(BaseModel):
    id: UUID
    wallet_id: UUID
    organization_id: UUID
    txn_type: str
    amount: Decimal
    balance_after: Decimal
    reference_id: Optional[UUID] = None
    description: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: Optional[str] = None


class AdminAddFundsRequest(BaseModel):
    organization_id: UUID
    amount: Decimal = Field(..., gt=0)
    description: Optional[str] = None
