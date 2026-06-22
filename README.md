<div align="center">

# 🌿 IndiCarbon AI

**India's AI-Native Sustainability Compliance & Carbon Trading Platform**

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![LangChain](https://img.shields.io/badge/LangChain-0.2-1C3C3C?style=flat-square)](https://langchain.com)
[![Ollama](https://img.shields.io/badge/Ollama-qwen2.5:3b-white?style=flat-square)](https://ollama.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docker.com)

> Automate SEBI BRSR reporting, calculate GHG emissions across all scopes, and trade verified carbon credits — powered by privacy-first, local AI agents.

</div>

---

## ✨ Features

| Module | Capabilities |
|--------|-------------|
| **Compliance Engine** | Scope 1/2/3 GHG calculations (GHG Protocol), SEBI BRSR report generation, emission factor management |
| **Carbon Marketplace** | Carbon credit registry (Verra VCS, Gold Standard), order book, ACID-safe Reserve→Commit trade settlement, RFQ proposals |
| **AI Sovereign Agent** | LangChain ReAct agents (Auditor + Strategist), local Ollama LLMs, Langfuse observability, Supabase vector search |
| **MCP Server** | 40+ tools via Model Context Protocol — connect Claude, Cursor, or any MCP host to the full platform |
| **A2A Protocol** | Agent2Agent v0.3.0 — agent-to-agent communication with task lifecycle, JSON-RPC 2.0 + SSE streaming, guardrailed execution |
| **API Gateway** | Supabase JWT auth, Redis rate limiting, reverse-proxy routing, 4-layer guardrail pipeline |

---

## 🔌 AI Agent Integration

IndiCarbon supports two complementary AI integration protocols:

### MCP (Model Context Protocol)

Connect any MCP-compatible AI client directly to the platform. Zero-install hosted server with 40+ tools.

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

**Compatible with:** Claude Desktop, Claude Code, Cursor, Windsurf, and any MCP host.

See [`docs/mcp-server.md`](docs/mcp-server.md) for the full tool reference and workflow examples.

### A2A (Agent-to-Agent Protocol)

Agent2Agent v0.3.0 for agent-to-agent task delegation. External agents can discover IndiCarbon's capabilities and send structured tasks (blocking or SSE-streamed).

```bash
# Discover the agent (v0.3.0 well-known path)
curl https://indicarbon.ajayv.online/.well-known/agent-card.json

# Send a message (JSON-RPC 2.0)
curl -X POST https://indicarbon.ajayv.online/api/v1/a2a \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":"1","method":"message/send","params":{"message":{"role":"user","kind":"message","messageId":"1","parts":[{"kind":"text","text":"Generate our BRSR report for FY2025-26"}],"metadata":{"skill_id":"brsr-compliance"}}}}'

# Or run the bundled external-agent demo (discovers, logs in, sends + streams):
python scripts/a2a_demo_client.py --email you@company.com --password 'secret'
```

**Skills:** Carbon Accounting, BRSR Compliance, Document Analysis, Carbon Trading, Strategy Advisory

**Guardrails:** Every A2A task passes through PII masking, domain guard, injection defense, and output validation.

See [`docs/a2a-protocol.md`](docs/a2a-protocol.md) for the full protocol specification and integration guide.

---

## 🏗️ Architecture

```
                    ┌───────��─────────────────────────────┐
                    │         External AI Agents           │
                    │  (Claude, Cursor, custom agents)     │
                    └────────┬──────────────┬─────────────┘
                             │ MCP          │ A2A (JSON-RPC)
                             ▼              ▼
Internet → Next.js :3000 → API Gateway :8000
                               ├── /.well-known/agent.json (A2A discovery)
                               ├── /mcp/ (MCP Streamable HTTP)
                               ├── Compliance Service :8001
                               ├── Marketplace Service :8002
                               └── AI-Agent Service   :8003
                                   ├── A2A Protocol (task lifecycle)
                                   ├── Guardrail Pipeline (PII/Domain/Injection)
                                   └── ReAct Agent (LangChain + RAG)
                                        ↓
                              Supabase (PostgreSQL + pgvector)
                              Redis (rate limits + trade locks)

  MCP Server :8080 (standalone, or hosted at /mcp/)
  └── 40+ tools → Gateway HTTP calls

  HOST MACHINE (not in Docker)
  └── Ollama :11434  (qwen2.5:3b-instruct, nomic-embed-text)
       ↑ accessed by ai-agent via host.docker.internal
```

See [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for the full directory tree and design patterns.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | ≥ 4.25 | [docker.com](https://docker.com) |
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| Python | ≥ 3.12 | [python.org](https://python.org) |
| Git | any | [git-scm.com](https://git-scm.com) |
| **Ollama** | latest | Running locally on your machine |

> ⚠️ **Ollama runs on your host machine — not inside Docker.**  
> Ensure it is running before starting the stack: `ollama serve`  
> Required models (already installed): `qwen2.5:3b-instruct`, `nomic-embed-text`  
> The `ai-agent` container reaches Ollama via `host.docker.internal:11434`.

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/your-org/IndiCarbon.git
cd IndiCarbon
```

---

### Step 2 — Configure environment variables

All secrets live in `.envs/`. The files are already created — fill in the values marked `YOUR_*`:

```bash
# Critical files to edit:
.envs/.supabase.env      # Supabase URL, anon key, service role key, JWT secret
.envs/.langfuse.env      # Langfuse keys (already filled)
.envs/.redis.env         # Set a strong REDIS_PASSWORD
.envs/.gateway.env       # Review ALLOWED_ORIGINS for production
.envs/.frontend.env      # NEXT_PUBLIC_SUPABASE_* values
```

**Supabase — get missing keys from your dashboard:**

1. Go to [Supabase Dashboard → Settings → API](https://supabase.com/dashboard/project/tuehmheaycywuiuwmwzu/settings/api)
2. Copy **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`
3. Copy **JWT Secret** (under "JWT Settings") → `SUPABASE_JWT_SECRET`

---

### Step 3 — Initialise the Supabase database

Run the migration in the [Supabase SQL Editor](https://supabase.com/dashboard/project/tuehmheaycywuiuwmwzu/sql/new):

```bash
# Copy and paste the contents of this file into the SQL editor and run it:
supabase/migrations/001_initial_schema.sql
```

This creates all tables, the `pgvector` extension, RLS policies, and the `match_embeddings()` function.

> ⚠️ Make sure **pgvector** is enabled first:  
> Dashboard → Database → Extensions → search `vector` → Enable

---

### Step 4 — Start all services with Docker

```bash
docker compose up --build
```

Docker will automatically start Redis, all 3 microservices, the API Gateway, and the frontend.

> **Ollama is NOT in Docker** — it reads from your host at `host.docker.internal:11434`.  
> Make sure `ollama serve` is running on your machine before `docker compose up`.

| Service | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:3000 |
| 🔀 API Gateway | http://localhost:8000 |
| 📖 Gateway Swagger Docs | http://localhost:8000/api/docs |
| 🧪 Compliance Docs | http://localhost:8001/docs *(internal)* |
| 🛒 Marketplace Docs | http://localhost:8002/docs *(internal)* |
| 🤖 AI Agent Docs | http://localhost:8003/docs *(internal)* |
| 🔧 Auth Service | http://localhost:8004/docs *(internal)* |


---

### Step 5 — Local development (without Docker)

Install the shared library and run each service individually:

```bash
# Install shared Python library
pip install -e libs

# Install Python dependencies
pip install supabase langfuse fastapi uvicorn httpx redis pydantic-settings \
            PyJWT langchain langchain-community

# Run API Gateway
cd apps/backend/services/gateway
uvicorn main:app --reload --port 8000

# Run Compliance Service (new terminal)
cd apps/backend/services/compliance
uvicorn main:app --reload --port 8001

# Run Marketplace Service (new terminal)
cd apps/backend/services/marketplace
uvicorn main:app --reload --port 8002

# Run AI-Agent Service (new terminal)
cd apps/backend/services/ai-agent
uvicorn main:app --reload --port 8003

# Run Auth Service (new terminal)
cd apps/backend/services/auth
uvicorn main:app --reload --port 8004

# Run Frontend (new terminal)
cd apps/frontend
npm install
npm run dev
```

---

### Step 6 — Test the AI Agent

```bash
# First get a JWT from Supabase Auth, then:
curl -X POST http://localhost:8000/api/v1/ai/run \
  -H "Authorization: Bearer <your_supabase_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "<your_org_uuid>",
    "agent_type": "auditor",
    "query": "Audit our FY2024 emissions. We consumed 450,000 kWh of grid electricity and 12,000 litres of diesel. Are we BRSR compliant?",
    "fiscal_year": 2024
  }'
```

View the AI reasoning trace at: [https://cloud.langfuse.com](https://cloud.langfuse.com) → Project: **IndiCarbon**

---

## 🧪 Useful Commands

```bash
# View logs for a specific service
docker compose logs -f ai-agent

# Restart a single service (after code change)
docker compose up --build ai-agent

# Stop everything
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v

# Check service health
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
curl http://localhost:8003/health
```

---

## 🔗 Key Links

| Resource | URL |
|----------|-----|
| Supabase Project | https://supabase.com/dashboard/project/tuehmheaycywuiuwmwzu |
| Langfuse Project | https://cloud.langfuse.com/project/cmofmp8wb01rtad07c6bju9ra |
| API Docs (local) | http://localhost:8000/api/docs |
| MCP Server (hosted) | https://indicarbon.ajayv.online/mcp/ |
| A2A Agent Card | https://indicarbon.ajayv.online/.well-known/agent.json |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) | Full directory tree and design patterns |
| [`docs/a2a-protocol.md`](docs/a2a-protocol.md) | A2A Protocol v0.2.1 — specification, integration guide, examples |
| [`docs/mcp-server.md`](docs/mcp-server.md) | MCP Server — 40+ tools reference, setup, workflows |
| [`docs/backend_architecture.md`](docs/backend_architecture.md) | Microservices architecture and API design |
| [`docs/api_integration_walkthrough.md`](docs/api_integration_walkthrough.md) | Step-by-step API integration tutorial |
| [`mcp-server/README.md`](mcp-server/README.md) | MCP server quick-start and tool listing |

---

<div align="center">
  <sub>Built with ❤️ for Indian enterprises navigating the carbon transition</sub>
</div>
