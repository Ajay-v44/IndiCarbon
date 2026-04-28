from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import get_requesting_user
from ....schemas.organization import OrganizationCreate, OrganizationResponse
from ....services import organization_service as org_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[OrganizationResponse], summary="Create a new organization")
def create_organization(
    req: OrganizationCreate,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrganizationResponse]:
    org = org_svc.create_organization(req, db)
    return ApiResponse(data=org, message="Organization created.")


@router.get("", response_model=ApiResponse[list], summary="List all organizations")
def list_organizations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    orgs = org_svc.list_organizations(db, limit=limit, offset=offset)
    return ApiResponse(data=[o.model_dump() for o in orgs], message=f"{len(orgs)} organizations found.")


@router.get("/{org_id}", response_model=ApiResponse[OrganizationResponse], summary="Get organization by ID")
def get_organization(
    org_id: str,
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrganizationResponse]:
    org = org_svc.get_organization(org_id, db)
    return ApiResponse(data=org)
