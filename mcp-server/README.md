# IndiCarbon MCP Server

Model Context Protocol (MCP) server that connects any MCP-compatible AI agent
(Claude, GPT, etc.) to the full **IndiCarbon AI** platform.

> **See also:** IndiCarbon also supports [Google's A2A Protocol](../docs/a2a-protocol.md) for agent-to-agent task delegation with full guardrail pipeline.

## Features

| Domain | Capabilities |
|--------|-------------|
| **Auth** | Login, register, token management, RBAC role management |
| **Organisations** | Create, list, get org profiles |
| **Documents** | Register docs in vault, list, verify, presigned URLs |
| **Emissions** | Submit GHG data (Scope 1/2/3), emission summaries, BRSR reports |
| **Marketplace** | List credits, buy/sell orders, auto-matching, retire credits |
| **AI Agents** | Run Auditor/Strategist agents, analyse documents, HITL reviews |

## Quick Start (Hosted)

The IndiCarbon MCP server is hosted — no local installation needed.

Add this to your Claude Desktop config (`%APPDATA%\Claude\claude_desktop_config.json` on Windows,
`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "indicarbon": {
      "url": "https://indicarbon.ajayv.online/mcp/",
      "headers": {
        "x-user-email": "your@email.com",
        "x-user-password": "yourpassword"
      }
    }
  }
}
```

Restart your AI client. The 40+ IndiCarbon tools appear automatically.

## Self-Hosting (Development)

### 1. Install

```bash
cd mcp-server

# Create and activate a virtual environment:
uv venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install the package
uv pip install -e .
```

### 2. Configure

```bash
cp .env.example .env
# Edit .env with your gateway URL and credentials
```

### 3. Run

```bash
# stdio transport (local process — for Claude Desktop local config)
python -m indicarbon_mcp

# HTTP transport (remote hosting — Streamable HTTP)
python -m indicarbon_mcp --http --port 8080

# SSE transport (legacy)
python -m indicarbon_mcp --sse --port 8080
```

## Available Tools (30 total)

### Authentication
| Tool | Description |
|------|-------------|
| `indicarbon_login` | Authenticate & store session token |
| `indicarbon_register` | Register new user account |
| `indicarbon_get_profile` | Get current user profile |
| `indicarbon_list_users` | List all users (admin) |
| `indicarbon_list_roles` | List RBAC roles |
| `indicarbon_create_role` | Create new role (admin) |
| `indicarbon_assign_role` | Assign role to user (admin) |

### Organisations
| Tool | Description |
|------|-------------|
| `indicarbon_create_organization` | Create organisation |
| `indicarbon_list_organizations` | List all organisations |
| `indicarbon_get_organization` | Get org by ID |

### Documents
| Tool | Description |
|------|-------------|
| `indicarbon_register_document` | Register doc in vault |
| `indicarbon_list_documents` | List org's documents |
| `indicarbon_get_document` | Get doc metadata |
| `indicarbon_verify_document` | Verify/unverify a doc |
| `indicarbon_get_document_signed_url` | Presigned download URL |

### Emissions & Compliance
| Tool | Description |
|------|-------------|
| `indicarbon_submit_emission_report` | Submit GHG entry |
| `indicarbon_get_emission_summary` | Scope 1/2/3 totals |
| `indicarbon_generate_brsr_report` | SEBI BRSR report |
| `indicarbon_list_emission_factors` | Active emission factors |
| `indicarbon_calculate_scope_emissions` | Bulk scope calculation |
| `indicarbon_list_sector_benchmarks` | CCTS sector benchmarks |

### Carbon Marketplace
| Tool | Description |
|------|-------------|
| `indicarbon_list_carbon_credits` | List org's credits |
| `indicarbon_get_market_book` | Open SELL order book |
| `indicarbon_list_orders` | Org's order history |
| `indicarbon_place_order` | Place BUY or SELL order |
| `indicarbon_cancel_order` | Cancel open order |
| `indicarbon_retire_credits` | Retire credits permanently |
| `indicarbon_list_trades` | Completed trade history |
| `indicarbon_list_proposals` | List RFQ proposals |
| `indicarbon_create_proposal` | Create new RFQ proposal |
| `indicarbon_accept_proposal` | Accept a proposal |
| `indicarbon_reject_proposal` | Reject a proposal |
| `indicarbon_cancel_proposal` | Cancel your own proposal |

### AI Agents
| Tool | Description |
|------|-------------|
| `indicarbon_run_agent` | Run Auditor or Strategist agent |
| `indicarbon_analyse_document` | AI document analysis + auto-calculate |
| `indicarbon_chat_with_agent` | Chat with compliance assistant |
| `indicarbon_get_chat_history` | Retrieve chat history |
| `indicarbon_list_agent_registry` | List registered agents |
| `indicarbon_create_hitl_review` | Flag interaction for human review |
| `indicarbon_resolve_hitl_review` | Resolve HITL review |
