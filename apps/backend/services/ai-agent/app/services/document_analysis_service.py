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
from ..schemas.agent_schemas import DocumentAnalysisResult, EmissionLineItem
from shared_logic import AuthenticatedUser

logger = logging.getLogger("ai-agent.services.document_analysis")


async def run_document_analysis(
    document_bytes: bytes,
    filename: str,
    user: AuthenticatedUser,
    revenue_crore: Optional[float],
) -> DocumentAnalysisResult:
    """
    Execute the document analysis pipeline via a React agent with tools.
    """
    run_id = str(uuid.uuid4())
    start_ms = int(time.time() * 1000)
    s = get_settings()

    organization_id = str(user.organization_id)
    user_id_str = str(user.id)

    logger.info(
        "[%s] Starting document analysis: org=%s file=%s",
        run_id, organization_id, filename
    )

    # 1. Upload to Supabase and get doc ID
    from shared_logic.supabase_client import get_supabase_client
    import hashlib
    supabase = get_supabase_client(use_service_role=True)
    
    document_id = str(uuid.uuid4())
    file_hash = hashlib.sha256(document_bytes).hexdigest()
    file_path = f"{organization_id}/{document_id}_{filename}"

    try:
        supabase.storage.from_("IndiCarbon").upload(file_path, document_bytes)
        logger.info("[%s] Uploaded to storage: %s", run_id, file_path)
    except Exception as exc:
        logger.error("[%s] Failed to upload to Supabase storage: %s", run_id, exc)
        # proceed anyway or fail? Best to proceed if we just need analysis, but usually we should fail.
        # But we will continue to let the analysis run if possible.

    try:
        supabase.table("document_vault").insert({
            "id": document_id,
            "organization_id": organization_id,
            "uploader_id": user_id_str,
            "doc_type": "report",
            "bucket_name": "IndiCarbon",
            "file_path": file_path,
            "file_hash": file_hash,
            "mime_type": "application/octet-stream",
            "is_verified": False
        }).execute()
        logger.info("[%s] Inserted into document_vault", run_id)
    except Exception as exc:
        logger.error("[%s] Failed to insert into document_vault: %s", run_id, exc)

    # 2. Parse document text
    from ..parsers.document_parser import parse_document
    try:
        raw_text = parse_document(document_bytes, filename)
        if len(raw_text) > 120_000:
            raw_text = raw_text[:120_000] + "\n\n[DOCUMENT TRUNCATED]"
    except Exception as exc:
        logger.error("[%s] Failed to parse document: %s", run_id, exc)
        raise ValueError(f"Failed to parse document: {exc}")

    # 3. Setup Agent and initial state
    from langchain_core.messages import HumanMessage
    langfuse_handler = build_langfuse_handler(run_id, "document_analysis", organization_id)
    graph = get_document_analysis_graph()

    initial_messages = [
        HumanMessage(content=f"Here is the document text:\n\n{raw_text}\n\n"
                             f"Organization ID: {organization_id}\n"
                             f"User ID: {user_id_str}\n"
                             f"Revenue Crore: {revenue_crore}\n"
                             f"Document ID: {document_id}")
    ]

    initial_state = {
        "messages": initial_messages
    }

    try:
        final_state = await graph.ainvoke(
            initial_state,
            config={
                "callbacks": [langfuse_handler],
                "run_name": f"indicarbon.document_analysis.{run_id}",
                "configurable": {"thread_id": organization_id},
                "metadata": {
                    "langfuse_session_id": run_id,
                    "langfuse_user_id": organization_id,
                    "agent_type": "document_analysis"
                }
            },
        )

        duration_ms = int(time.time() * 1000) - start_ms

        # Extract final answer from agent
        final_message = final_state["messages"][-1].content if "messages" in final_state and final_state["messages"] else ""

        result = DocumentAnalysisResult(
            run_id=uuid.UUID(run_id),
            organization_id=uuid.UUID(organization_id),
            document_id=uuid.UUID(document_id),
            fiscal_year=None,
            revenue_crore=revenue_crore,
            emission_line_items=[],
            summary=final_message,
            compliance_api_result={},
            trace_url=f"{s.langfuse_host}/sessions/{run_id}",
            duration_ms=duration_ms,
            graph_steps=[],
        )

        try:
            get_langfuse_client().flush()
        except Exception:
            pass

        logger.info("[%s] Document analysis complete in %d ms", run_id, duration_ms)
        return result

    except Exception as exc:
        duration_ms = int(time.time() * 1000) - start_ms
        logger.error("[%s] Document analysis failed: %s", run_id, exc, exc_info=True)
        try:
            get_langfuse_client().flush()
        except Exception:
            pass
        raise
