"""
app/graph/state.py
───────────────────
LangGraph state definition for the IndiCarbon AI-Agent pipeline.

State is the single shared mutable object that flows through every node.
Using TypedDict keeps it serialisable and compatible with LangGraph's
built-in checkpointing and streaming mechanisms.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional
from typing_extensions import TypedDict


class AgentState(TypedDict, total=False):
    """
    Shared state object threaded through the LangGraph document-analysis graph.

    Fields are populated incrementally as the graph executes.
    Nodes MUST only add/update keys — never delete existing ones.

    Lifecycle
    ─────────
    START
     │
     ├─ parse_document_node       → fills: raw_text, filename
     │
     ├─ extract_emissions_node    → fills: emission_items, llm_raw_output
     │
     ├─ validate_items_node       → fills: validated_items, validation_warnings
     │
     ├─ call_compliance_node  ┐   (runs concurrently if multiple scopes)
     │                        └── fills: compliance_result
     │
     ├─ summarise_node            → fills: summary
     │
     └─ END
    """

    # ── Input ─────────────────────────────────────────────────────────────────
    organization_id: str                       # UUID string of the org
    user_id: str                               # Acting user (usually "ai-agent-system")
    document_bytes: bytes                      # Raw file bytes
    filename: str                              # Original filename with extension
    fiscal_year: Optional[int]                 # Hint from caller; agent may override
    revenue_crore: Optional[float]             # For BRSR intensity calculation
    document_id: Optional[str]                 # Existing vault doc UUID (if any)
    run_id: str                                # Unique run UUID for tracing

    # ── Parsing ───────────────────────────────────────────────────────────────
    raw_text: str                              # Parsed plain text from document

    # ── Extraction ────────────────────────────────────────────────────────────
    llm_raw_output: str                        # Raw LLM JSON string response
    emission_items: List[Dict[str, Any]]       # Parsed emission line items

    # ── Validation ────────────────────────────────────────────────────────────
    validated_items: List[Dict[str, Any]]      # Items after validation filter
    validation_warnings: List[str]             # Non-fatal warnings

    # ── Compliance API ────────────────────────────────────────────────────────
    compliance_result: Dict[str, Any]          # Response from Compliance Service

    # ── Summary ───────────────────────────────────────────────────────────────
    summary: str                               # Human-readable audit summary

    # ── Metadata ─────────────────────────────────────────────────────────────
    graph_steps: List[str]                     # Ordered list of nodes executed
    errors: List[str]                          # Non-fatal errors accumulated during run
