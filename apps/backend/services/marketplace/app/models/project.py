from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID

from shared_logic.database import Base


class CarbonProject(Base):
    """
    Represents an organization-submitted carbon reduction project
    seeking verification and credit issuance.
    """
    __tablename__ = "carbon_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    submitted_by_id = Column(UUID(as_uuid=True), nullable=True)

    # Project Details
    name = Column(String(255), nullable=False)
    project_type = Column(String(100), nullable=False)  # Solar, Wind, Biomass, etc.
    description = Column(Text, nullable=True)
    registry = Column(String(100), nullable=True)  # VERRA, GOLD_STANDARD, BEE, CCTS, OTHER

    # Input metrics from org (fed to AI credit calculator)
    energy_produced_mwh = Column(Float, nullable=True)        # MWh of renewable energy produced
    fuel_switched_litre = Column(Float, nullable=True)        # Litres of fossil fuel displaced
    waste_diverted_tonnes = Column(Float, nullable=True)      # Tonnes of waste diverted
    trees_planted = Column(Integer, nullable=True)            # Trees planted (afforestation)
    area_hectares = Column(Float, nullable=True)              # Project area in hectares

    # User estimates
    estimated_annual_reduction_tco2e = Column(Float, nullable=True)
    estimated_credits = Column(Float, nullable=True)
    project_lifetime_years = Column(Integer, nullable=True)

    # AI Evaluation Results
    ai_estimated_credits = Column(Float, nullable=True)       # Credits calculated by AI tool
    ai_annual_reduction_tco2e = Column(Float, nullable=True)  # AI-calculated annual tCO2e reduction
    ai_methodology = Column(String(255), nullable=True)       # CDM/VCS methodology used
    ai_confidence_score = Column(Float, nullable=True)        # 0.0 - 1.0
    ai_evaluation_notes = Column(Text, nullable=True)         # Full AI justification text
    ai_evaluated_at = Column(DateTime(timezone=True), nullable=True)

    # Admin override before credit issuance
    admin_approved_credits = Column(Float, nullable=True)     # Admin-set final credit quantity
    credits_issued = Column(Float, nullable=True)             # Actual credits minted to org

    # Status: PENDING → UNDER_REVIEW → VERIFIED | REJECTED
    status = Column(String(30), default="PENDING", nullable=False)
    reviewer_notes = Column(Text, nullable=True)
    reviewed_by_id = Column(UUID(as_uuid=True), nullable=True)

    # Documents (JSON list of filenames/URLs)
    submitted_documents = Column(Text, nullable=True)

    # Timestamps
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
