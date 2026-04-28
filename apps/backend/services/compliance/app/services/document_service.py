from __future__ import annotations

import logging
import uuid
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from shared_logic.supabase_client import get_supabase_client

from ..config import settings
from ..models.document import DocumentVault
from ..repositories.document_repo import DocumentVaultRepository
from ..schemas.document import DocumentResponse, DocumentUploadRequest, DocumentVerifyRequest

logger = logging.getLogger(__name__)


# ─── Document — Pure Functions ────────────────────────────────────────────────


def register_document(
    req: DocumentUploadRequest, uploader_id: str, db: Session
) -> DocumentResponse:
    """Register document metadata after the frontend has uploaded to Supabase Storage."""
    repo = DocumentVaultRepository(db)
    doc = repo.create(
        id=uuid.uuid4(),
        organization_id=req.organization_id,
        uploader_id=uuid.UUID(uploader_id),
        doc_type=req.doc_type,
        bucket_name=settings.storage_bucket,
        file_path=req.file_path,
        file_hash=req.file_hash,
        mime_type=req.mime_type,
        is_verified=False,
        metadata_=req.metadata,
    )
    return _doc_to_response(doc)


def list_documents(
    org_id: str, doc_type: Optional[str], db: Session
) -> list[DocumentResponse]:
    """List all documents for an organization, optionally filtered by type."""
    docs = DocumentVaultRepository(db).get_by_organization(org_id, doc_type=doc_type)
    return [_doc_to_response(d) for d in docs]


def get_document(doc_id: str, db: Session) -> DocumentResponse:
    """Fetch a single document by ID."""
    doc = DocumentVaultRepository(db).find_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    return _doc_to_response(doc)


def verify_document(
    doc_id: str, req: DocumentVerifyRequest, verifier_id: str, db: Session
) -> DocumentResponse:
    """Mark a document as verified (auditor action). Optionally updates AI-extracted metadata."""
    repo = DocumentVaultRepository(db)
    doc = repo.find_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")
    doc = repo.verify(doc_id, verifier_id, req.metadata)
    return _doc_to_response(doc)


def get_signed_url(doc_id: str, db: Session, expires_in: int = 3600) -> str:
    """Generate a time-limited Supabase Storage signed URL for secure document access."""
    doc = DocumentVaultRepository(db).find_by_id(doc_id)
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found.")

    supabase = get_supabase_client(use_service_role=True)
    res = supabase.storage.from_(doc.bucket_name).create_signed_url(doc.file_path, expires_in)
    return res.get("signedURL", "")


def _doc_to_response(d: DocumentVault) -> DocumentResponse:
    return DocumentResponse(
        id=d.id,
        organization_id=d.organization_id,
        doc_type=d.doc_type,
        bucket_name=d.bucket_name,
        file_path=d.file_path,
        file_hash=d.file_hash,
        mime_type=d.mime_type,
        is_verified=d.is_verified,
        metadata=d.metadata_,
    )
