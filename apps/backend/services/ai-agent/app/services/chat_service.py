from __future__ import annotations

import logging
import asyncio
import time
import uuid
from datetime import datetime
from functools import lru_cache
from typing import Any

import httpx
from fastapi import BackgroundTasks, HTTPException, status
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from langchain_ollama import ChatOllama
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from sqlalchemy import text
from sqlalchemy.orm import Session

from shared_logic import AuthenticatedUser
from shared_logic.supabase_client import VectorRepository

from langgraph.prebuilt import create_react_agent

from ..config.settings import get_settings
from ..config.observability import build_langfuse_handler
from ..graph.chat_tools import build_chat_tools
from ..guardrails.domain_guard import (
    IndiCarbonDomainGuard,
    OFF_TOPIC_RESPONSE,
    UNSAFE_OUTPUT_RESPONSE,
)
from ..guardrails.pii_masker import PIIMasker
from ..repositories.agent_repo import AgentInteractionRepository, AgentRegistryRepository, HITLReviewRepository
from ..schemas.chat import ChatHistoryItem, ChatHistoryResponse, ChatRequest, ChatResponse, ChatSource

logger = logging.getLogger("ai-agent.services.chat")

_background_tasks: set = set()


@lru_cache(maxsize=1)
def _get_chat_llm() -> BaseChatModel:
    s = get_settings()
    if s.llm_provider == "openai":
        return ChatOpenAI(
            model=s.openai_chat_model,
            api_key=s.openai_api_key,
            temperature=s.openai_temperature,
            max_tokens=min(s.openai_max_tokens, 1024),
        )
    elif s.llm_provider == "google":
        return ChatGoogleGenerativeAI(
            model=s.gemini_chat_model,
            google_api_key=s.google_api_key,
            temperature=s.ollama_temperature,
            max_output_tokens=min(s.ollama_num_predict, 1024),
        )
    else:
        return ChatOllama(
            base_url=s.ollama_base_url,
            model=s.ollama_chat_model,
            temperature=s.ollama_temperature,
            num_predict=min(s.ollama_num_predict, 420),
        )


def _default_session_id(user: AuthenticatedUser) -> uuid.UUID:
    return uuid.uuid5(
        uuid.NAMESPACE_URL,
        f"indicarbon-chat:{user.organization_id}:{user.id}",
    )


def _is_admin(user: AuthenticatedUser) -> bool:
    return any(role.upper() in {"ADMIN", "ORG_ADMIN", "SUPER_ADMIN"} for role in user.roles)


def _extract_chat_memory(
    interactions: list[Any],
    organization_id: str,
    user_id: str,
    limit: int,
) -> str:
    turns: list[str] = []
    for interaction in interactions:
        payload = interaction.message_payload or {}
        if payload.get("interaction_type") != "chat":
            continue
        if str(payload.get("organization_id")) != organization_id:
            continue
        if str(payload.get("user_id")) != user_id:
            continue

        query = (payload.get("query") or "").strip()
        answer = (payload.get("answer") or "").strip()
        if query and answer:
            turns.append(f"User: {query}\nAssistant: {answer}")

    return "\n\n".join(turns[-limit:])


async def _embed_query(query: str) -> list[float]:
    s = get_settings()
    if s.llm_provider == "openai":
        embeddings = OpenAIEmbeddings(
            model=s.openai_embed_model,
            api_key=s.openai_api_key,
        )
        return await embeddings.aembed_query(query)
    elif s.llm_provider == "google":
        embeddings = GoogleGenerativeAIEmbeddings(
            model=s.gemini_embed_model,
            google_api_key=s.google_api_key,
            output_dimensionality=768,
        )
        return await embeddings.aembed_query(query)
    else:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(
                f"{s.ollama_base_url}/api/embeddings",
                json={"model": s.ollama_embed_model, "prompt": query},
            )
            resp.raise_for_status()
            return resp.json()["embedding"]


