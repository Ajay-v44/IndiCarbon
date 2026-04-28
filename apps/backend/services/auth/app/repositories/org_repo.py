from __future__ import annotations

import uuid as _uuid
from typing import Optional

from sqlalchemy.orm import Session

from ..models.organization import Organization


class OrganizationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, org_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id).first()

    def find_by_registration_number(self, reg_number: str) -> Optional[Organization]:
        return (
            self.db.query(Organization)
            .filter(Organization.registration_number == reg_number)
            .first()
        )

    def find_by_tax_id(self, tax_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.tax_id == tax_id).first()

    def create(self, **kwargs) -> Organization:
        org = Organization(id=_uuid.uuid4(), **kwargs)
        self.db.add(org)
        self.db.flush()
        return org

    def list_all(self, limit: int = 50, offset: int = 0) -> list[Organization]:
        return self.db.query(Organization).limit(limit).offset(offset).all()
