from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID

from shared_logic.database import Base


class MarketOrder(Base):
    __tablename__ = "market_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False)
    order_type = Column(String(10), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(Numeric, nullable=False)
    status = Column(String(20), default="OPEN")
    expires_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    vintage_year = Column(Integer, nullable=True)
    project_type = Column(String(100), nullable=True)


class Trade(Base):
    __tablename__ = "trades"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_org_id = Column(UUID(as_uuid=True), nullable=False)
    seller_org_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_per_unit = Column(Numeric, nullable=False)
    total_value = Column(Numeric, nullable=False)
    settled_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sell_order_id = Column(UUID(as_uuid=True), nullable=False)
    buyer_org_id = Column(UUID(as_uuid=True), nullable=False)
    seller_org_id = Column(UUID(as_uuid=True), nullable=False)
    quantity = Column(Integer, nullable=False)
    asking_price = Column(Numeric, nullable=False)
    proposed_price = Column(Numeric, nullable=False)
    total_value = Column(Numeric, nullable=False)
    status = Column(String(20), default="PENDING")
    buyer_note = Column(String(500), nullable=True)
    rejection_reason = Column(String(500), nullable=True)
    trade_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    responded_at = Column(DateTime(timezone=True), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    project_type = Column(String(100), nullable=True)
    vintage_year = Column(Integer, nullable=True)
