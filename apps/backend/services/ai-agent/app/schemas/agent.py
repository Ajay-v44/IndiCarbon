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


class AgentRegistryCreate(BaseModel):
    agent_name: str = Field(..., min_length=2, max_length=100)
    agent_type: str = Field(..., min_length=2, max_length=50)
    model_version: str = Field(..., min_length=1)
    is_active: bool = True


class AgentRegistryUpdate(BaseModel):
    agent_name: Optional[str] = Field(None, min_length=2, max_length=100)
    agent_type: Optional[str] = Field(None, min_length=2, max_length=50)
    model_version: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None


class AgentRegistryResponse(BaseModel):
    id: UUID
    agent_name: Optional[str] = None
    agent_type: Optional[str] = None
    model_version: Optional[str] = None
    is_active: bool = True
    created_at: Optional[str] = None
