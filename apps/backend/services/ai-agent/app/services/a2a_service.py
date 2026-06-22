"""
A2A (Agent-to-Agent) Service — v0.3.0
──────────────────────────────────────
Industry-standard Agent2Agent protocol service with the IndiCarbon
4-layer guardrail pipeline (PII → domain → injection → output) wrapping
every task.

Surface:
  * get_agent_card()        → v0.3.0 Agent Card (/.well-known/agent-card.json)
  * handle_jsonrpc()        → message/send, tasks/get, tasks/cancel
  * stream_jsonrpc()        → message/stream, tasks/resubscribe (SSE events)
  * send_task()             → REST convenience wrapper
  * list_tasks() / stats    → org-scoped activity (multi-tenant safe)
"""
from __future__ import annotations

import asyncio
import logging
import time
import uuid
from datetime import datetime, timezone
from typing import Any, AsyncGenerator, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from shared_logic import AuthenticatedUser

from ..config.settings import get_settings
from ..guardrails.domain_guard import (
    IndiCarbonDomainGuard,
    OFF_TOPIC_RESPONSE,
    UNSAFE_OUTPUT_RESPONSE,
)
from ..guardrails.pii_masker import PIIMasker
from ..repositories.a2a_repo import A2AMessageRepository, A2ATaskRepository
from ..repositories.agent_repo import AgentInteractionRepository, AgentRegistryRepository
from ..schemas.a2a import (
    A2A_TASK_NOT_CANCELABLE,
    A2A_TASK_NOT_FOUND,
    JSONRPC_INVALID_PARAMS,
    JSONRPC_METHOD_NOT_FOUND,
    A2AActivityStats,
    A2AAgentCapabilities,
    A2AAgentCard,
    A2AAgentInterface,
    A2AAgentProvider,
    A2AAgentSkill,
    A2AArtifact,
    A2AMessage,
    A2ASecurityScheme,
    A2ATask,
    A2ATaskState,
    A2ATaskStatus,
    A2ATaskStatusUpdateEvent,
    A2ATaskArtifactUpdateEvent,
    A2ATaskSummary,
    parts_to_text,
    text_part,
)

logger = logging.getLogger("ai-agent.services.a2a")


# ─── Skills (single source of truth) ─────────────────────────────────────────


_SKILLS: list[A2AAgentSkill] = [
    A2AAgentSkill(
        id="carbon-accounting",
        name="Carbon Accounting & GHG Analysis",
        description="Calculate Scope 1/2/3 emissions, analyse emission factors, and generate carbon footprint reports.",
        tags=["emissions", "ghg", "scope1", "scope2", "scope3", "carbon"],
        examples=[
            "Calculate our Scope 1 emissions from diesel consumption",
            "What are the emission factors for electricity in Maharashtra?",
            "Analyse our carbon footprint trend over the last 3 quarters",
        ],
    ),
    A2AAgentSkill(
        id="brsr-compliance",
        name="BRSR & ESG Compliance",
        description="Generate BRSR reports, check SEBI compliance, and provide ESG reporting guidance.",
        tags=["brsr", "esg", "sebi", "compliance", "reporting"],
        examples=[
            "Generate our BRSR report for FY2025-26",
            "Are we compliant with SEBI BRSR Core requirements?",
            "What ESG metrics should we track for our sector?",
        ],
    ),
    A2AAgentSkill(
        id="document-analysis",
        name="Sustainability Document Analysis",
        description="Extract emission data from sustainability reports, annual reports, and ESG disclosures.",
        tags=["document", "analysis", "extraction", "pdf"],
        examples=[
            "Analyse the uploaded sustainability report for emission data",
            "Extract Scope 2 electricity data from this annual report",
        ],
    ),
    A2AAgentSkill(
        id="carbon-trading",
        name="Carbon Credit Trading",
        description="Query carbon credit market, check portfolio, and advise on trading strategies.",
        tags=["trading", "credits", "marketplace", "offset"],
        examples=[
            "What's the current market price for VCS credits?",
            "Show me available carbon credits for our offset needs",
            "What's our carbon credit portfolio status?",
        ],
    ),
    A2AAgentSkill(
        id="strategy-advisory",
        name="Decarbonisation Strategy",
        description="Provide net-zero pathway recommendations, benchmark analysis, and reduction strategies.",
        tags=["strategy", "decarbonization", "net-zero", "advisory"],
        examples=[
            "What decarbonisation strategies fit our sector?",
            "How do we compare to industry benchmarks?",
            "Recommend a net-zero pathway for our organisation",
        ],
    ),
]


