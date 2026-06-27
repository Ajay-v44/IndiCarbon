from __future__ import annotations

import uuid as _uuid
from typing import Optional

from sqlalchemy.orm import Session

from ..models.organization import Organization


class OrganizationRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, org_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == org_id, Organization.is_active == True).first()

    def find_by_registration_number(self, reg_number: str) -> Optional[Organization]:
        return (
            self.db.query(Organization)
            .filter(Organization.registration_number == reg_number, Organization.is_active == True)
            .first()
        )

    def find_by_tax_id(self, tax_id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.tax_id == tax_id, Organization.is_active == True).first()

    def create(self, **kwargs) -> Organization:
        org = Organization(id=_uuid.uuid4(), **kwargs)
        self.db.add(org)
        self.db.flush()
        return org

    def list_all(self, limit: int = 50, offset: int = 0) -> list[Organization]:
        return self.db.query(Organization).filter(Organization.is_active == True).limit(limit).offset(offset).all()

    def list_by_ids(self, org_ids: list[str], limit: int = 50, offset: int = 0) -> list[Organization]:
        if not org_ids:
            return []
        ids = [_uuid.UUID(org_id) for org_id in org_ids]
        return (
            self.db.query(Organization)
            .filter(Organization.id.in_(ids), Organization.is_active == True)
            .limit(limit)
            .offset(offset)
            .all()
        )

    def deactivate(self, org_id: str) -> bool:
        org = self.db.query(Organization).filter(Organization.id == org_id, Organization.is_active == True).first()
        if org:
            org.is_active = False
            if org.registration_number:
                org.registration_number = org.registration_number + "_deleted_" + str(org.id)
            if org.tax_id:
                org.tax_id = org.tax_id + "_deleted_" + str(org.id)
            self.db.flush()
            return True
        return False
