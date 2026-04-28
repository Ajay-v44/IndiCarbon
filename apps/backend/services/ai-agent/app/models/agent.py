from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from shared_logic.database import Base


class AgentRegistry(Base):
    __tablename__ = "agent_registry"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_name = Column(String(100))
    agent_type = Column(String(50))
    model_version = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sent_interactions = relationship("AgentInteraction", foreign_keys="AgentInteraction.sender_agent_id", back_populates="sender")
    received_interactions = relationship("AgentInteraction", foreign_keys="AgentInteraction.receiver_agent_id", back_populates="receiver")


class AgentInteraction(Base):
    __tablename__ = "agent_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_agent_id = Column(UUID(as_uuid=True), nullable=True)
    receiver_agent_id = Column(UUID(as_uuid=True), nullable=True)
    session_id = Column(UUID(as_uuid=True), nullable=True)
    message_payload = Column(JSONB)
    token_usage = Column(Integer)
    response_time_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    sender = relationship("AgentRegistry", foreign_keys=[sender_agent_id], back_populates="sent_interactions")
    receiver = relationship("AgentRegistry", foreign_keys=[receiver_agent_id], back_populates="received_interactions")


class HITLReview(Base):
    __tablename__ = "hitl_reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=True)
    agent_interaction_id = Column(UUID(as_uuid=True), nullable=True)
    issue_detected = Column(Text)
    ai_suggestion = Column(Text)
    human_decision = Column(String(50))
    reviewer_id = Column(UUID(as_uuid=True), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