def get_agent_card(base_url: str = "http://localhost:8000") -> A2AAgentCard:
    base_url = base_url.rstrip("/")
    rpc_url = f"{base_url}/api/v1/a2a"
    return A2AAgentCard(
        protocol_version="0.3.0",
        name="IndiCarbon AI Agent",
        description=(
            "India's AI-native carbon accounting and sustainability compliance agent. "
            "Handles GHG emission calculations, BRSR reporting, ESG compliance, "
            "carbon credit trading, and document analysis for Indian enterprises."
        ),
        url=rpc_url,
        preferred_transport="JSONRPC",
        additional_interfaces=[A2AAgentInterface(url=rpc_url, transport="JSONRPC")],
        version="1.0.0",
        provider=A2AAgentProvider(organization="IndiCarbon AI", url=base_url),
        capabilities=A2AAgentCapabilities(
            streaming=True,
            push_notifications=False,
            state_transition_history=True,
        ),
        security_schemes={
            "bearer": A2ASecurityScheme(
                type="http",
                scheme="bearer",
                bearer_format="JWT",
                description="Supabase-issued JWT obtained from /api/v1/auth/login.",
            )
        },
        security=[{"bearer": []}],
        default_input_modes=["text/plain"],
        default_output_modes=["text/plain"],
        skills=_SKILLS,
        documentation_url=f"{base_url}/docs/a2a-protocol",
    )


# ─── Internals ───────────────────────────────────────────────────────────────


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _status(state: A2ATaskState, answer: Optional[str] = None,
            context_id: Optional[str] = None, task_id: Optional[str] = None) -> A2ATaskStatus:
    msg = None
    if answer is not None:
        msg = A2AMessage(
            role="agent",
            parts=[text_part(answer)],
            context_id=context_id,
            task_id=task_id,
        )
    return A2ATaskStatus(state=state, message=msg, timestamp=_now())


