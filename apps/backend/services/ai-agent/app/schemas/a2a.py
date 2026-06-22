"""
A2A (Agent-to-Agent) Protocol Schemas — v0.3.0
───────────────────────────────────────────────
Conformant with the Agent2Agent Protocol v0.3.0 JSON-RPC binding.
Reference: https://a2a-protocol.org/v0.3.0/specification/

Wire format notes (industry standard):
  * Agent Card served at  /.well-known/agent-card.json
  * JSON-RPC methods:     message/send, message/stream, tasks/get,
                          tasks/cancel, tasks/resubscribe
  * Part discriminator:   "kind"  ∈ {text, file, data}
  * Object discriminator: Message.kind = "message", Task.kind = "task"
  * Field casing:         camelCase on the wire (messageId, contextId, taskId …)

Spec models below derive from ``_A2ABase`` which auto-aliases snake_case →
camelCase. Always serialise spec models with ``.to_wire()`` (by_alias=True).
Internal convenience models (REST summaries / stats) stay snake_case so the
dashboard keeps working without alias gymnastics.
"""
from __future__ import annotations

import uuid
from enum import Enum
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


def _new_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex}"


# ─── Spec base (camelCase on the wire) ───────────────────────────────────────


class _A2ABase(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
    )

    def to_wire(self) -> dict[str, Any]:
        """Serialise to a spec-conformant JSON dict (camelCase, JSON types)."""
        return self.model_dump(by_alias=True, mode="json", exclude_none=True)


# ─── Message & Part model ────────────────────────────────────────────────────


def text_part(text: str, metadata: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    """Build a spec TextPart dict (kind=text)."""
    part: dict[str, Any] = {"kind": "text", "text": text}
    if metadata:
        part["metadata"] = metadata
    return part


def part_text(part: dict[str, Any]) -> str:
    """Extract text from any part shape (tolerant of legacy 'type' key)."""
    if part.get("kind") == "text" or part.get("type") == "text":
        return part.get("text", "") or ""
    if part.get("kind") == "data" or part.get("type") == "data":
        data = part.get("data")
        return str(data) if data is not None else ""
    return ""


def parts_to_text(parts: list[dict[str, Any]]) -> str:
    return "".join(part_text(p) for p in (parts or []))


class A2AMessage(_A2ABase):
    role: str = Field(pattern="^(user|agent)$")
    parts: list[dict[str, Any]]
    message_id: str = Field(default_factory=lambda: _new_id("msg"))
    kind: Literal["message"] = "message"
    context_id: Optional[str] = None
    task_id: Optional[str] = None
    reference_task_ids: Optional[list[str]] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


# ─── Task lifecycle ──────────────────────────────────────────────────────────


class A2ATaskState(str, Enum):
    SUBMITTED = "submitted"
    WORKING = "working"
    INPUT_REQUIRED = "input-required"
    COMPLETED = "completed"
    CANCELED = "canceled"
    FAILED = "failed"
    REJECTED = "rejected"
    AUTH_REQUIRED = "auth-required"
    UNKNOWN = "unknown"


class A2ATaskStatus(_A2ABase):
    state: A2ATaskState
    message: Optional[A2AMessage] = None
    timestamp: Optional[str] = None


class A2AArtifact(_A2ABase):
    artifact_id: str = Field(default_factory=lambda: _new_id("artifact"))
    name: Optional[str] = None
    description: Optional[str] = None
    parts: list[dict[str, Any]]
    metadata: dict[str, Any] = Field(default_factory=dict)


class A2ATask(_A2ABase):
    id: str
    context_id: Optional[str] = None
    status: A2ATaskStatus
    artifacts: list[A2AArtifact] = Field(default_factory=list)
    history: list[A2AMessage] = Field(default_factory=list)
    kind: Literal["task"] = "task"
    metadata: dict[str, Any] = Field(default_factory=dict)


# ─── Streaming events (message/stream, tasks/resubscribe) ────────────────────


class A2ATaskStatusUpdateEvent(_A2ABase):
    task_id: str
    context_id: Optional[str] = None
    kind: Literal["status-update"] = "status-update"
    status: A2ATaskStatus
    final: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)


