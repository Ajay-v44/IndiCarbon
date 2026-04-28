from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import get_requesting_user
from ....schemas.document import DocumentResponse, DocumentUploadRequest, DocumentVerifyRequest
from ....services import document_service as doc_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[DocumentResponse], summary="Register document after upload to Supabase Storage")
def register_document(
    req: DocumentUploadRequest,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    doc = doc_svc.register_document(req, user_id, db)
    return ApiResponse(data=doc, message="Document registered in vault.")


@router.get("", response_model=ApiResponse[list], summary="List documents for an organization")
def list_documents(
    organization_id: str = Query(...),
    doc_type: Optional[str] = Query(None),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    docs = doc_svc.list_documents(organization_id, doc_type, db)
    return ApiResponse(data=[d.model_dump() for d in docs], message=f"{len(docs)} documents found.")


@router.get("/{doc_id}", response_model=ApiResponse[DocumentResponse], summary="Get document by ID")
def get_document(
    doc_id: str,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    doc = doc_svc.get_document(doc_id, db)
    return ApiResponse(data=doc)


@router.patch("/{doc_id}/verify", response_model=ApiResponse[DocumentResponse], summary="Verify a document (auditor action)")
def verify_document(
    doc_id: str,
    req: DocumentVerifyRequest,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[DocumentResponse]:
    doc = doc_svc.verify_document(doc_id, req, user_id, db)
    return ApiResponse(data=doc, message="Document verified.")


@router.get("/{doc_id}/signed-url", response_model=ApiResponse[dict], summary="Get time-limited signed URL")
def get_signed_url(
    doc_id: str,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    url = doc_svc.get_signed_url(doc_id, db)
    return ApiResponse(data={"signed_url": url}, message="Signed URL generated.")