async def _guarded_execute(
    *,
    query: str,
    user: AuthenticatedUser,
    db: Session,
    context_id: str,
    task_id: str,
    skill_id: Optional[str],
    metadata: Optional[dict[str, Any]],
) -> A2ATask:
    """
    Run one A2A task through the full guardrail pipeline and persist it.
    Returns a fully-formed, spec-conformant A2ATask.
    """
    if user.organization_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User not attached to an organization.")

    s = get_settings()
    start = time.perf_counter()

    task_repo = A2ATaskRepository(db)
    msg_repo = A2AMessageRepository(db)
    registry_repo = AgentRegistryRepository(db)
    interaction_repo = AgentInteractionRepository(db)

    agent_record = registry_repo.get_or_create(
        agent_name="INDICARBON_A2A_AGENT",
        agent_type="A2A",
        model_version=s.ollama_chat_model,
    )

    # ── Guardrail 1: PII masking (one-way) before anything leaves to the LLM ──
    pii = PIIMasker(use_spacy=False)
    masked_query, input_pii = pii.mask(query)

    # ── Guardrail 2: domain gate on input ──
    domain_guard = IndiCarbonDomainGuard(
        ollama_base_url=s.ollama_base_url,
        evaluator_model=s.ollama_llm_model,
        fail_open=False,
        timeout_seconds=10.0,
    )
    input_verdict = domain_guard.check_input(masked_query)

    msg_repo.create(
        task_id=task_id,
        role="user",
        parts=[text_part(masked_query)],
        metadata_={"organization_id": str(user.organization_id), "user_id": str(user.id), "skill_id": skill_id},
    )

    if not input_verdict.allowed:
        duration_ms = int((time.perf_counter() - start) * 1000)
        msg_repo.create(task_id=task_id, role="agent", parts=[text_part(OFF_TOPIC_RESPONSE)])
        audit = {
            "input_pii_masked": len(input_pii),
            "domain_verdict_input": input_verdict.verdict_raw,
            "domain_reason": input_verdict.reason,
            "output_verdict": "not_checked",
        }
        task_repo.create(
            task_id=task_id, session_id=context_id, organization_id=user.organization_id,
            user_id=user.id, skill_id=skill_id, state="rejected", query=masked_query,
            answer=OFF_TOPIC_RESPONSE, duration_ms=duration_ms, token_usage=0,
            guardrail_blocked=True, guardrail_audit=audit, sender_agent_id=agent_record.id,
            error_message=f"Domain guard rejected input: {input_verdict.reason}",
            artifacts=[], history=[
                {"role": "user", "parts": [text_part(masked_query)]},
                {"role": "agent", "parts": [text_part(OFF_TOPIC_RESPONSE)]},
            ],
            metadata_=metadata or {},
        )
        return _build_task(
            task_id=task_id, context_id=context_id, state=A2ATaskState.REJECTED,
            query=masked_query, answer=OFF_TOPIC_RESPONSE, artifacts_text=OFF_TOPIC_RESPONSE,
            metadata={"guardrailAudit": audit, "durationMs": duration_ms, "tokenUsage": 0,
                      "guardrailBlocked": True},
        )

    # ── Execute via the RAG chat pipeline (LangChain ReAct + pgvector) ──
    from .chat_service import run_chat
    from ..schemas.chat import ChatRequest

    try:
        chat_result = await run_chat(req=ChatRequest(query=masked_query), user=user, db=db)
        answer = chat_result.answer
        sources = [src.model_dump() for src in chat_result.sources]
        chat_audit = chat_result.guardrail_audit or {}
    except Exception as exc:  # noqa: BLE001
        logger.error("A2A task %s execution failed: %s", task_id, exc, exc_info=True)
        duration_ms = int((time.perf_counter() - start) * 1000)
        audit = {"input_pii_masked": len(input_pii), "error": str(exc)}
        task_repo.create(
            task_id=task_id, session_id=context_id, organization_id=user.organization_id,
            user_id=user.id, skill_id=skill_id, state="failed", query=masked_query,
            answer=None, duration_ms=duration_ms, token_usage=0, guardrail_blocked=False,
            guardrail_audit=audit, sender_agent_id=agent_record.id,
            error_message=str(exc), artifacts=[], history=[], metadata_=metadata or {},
        )
        return _build_task(
            task_id=task_id, context_id=context_id, state=A2ATaskState.FAILED,
            query=masked_query, answer=f"Agent execution failed: {exc}", artifacts_text=None,
            metadata={"guardrailAudit": audit, "durationMs": duration_ms, "error": str(exc)},
        )

    # ── Guardrail 3: domain gate on output ──
    output_blocked = False
    output_verdict_raw = "skipped"
    if answer and answer != OFF_TOPIC_RESPONSE:
        output_verdict = domain_guard.check_output(masked_query, answer)
        output_verdict_raw = output_verdict.verdict_raw
        if not output_verdict.allowed:
            answer = UNSAFE_OUTPUT_RESPONSE
            output_blocked = True

    # NOTE: the answer is intentionally NOT re-masked. PII masking is one-way
    # (SHA-256) and the answer is generated from already-masked input + the
    # caller's own org context, so re-masking would corrupt legitimate figures.

    duration_ms = int((time.perf_counter() - start) * 1000)
    token_usage = len(masked_query.split()) + len(answer.split())
    final_state = "failed" if output_blocked else "completed"

    audit = {
        **chat_audit,
        "input_pii_masked": len(input_pii),
        "domain_verdict_input": input_verdict.verdict_raw,
        "domain_verdict_output": output_verdict_raw,
        "token_usage_estimated": True,
    }

    artifact = {"artifactId": f"artifact-{task_id}", "name": "response",
                "parts": [text_part(answer)]}

    msg_repo.create(task_id=task_id, role="agent", parts=[text_part(answer)],
                    metadata_={"sources": sources})

    task_repo.create(
        task_id=task_id, session_id=context_id, organization_id=user.organization_id,
        user_id=user.id, skill_id=skill_id, state=final_state, query=masked_query,
        answer=answer, artifacts=[artifact],
        history=[
            {"role": "user", "parts": [text_part(masked_query)]},
            {"role": "agent", "parts": [text_part(answer)]},
        ],
        metadata_=metadata or {}, token_usage=token_usage, duration_ms=duration_ms,
        guardrail_blocked=output_blocked, guardrail_audit=audit, sender_agent_id=agent_record.id,
    )

    interaction_repo.create(
        sender_agent_id=agent_record.id,
        session_id=_as_uuid(context_id),
        message_payload={
            "interaction_type": "a2a", "task_id": task_id, "context_id": context_id,
            "organization_id": str(user.organization_id), "user_id": str(user.id),
            "query": masked_query, "answer": answer, "skill_id": skill_id,
            "guardrail_blocked": output_blocked,
        },
        token_usage=token_usage, response_time_ms=duration_ms,
    )

    return _build_task(
        task_id=task_id, context_id=context_id,
        state=A2ATaskState(final_state), query=masked_query, answer=answer,
        artifacts_text=answer,
        metadata={"guardrailAudit": audit, "durationMs": duration_ms,
                  "tokenUsage": token_usage, "sources": sources, "guardrailBlocked": output_blocked},
    )


