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

import asyncio
import httpx
import logging
import time
import uuid
from typing import Any, Optional

from ..config.observability import build_langfuse_handler, get_langfuse_client
from ..config.settings import get_settings
from ..graph.document_graph import get_document_analysis_graph
from ..schemas.agent_schemas import DocumentAnalysisResult, EmissionLineItem
from shared_logic import AuthenticatedUser

logger = logging.getLogger("ai-agent.services.document_analysis")

_background_tasks = set()


def _message_content_to_str(content: Any) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        text_parts = []
        for part in content:
            if isinstance(part, str):
                text_parts.append(part)
            elif isinstance(part, dict):
                if "text" in part:
                    text_parts.append(str(part["text"]))
                elif part.get("type") == "text" and "text" in part:
                    text_parts.append(str(part["text"]))
                else:
                    text_parts.append(str(part))
            elif hasattr(part, "get") and part.get("text"):
                text_parts.append(str(part.get("text")))
            elif hasattr(part, "text"):
                text_parts.append(str(part.text))
            else:
                text_parts.append(str(part))
        return "".join(text_parts)
    return str(content) if content is not None else ""


async def _embed_text(text: str) -> list[float]:
    s = get_settings()
    if s.llm_provider == "openai":
        from langchain_openai import OpenAIEmbeddings
        embeddings = OpenAIEmbeddings(
            model=s.openai_embed_model,
            api_key=s.openai_api_key,
            base_url=s.openai_api_base or None,
        )
        return await embeddings.aembed_query(text)
    elif s.llm_provider == "google":
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
        embeddings = GoogleGenerativeAIEmbeddings(
            model=s.gemini_embed_model,
            google_api_key=s.google_api_key,
            output_dimensionality=768,
        )
        return await embeddings.aembed_query(text)
    else:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{s.ollama_base_url}/api/embeddings",
                json={"model": s.ollama_embed_model, "prompt": text},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]


