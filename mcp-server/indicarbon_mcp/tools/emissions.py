"""
GHG emissions & compliance tools.

Gateway routes (all under /api/v1/emissions):
  POST  /                          Submit emission report entry
  GET   /summary                   Aggregated scope totals
  GET   /brsr                      Generate SEBI BRSR compliance report
  GET   /factors                   List active emission factors
  POST  /calculate_scope_emissions  Calculate and store scope emissions from document
  GET   /benchmarks                List sector benchmarks
  POST  /benchmarks                Create sector benchmark (super admin)
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client
from ..config import settings


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_submit_emission_report(
        organization_id: str,
        scope_type: str,
        raw_quantity: float,
        activity_unit: str,
        reporting_period_start: str,
        reporting_period_end: str,
        document_evidence_id: str | None = None,
        factor_key: str | None = None,
    ) -> str:
        """
        Submit a GHG emission data entry for an organisation.
        The system calculates tCO₂e using the matched emission factor.

        Args:
            organization_id: UUID of the organisation.
            scope_type: GHG scope — "SCOPE_1", "SCOPE_2", or "SCOPE_3".
            raw_quantity: Activity quantity (e.g. 1500 for 1500 kWh).
            activity_unit: Unit of measurement (e.g. "kWh", "litre", "km").
            reporting_period_start: ISO date e.g. "2024-04-01".
            reporting_period_end:   ISO date e.g. "2025-03-31".
            document_evidence_id: UUID of a supporting document (optional).
            factor_key: Emission factor key (e.g. "GRID_ELECTRICITY_IN").
                        If omitted, the system auto-selects based on scope.
        """
        payload: dict[str, Any] = {
            "organization_id": organization_id,
            "scope_type": scope_type,
            "raw_quantity": raw_quantity,
            "activity_unit": activity_unit,
            "reporting_period_start": reporting_period_start,
            "reporting_period_end": reporting_period_end,
        }
        if document_evidence_id:
            payload["document_evidence_id"] = document_evidence_id
        if factor_key:
            payload["factor_key"] = factor_key

        data = client.post("/api/v1/emissions", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_emission_summary(
        organization_id: str,
        period_start: str,
        period_end: str,
    ) -> str:
        """
        Get aggregated GHG scope totals (Scope 1 + 2 + 3) and grand total for
        an organisation over a reporting period.

        Args:
            organization_id: UUID of the organisation.
            period_start: ISO date e.g. "2024-04-01".
            period_end:   ISO date e.g. "2025-03-31".
        """
        data = client.get("/api/v1/emissions/summary", params={
            "organization_id": organization_id,
            "period_start": period_start,
            "period_end": period_end,
        })
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_generate_brsr_report(
        period_start: str,
        period_end: str,
        revenue_crore: float | None = None,
    ) -> str:
        """
        Generate a SEBI BRSR (Business Responsibility and Sustainability Report)
        compliance report for the current user's organisation.

        Args:
            period_start: Reporting period start date (ISO format, e.g. "2024-04-01").
            period_end:   Reporting period end date   (ISO format, e.g. "2025-03-31").
            revenue_crore: Annual revenue in crores for intensity calculation (optional).
        """
        params: dict[str, Any] = {
            "period_start": period_start,
            "period_end": period_end,
        }
        if revenue_crore is not None:
            params["revenue_crore"] = revenue_crore
        data = client.get("/api/v1/emissions/brsr", params=params)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_emission_factors(vintage_year: int | None = None) -> str:
        """
        List active emission factors used in GHG calculations.
        Factors come from BEE, MoEFCC, and IPCC databases.

        Args:
            vintage_year: Filter factors by year (e.g. 2024). Omit for all years.
        """
        # This endpoint is public (no auth required)
        import httpx
        params: dict[str, Any] = {}
        if vintage_year is not None:
            params["vintage_year"] = vintage_year
        with httpx.Client(base_url=settings.gateway_url) as c:
            resp = c.get("/api/v1/emissions/factors", params=params)
        resp.raise_for_status()
        data = resp.json()
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_calculate_scope_emissions(
        document_id: str,
        revenue_crore: float,
        emission_items: list[dict],
    ) -> str:
        """
        Calculate and persist scope emissions from a set of activity items
        extracted from a document. Used after AI document analysis.

        Args:
            document_id: UUID of the evidence document.
            revenue_crore: Annual revenue in crores for intensity calculation.
            emission_items: List of emission line items. Each item must contain:
                - year (int): Calendar year e.g. 2024.
                - factor_key (str): Emission factor key e.g. "GRID_ELECTRICITY_IN".
                - raw_quantity (float): Activity amount.

        Example emission_items:
            [
                {"year": 2024, "factor_key": "GRID_ELECTRICITY_IN", "raw_quantity": 150000},
                {"year": 2024, "factor_key": "DIESEL_COMBUSTION", "raw_quantity": 5000}
            ]
        """
        data = client.post(
            f"/api/v1/emissions/calculate_scope_emissions"
            f"?revenue_crore={revenue_crore}&document_id={document_id}",
            json=emission_items,
        )
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_sector_benchmarks() -> str:
        """
        List CCTS sector benchmarks for compliance intensity targets.
        Requires SUPER_ADMIN or SALES role.
        """
        data = client.get("/api/v1/emissions/benchmarks")
        return json.dumps(data.get("data") or data, indent=2, default=str)