def _as_uuid(value: Optional[str]) -> Optional[uuid.UUID]:
    if not value:
        return None
    try:
        return uuid.UUID(value)
    except (ValueError, AttributeError):
        return None


def _build_task(
    *,
    task_id: str,
    context_id: Optional[str],
    state: A2ATaskState,
    query: str,
    answer: Optional[str],
    artifacts_text: Optional[str],
    metadata: dict[str, Any],
) -> A2ATask:
    artifacts: list[A2AArtifact] = []
    if artifacts_text is not None:
        artifacts.append(A2AArtifact(name="response", parts=[text_part(artifacts_text)]))
    return A2ATask(
        id=task_id,
        context_id=context_id,
        status=_status(state, answer=answer, context_id=context_id, task_id=task_id),
        artifacts=artifacts,
        history=[
            A2AMessage(role="user", parts=[text_part(query)], context_id=context_id, task_id=task_id),
            *([A2AMessage(role="agent", parts=[text_part(answer)], context_id=context_id, task_id=task_id)]
              if answer is not None else []),
        ],
        metadata=metadata,
    )


# ─── REST convenience ────────────────────────────────────────────────────────


async def send_task(
    query: str,
    user: AuthenticatedUser,
    db: Session,
    session_id: Optional[str] = None,
    skill_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> A2ATask:
    context_id = session_id or _new_context_id()
    task_id = _new_task_id()
    return await _guarded_execute(
        query=query, user=user, db=db, context_id=context_id, task_id=task_id,
        skill_id=skill_id, metadata=metadata,
    )


def _new_task_id() -> str:
    return f"task-{uuid.uuid4().hex}"


def _new_context_id() -> str:
    return f"ctx-{uuid.uuid4().hex}"


# ─── Read paths (org-scoped — multi-tenant safe) ─────────────────────────────


def get_task(task_id: str, db: Session, user: Optional[AuthenticatedUser] = None) -> A2ATask:
    record = A2ATaskRepository(db).get_by_task_id(task_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="A2A task not found.")
    _assert_task_access(record, user)

    history = [_message_from_stored(m) for m in (record.history or [])]
    artifacts = [
        A2AArtifact(
            artifact_id=a.get("artifactId") or a.get("artifact_id") or f"artifact-{task_id}",
            name=a.get("name"),
            parts=a.get("parts", []),
        )
        for a in (record.artifacts or [])
    ]
    return A2ATask(
        id=record.task_id,
        context_id=record.session_id,
        status=_status(A2ATaskState(record.state), answer=record.answer,
                       context_id=record.session_id, task_id=record.task_id),
        artifacts=artifacts,
        history=history,
        metadata=record.metadata_ or {},
    )


def _message_from_stored(m: dict[str, Any]) -> A2AMessage:
    role = m.get("role", "agent")
    return A2AMessage(role=role if role in ("user", "agent") else "agent",
                      parts=m.get("parts", []))


def cancel_task(task_id: str, db: Session, user: Optional[AuthenticatedUser] = None) -> A2ATask:
    repo = A2ATaskRepository(db)
    record = repo.get_by_task_id(task_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="A2A task not found.")
    _assert_task_access(record, user)
    if record.state in ("completed", "failed", "canceled", "rejected"):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail=f"Task is in terminal state '{record.state}' and cannot be canceled.")
    repo.update_state(task_id, "canceled")
    return A2ATask(
        id=task_id,
        context_id=record.session_id,
        status=_status(A2ATaskState.CANCELED, context_id=record.session_id, task_id=task_id),
    )


