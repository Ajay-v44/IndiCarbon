from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel


class DocumentUploadRequest(BaseModel):
    organization_id: UUID
    doc_type: str
    file_path: str
    file_hash: Optional[str] = None
    mime_type: Optional[str] = None
    metadata: Optional[dict] = None


class DocumentResponse(BaseModel):
    id: UUID
    organization_id: UUID
    doc_type: str
    bucket_name: str
    file_path: str
    file_hash: Optional[str] = None
    mime_type: Optional[str] = None
    is_verified: bool
    metadata: Optional[dict] = None


class DocumentVerifyRequest(BaseModel):
    is_verified: bool
    metadata: Optional[dict] = None
