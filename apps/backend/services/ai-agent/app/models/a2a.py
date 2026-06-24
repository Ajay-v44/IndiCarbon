from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from shared_logic.database import Base


class A2ATaskRecord(Base):
    __tablename__ = "a2a_tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(100), nullable=False, index=True, unique=True)
    session_id = Column(String(100), nullable=True, index=True)
    organization_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)
    skill_id = Column(String(100), nullable=True)
    state = Column(String(30), nullable=False, default="submitted")
    query = Column(Text, nullable=False)
    answer = Column(Text, nullable=True)
    artifacts = Column(JSONB, default=list)
    history = Column(JSONB, default=list)
    metadata_ = Column("metadata", JSONB, default=dict)
    token_usage = Column(Integer, default=0)
    duration_ms = Column(Integer, default=0)
    guardrail_blocked = Column(Boolean, default=False)
    guardrail_audit = Column(JSONB, default=dict)
    sender_agent_id = Column(UUID(as_uuid=True), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


class A2AMessageRecord(Base):
    __tablename__ = "a2a_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    task_id = Column(String(100), nullable=False, index=True)
    role = Column(String(10), nullable=False)
    parts = Column(JSONB, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
