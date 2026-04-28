from __future__ import annotations

import logging
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.organization import Organization
from ..repositories.org_repo import OrganizationRepository
from ..schemas.organization import OrganizationCreate, OrganizationResponse

logger = logging.getLogger(__name__)


# ─── Organization — Pure Functions ───────────────────────────────────────────


def create_organization(req: OrganizationCreate, db: Session) -> OrganizationResponse:
    """Create a new organization record. Rejects duplicates on registration_number."""
    repo = OrganizationRepository(db)

    if req.registration_number and repo.find_by_registration_number(req.registration_number):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An organization with this registration number already exists.",
        )

    org = repo.create(**req.model_dump(exclude_none=True))
    return _to_response(org)


def get_organization(org_id: str, db: Session) -> OrganizationResponse:
    """Fetch a single organization by UUID."""
    repo = OrganizationRepository(db)
    org = repo.find_by_id(org_id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found.")
    return _to_response(org)


def list_organizations(db: Session, limit: int = 50, offset: int = 0) -> list[OrganizationResponse]:
    """List organizations with pagination."""
    orgs = OrganizationRepository(db).list_all(limit=limit, offset=offset)
    return [_to_response(o) for o in orgs]


def _to_response(org: Organization) -> OrganizationResponse:
    return OrganizationResponse(
        id=org.id,
        legal_name=org.legal_name,
        trade_name=org.trade_name,
        industry_sector=org.industry_sector,
        registration_number=org.registration_number,
        subscription_status=org.subscription_status or "TRIAL",
    )
