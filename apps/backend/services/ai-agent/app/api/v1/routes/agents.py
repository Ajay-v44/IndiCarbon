from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, AuthenticatedUser, get_current_user, get_db

from ....schemas.agent import AgentRunRequest, AgentRunResponse, HITLReviewCreate, HITLReviewResolve
from ....services import agent_service as agent_svc

router = APIRouter()


def get_factory(request: Request):
    factory = getattr(request.app.state, "agent_factory", None)
    if factory is None:
        raise HTTPException(status_code=503, detail="Agent service not ready.")
    return factory


@router.post("/run", response_model=ApiResponse[AgentRunResponse], summary="Run an AI agent (Auditor or Strategist)")
async def run_agent(
    req: AgentRunRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
    factory=Depends(get_factory),
) -> ApiResponse[AgentRunResponse]:
    response = await agent_svc.run_agent(req, db, factory)
    return ApiResponse(data=response, message="Agent run completed.")


@router.post("/hitl", response_model=ApiResponse[dict], summary="Flag an agent interaction for human review")
def create_hitl_review(
    req: HITLReviewCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = agent_svc.create_hitl_review(req, db)
    return ApiResponse(data=result, message="Review created.")


@router.patch("/hitl/{review_id}", response_model=ApiResponse[dict], summary="Resolve a HITL review")
def resolve_hitl_review(
    review_id: str,
    req: HITLReviewResolve,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = agent_svc.resolve_hitl_review(review_id, req.decision, str(user.id), db)
    return ApiResponse(data=result, message="Review resolved.")