class A2ATaskArtifactUpdateEvent(_A2ABase):
    task_id: str
    context_id: Optional[str] = None
    kind: Literal["artifact-update"] = "artifact-update"
    artifact: A2AArtifact
    append: bool = False
    last_chunk: bool = True
    metadata: dict[str, Any] = Field(default_factory=dict)


# ─── Agent Card (/.well-known/agent-card.json) ───────────────────────────────


class A2AAgentProvider(_A2ABase):
    organization: str
    url: str


class A2AAgentCapabilities(_A2ABase):
    streaming: bool = True
    push_notifications: bool = False
    state_transition_history: bool = True


class A2AAgentSkill(_A2ABase):
    id: str
    name: str
    description: str
    tags: list[str] = Field(default_factory=list)
    examples: list[str] = Field(default_factory=list)
    input_modes: Optional[list[str]] = None
    output_modes: Optional[list[str]] = None


class A2ASecurityScheme(_A2ABase):
    type: str = "http"
    scheme: str = "bearer"
    bearer_format: Optional[str] = "JWT"
    description: Optional[str] = None


class A2AAgentInterface(_A2ABase):
    url: str
    transport: str = "JSONRPC"


class A2AAgentCard(_A2ABase):
    protocol_version: str = "0.3.0"
    name: str
    description: str
    url: str
    preferred_transport: str = "JSONRPC"
    additional_interfaces: list[A2AAgentInterface] = Field(default_factory=list)
    version: str = "1.0.0"
    provider: A2AAgentProvider
    capabilities: A2AAgentCapabilities = Field(default_factory=A2AAgentCapabilities)
    security_schemes: dict[str, A2ASecurityScheme] = Field(default_factory=dict)
    security: list[dict[str, list[str]]] = Field(default_factory=list)
    default_input_modes: list[str] = Field(default_factory=lambda: ["text/plain"])
    default_output_modes: list[str] = Field(default_factory=lambda: ["text/plain"])
    skills: list[A2AAgentSkill] = Field(default_factory=list)
    supports_authenticated_extended_card: bool = False
    documentation_url: Optional[str] = None


# ─── JSON-RPC envelope ───────────────────────────────────────────────────────


class A2AJsonRpcError(BaseModel):
    code: int
    message: str
    data: Optional[Any] = None


# JSON-RPC / A2A error codes (spec §8)
JSONRPC_PARSE_ERROR = -32700
JSONRPC_INVALID_REQUEST = -32600
JSONRPC_METHOD_NOT_FOUND = -32601
JSONRPC_INVALID_PARAMS = -32602
JSONRPC_INTERNAL_ERROR = -32603
A2A_TASK_NOT_FOUND = -32001
A2A_TASK_NOT_CANCELABLE = -32002
A2A_PUSH_NOT_SUPPORTED = -32003
A2A_UNSUPPORTED_OPERATION = -32004
A2A_CONTENT_TYPE_NOT_SUPPORTED = -32005
A2A_INVALID_AGENT_RESPONSE = -32006


# ─── REST convenience models (snake_case, dashboard-facing) ──────────────────


class A2ASendTaskRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=8000)
    session_id: Optional[str] = None
    skill_id: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class A2ATaskSummary(BaseModel):
    id: str
    context_id: Optional[str] = None
    state: A2ATaskState
    query: str
    answer: Optional[str] = None
    skill_id: Optional[str] = None
    duration_ms: Optional[int] = None
    token_usage: Optional[int] = None
    guardrail_blocked: bool = False
    guardrail_audit: dict[str, Any] = Field(default_factory=dict)
    organization_id: Optional[str] = None
    user_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class A2AActivityStats(BaseModel):
    total_tasks: int = 0
    completed_tasks: int = 0
    failed_tasks: int = 0
    blocked_tasks: int = 0
    avg_duration_ms: float = 0.0
    total_tokens: int = 0
    tasks_by_state: dict[str, int] = Field(default_factory=dict)
    tasks_by_skill: dict[str, int] = Field(default_factory=dict)
    tasks_by_org: dict[str, int] = Field(default_factory=dict)