async def _search_org_documents(query: str, organization_id: str) -> list[ChatSource]:
    s = get_settings()
    embedding = await _embed_query(query)
    repo = VectorRepository()

    raw_results = await time_to_thread(
        repo.similarity_search,
        query_embedding=embedding,
        match_threshold=s.chat_vector_match_threshold,
        match_count=max(s.chat_vector_match_count * 4, s.chat_vector_match_count),
    )

    sources: list[ChatSource] = []
    for result in raw_results:
        metadata = result.get("metadata") or {}
        if str(metadata.get("organization_id")) != organization_id:
            continue

        content = (result.get("content") or "").strip()
        if not content:
            continue

        sources.append(
            ChatSource(
                document_id=metadata.get("document_id"),
                filename=metadata.get("filename"),
                chunk_index=metadata.get("chunk_index"),
                similarity=float(result.get("similarity") or 0.0),
                excerpt=content[:700],
            )
        )
        if len(sources) >= s.chat_vector_match_count:
            break

    return sources


async def _search_org_documents_fast(query: str, organization_id: str) -> list[ChatSource]:
    try:
        return await asyncio.wait_for(_search_org_documents(query, organization_id), timeout=3.0)
    except Exception as exc:
        logger.warning("Chat memory/vector lookup skipped: %s", exc)
        return []


async def time_to_thread(func, /, *args, **kwargs):
    import asyncio

    return await asyncio.to_thread(func, *args, **kwargs)


async def _embed_and_store_chat_turn(
    *,
    organization_id: str,
    user_id: str,
    session_id: str,
    interaction_id: str,
    query: str,
    answer: str,
):
    try:
        repo = VectorRepository()
        content = f"User: {query}\nAssistant: {answer}"
        embedding = await _embed_query(content)
        await time_to_thread(
            repo.upsert_embedding,
            content=content,
            embedding=embedding,
            metadata={
                "content_type": "chat",
                "organization_id": organization_id,
                "user_id": user_id,
                "session_id": session_id,
                "interaction_id": interaction_id,
                "created_at": datetime.utcnow().isoformat(),
            },
        )
    except Exception as exc:
        logger.error("Failed to embed chat turn %s: %s", interaction_id, exc, exc_info=True)


def _schedule_background(coro) -> None:
    task = asyncio.create_task(coro)
    _background_tasks.add(task)
    task.add_done_callback(_background_tasks.discard)


async def _run_coro_background(coro) -> None:
    await coro


def _schedule_after_response(background_tasks: BackgroundTasks | None, coro) -> None:
    if background_tasks is not None:
        background_tasks.add_task(_run_coro_background, coro)
    else:
        _schedule_background(coro)


