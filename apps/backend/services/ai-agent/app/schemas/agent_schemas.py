"""
app/schemas/agent_schemas.py
─────────────────────────────
Pydantic models for AI-Agent API request/response contracts.
These are internal to the ai-agent service. Shared schemas live in shared_logic.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


# ─── Document Extraction ─────────────────────────────────────────────────────

class DocumentAnalysisRequest(BaseModel):
    """
    Input to the /analyse-document endpoint.
    The caller uploads a file and optionally provides org context.
    """
    organization_id: UUID = Field(..., description="UUID of the requesting organisation")
    document_id: Optional[UUID] = Field(
        None,
        description="Optional UUID of a document already stored in the document vault",
    )
    fiscal_year: Optional[int] = Field(
        None,
        ge=2000,
        le=2100,
        description="Fiscal year the document covers; agent will infer if absent",
    )
    revenue_crore: Optional[float] = Field(
        None,
        gt=0,
        description="Revenue in crore INR for emission intensity calculation",
    )


class EmissionLineItem(BaseModel):
    """
    A single emission activity extracted from the source document.
    Maps directly to CalculateScopeEmissionsRequest in the Compliance service.
    """
    factor_key: str = Field(..., description="GHG factor key e.g. 'electricity', 'stationary_combustion'")
    raw_quantity: float = Field(..., gt=0, description="Activity quantity")
    activity_unit: str = Field(..., description="Unit of quantity e.g. 'kWh', 'litre', 'km'")
    year: int = Field(..., ge=2000, le=2100, description="Reporting year")
    scope_hint: Optional[str] = Field(None, description="Scope 1/2/3 hint from document")
    source_text: Optional[str] = Field(None, description="Verbatim excerpt from document that yielded this entry")


class DocumentAnalysisResult(BaseModel):
    """
    Full result of the document-analysis LangGraph run.
    """
    run_id: UUID = Field(default_factory=uuid4)
    organization_id: UUID
    document_id: Optional[UUID] = None
    fiscal_year: Optional[int] = None
    revenue_crore: Optional[float] = None

    # Extracted emission factors ready for the Compliance API
    emission_line_items: List[EmissionLineItem] = []

    # Human-readable summary from the LLM
    summary: str = ""

    # Optional: result of calling the Compliance calculate_scope_emissions API
    compliance_api_result: Optional[Dict[str, Any]] = None

    # Observability
    trace_url: Optional[str] = None
    duration_ms: int = 0
    completed_at: datetime = Field(default_factory=datetime.utcnow)
    graph_steps: List[str] = Field(default_factory=list, description="Ordered list of graph nodes executed")


# ─── General Agent Run ────────────────────────────────────────────────────────

class AgentRunRequest(BaseModel):
    """Generic agent run request (auditor / strategist)."""
    organization_id: UUID
    agent_type: str = Field(..., description="auditor | strategist")
    query: str = Field(..., min_length=10, max_length=2000)
    fiscal_year: Optional[int] = None


class AgentRunResult(BaseModel):
    """Generic agent run result."""
    run_id: UUID = Field(default_factory=uuid4)
    agent_type: str
    organization_id: UUID
    query: str
    answer: str
    tool_calls: List[Dict[str, Any]] = []
    trace_url: Optional[str] = None
    duration_ms: int = 0
    completed_at: datetime = Field(default_factory=datetime.utcnow)