def _assert_task_access(record: Any, user: Optional[AuthenticatedUser]) -> None:
    """Reject cross-org access unless the caller is an admin."""
    if user is None:
        return
    if _is_admin(user):
        return
    if user.organization_id and record.organization_id and \
            str(record.organization_id) != str(user.organization_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="A2A task not found.")


def _is_admin(user: AuthenticatedUser) -> bool:
    roles = {str(r).upper() for r in (getattr(user, "roles", None) or [])}
    return bool(roles & {"ADMIN", "ORG_ADMIN", "SUPER_ADMIN"})


def list_tasks(
    db: Session,
    user: AuthenticatedUser,
    organization_id: Optional[str] = None,
    state: Optional[str] = None,
    skill_id: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
) -> list[A2ATaskSummary]:
    # Multi-tenant isolation: non-admins are pinned to their own org.
    scoped_org = organization_id
    if not _is_admin(user):
        if not user.organization_id:
            return []  # non-admin with no org sees nothing
        scoped_org = str(user.organization_id)

    records = A2ATaskRepository(db).list_tasks(
        organization_id=scoped_org, state=state, skill_id=skill_id, limit=limit, offset=offset,
    )
    return [
        A2ATaskSummary(
            id=r.task_id, context_id=r.session_id, state=A2ATaskState(r.state), query=r.query,
            answer=r.answer, skill_id=r.skill_id, duration_ms=r.duration_ms, token_usage=r.token_usage,
            guardrail_blocked=r.guardrail_blocked, guardrail_audit=r.guardrail_audit or {},
            organization_id=str(r.organization_id) if r.organization_id else None,
            user_id=str(r.user_id) if r.user_id else None,
            created_at=r.created_at.isoformat() if r.created_at else None,
            updated_at=r.updated_at.isoformat() if r.updated_at else None,
        )
        for r in records
    ]


def get_activity_stats(db: Session, user: AuthenticatedUser,
                       organization_id: Optional[str] = None) -> A2AActivityStats:
    scoped_org = organization_id
    if not _is_admin(user):
        if not user.organization_id:
            return A2AActivityStats()  # non-admin with no org sees nothing
        scoped_org = str(user.organization_id)
    raw = A2ATaskRepository(db).get_activity_stats(scoped_org)
    return A2AActivityStats(**raw)


# ─── JSON-RPC 2.0 dispatch ───────────────────────────────────────────────────


def _extract_message(params: dict[str, Any]) -> tuple[str, Optional[str], Optional[str], dict[str, Any]]:
    """Return (query_text, context_id, skill_id, metadata) from message/send params."""
    message = params.get("message") or {}
    parts = message.get("parts") or []
    query_text = parts_to_text(parts)
    context_id = message.get("contextId") or message.get("context_id") or params.get("contextId")
    msg_meta = message.get("metadata") or {}
    params_meta = params.get("metadata") or {}
    skill_id = (
        msg_meta.get("skill_id") or msg_meta.get("skillId")
        or params_meta.get("skill_id") or params_meta.get("skillId")
        or params.get("skillId")
    )
    merged_meta = {**params_meta, **msg_meta}
    return query_text, context_id, skill_id, merged_meta