def _fetch_structured_context(query: str, organization_id: str, db: Session) -> str:
    lower = query.lower()
    snippets: list[str] = []

    if any(word in lower for word in ["emission", "scope", "tco2e", "brsr", "score"]):
        try:
            totals = db.execute(
                text(
                    """
                    SELECT
                        COALESCE(scope_type, 'unknown') AS scope_type,
                        COALESCE(SUM(calculated_tco2e), 0) AS total_tco2e
                    FROM emission_reports
                    WHERE organization_id = :organization_id
                    GROUP BY scope_type
                    ORDER BY scope_type
                    """
                ),
                {"organization_id": organization_id},
            ).mappings().all()
            if totals:
                snippets.append(
                    "Emission totals by scope: "
                    + "; ".join(f"{row['scope_type']}={float(row['total_tco2e']):.3f} tCO2e" for row in totals)
                )
        except Exception as exc:
            logger.debug("Structured emission lookup skipped: %s", exc)

        try:
            scores = db.execute(
                text(
                    """
                    SELECT month_year, total_monthly_tco2e, monthly_revenue_cr, calculated_score
                    FROM monthly_emissions_summary
                    WHERE organization_id = :organization_id
                    ORDER BY month_year DESC
                    LIMIT 6
                    """
                ),
                {"organization_id": organization_id},
            ).mappings().all()
            if scores:
                snippets.append(
                    "Recent BRSR scores: "
                    + "; ".join(
                        f"{row['month_year']}: score={float(row['calculated_score']):.2f}, "
                        f"tCO2e={float(row['total_monthly_tco2e']):.3f}"
                        for row in scores
                    )
                )
        except Exception as exc:
            logger.debug("Structured score lookup skipped: %s", exc)

    if any(word in lower for word in ["credit", "credits", "carbon credit", "retire", "available"]):
        try:
            credits = db.execute(
                text(
                    """
                    SELECT status, COUNT(*) AS credit_count
                    FROM carbon_credits
                    WHERE current_owner_id = :organization_id
                    GROUP BY status
                    ORDER BY status
                    """
                ),
                {"organization_id": organization_id},
            ).mappings().all()
            if credits:
                snippets.append(
                    "Carbon credits by status: "
                    + "; ".join(f"{row['status']}={int(row['credit_count'])}" for row in credits)
                )
        except Exception as exc:
            logger.debug("Structured credit lookup skipped: %s", exc)

    if any(word in lower for word in ["delete", "update", "edit", "retire", "transfer"]):
        snippets.append(
            "Mutation policy: update/delete/retire/transfer actions require human approval. "
            "The assistant may explain the requested action but must not execute it directly."
        )

    return "\n".join(snippets) if snippets else "No structured table context matched this question."


def _requires_human_approval(query: str) -> bool:
    lower = query.lower()
    return any(word in lower for word in ["delete", "update", "edit", "retire", "transfer", "approve", "commit"])


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


def _answer_violates_policy(answer: Any) -> bool:
    lower = _message_content_to_str(answer).lower()
    blocked_markers = [
        "debug mode activated",
        "developer mode activated",
        "restrictions removed",
        "guardrails disabled",
        "my creator",
        "as your creator",
        "i can ignore",
        "i will ignore",
    ]
    return any(marker in lower for marker in blocked_markers)


def _format_sources(sources: list[ChatSource]) -> str:
    if not sources:
        return "No organization document context was retrieved."
    return "\n\n".join(
        (
            f"[{idx}] filename={source.filename or 'unknown'} "
            f"document_id={source.document_id or 'unknown'} "
            f"chunk={source.chunk_index if source.chunk_index is not None else 'unknown'} "
            f"similarity={source.similarity:.2f}\n{source.excerpt}"
        )
        for idx, source in enumerate(sources, start=1)
    )


def _build_system_prompt(
    user: AuthenticatedUser,
    memory: str,
    sources: list[ChatSource],
    structured_context: str,
) -> str:
    role_mode = "admin" if _is_admin(user) else "standard user"
    access_rule = (
        "The user is an admin. You may answer broad internal IndiCarbon and organization questions, "
        "but only using this organization's retrieved context, chat memory, and general carbon-accounting knowledge."
        if _is_admin(user)
        else
        "The user is not an admin. Keep answers focused on their organization's carbon, ESG, BRSR, "
        "document, and platform data. Do not expose admin-only operational details."
    )

    return f"""You are the IndiCarbon responsible AI chatbot.

You must follow these rules:
- Answer only about IndiCarbon, carbon accounting, GHG emissions, ESG, BRSR, sustainability reporting, document analysis, and this user's organization.
- Never use or infer data from another organization.
- If asked about your organization's details, company name, or legal name, use the `get_organization_details` tool to fetch the info and respond with it.
- When asked to create a user:
  1. ALWAYS first fetch available roles using `get_available_roles` and list them (names and IDs) to the user.
  2. Ask the user to confirm the details (email, full name, role ID).
  3. Once confirmed, call the `create_new_user` tool to log the pending request.
  4. Immediately inform the user of the logged request's HITL ID, and ask them if they want to approve and execute this user creation now.
  5. If they confirm or say yes to approve, call `approve_hitl_review` with that HITL ID to execute it.
- For other database updates, deletes, or inserts, call the `execute_sql_query` tool to log the request, then ask the user if they want to approve it. If they confirm, call `approve_hitl_review` with the returned HITL ID.
- Do not invent document names, figures, emission totals, policies, users, or organization facts.
- Prefer the structured table context for numeric totals, scores, and credit counts.
- Use concise, practical language. Keep your output concise and to the point.
- Treat chat memory as user-specific context, not as verified source evidence.

Current user role mode: {role_mode}
Organization ID: {user.organization_id}
User ID: {user.id}
Role policy: {access_rule}

Recent user-specific chat memory:
{memory or "No prior chat memory for this user/session."}

Structured table context:
{structured_context}

Retrieved organization document context:
{_format_sources(sources)}
"""



