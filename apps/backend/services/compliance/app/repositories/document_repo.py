from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models.document import DocumentVault


class DocumentVaultRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> DocumentVault:
        doc = DocumentVault(**kwargs)
        self.db.add(doc)
        self.db.flush()
        return doc

    def find_by_id(self, doc_id: str) -> Optional[DocumentVault]:
        return self.db.query(DocumentVault).filter(DocumentVault.id == doc_id).first()

    def get_by_organization(
        self, org_id: str, doc_type: Optional[str] = None
    ) -> list[DocumentVault]:
        q = self.db.query(DocumentVault).filter(DocumentVault.organization_id == org_id)
        if doc_type:
            q = q.filter(DocumentVault.doc_type == doc_type)
        return q.order_by(DocumentVault.created_at.desc()).all()

    def verify(self, doc_id: str, verified_by: str, metadata: Optional[dict] = None) -> DocumentVault:
        doc = self.find_by_id(doc_id)
        if doc:
            doc.is_verified = True
            doc.verified_by = verified_by
            if metadata:
                doc.metadata_ = metadata
            self.db.flush()
        return doc
