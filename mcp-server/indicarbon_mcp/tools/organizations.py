"""
Organization management tools.

Gateway routes:
  POST /api/v1/organizations/
  GET  /api/v1/organizations/
  GET  /api/v1/organizations/{org_id}
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_create_organization(
        legal_name: str,
        trade_name: str | None = None,
        industry_sector: str | None = None,
        registration_number: str | None = None,
    ) -> str:
        """
        Create a new organization on the IndiCarbon platform.

        Args:
            legal_name: Official legal name of the company.
            trade_name: Brand / trade name (optional).
            industry_sector: Industry sector (e.g. "Manufacturing", "IT Services").
            registration_number: Company registration / CIN number (optional).

        Returns organization ID and details.
        """
        payload: dict[str, Any] = {"legal_name": legal_name}
        if trade_name:
            payload["trade_name"] = trade_name
        if industry_sector:
            payload["industry_sector"] = industry_sector
        if registration_number:
            payload["registration_number"] = registration_number

        data = client.post("/api/v1/organizations/", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_organizations(limit: int = 50, offset: int = 0) -> str:
        """
        List all organizations accessible to the current user.

        Args:
            limit: Max results (1-200, default 50).
            offset: Pagination offset (default 0).
        """
        data = client.get("/api/v1/organizations/", params={"limit": limit, "offset": offset})
        # List endpoint returns list directly
        payload = data if isinstance(data, list) else (data.get("data") or data)
        return json.dumps(payload, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_organization(org_id: str) -> str:
        """
        Get details for a specific organization by its UUID.

        Args:
            org_id: Organization UUID.
        """
        data = client.get(f"/api/v1/organizations/{org_id}")
        return json.dumps(data.get("data") or data, indent=2, default=str)
