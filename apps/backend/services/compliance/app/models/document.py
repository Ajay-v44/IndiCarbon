from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from shared_logic.database import Base


class DocumentVault(Base):
    __tablename__ = "document_vault"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"))
    uploader_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    doc_type = Column(String(50))
    bucket_name = Column(Text, nullable=False, default="IndiCarbon")
    file_path = Column(Text, nullable=False)
    file_hash = Column(Text)
    mime_type = Column(String(100))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=True)
    metadata_ = Column("metadata", JSONB)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
