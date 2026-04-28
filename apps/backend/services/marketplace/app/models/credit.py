from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import relationship

from shared_logic.database import Base


class CarbonCredit(Base):
    __tablename__ = "carbon_credits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    serial_number = Column(String(100), unique=True, nullable=False)
    vintage_year = Column(Integer, nullable=False)
    project_type = Column(String(100))
    initial_owner_id = Column(UUID(as_uuid=True), nullable=True)
    current_owner_id = Column(UUID(as_uuid=True), nullable=True)
    status = Column(String(20), default="ISSUED")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
