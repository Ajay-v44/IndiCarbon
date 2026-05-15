from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, AuthenticatedUser, get_current_user, get_db

from ....schemas.agent import (
    AgentRegistryCreate,
    AgentRegistryResponse,
    AgentRegistryUpdate,
    AgentRunRequest,
    AgentRunResponse,
    HITLReviewCreate,
    HITLReviewResolve,
)
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


@router.post("/registry", response_model=ApiResponse[AgentRegistryResponse], summary="Create an agent registry record")
def create_agent_registry(
    req: AgentRegistryCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[AgentRegistryResponse]:
    response = agent_svc.create_agent_registry(req, db)
    return ApiResponse(data=response, message="Agent registry record created.")


@router.get("/registry", response_model=ApiResponse[list[AgentRegistryResponse]], summary="List agent registry records")
def list_agent_registry(
    limit: int = 100,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[AgentRegistryResponse]]:
    response = agent_svc.list_agent_registry(db, limit=min(limit, 200), offset=offset)
    return ApiResponse(data=response, message="Agent registry records fetched.")


@router.get("/registry/{agent_id}", response_model=ApiResponse[AgentRegistryResponse], summary="Get an agent registry record")
def get_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[AgentRegistryResponse]:
    response = agent_svc.get_agent_registry(agent_id, db)
    return ApiResponse(data=response, message="Agent registry record fetched.")


@router.patch("/registry/{agent_id}", response_model=ApiResponse[AgentRegistryResponse], summary="Update an agent registry record")
def update_agent_registry(
    agent_id: str,
    req: AgentRegistryUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[AgentRegistryResponse]:
    response = agent_svc.update_agent_registry(agent_id, req, db)
    return ApiResponse(data=response, message="Agent registry record updated.")


@router.delete("/registry/{agent_id}", response_model=ApiResponse[dict], summary="Delete an agent registry record")
def delete_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    response = agent_svc.delete_agent_registry(agent_id, db)
    return ApiResponse(data=response, message="Agent registry record deleted.")


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