async def handle_jsonrpc(payload: dict[str, Any], user: AuthenticatedUser, db: Session) -> dict[str, Any]:
    """Non-streaming JSON-RPC methods (message/send, tasks/get, tasks/cancel)."""
    request_id = payload.get("id")
    method = payload.get("method", "")
    params = payload.get("params") or {}

    try:
        if method in ("message/send", "tasks/send"):  # tasks/send = legacy alias
            query_text, context_id, skill_id, meta = _extract_message(params)
            if not query_text.strip():
                return _rpc_error(request_id, JSONRPC_INVALID_PARAMS, "No text part found in message.")
            task = await _guarded_execute(
                query=query_text, user=user, db=db,
                context_id=context_id or _new_context_id(), task_id=_new_task_id(),
                skill_id=skill_id, metadata=meta,
            )
            return _rpc_result(request_id, task.to_wire())

        if method == "tasks/get":
            task_id = params.get("id") or params.get("taskId")
            if not task_id:
                return _rpc_error(request_id, JSONRPC_INVALID_PARAMS, "Missing task id.")
            return _rpc_result(request_id, get_task(task_id, db, user).to_wire())

        if method == "tasks/cancel":
            task_id = params.get("id") or params.get("taskId")
            if not task_id:
                return _rpc_error(request_id, JSONRPC_INVALID_PARAMS, "Missing task id.")
            return _rpc_result(request_id, cancel_task(task_id, db, user).to_wire())

        if method == "message/stream":
            return _rpc_error(request_id, JSONRPC_INVALID_PARAMS,
                              "message/stream requires an SSE connection (Accept: text/event-stream).")

        return _rpc_error(request_id, JSONRPC_METHOD_NOT_FOUND, f"Unknown method: {method}")

    except HTTPException as exc:
        code = A2A_TASK_NOT_FOUND if exc.status_code == 404 else (
            A2A_TASK_NOT_CANCELABLE if exc.status_code == 409 else JSONRPC_INVALID_PARAMS)
        return _rpc_error(request_id, code, exc.detail)
    except Exception as exc:  # noqa: BLE001
        logger.error("A2A JSON-RPC error: %s", exc, exc_info=True)
        return _rpc_error(request_id, -32603, f"Internal error: {exc}")


def is_streaming_method(payload: dict[str, Any]) -> bool:
    return payload.get("method") in ("message/stream", "tasks/resubscribe")


async def stream_jsonrpc(
    payload: dict[str, Any], user: AuthenticatedUser, db: Session
) -> AsyncGenerator[dict[str, Any], None]:
    """
    SSE generator for message/stream and tasks/resubscribe.
    Yields JSON-RPC result envelopes carrying A2A streaming events.
    """
    request_id = payload.get("id")
    method = payload.get("method", "")
    params = payload.get("params") or {}

    if method == "tasks/resubscribe":
        task_id = params.get("id") or params.get("taskId")
        try:
            task = get_task(task_id, db, user)
        except HTTPException as exc:
            yield _rpc_error(request_id, A2A_TASK_NOT_FOUND, exc.detail)
            return
        yield _rpc_result(request_id, A2ATaskStatusUpdateEvent(
            task_id=task.id, context_id=task.context_id, status=task.status, final=True).to_wire())
        return

    query_text, context_id, skill_id, meta = _extract_message(params)
    context_id = context_id or _new_context_id()
    task_id = _new_task_id()

    if not query_text.strip():
        yield _rpc_error(request_id, JSONRPC_INVALID_PARAMS, "No text part found in message.")
        return

    # 1) submitted
    yield _rpc_result(request_id, A2ATaskStatusUpdateEvent(
        task_id=task_id, context_id=context_id,
        status=A2ATaskStatus(state=A2ATaskState.SUBMITTED, timestamp=_now()), final=False).to_wire())
    # 2) working
    yield _rpc_result(request_id, A2ATaskStatusUpdateEvent(
        task_id=task_id, context_id=context_id,
        status=A2ATaskStatus(state=A2ATaskState.WORKING, timestamp=_now()), final=False).to_wire())

    # 3) run the guarded pipeline (blocking work off the event loop is internal to run_chat)
    task = await _guarded_execute(
        query=query_text, user=user, db=db, context_id=context_id, task_id=task_id,
        skill_id=skill_id, metadata=meta,
    )

    # 4) emit the artifact (if any)
    if task.artifacts:
        yield _rpc_result(request_id, A2ATaskArtifactUpdateEvent(
            task_id=task_id, context_id=context_id, artifact=task.artifacts[0],
            append=False, last_chunk=True).to_wire())

    # 5) terminal status (final=True)
    yield _rpc_result(request_id, A2ATaskStatusUpdateEvent(
        task_id=task_id, context_id=context_id, status=task.status, final=True).to_wire())


# ─── JSON-RPC envelope helpers ───────────────────────────────────────────────


def _rpc_result(request_id: Any, result: Any) -> dict[str, Any]:
    return {"jsonrpc": "2.0", "id": request_id, "result": result}


def _rpc_error(request_id: Any, code: int, message: str, data: Any = None) -> dict[str, Any]:
    err: dict[str, Any] = {"code": code, "message": message}
    if data is not None:
        err["data"] = data
    return {"jsonrpc": "2.0", "id": request_id, "error": err}
