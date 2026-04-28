from __future__ import annotations

from enum import Enum
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AgentType(str, Enum):
    AUDITOR = "COMPLIANCE"
    STRATEGIST = "TRADING"
    DATA_EXTRACTOR = "DATA_EXTRACTOR"


class AgentRunRequest(BaseModel):
    organization_id: UUID
    agent_type: AgentType
    query: str = Field(..., min_length=10, max_length=2000)
    fiscal_year: Optional[int] = None
    session_id: Optional[UUID] = None


class AgentRunResponse(BaseModel):
    run_id: UUID
    agent_type: AgentType
    organization_id: UUID
    query: str
    answer: str
    sources: list[str] = []
    tool_calls: list[dict[str, Any]] = []
    trace_url: Optional[str] = None
    duration_ms: int
    interaction_id: Optional[UUID] = None


class HITLReviewCreate(BaseModel):
    organization_id: UUID
    agent_interaction_id: UUID
    issue_detected: str
    ai_suggestion: str


class HITLReviewResolve(BaseModel):
    decision: str = Field(..., pattern="^(APPROVED|REJECTED|EDITED)$")