async def run_chat(
    req: ChatRequest,
    user: AuthenticatedUser,
    db: Session,
    background_tasks: BackgroundTasks | None = None,
) -> ChatResponse:
    if user.organization_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authenticated user is not attached to an organization.",
        )

    s = get_settings()
    run_id = uuid.uuid4()
    session_id = _default_session_id(user)
    start = time.perf_counter()
    organization_id = str(user.organization_id)
    user_id = str(user.id)

    pii = PIIMasker(use_spacy=False)
    masked_query, input_pii = pii.mask(req.query)

    domain_guard = IndiCarbonDomainGuard(
        ollama_base_url=s.ollama_base_url,
        evaluator_model=s.ollama_llm_model,
        fail_open=False,
        timeout_seconds=10.0,
    )
    input_verdict = domain_guard.check_input(masked_query)

    registry_repo = AgentRegistryRepository(db)
    interaction_repo = AgentInteractionRepository(db)
    agent_record = registry_repo.get_or_create(
        agent_name="INDICARBON_CHATBOT",
        agent_type="CHATBOT",
        model_version=s.ollama_chat_model,
    )

    if not input_verdict.allowed:
        duration_ms = int((time.perf_counter() - start) * 1000)
        interaction = interaction_repo.create(
            sender_agent_id=agent_record.id,
            session_id=session_id,
            message_payload={
                "interaction_type": "chat",
                "run_id": str(run_id),
                "organization_id": organization_id,
                "user_id": user_id,
                "roles": user.roles,
                "query": masked_query,
                "answer": OFF_TOPIC_RESPONSE,
                "guardrail_blocked": True,
                "guardrail_reason": input_verdict.reason,
                "completed_at": datetime.utcnow().isoformat(),
            },
            token_usage=0,
            response_time_ms=duration_ms,
        )
        return ChatResponse(
            run_id=run_id,
            session_id=session_id,
            organization_id=user.organization_id,
            user_id=user.id,
            answer=OFF_TOPIC_RESPONSE,
            duration_ms=duration_ms,
            guardrail_audit={
                "input_pii_masked": len(input_pii),
                "domain_verdict_input": input_verdict.verdict_raw,
                "domain_verdict_output": "not_checked",
            },
            interaction_id=interaction.id,
        )

    recent = interaction_repo.get_recent_by_session(str(session_id), limit=s.chat_memory_turns * 2)
    memory = _extract_chat_memory(recent, organization_id, user_id, s.chat_memory_turns)
    sources = await _search_org_documents_fast(masked_query, organization_id)
    structured_context = _fetch_structured_context(masked_query, organization_id, db)

    llm = _get_chat_llm()
    pii_unmask_map = {m.hash_token: m.original for m in input_pii}
    tools = build_chat_tools(db, organization_id, user_id, pii_unmask_map=pii_unmask_map)
    langfuse_handler = build_langfuse_handler(str(run_id), "chat", organization_id)

    system_prompt = _build_system_prompt(user, memory, sources, structured_context)
    agent = create_react_agent(llm, tools)

    try:
        final_state = await asyncio.wait_for(
            agent.ainvoke(
                {
                    "messages": [
                        SystemMessage(content=system_prompt),
                        HumanMessage(content=masked_query),
                    ]
                },
                config={
                    "recursion_limit": 12,
                    "callbacks": [langfuse_handler],
                    "metadata": {
                        "langfuse_session_id": str(session_id),
                        "langfuse_user_id": user_id,
                    },
                },
            ),
            timeout=s.chat_llm_timeout_seconds,
        )
        answer_raw = final_state["messages"][-1].content if "messages" in final_state else "I could not generate an answer."
        answer = _message_content_to_str(answer_raw)
    except asyncio.TimeoutError:
        logger.warning("[%s] Chat model timed out after %.1fs", run_id, s.chat_llm_timeout_seconds)
        answer = (
            "I could not generate a reliable answer quickly enough. "
            "Please ask a narrower IndiCarbon question or try again."
        )
    except Exception as exc:
        logger.error("[%s] Chat model call failed: %s", run_id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Chat model call failed: {exc}",
        )

    output_verdict_raw = "skipped_fast_path"
    if _answer_violates_policy(answer):
        answer = UNSAFE_OUTPUT_RESPONSE
        output_verdict_raw = "blocked_deterministic_output"

    masked_answer, output_pii = pii.mask(answer)
    answer = masked_answer
    duration_ms = int((time.perf_counter() - start) * 1000)
    token_usage = len(masked_query.split()) + len(answer.split())

    interaction = interaction_repo.create(
        sender_agent_id=agent_record.id,
        session_id=session_id,
        message_payload={
            "interaction_type": "chat",
            "run_id": str(run_id),
            "organization_id": organization_id,
            "user_id": user_id,
            "roles": user.roles,
            "query": masked_query,
            "answer": answer,
            "source_count": len(sources),
            "sources": [source.model_dump() for source in sources],
            "structured_context": structured_context,
            "guardrail_blocked": False,
            "domain_verdict_input": input_verdict.verdict_raw,
            "domain_verdict_output": output_verdict_raw,
            "completed_at": datetime.utcnow().isoformat(),
        },
        token_usage=token_usage,
        response_time_ms=duration_ms,
    )

    # HITL is now handled securely inside the tools (chat_tools.py), 
    # so we don't need the brittle regex check here.
    hitl_review_id = None

    _schedule_after_response(
        background_tasks,
        _embed_and_store_chat_turn(
            organization_id=organization_id,
            user_id=user_id,
            session_id=str(session_id),
            interaction_id=str(interaction.id),
            query=masked_query,
            answer=answer,
        ),
    )

    return ChatResponse(
        run_id=run_id,
        session_id=session_id,
        organization_id=user.organization_id,
        user_id=user.id,
        answer=answer,
        sources=sources,
        duration_ms=duration_ms,
        trace_url=None,
        guardrail_audit={
            "input_pii_masked": len(input_pii),
            "output_pii_masked": len(output_pii),
            "domain_verdict_input": input_verdict.verdict_raw,
            "domain_verdict_output": output_verdict_raw,
            "hitl_review_id": hitl_review_id,
        },
        interaction_id=interaction.id,
    )


def get_chat_history(
    user: AuthenticatedUser,
    db: Session,
    limit: int = 50,
    offset: int = 0,
) -> ChatHistoryResponse:
    if user.organization_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Authenticated user is not attached to an organization.",
        )

    rows = AgentInteractionRepository(db).get_recent_chat_for_user(
        organization_id=str(user.organization_id),
        user_id=str(user.id),
        limit=limit,
        offset=offset,
    )

    items: list[ChatHistoryItem] = []
    for row in rows:
        payload = row.message_payload or {}
        items.append(
            ChatHistoryItem(
                interaction_id=row.id,
                session_id=row.session_id,
                query=payload.get("query") or "",
                answer=payload.get("answer") or "",
                created_at=row.created_at.isoformat() if row.created_at else "",
                sources=[ChatSource(**source) for source in payload.get("sources", [])],
                guardrail_blocked=bool(payload.get("guardrail_blocked")),
            )
        )
    return ChatHistoryResponse(items=items)
