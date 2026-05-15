from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=4000)


class ChatSource(BaseModel):
    document_id: Optional[str] = None
    filename: Optional[str] = None
    chunk_index: Optional[int] = None
    similarity: float = 0.0
    excerpt: str


class ChatResponse(BaseModel):
    run_id: UUID
    session_id: UUID
    organization_id: UUID
    user_id: UUID
    answer: str
    sources: list[ChatSource] = Field(default_factory=list)
    duration_ms: int
    trace_url: Optional[str] = None
    guardrail_audit: dict[str, Any] = Field(default_factory=dict)
    interaction_id: Optional[UUID] = None


class ChatHistoryItem(BaseModel):
    interaction_id: UUID
    session_id: Optional[UUID] = None
    query: str
    answer: str
    created_at: str
    sources: list[ChatSource] = Field(default_factory=list)
    guardrail_blocked: bool = False


class ChatHistoryResponse(BaseModel):
    items: list[ChatHistoryItem] = Field(default_factory=list)
