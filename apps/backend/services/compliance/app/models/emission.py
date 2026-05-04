from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from shared_logic.database import Base


class EmissionFactor(Base):
    __tablename__ = "emission_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    factor_key = Column(String(100), nullable=False)
    factor_value = Column(Numeric, nullable=False)
    unit = Column(String(50), nullable=False)
    vintage_year = Column(Integer, nullable=False)
    source_agency = Column(Text)
    is_active = Column(Boolean, default=True)
    scope = Column(String(100))

    reports = relationship("EmissionReport", back_populates="factor_used")


class EmissionReport(Base):
    __tablename__ = "emission_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    reporting_period_start = Column(Date, nullable=False)
    reporting_period_end = Column(Date, nullable=False)
    scope_type = Column(String(10))
    document_evidence_id = Column(UUID(as_uuid=True), ForeignKey("document_vault.id"), nullable=True)
    raw_quantity = Column(Numeric)
    activity_unit = Column(String(50))
    calculated_tco2e = Column(Numeric)
    factor_used_id = Column(UUID(as_uuid=True), ForeignKey("emission_factors.id"), nullable=True)
    audit_status = Column(String(50), default="PENDING_AI_VERIFICATION")
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    factor_used = relationship("EmissionFactor", back_populates="reports")
