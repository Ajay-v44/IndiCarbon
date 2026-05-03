from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....schemas.document import DocumentResponse, DocumentUploadRequest, DocumentVerifyRequest
from ....services import document_service as doc_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[DocumentResponse], summary="Register document after upload to Supabase Storage")
def register_document(
    req: DocumentUploadRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    require_organization_access(user, req.organization_id)
    doc = doc_svc.register_document(req, str(user.id), db)
    return ApiResponse(data=doc, message="Document registered in vault.")


@router.get("", response_model=ApiResponse[list], summary="List documents for an organization")
def list_documents(
    organization_id: str = Query(...),
    doc_type: Optional[str] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    docs = doc_svc.list_documents(organization_id, doc_type, db)
    return ApiResponse(data=[d.model_dump() for d in docs], message=f"{len(docs)} documents found.")


@router.get("/{doc_id}", response_model=ApiResponse[DocumentResponse], summary="Get document by ID")
def get_document(
    doc_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    doc = doc_svc.get_document(doc_id, db)
    require_organization_access(user, doc.organization_id)
    return ApiResponse(data=doc)


@router.patch("/{doc_id}/verify", response_model=ApiResponse[DocumentResponse], summary="Verify a document (auditor action)")
def verify_document(
    doc_id: str,
    req: DocumentVerifyRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    existing_doc = doc_svc.get_document(doc_id, db)
    require_organization_access(user, existing_doc.organization_id)
    doc = doc_svc.verify_document(doc_id, req, str(user.id), db)
    return ApiResponse(data=doc, message="Document verified.")


@router.get("/{doc_id}/signed-url", response_model=ApiResponse[dict], summary="Get time-limited signed URL")
def get_signed_url(
    doc_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    doc = doc_svc.get_document(doc_id, db)
    require_organization_access(user, doc.organization_id)
    url = doc_svc.get_signed_url(doc_id, db)
    return ApiResponse(data={"signed_url": url}, message="Signed URL generated.")
