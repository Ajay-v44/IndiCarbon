"""
Carbon marketplace tools.

Gateway routes:
  GET  /api/v1/credits              List credits for an org
  POST /api/v1/credits/retire       Retire credits permanently
  GET  /api/v1/orders/market        Open SELL order book
  GET  /api/v1/orders               List org's orders
  POST /api/v1/orders               Place buy/sell order (auto-matches)
  DELETE /api/v1/orders/{id}        Cancel open order
  GET  /api/v1/marketplace/trades   Trade history
"""

from __future__ import annotations

import json
from typing import Any

from mcp.server.fastmcp import FastMCP

from .. import client


def register(mcp: FastMCP) -> None:

    @mcp.tool()
    def indicarbon_list_carbon_credits(organization_id: str) -> str:
        """
        List all carbon credits owned by an organisation.
        Credits may be ISSUED, PENDING_TRANSFER, or RETIRED.

        Args:
            organization_id: UUID of the organisation.
        """
        data = client.get("/api/v1/credits", params={"organization_id": organization_id})
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_retire_credits(credit_ids: list[str]) -> str:
        """
        Permanently retire one or more carbon credits.
        Retirement is irreversible and removes credits from circulation.
        Typically done to offset emissions.

        Args:
            credit_ids: List of carbon credit UUIDs to retire.
        """
        data = client.post("/api/v1/credits/retire", json=credit_ids)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_get_market_book() -> str:
        """
        Get all open SELL orders on the carbon credit market.
        Shows available listings with price, quantity, vintage year, and project type.
        Use this to discover buy opportunities before placing an order.
        """
        data = client.get("/api/v1/orders/market")
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_orders(organization_id: str) -> str:
        """
        List all orders (buy and sell) placed by an organisation.

        Args:
            organization_id: UUID of the organisation.
        """
        data = client.get("/api/v1/orders", params={"organization_id": organization_id})
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_place_order(
        organization_id: str,
        order_type: str,
        quantity: int,
        price_per_unit: float,
        vintage_year: int | None = None,
        project_type: str | None = None,
    ) -> str:
        """
        Place a carbon credit buy or sell order on the marketplace.
        The platform auto-matches your order against existing counterparties.
        If matched, trade is settled immediately (ACID-safe).
        If unmatched, the order stays open in the order book.

        Args:
            organization_id: UUID of the trading organisation.
            order_type: "BUY" or "SELL".
            quantity: Number of carbon credits (tCO₂e units, must be > 0).
            price_per_unit: Price per credit in INR (e.g. 1500.00).
            vintage_year: Filter to credits from this year (optional).
            project_type: Filter by project type e.g. "solar", "forestry" (optional).

        Returns:
            matched (bool), trade receipt if matched, or order ID if queued.
        """
        payload: dict[str, Any] = {
            "organization_id": organization_id,
            "order_type": order_type,
            "quantity": quantity,
            "price_per_unit": str(price_per_unit),
        }
        if vintage_year is not None:
            payload["vintage_year"] = vintage_year
        if project_type:
            payload["project_type"] = project_type

        data = client.post("/api/v1/orders", json=payload)
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_cancel_order(order_id: str) -> str:
        """
        Cancel an open (unfilled) order on the marketplace.
        Only OPEN orders can be cancelled; FILLED orders cannot.

        Args:
            order_id: UUID of the order to cancel.
        """
        data = client.delete(f"/api/v1/orders/{order_id}")
        return json.dumps(data.get("data") or data, indent=2, default=str)

    @mcp.tool()
    def indicarbon_list_trades(organization_id: str) -> str:
        """
        List completed trade history for an organisation.
        Shows settled buy/sell transactions with full receipt details.

        Args:
            organization_id: UUID of the organisation.
        """
        data = client.get("/api/v1/marketplace/trades", params={"organization_id": organization_id})
        return json.dumps(data.get("data") or data, indent=2, default=str)
