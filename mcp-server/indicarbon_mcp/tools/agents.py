"""
AI Agent tools.

Gateway routes:
  POST /api/v1/ai/run              Run Auditor or Strategist agent
  POST /api/v1/analyse-document    Full AI document analysis (extract + calculate)
  GET  /api/v1/ai/registry         List agent registry entries
  POST /api/v1/ai/registry         Create agent registry entry
  GET  /api/v1/ai/registry/{id}    Get agent registry entry
  PATCH /api/v1/ai/registry/{id}   Update agent registry entry
  POST /api/v1/ai/hitl             Flag interaction for human review
  PATCH /api/v1/ai/hitl/{id}       Resolve HITL review
  GET  /api/v1/ai/chat             Chat with compliance agent
  GET  /api/v1/ai/chat/history     Retrieve chat history
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client
from ..config import settings


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_run_agent(
        agent_type: str,
        query: str,
        organization_id: str | None = None,
        document_ids: list[str] | None = None,
        session_id: str | None = None,
    ) -> str:
        """
        Run an IndiCarbon AI agent (Auditor or Strategist) with a query.

        Agent types:
          - "auditor"    — Analyses GHG data, verifies calculations, flags anomalies.
          - "strategist" — Provides decarbonisation strategies and carbon credit advice.

        Args:
            agent_type: "auditor" or "strategist".
            query: The question or task for the agent.
            organization_id: Scope the agent to this org's data (optional).
            document_ids: List of document UUIDs to include as context (optional).
            session_id: Resume an existing conversation session (optional).

        Note: AI agent calls may take up to 120 seconds for complex analysis.
        """
        payload: dict[str, Any] = {
            "agent_type": agent_type,
            "query": query,
        }
        if organization_id:
            payload["organization_id"] = organization_id
        if document_ids:
            payload["document_ids"] = document_ids
        if session_id:
            payload["session_id"] = session_id

        data = client.post("/api/v1/ai/run", json=payload, timeout=settings.ai_timeout)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_analyse_document(
        organization_id: str,
        document_id: str,
        fiscal_year: int | None = None,
    ) -> str:
        """
        Run full AI-powered sustainability document analysis.
        Extracts emission line items, calculates GHG scope totals, and
        auto-registers results in the compliance database.

        This is the primary entry point for processing:
          - Annual reports
          - Sustainability reports
          - Energy audit reports
          - BRSR disclosures

        Args:
            organization_id: UUID of the organisation that owns the document.
            document_id: UUID of the already-registered document to analyse.
            fiscal_year: Override fiscal year extraction (optional).

        Returns:
            Extracted emission line items, summary narrative, compliance API
            result, trace URL, and processing duration.

        Note: This may take up to 120 seconds for large documents.
        """
        payload: dict[str, Any] = {
            "organization_id": organization_id,
            "document_id": document_id,
        }
        if fiscal_year is not None:
            payload["fiscal_year"] = fiscal_year

        data = client.post(
            "/api/v1/analyse-document",
            json=payload,
            timeout=settings.ai_timeout,
        )
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_chat_with_agent(
        query: str,
        session_id: str | None = None,
        organization_id: str | None = None,
    ) -> str:
        """
        Chat with the IndiCarbon compliance assistant.
        Answers questions about GHG data, regulations (SEBI BRSR, CCTS),
        carbon trading, and sustainability strategy.

        Args:
            query: Your question or message.
            session_id: Continue an existing chat session (optional).
            organization_id: Restrict answers to this org's data (optional).
        """
        payload: dict[str, Any] = {"query": query}
        if session_id:
            payload["session_id"] = session_id
        if organization_id:
            payload["organization_id"] = organization_id

        data = client.post("/api/v1/ai/chat", json=payload, timeout=settings.ai_timeout)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_chat_history(
        session_id: str | None = None,
        limit: int = 20,
    ) -> str:
        """
        Retrieve chat interaction history with the AI compliance agent.

        Args:
            session_id: Filter by session UUID (optional).
            limit: Number of interactions to return (default 20).
        """
        params: dict[str, Any] = {"limit": limit}
        if session_id:
            params["session_id"] = session_id
        data = client.get("/api/v1/ai/chat/history", params=params)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_agent_registry(limit: int = 100, offset: int = 0) -> str:
        """
        List registered AI agents in the platform registry.
        Shows agent type, model version, and active status.

        Args:
            limit: Max results (default 100).
            offset: Pagination offset (default 0).
        """
        data = client.get("/api/v1/ai/registry", params={"limit": limit, "offset": offset})
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_create_hitl_review(
        interaction_id: str,
        reason: str,
        flagged_content: str | None = None,
    ) -> str:
        """
        Flag an AI agent interaction for Human-in-the-Loop (HITL) review.
        Use when an AI response seems incorrect, hallucinated, or requires
        expert validation before being used in compliance filings.

        Args:
            interaction_id: UUID of the agent interaction to flag.
            reason: Reason for flagging (e.g. "suspicious emission factor").
            flagged_content: Excerpt of the content to review (optional).
        """
        payload: dict[str, Any] = {
            "interaction_id": interaction_id,
            "reason": reason,
        }
        if flagged_content:
            payload["flagged_content"] = flagged_content
        data = client.post("/api/v1/ai/hitl", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_resolve_hitl_review(review_id: str, decision: str) -> str:
        """
        Resolve a pending HITL review after human expert evaluation.

        Args:
            review_id: UUID of the HITL review.
            decision: Resolution decision — "approved", "rejected", or "escalated".
        """
        data = client.patch(f"/api/v1/ai/hitl/{review_id}", json={"decision": decision})
        return json.dumps(data.get("data") or data, indent=2, default=str)
