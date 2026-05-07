"""
app/registry/compliance_registry.py
─────────────────────────────────────
Thin, typed wrappers around Compliance Service HTTP calls.

Pattern mirrors auth_registry.py: one function per API endpoint.
All network I/O is centralised here — graph nodes must NOT call httpx directly.

Available Compliance endpoints used:
  POST /api/v1/ghg/calculate-scope      → calculate_scope_emissions_api
  GET  /api/v1/ghg/emission-factors     → list_emission_factors_api
"""
from __future__ import annotations

import logging
from typing import Any, Dict, List

from shared_logic import ServiceName, get_service_client

logger = logging.getLogger("ai-agent.registry.compliance")


async def calculate_scope_emissions_api(
    organization_id: str,
    user_id: str,
    revenue_crore: float,
    emission_items: List[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Call the Compliance Service calculate_scope_emissions endpoint.

    Args:
        organization_id: UUID string of the organisation.
        user_id:         Acting user UUID (ai-agent-system for internal calls).
        revenue_crore:   Organisation revenue in crore INR for BRSR intensity.
        emission_items:  List of dicts matching CalculateScopeEmissionsRequest:
                         [{factor_key, raw_quantity, activity_unit, year, document_id}]

    Returns:
        JSON response dict from the Compliance Service.
    """
    client = get_service_client(ServiceName.COMPLIANCE, caller="ai-agent")

    # Build request payload — matches CalculateScopeEmissionsRequest schema
    payload = {
        "organization_id": organization_id,
        "revenue_crore": revenue_crore,
        "items": [
            {
                "factor_key": item["factor_key"],
                "raw_quantity": item["raw_quantity"],
                "activity_unit": item.get("activity_unit", "unit"),
                "year": item["year"],
                "document_id": str(item.get("document_id") or ""),
            }
            for item in emission_items
        ],
    }

    try:
        response = await client.apost_json(
            "/api/v1/ghg/calculate-scope",
            json=payload,
            headers={
                "X-User-ID": user_id,
                "X-Organization-ID": organization_id,
            },
        )
        logger.info(
            "Compliance API calculate_scope_emissions success: org=%s items=%d",
            organization_id,
            len(emission_items),
        )
        return response
    except Exception as exc:
        logger.error("Compliance API error (calculate_scope_emissions): %s", exc)
        return {"error": str(exc), "message": "Compliance Service unavailable"}


async def list_emission_factors_api(vintage_year: int | None = None) -> List[Dict[str, Any]]:
    """
    Fetch available emission factors from the Compliance Service.

    Args:
        vintage_year: Optional filter for factor vintage year.

    Returns:
        List of emission factor dicts.
    """
    client = get_service_client(ServiceName.COMPLIANCE, caller="ai-agent")
    params: Dict[str, Any] = {}
    if vintage_year:
        params["vintage_year"] = vintage_year

    try:
        response = await client.aget_json(
            "/api/v1/ghg/emission-factors",
            params=params,
            headers={"X-User-ID": "ai-agent-system"},
        )
        return response.get("data", [])
    except Exception as exc:
        logger.error("Compliance API error (list_emission_factors): %s", exc)
        return []
