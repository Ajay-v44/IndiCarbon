"""
A2A (Agent-to-Agent) Protocol Routes — v0.3.0
──────────────────────────────────────────────
Canonical A2A surface (Agent2Agent Protocol v0.3.0, JSON-RPC binding):

  GET  /.well-known/agent-card.json   → Agent Card (public discovery, v0.3.0 path)
  GET  /.well-known/agent.json        → Agent Card (legacy 0.2.x alias)
  POST /api/v1/a2a                    → JSON-RPC 2.0 (message/send, message/stream,
                                         tasks/get, tasks/cancel, tasks/resubscribe)

REST convenience layer (dashboard / simple clients):
  POST /api/v1/a2a/tasks              → send a task
  GET  /api/v1/a2a/tasks              → list tasks (org-scoped)
  GET  /api/v1/a2a/tasks/{id}         → get task
  POST /api/v1/a2a/tasks/{id}/cancel  → cancel task
  GET  /api/v1/a2a/stats             → activity stats (org-scoped)

Every endpoint (except the public Agent Card) requires a Bearer JWT and runs the
full IndiCarbon guardrail pipeline.
"""
from __future__ import annotations

import json

from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from shared_logic import AuthenticatedUser, get_current_user, get_db

from ....schemas.a2a import A2AAgentCard, A2ASendTaskRequest
from ....services import a2a_service

router = APIRouter()


# ─── Agent Card (public discovery) ───────────────────────────────────────────


@router.get("/.well-known/agent-card.json", response_model=A2AAgentCard,
            tags=["A2A Protocol"], summary="A2A Agent Card (v0.3.0 discovery)")
@router.get("/.well-known/agent.json", response_model=A2AAgentCard, include_in_schema=False)
async def agent_card(request: Request):
    base_url = str(request.base_url).rstrip("/")
    return a2a_service.get_agent_card(base_url).to_wire()


# ─── JSON-RPC 2.0 (streaming-aware) ──────────────────────────────────────────


@router.post("/api/v1/a2a", tags=["A2A Protocol"],
             summary="A2A JSON-RPC 2.0 — message/send, message/stream, tasks/get, tasks/cancel")
@router.post("/api/v1/ai/a2a", include_in_schema=False)
async def a2a_jsonrpc(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payload = await request.json()

    if a2a_service.is_streaming_method(payload):
        async def event_stream():
            async for event in a2a_service.stream_jsonrpc(payload, user, db):
                yield f"data: {json.dumps(event)}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    return await a2a_service.handle_jsonrpc(payload, user, db)


# ─── REST convenience ────────────────────────────────────────────────────────


@router.post("/api/v1/a2a/tasks", response_model=dict, tags=["A2A Protocol"],
             summary="Send a new A2A task (REST)")
@router.post("/api/v1/ai/a2a/tasks", response_model=dict, include_in_schema=False)
async def send_task(
    req: A2ASendTaskRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    task = await a2a_service.send_task(
        query=req.query, user=user, db=db,
        session_id=req.session_id, skill_id=req.skill_id, metadata=req.metadata,
    )
    return {"success": True, "message": "A2A task completed.", "data": task.to_wire()}


@router.get("/api/v1/a2a/tasks", response_model=dict, tags=["A2A Protocol"],
            summary="List A2A tasks (REST, org-scoped)")
@router.get("/api/v1/ai/a2a/tasks", response_model=dict, include_in_schema=False)
async def list_tasks(
    organization_id: str | None = None,
    state: str | None = None,
    skill_id: str | None = None,
    limit: int = 50,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    tasks = a2a_service.list_tasks(
        db, user, organization_id=organization_id, state=state, skill_id=skill_id,
        limit=min(limit, 200), offset=offset,
    )
    return {"success": True, "message": "A2A tasks fetched.",
            "data": [t.model_dump(mode="json") for t in tasks]}


@router.get("/api/v1/a2a/tasks/{task_id}", response_model=dict, tags=["A2A Protocol"],
            summary="Get an A2A task by ID (REST)")
@router.get("/api/v1/ai/a2a/tasks/{task_id}", response_model=dict, include_in_schema=False)
async def get_task(
    task_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    task = a2a_service.get_task(task_id, db, user)
    return {"success": True, "message": "A2A task fetched.", "data": task.to_wire()}


@router.post("/api/v1/a2a/tasks/{task_id}/cancel", response_model=dict, tags=["A2A Protocol"],
             summary="Cancel an A2A task (REST)")
@router.post("/api/v1/ai/a2a/tasks/{task_id}/cancel", response_model=dict, include_in_schema=False)
async def cancel_task(
    task_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    task = a2a_service.cancel_task(task_id, db, user)
    return {"success": True, "message": "A2A task canceled.", "data": task.to_wire()}


@router.get("/api/v1/a2a/stats", response_model=dict, tags=["A2A Protocol"],
            summary="A2A activity statistics (org-scoped; full cross-org for admins)")
@router.get("/api/v1/ai/a2a/stats", response_model=dict, include_in_schema=False)
async def activity_stats(
    organization_id: str | None = None,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    stats = a2a_service.get_activity_stats(db, user, organization_id=organization_id)
    return {"success": True, "message": "A2A activity stats fetched.", "data": stats.model_dump(mode="json")}
