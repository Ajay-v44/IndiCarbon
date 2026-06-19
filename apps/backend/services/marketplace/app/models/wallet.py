from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID

from shared_logic.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), unique=True, nullable=False)
    balance = Column(Numeric, nullable=False, default=0)
    currency = Column(String(10), nullable=False, default="INR")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class WalletTransaction(Base):
    __tablename__ = "wallet_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    wallet_id = Column(UUID(as_uuid=True), nullable=False)
    organization_id = Column(UUID(as_uuid=True), nullable=False)
    txn_type = Column(String(30), nullable=False)
    amount = Column(Numeric, nullable=False)
    balance_after = Column(Numeric, nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
