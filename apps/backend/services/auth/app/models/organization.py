from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from shared_logic.database import Base


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    legal_name = Column(Text, nullable=False)
    trade_name = Column(Text)
    industry_sector = Column(String(100))
    registration_number = Column(String(100), unique=True)
    tax_id = Column(String(100), unique=True)
    headquarters_address = Column(Text)
    employee_count_bracket = Column(String(50))
    annual_turnover_bracket = Column(String(50))
    sustainability_contact_email = Column(Text)
    subscription_status = Column(String(50), default="TRIAL")
    onboarding_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
