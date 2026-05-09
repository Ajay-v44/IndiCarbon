from fastapi import HTTPException

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user
from ....schemas.organization import OrganizationCreate, OrganizationResponse
from ....services import organization_service as org_svc
import logging


router = APIRouter()
logger = logging.getLogger(__name__)



@router.post("/", response_model=ApiResponse[OrganizationResponse], summary="Create a new organization")
def create_organization(
    req: OrganizationCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrganizationResponse]:
    try:
        logger.info(f"User {user.id} requested to create organization {req.legal_name}")
        org = org_svc.create_organization(req, str(user.id), db)
        return ApiResponse(data=org, message="Organization created.")
    except HTTPException as e:
        return ApiResponse(error=e.detail, error_code=e.status_code)


@router.get("/", response_model=list[OrganizationResponse], summary="List all organizations")
def list_organizations(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrganizationResponse]:
   return org_svc.list_organizations(str(user.id), db, limit=limit, offset=offset)
 


@router.get("/{org_id}", response_model=ApiResponse[OrganizationResponse], summary="Get organization by ID")
def get_organization(
    org_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[OrganizationResponse]:
    org = org_svc.get_organization(org_id, str(user.id), db)
    return ApiResponse(data=org)
