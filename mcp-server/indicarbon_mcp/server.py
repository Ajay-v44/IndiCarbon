"""
IndiCarbon MCP Server

Exposes 30+ tools covering the complete IndiCarbon AI platform:
  - Authentication & token management
  - Organisation management
  - Document vault (Supabase Storage integration)
  - GHG emissions & SEBI BRSR compliance
  - Carbon credit marketplace (buy, sell, retire)
  - AI agents (Auditor, Strategist, document analysis, chat)
"""

from __future__ import annotations

import logging

from mcp.server.fastmcp import FastMCP

from .config import settings
from .tools import auth, organizations, documents, emissions, marketplace, agents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("indicarbon_mcp")


def create_server() -> FastMCP:
    mcp = FastMCP(
        name="IndiCarbon AI",
        instructions="""
You are connected to **IndiCarbon AI** — India's AI-native carbon trading &
sustainability compliance platform.

## Available capability groups

| Group | Tools |
|-------|-------|
| **Auth** | login, register, get_profile, list_users, list_roles, create_role, assign_role |
| **Organisations** | create, list, get |
| **Documents** | register, list, get, verify, signed_url |
| **Emissions** | submit_report, summary, brsr_report, emission_factors, calculate_scope, benchmarks |
| **Marketplace** | list_credits, retire, market_book, list_orders, place_order, cancel_order, list_trades |
| **AI Agents** | run_agent, analyse_document, chat, chat_history, hitl_review, agent_registry |

## Typical workflow

1. Call `indicarbon_login` with credentials to authenticate.
2. Use `indicarbon_list_organizations` to find an org UUID.
3. Register a document with `indicarbon_register_document`.
4. Analyse it with `indicarbon_analyse_document` (AI extracts emissions).
5. View the BRSR report with `indicarbon_generate_brsr_report`.
6. Trade carbon credits: check `indicarbon_get_market_book`, then `indicarbon_place_order`.

## Base URL
Gateway: {gateway_url}
""".format(gateway_url=settings.gateway_url),
    )

    # Register all tool groups
    auth.register(mcp)
    organizations.register(mcp)
    documents.register(mcp)
    emissions.register(mcp)
    marketplace.register(mcp)
    agents.register(mcp)

    logger.info(
        "IndiCarbon MCP server initialised — gateway=%s",
        settings.gateway_url,
    )
    return mcp