async def _embed_and_store_document_background(
    text: str,
    organization_id: str,
    document_id: str,
    filename: str,
    run_id: str
):
    """Chunks the parsed document, embeds it via the configured provider, and stores in pgvector."""
    try:
        logger.info("[%s] Starting background embedding for document %s", run_id, document_id)
        from langchain_text_splitters import RecursiveCharacterTextSplitter
        from shared_logic.supabase_client import VectorRepository
        
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = splitter.split_text(text)
        
        repo = VectorRepository()
        
        for i, chunk in enumerate(chunks):
            embedding = await _embed_text(chunk)
            
            metadata = {
                "organization_id": organization_id,
                "document_id": document_id,
                "filename": filename,
                "chunk_index": i
            }
            
            # Run the synchronous upsert_embedding in a thread to avoid blocking
            await asyncio.to_thread(
                repo.upsert_embedding,
                content=chunk,
                embedding=embedding,
                metadata=metadata
            )
        
        logger.info("[%s] Successfully embedded %d chunks for document %s", run_id, len(chunks), document_id)
    except Exception as exc:
        logger.error("[%s] Failed to embed document %s: %s", run_id, document_id, exc, exc_info=True)


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

    # 2. Parse document text + PDF injection guard
    from ..parsers.document_parser import parse_document
    from ..guardrails.pdf_injection_guard import PDFInjectionGuard, InjectionDetectedException
    try:
        raw_text = parse_document(document_bytes, filename)

        # Layer: PDF injection guard — sanitise before LLM sees the text
        pdf_guard = PDFInjectionGuard(
            use_llm_check=True,
            ollama_base_url=s.ollama_base_url,
            evaluator_model=s.ollama_llm_model,
        )
        try:
            raw_text = pdf_guard.sanitise(raw_text, document_name=filename)
            logger.info("[%s] PDF injection guard passed for '%s'", run_id, filename)
        except InjectionDetectedException as exc:
            logger.error("[%s] PDF injection guard BLOCKED document '%s': %s", run_id, filename, exc)
            raise ValueError(
                f"Document '{filename}' was rejected by the security scanner: {exc}. "
                "Please upload a clean document without embedded instructions."
            )

        # Fire and forget background embedding job
        task = asyncio.create_task(
            _embed_and_store_document_background(
                text=raw_text,
                organization_id=organization_id,
                document_id=document_id,
                filename=filename,
                run_id=run_id
            )
        )
        _background_tasks.add(task)
        task.add_done_callback(_background_tasks.discard)

        if len(raw_text) > 120_000:
            raw_text = raw_text[:120_000] + "\n\n[DOCUMENT TRUNCATED]"
    except Exception as exc:
        logger.error("[%s] Failed to parse document: %s", run_id, exc)
        raise ValueError(f"Failed to parse document: {exc}")

    # 3. Setup Agent and initial state
    from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
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
                "configurable": {"thread_id": run_id},
                "metadata": {
                    "langfuse_session_id": run_id,
                    "langfuse_user_id": organization_id,
                    "agent_type": "document_analysis"
                }
            },
        )

        duration_ms = int(time.time() * 1000) - start_ms

        # Extract final answer from agent
        final_message_raw = final_state["messages"][-1].content if "messages" in final_state and final_state["messages"] else ""
        final_message = _message_content_to_str(final_message_raw)

        # Extract variables from messages in final_state
        fiscal_year = None
        emission_line_items = []
        compliance_api_result = {}
        graph_steps = ["parsing"]

        if "messages" in final_state:
            # We want to map tool call IDs to their inputs/details
            tool_calls_map = {}
            factors_map = {}
            
            for msg in final_state["messages"]:
                # If msg is AIMessage
                if isinstance(msg, AIMessage) or hasattr(msg, "tool_calls"):
                    tool_calls = getattr(msg, "tool_calls", None)
                    if tool_calls:
                        for tc in tool_calls:
                            name = tc.get("name")
                            tc_id = tc.get("id")
                            args = tc.get("args") or {}
                            if name == "get_emission_factors" and tc_id:
                                tool_calls_map[tc_id] = {"name": name}
                                if "retrieve_factors" not in graph_steps:
                                    graph_steps.append("retrieve_factors")
                            elif name == "calculate_scope_emissions" and tc_id:
                                tool_calls_map[tc_id] = {"name": name, "args": args}
                                if "calculate_emissions" not in graph_steps:
                                    graph_steps.append("calculate_emissions")

                # If msg is ToolMessage
                elif isinstance(msg, ToolMessage) or getattr(msg, "type", None) == "tool":
                    tc_id = getattr(msg, "tool_call_id", None)
                    if tc_id in tool_calls_map:
                        tinfo = tool_calls_map[tc_id]
                        if tinfo["name"] == "get_emission_factors":
                            try:
                                import json
                                data = []
                                if isinstance(msg.content, str):
                                    data = json.loads(msg.content)
                                elif isinstance(msg.content, list):
                                    data = msg.content
                                if isinstance(data, list):
                                    for f in data:
                                        fkey = f.get("factor_key")
                                        if fkey:
                                            factors_map[fkey] = {
                                                "unit": f.get("unit", "unit"),
                                                "scope": f.get("scope", "Scope 1")
                                            }
                            except Exception:
                                pass
                        elif tinfo["name"] == "calculate_scope_emissions":
                            args = tinfo.get("args") or {}
                            items = args.get("items") or []
                            for item in items:
                                fkey = item.get("factor_key", "")
                                mapped_info = factors_map.get(fkey, {})
                                unit = item.get("activity_unit") or mapped_info.get("unit") or "unit"
                                scope = item.get("scope_hint") or mapped_info.get("scope") or "Scope 1"
                                
                                emission_line_items.append(
                                    EmissionLineItem(
                                        factor_key=fkey,
                                        raw_quantity=float(item.get("raw_quantity", 0.0)),
                                        activity_unit=unit,
                                        year=int(item.get("year") or 2026),
                                        scope_hint=scope,
                                        source_text=item.get("source_text"),
                                    )
                                )
                            if items:
                                fiscal_year = int(items[0].get("year") or 2026)
                            
                            try:
                                import json
                                if isinstance(msg.content, str):
                                    compliance_api_result = json.loads(msg.content)
                                elif isinstance(msg.content, dict):
                                    compliance_api_result = msg.content
                            except Exception:
                                compliance_api_result = {"raw_output": str(msg.content)}

        # Fallback for fiscal year from get_emission_factors tool calls if not extracted from calculate_scope_emissions
        if fiscal_year is None:
            for msg in final_state.get("messages", []):
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        if tc.get("name") == "get_emission_factors":
                            args = tc.get("args") or {}
                            if "year" in args:
                                try:
                                    fiscal_year = int(args["year"])
                                except (ValueError, TypeError):
                                    pass

        graph_steps.append("summarize")

        result = DocumentAnalysisResult(
            run_id=uuid.UUID(run_id),
            organization_id=uuid.UUID(organization_id),
            document_id=uuid.UUID(document_id),
            fiscal_year=fiscal_year,
            revenue_crore=revenue_crore,
            emission_line_items=emission_line_items,
            summary=final_message,
            compliance_api_result=compliance_api_result,
            trace_url=f"{s.langfuse_host}/sessions/{run_id}",
            duration_ms=duration_ms,
            graph_steps=graph_steps,
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
