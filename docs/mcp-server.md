# MCP Server — IndiCarbon AI

IndiCarbon ships a production-ready [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that exposes 40+ tools covering the entire platform. Any MCP-compatible AI client (Claude Desktop, Claude Code, Cursor, Windsurf, etc.) can run compliance audits, trade credits, and generate reports through natural language.

---

## Quick Start (Hosted)

The MCP server is hosted — no local installation needed. Add one config block to your AI client:

### Claude Desktop / Claude Code

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

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

### Cursor / Windsurf

Add to `.cursor/mcp.json` or equivalent:

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

Restart your AI client. The IndiCarbon tools appear automatically.

---

## Architecture

```
┌──────────────────────────────────────────────┐
│  AI Client (Claude, Cursor, etc.)            │
│  ← MCP Protocol (stdio / SSE / HTTP) →       │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│  IndiCarbon MCP Server                       │
│  ├── FastMCP (mcp SDK v1.3+)                 │
│  ├── Auth Middleware (auto-login from headers)│
│  ├── Token Management (thread-safe, refresh) │
│  └── 40+ Tools across 6 modules             │
└──────────────────┬───────────────────────────┘
                   │ HTTP (httpx)
                   ▼
┌──────────────────────────────────────────────┐
│  API Gateway (:8000)                         │
│  ├── JWT Authentication                      │
│  ├── Rate Limiting (Redis)                   │
│  └── Reverse Proxy to Microservices          │
└──────────────────────────────────────────────┘
```

---

## Transport Modes

| Mode | Use Case | Command |
|------|----------|---------|
| **stdio** | Local process (Claude Desktop config) | `python -m indicarbon_mcp` |
| **Streamable HTTP** | Remote hosting (recommended) | `python -m indicarbon_mcp --http --port 8080` |
| **SSE** | Legacy remote hosting | `python -m indicarbon_mcp --sse --port 8080` |

The hosted deployment uses Streamable HTTP with auth middleware that extracts credentials from request headers.

---

## Tool Reference (40 tools)

### Authentication (7 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_login` | Authenticate with email/password, stores session token |
| `indicarbon_register` | Register a new user account (auto-logs in) |
| `indicarbon_get_profile` | Get current user's profile, roles, org memberships |
| `indicarbon_list_users` | List all users (admin only) |
| `indicarbon_list_roles` | List available RBAC roles |
| `indicarbon_create_role` | Create a new RBAC role (admin) |
| `indicarbon_assign_role` | Assign role to a user (admin) |

### Organisations (3 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_create_organization` | Create a new organisation |
| `indicarbon_list_organizations` | List all organisations |
| `indicarbon_get_organization` | Get organisation by UUID |

### Documents (5 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_register_document` | Upload and register a document in the vault |
| `indicarbon_list_documents` | List an organisation's documents |
| `indicarbon_get_document` | Get document metadata by ID |
| `indicarbon_verify_document` | Mark a document as verified/unverified |
| `indicarbon_get_document_signed_url` | Get a presigned download URL |

### Emissions & Compliance (6 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_submit_emission_report` | Submit a GHG emission entry (Scope 1/2/3) |
| `indicarbon_get_emission_summary` | Get scope totals for an organisation |
| `indicarbon_generate_brsr_report` | Generate a SEBI BRSR disclosure report |
| `indicarbon_list_emission_factors` | List active emission factors |
| `indicarbon_calculate_scope_emissions` | Bulk scope calculation from raw data |
| `indicarbon_list_sector_benchmarks` | Get CCTS sector intensity benchmarks |

### Carbon Marketplace (12 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_list_carbon_credits` | List an organisation's carbon credits |
| `indicarbon_retire_credits` | Permanently retire credits (offset) |
| `indicarbon_get_market_book` | View the open order book |
| `indicarbon_list_orders` | List org's order history |
| `indicarbon_place_order` | Place a BUY or SELL order |
| `indicarbon_cancel_order` | Cancel an open order |
| `indicarbon_list_trades` | View completed trade history |
| `indicarbon_list_proposals` | List marketplace RFQ proposals |
| `indicarbon_create_proposal` | Create a new RFQ proposal |
| `indicarbon_accept_proposal` | Accept a proposal |
| `indicarbon_reject_proposal` | Reject a proposal |
| `indicarbon_cancel_proposal` | Cancel your own proposal |

### AI Agents (7 tools)

| Tool | Description |
|------|-------------|
| `indicarbon_run_agent` | Run Auditor or Strategist agent |
| `indicarbon_analyse_document` | Full AI document analysis (extract + calculate) |
| `indicarbon_chat_with_agent` | Chat with compliance assistant |
| `indicarbon_get_chat_history` | Retrieve conversation history |
| `indicarbon_list_agent_registry` | List registered AI agents |
| `indicarbon_create_hitl_review` | Flag interaction for human review |
| `indicarbon_resolve_hitl_review` | Resolve a pending HITL review |

---

## Typical Workflows

### 1. Complete Emissions Audit

```
User: "Analyse the Tata Steel sustainability report and check BRSR compliance"

AI calls:
  1. indicarbon_login(email, password)
  2. indicarbon_list_organizations() → finds Tata Steel org UUID
  3. indicarbon_list_documents(org_id) → finds the report
  4. indicarbon_analyse_document(org_id, doc_id) → AI extracts emissions
  5. indicarbon_get_emission_summary(org_id) → shows scope totals
  6. indicarbon_generate_brsr_report(org_id) → full BRSR disclosure
```

### 2. Carbon Credit Trading

```
User: "Buy 500 VCS credits under ₹400/tCO2"

AI calls:
  1. indicarbon_get_market_book() → checks available sellers
  2. indicarbon_place_order(type="BUY", quantity=500, price=400, ...)
  3. indicarbon_list_trades() → confirms if matched
```

### 3. Compliance Strategy

```
User: "What's our reduction target gap and how do we close it?"

AI calls:
  1. indicarbon_get_emission_summary(org_id) → current emissions
  2. indicarbon_list_sector_benchmarks() → target intensity
  3. indicarbon_run_agent(agent_type="strategist", query="...")
```

---

## Self-Hosting

### Prerequisites

- Python 3.10+
- Access to the IndiCarbon API Gateway

### Install

```bash
cd mcp-server
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -e .
```

### Configure

Create a `.env` file:

```env
INDICARBON_GATEWAY_URL=http://localhost:8000
INDICARBON_EMAIL=admin@indicarbon.com
INDICARBON_PASSWORD=yourpassword
INDICARBON_REQUEST_TIMEOUT=30.0
INDICARBON_AI_TIMEOUT=120.0
```

### Run

```bash
# stdio (for local Claude Desktop)
python -m indicarbon_mcp

# HTTP (for remote hosting)
python -m indicarbon_mcp --http --port 8080

# SSE (legacy)
python -m indicarbon_mcp --sse --port 8080
```

---

## Technical Details

### Token Management

The MCP server handles authentication transparently:

1. **Auto-login**: If `INDICARBON_EMAIL`/`INDICARBON_PASSWORD` are set, logs in automatically on first tool call
2. **Header auth**: In HTTP mode, extracts credentials from `x-user-email`/`x-user-password` headers
3. **Token refresh**: On 401, silently refreshes the access token using the stored refresh token
4. **Thread safety**: Token storage uses threading locks for concurrent tool calls

### Error Handling

- HTTP errors from the gateway raise `httpx.HTTPStatusError` with the response body
- Auth failures prompt the user to call `indicarbon_login` first
- AI agent calls use extended timeouts (120s) for complex analysis
- All tool responses are JSON-serialized with `indent=2` for readability

### SDK Version

Built on `mcp[cli]>=1.3.0` (FastMCP) — the latest stable MCP SDK with full support for:
- Tool registration via decorators
- Typed parameters with docstring descriptions
- stdio, SSE, and Streamable HTTP transports
- Server instructions (shown to AI clients on connection)

---

## Spec Compliance

| MCP Spec Requirement | Status |
|---------------------|--------|
| Tool discovery | Automatic via FastMCP |
| Tool descriptions | Full docstrings with Args sections |
| Typed parameters | Python type hints (str, int, bool, list, Optional) |
| Error propagation | HTTPStatusError raised to client |
| Transport: stdio | Supported |
| Transport: SSE | Supported |
| Transport: Streamable HTTP | Supported (recommended) |
| Server instructions | Provided (workflow guidance) |
| Authentication | Header-based + auto-login |
