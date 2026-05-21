"""
app/api/routes.py
──────────────────
FastAPI route definitions for the AI-Agent service.

Endpoints:
  GET  /health                      → Liveness probe
  POST /api/v1/analyse-document     → Document analysis pipeline (LangGraph)
  GET  /api/v1/graph-schema         → Returns the graph structure (dev tool)
  POST /api/v1/prompts/push         → Push prompts to LangSmith Hub

All endpoints follow the IndiCarbon ApiResponse envelope pattern.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile, status, Depends
from sqlalchemy.orm import Session
from shared_logic import AuthenticatedUser, get_current_user, get_db

from ..schemas.agent import AgentRegistryCreate, AgentRegistryResponse, AgentRegistryUpdate
from ..schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse
from ..schemas.agent_schemas import DocumentAnalysisResult
from ..services import agent_service as agent_svc
from ..services.chat_service import get_chat_history, run_chat
from ..services.document_analysis_service import run_document_analysis

logger = logging.getLogger("ai-agent.api.routes")

router = APIRouter()

# ─── Health ───────────────────────────────────────────────────────────────────


@router.get(
    "/health",
    tags=["Observability"],
    summary="Liveness probe",
)
async def health() -> dict:
    """Returns service health status. Used by Docker health checks and load balancers."""
    return {"success": True, "data": {"service": "ai-agent", "status": "healthy"}}


# ─── Document Analysis ────────────────────────────────────────────────────────


@router.post(
    "/api/v1/analyse-document",
    response_model=dict,
    tags=["Document Analysis"],
    summary="Analyse a sustainability document and extract emission factors",
    description="""
Upload any sustainability/ESG document (PDF, DOCX, Excel, CSV, HTML, image).

The agent will use tools to:
1. Parse the document into plain text.
2. Find the fiscal year from the text.
3. Call emission factors API.
4. Call calculate emissions API.
    """,
)
@router.post(
    "/api/v1/ai/analyse-document",
    response_model=dict,
    include_in_schema=False,
)
async def analyse_document(
    file: UploadFile = File(..., description="Sustainability/ESG document to analyse"),
    revenue_crore: Optional[float] = Form(None, description="Revenue in crore INR for BRSR intensity"),
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    """
    Main document analysis endpoint.

    Accepts multipart/form-data with the file + metadata fields.
    Returns the full DocumentAnalysisResult.
    """
    from shared_logic import AuthenticatedUser, get_current_user
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    # Enforce file size limit: 50 MB
    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum allowed size is 50 MB.",
        )

    logger.info(
        "Document analysis request: user_id=%s file=%s size=%d bytes",
        user.id, file.filename, len(file_bytes)
    )

    try:
        result: DocumentAnalysisResult = await run_document_analysis(
            document_bytes=file_bytes,
            filename=file.filename,
            user=user,
            revenue_crore=revenue_crore,
        )

        return {
            "success": True,
            "message": "Document analysis complete.",
            "data": result.model_dump(mode="json"),
        }

    except ValueError as exc:
        # Unsupported file format
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        logger.error("Document analysis endpoint error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline failed: {exc}",
        )


# ─── Responsible AI Chatbot ──────────────────────────────────────────────────


@router.post(
    "/api/v1/chat",
    response_model=dict,
    tags=["AI Chatbot"],
    summary="Ask the responsible organization-scoped IndiCarbon chatbot",
)
@router.post(
    "/api/v1/ai/chat",
    response_model=dict,
    include_in_schema=False,
)
async def chat(
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Token-authenticated RAG chatbot.

    The organization and user are resolved from the token/gateway headers. The
    request body intentionally does not accept organization_id, preventing users
    from switching org scope by payload.
    """
    try:
        result: ChatResponse = await run_chat(
            req=req,
            user=user,
            db=db,
            background_tasks=background_tasks,
        )
        return {
            "success": True,
            "message": "Chat response generated.",
            "data": result.model_dump(mode="json"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Chat endpoint error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot failed: {exc}",
        )


@router.get(
    "/api/v1/chat/history",
    response_model=dict,
    tags=["AI Chatbot"],
    summary="List the authenticated user's persisted chat history",
)
@router.get(
    "/api/v1/ai/chat/history",
    response_model=dict,
    include_in_schema=False,
)
async def chat_history(
    limit: int = 50,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result: ChatHistoryResponse = get_chat_history(user=user, db=db, limit=min(limit, 100), offset=offset)
    return {
        "success": True,
        "message": "Chat history fetched.",
        "data": result.model_dump(mode="json"),
    }


# ─── Agent Registry CRUD ─────────────────────────────────────────────────────


@router.post(
    "/api/v1/agents/registry",
    response_model=dict,
    tags=["AI Agents"],
    summary="Create an agent registry record",
)
@router.post("/api/v1/ai/agents/registry", response_model=dict, include_in_schema=False)
async def create_agent_registry(
    req: AgentRegistryCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result: AgentRegistryResponse = agent_svc.create_agent_registry(req, db)
    return {"success": True, "message": "Agent registry record created.", "data": result.model_dump(mode="json")}


@router.get(
    "/api/v1/agents/registry",
    response_model=dict,
    tags=["AI Agents"],
    summary="List agent registry records",
)
@router.get("/api/v1/ai/agents/registry", response_model=dict, include_in_schema=False)
async def list_agent_registry(
    limit: int = 100,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.list_agent_registry(db, limit=min(limit, 200), offset=offset)
    return {
        "success": True,
        "message": "Agent registry records fetched.",
        "data": [item.model_dump(mode="json") for item in result],
    }


@router.get(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Get an agent registry record",
)
@router.get("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def get_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.get_agent_registry(agent_id, db)
    return {"success": True, "message": "Agent registry record fetched.", "data": result.model_dump(mode="json")}


@router.patch(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Update an agent registry record",
)
@router.patch("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def update_agent_registry(
    agent_id: str,
    req: AgentRegistryUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.update_agent_registry(agent_id, req, db)
    return {"success": True, "message": "Agent registry record updated.", "data": result.model_dump(mode="json")}


@router.delete(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Delete an agent registry record",
)
@router.delete("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def delete_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.delete_agent_registry(agent_id, db)
    return {"success": True, "message": "Agent registry record deleted.", "data": result}


# ─── Graph Schema (Dev Tool) ──────────────────────────────────────────────────


@router.get(
    "/api/v1/graph-schema",
    tags=["Developer"],
    summary="Return the LangGraph document analysis graph structure",
)
async def graph_schema() -> dict:
    """Returns the graph node/edge structure for documentation and debugging."""
    from ..graph.document_graph import get_document_analysis_graph
    graph = get_document_analysis_graph()
    return {
        "success": True,
        "data": {
            "nodes": list(graph.nodes.keys()) if hasattr(graph, "nodes") else [],
            "description": "document_analysis: parse → extract → validate → call_compliance → summarise",
        },
    }


# ─── Prompt Management ────────────────────────────────────────────────────────


@router.post(
    "/api/v1/prompts/push",
    tags=["Developer"],
    summary="Push prompts to LangSmith Hub",
)
async def push_prompts() -> dict:
    """
    Push all IndiCarbon prompt templates to LangSmith Hub for versioning.
    Idempotent — safe to call multiple times.
    """
    from ..prompts.emission_extraction import push_prompts_to_langsmith
    push_prompts_to_langsmith()
    return {"success": True, "message": "Prompts pushed to LangSmith Hub."}
