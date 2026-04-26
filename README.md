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
| **Carbon Marketplace** | Carbon credit registry (Verra VCS, Gold Standard), order book, ACID-safe Reserve→Commit trade settlement |
| **AI Sovereign Agent** | LangChain ReAct agents (Auditor + Strategist), local Ollama LLMs, Langfuse observability, Supabase vector search |
| **API Gateway** | Supabase JWT auth, Redis rate limiting, reverse-proxy routing |

---

## 🏗️ Architecture

```
Internet → Next.js :3000 → API Gateway :8000
                               ├── Compliance Service :8001
                               ├── Marketplace Service :8002
                               └── AI-Agent Service   :8003
                                        ↓
                              Supabase (PostgreSQL + pgvector)
                              Redis (rate limits + trade locks)

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

---

### Step 5 — Local development (without Docker)

Install the shared library and run each service individually:

```bash
# Install shared Python library
pip install -e libs/shared-logic

# Install Python dependencies
pip install supabase langfuse fastapi uvicorn httpx redis pydantic-settings \
            PyJWT langchain langchain-community

# Run API Gateway
cd apps/gateway
uvicorn main:app --reload --port 8000

# Run Compliance Service (new terminal)
cd services/compliance
uvicorn main:app --reload --port 8001

# Run Marketplace Service (new terminal)
cd services/marketplace
uvicorn main:app --reload --port 8002

# Run AI-Agent Service (new terminal)
cd services/ai-agent
uvicorn main:app --reload --port 8003

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

---

## 📁 Project Structure

See [`docs/PROJECT_STRUCTURE.md`](docs/PROJECT_STRUCTURE.md) for the full breakdown.

---

<div align="center">
  <sub>Built with ❤️ for Indian enterprises navigating the carbon transition</sub>
</div>
