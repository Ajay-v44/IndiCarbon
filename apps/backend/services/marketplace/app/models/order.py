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
