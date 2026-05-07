"""
app/services/document_analysis_service.py
──────────────────────────────────────────
Business logic for the document-analysis pipeline.

This service layer sits between the FastAPI route and the LangGraph graph.
It:
  1. Builds the initial AgentState from the HTTP request data.
  2. Invokes the compiled LangGraph graph with Langfuse v4 tracing enabled.
  3. Maps the final graph state to the DocumentAnalysisResult schema.

Langfuse v4 Tracing Strategy
─────────────────────────────
Langfuse v4 replaced the imperative .trace() / .trace.generation() API with:
  • @observe() decorator   — for function-level tracing
  • LangfuseCallbackHandler — for LangChain / LangGraph chain tracing

Here we use LangfuseCallbackHandler exclusively.  The handler creates a
Langfuse trace automatically with the session_id == run_id, so every
pipeline run is queryable at:
    <LANGFUSE_HOST>/sessions/<run_id>
"""
from __future__ import annotations

import logging
import time
import uuid
from typing import Optional

from ..config.observability import build_langfuse_handler, get_langfuse_client
from ..config.settings import get_settings
from ..graph.document_graph import get_document_analysis_graph
from ..graph.state import AgentState
from ..schemas.agent_schemas import DocumentAnalysisResult, EmissionLineItem

logger = logging.getLogger("ai-agent.services.document_analysis")


async def run_document_analysis(
    document_bytes: bytes,
    filename: str,
    organization_id: str,
    document_id: Optional[str],
    fiscal_year: Optional[int],
    revenue_crore: Optional[float],
    user_id: str = "ai-agent-system",
) -> DocumentAnalysisResult:
    """
    Execute the full document analysis pipeline via LangGraph.

    Args:
        document_bytes:  Raw file content.
        filename:        Original filename (extension determines parser).
        organization_id: UUID string of the requesting org.
        document_id:     Optional UUID of a pre-stored vault document.
        fiscal_year:     Optional hint for reporting year.
        revenue_crore:   Optional revenue for BRSR intensity.
        user_id:         Acting user (defaults to system service identity).

    Returns:
        DocumentAnalysisResult with extracted items, compliance result, and summary.
    """
    run_id = str(uuid.uuid4())
    start_ms = int(time.time() * 1000)
    s = get_settings()

    logger.info(
        "[%s] Starting document analysis: org=%s file=%s fiscal_year=%s",
        run_id, organization_id, filename, fiscal_year,
    )

    # ── Build initial state ───────────────────────────────────────────────────
    initial_state: AgentState = {
        "run_id": run_id,
        "organization_id": organization_id,
        "user_id": user_id,
        "document_bytes": document_bytes,
        "filename": filename,
        "fiscal_year": fiscal_year,
        "revenue_crore": revenue_crore,
        "document_id": document_id,
        # Populated by nodes:
        "raw_text": "",
        "llm_raw_output": "",
        "emission_items": [],
        "validated_items": [],
        "validation_warnings": [],
        "compliance_result": {},
        "summary": "",
        "graph_steps": [],
        "errors": [],
    }

    # ── Observability: Langfuse v4 via CallbackHandler ────────────────────────
    # The CallbackHandler creates a Langfuse trace automatically.
    # session_id == run_id → queryable at <LANGFUSE_HOST>/sessions/<run_id>
    langfuse_handler = build_langfuse_handler(run_id, "document_analysis", organization_id)

    # ── Run the LangGraph graph ───────────────────────────────────────────────
    graph = get_document_analysis_graph()

    try:
        final_state: AgentState = await graph.ainvoke(
            initial_state,
            config={
                "callbacks": [langfuse_handler],
                "run_name": f"indicarbon.document_analysis.{run_id}",
            },
        )

        duration_ms = int(time.time() * 1000) - start_ms

        # ── Map to result schema ──────────────────────────────────────────────
        emission_line_items = [
            EmissionLineItem(
                factor_key=item["factor_key"],
                raw_quantity=item["raw_quantity"],
                activity_unit=item.get("activity_unit", "unit"),
                year=item.get("year", fiscal_year or 2024),
                scope_hint=item.get("scope_hint"),
                source_text=item.get("source_text"),
            )
            for item in final_state.get("validated_items", [])
        ]

        result = DocumentAnalysisResult(
            run_id=uuid.UUID(run_id),
            organization_id=uuid.UUID(organization_id),
            document_id=uuid.UUID(document_id) if document_id else None,
            fiscal_year=final_state.get("fiscal_year") or fiscal_year,
            revenue_crore=revenue_crore,
            emission_line_items=emission_line_items,
            summary=final_state.get("summary", ""),
            compliance_api_result=final_state.get("compliance_result"),
            # Langfuse v4: traces are grouped by session_id (== run_id)
            trace_url=f"{s.langfuse_host}/sessions/{run_id}",
            duration_ms=duration_ms,
            graph_steps=final_state.get("graph_steps", []),
        )

        # Flush remaining Langfuse spans before returning
        try:
            get_langfuse_client().flush()
        except Exception:
            pass

        logger.info(
            "[%s] Document analysis complete: %d items extracted, %d ms",
            run_id, len(emission_line_items), duration_ms,
        )
        return result

    except Exception as exc:
        duration_ms = int(time.time() * 1000) - start_ms
        logger.error("[%s] Document analysis failed: %s", run_id, exc, exc_info=True)
        # Best-effort Langfuse flush on failure
        try:
            get_langfuse_client().flush()
        except Exception:
            pass
        raise
