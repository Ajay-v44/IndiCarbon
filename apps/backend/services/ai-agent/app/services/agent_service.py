from __future__ import annotations

import logging
import time
import uuid
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..repositories.agent_repo import (
    AgentInteractionRepository,
    AgentRegistryRepository,
    HITLReviewRepository,
)
from ..schemas.agent import AgentRunRequest, AgentRunResponse, HITLReviewCreate

logger = logging.getLogger(__name__)


# ─── Agent Service — Pure Functions ───────────────────────────────────────────


async def run_agent(
    req: AgentRunRequest,
    db: Session,
    agent_factory,
) -> AgentRunResponse:
    """
    Execute an AI agent run, record the interaction in agent_interactions,
    and return the structured response.
    """
    start = time.perf_counter()
    run_id = uuid.uuid4()
    session_id = req.session_id or uuid.uuid4()

    agent_reg_repo = AgentRegistryRepository(db)
    interaction_repo = AgentInteractionRepository(db)

    agent_record = agent_reg_repo.get_or_create(
        agent_name=f"{req.agent_type.value}_AGENT",
        agent_type=req.agent_type.value,
        model_version=getattr(agent_factory, "model_version", "unknown"),
    )

    try:
        result: dict[str, Any] = await agent_factory.run(
            agent_type=req.agent_type.value,
            query=req.query,
            organization_id=str(req.organization_id),
            fiscal_year=req.fiscal_year,
            run_id=str(run_id),
        )
    except Exception as exc:
        logger.error("Agent run %s failed: %s", run_id, exc)
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"Agent execution failed: {exc}")

    elapsed_ms = int((time.perf_counter() - start) * 1000)

    interaction = interaction_repo.create(
        sender_agent_id=agent_record.id,
        session_id=session_id,
        message_payload={
            "run_id": str(run_id),
            "query": req.query,
            "organization_id": str(req.organization_id),
            "answer": result.get("answer", ""),
        },
        token_usage=result.get("token_usage", 0),
        response_time_ms=elapsed_ms,
    )

    logger.info("Agent run %s completed in %dms (type=%s)", run_id, elapsed_ms, req.agent_type.value)

    return AgentRunResponse(
        run_id=run_id,
        agent_type=req.agent_type,
        organization_id=req.organization_id,
        query=req.query,
        answer=result.get("answer", ""),
        sources=result.get("sources", []),
        tool_calls=result.get("tool_calls", []),
        trace_url=result.get("trace_url"),
        duration_ms=elapsed_ms,
        interaction_id=interaction.id,
    )


def create_hitl_review(req: HITLReviewCreate, db: Session) -> dict:
    """Flag an agent interaction for human review."""
    review = HITLReviewRepository(db).create(
        organization_id=req.organization_id,
        agent_interaction_id=req.agent_interaction_id,
        issue_detected=req.issue_detected,
        ai_suggestion=req.ai_suggestion,
    )
    return {"review_id": str(review.id), "status": "PENDING"}


def resolve_hitl_review(review_id: str, decision: str, reviewer_id: str, db: Session) -> dict:
    """Record a human reviewer's decision on a flagged agent interaction."""
    review = HITLReviewRepository(db).resolve(review_id, decision, reviewer_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="HITL review not found.")
    return {"review_id": review_id, "decision": decision, "reviewed_at": str(review.reviewed_at)}
