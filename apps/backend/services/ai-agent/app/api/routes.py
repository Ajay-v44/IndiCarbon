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

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status, Depends
from shared_logic import AuthenticatedUser, get_current_user

from ..schemas.agent_schemas import DocumentAnalysisResult
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
