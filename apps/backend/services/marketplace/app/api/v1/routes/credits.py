from __future__ import annotations

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....services import trade_engine as trade_svc

from pydantic import BaseModel, Field

router = APIRouter()


class MintCreditsRequest(BaseModel):
    organization_id: str
    quantity: int = Field(..., gt=0)
    vintage_year: int
    project_type: str


@router.get("", response_model=ApiResponse[list], summary="List carbon credits for an organization")
def list_credits(
    organization_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    credits = trade_svc.list_credits(organization_id, db)
    return ApiResponse(data=credits, message=f"{len(credits)} credits found.")


@router.post("/retire", response_model=ApiResponse[dict], summary="Retire carbon credits (permanent)")
def retire_credits(
    credit_ids: list[str],
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.retire_credits(credit_ids, str(user.id), db)
    return ApiResponse(data=result, message=f"{result['retired_count']} credits retired.")


@router.post("/admin/mint", response_model=ApiResponse[dict], summary="Admin: mint carbon credits for an organization")
def mint_credits(
    req: MintCreditsRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    if "SUPER_ADMIN" not in user.roles:
        raise HTTPException(
            status_code=403,
            detail="Only Super Admins can mint carbon credits."
        )
    
    from ....models.credit import CarbonCredit
    import uuid
    
    created_credits = []
    for _ in range(req.quantity):
        serial = f"CCT-{uuid.uuid4().hex[:8]}-{req.organization_id}"
        credit = CarbonCredit(
            serial_number=serial,
            vintage_year=req.vintage_year,
            project_type=req.project_type,
            initial_owner_id=uuid.UUID(req.organization_id),
            current_owner_id=uuid.UUID(req.organization_id),
            status="ISSUED",
        )
        db.add(credit)
        created_credits.append(credit)
    
    db.commit()
    
    return ApiResponse(
        data={
            "organization_id": req.organization_id,
            "quantity": req.quantity,
            "vintage_year": req.vintage_year,
            "project_type": req.project_type,
        },
        message=f"Successfully minted {req.quantity} carbon credits for organization {req.organization_id}."
    )
