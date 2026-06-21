from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, get_redis, require_organization_access
from ....schemas.market import CreateProposalRequest, RespondProposalRequest
from ....services import trade_engine as trade_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[dict], summary="Create a buy proposal against a SELL order")
async def create_proposal(
    req: CreateProposalRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    require_organization_access(user, req.buyer_org_id)
    result = trade_svc.create_proposal(req, str(user.id), db)
    return ApiResponse(data=result, message="Proposal submitted to seller.")


@router.get("", response_model=ApiResponse[list], summary="List proposals for an organization")
def list_proposals(
    organization_id: str = Query(...),
    role: str | None = Query(None, regex="^(buyer|seller)$"),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    proposals = trade_svc.list_proposals(organization_id, role, db)
    return ApiResponse(data=proposals, message=f"{len(proposals)} proposals found.")


@router.post("/{proposal_id}/accept", response_model=ApiResponse[dict], summary="Accept a proposal (seller)")
async def accept_proposal(
    proposal_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    redis=Depends(get_redis),
) -> ApiResponse[dict]:
    result = await trade_svc.accept_proposal(proposal_id, str(user.id), db, redis)
    return ApiResponse(data=result, message="Proposal accepted — trade settled.")


@router.post("/{proposal_id}/reject", response_model=ApiResponse[dict], summary="Reject a proposal (seller)")
def reject_proposal(
    proposal_id: str,
    req: RespondProposalRequest | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    reason = req.rejection_reason if req else None
    result = trade_svc.reject_proposal(proposal_id, reason, str(user.id), db)
    return ApiResponse(data=result, message="Proposal rejected.")


@router.post("/{proposal_id}/cancel", response_model=ApiResponse[dict], summary="Cancel own proposal (buyer)")
def cancel_proposal(
    proposal_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.cancel_proposal(proposal_id, str(user.id), db)
    return ApiResponse(data=result, message="Proposal cancelled.")
