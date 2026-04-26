# IndiCarbon AI — Project Structure

> **Architecture**: Microservice monorepo using Python FastAPI backends, Next.js 14 frontend, Supabase (PostgreSQL + pgvector), Redis, and local Ollama LLMs.

---

## Directory Tree

```
IndiCarbon/
│
├── 📁 .envs/                           # Scoped environment variables (never commit)
│   ├── .gateway.env                    # API Gateway config + Redis URL
│   ├── .supabase.env                   # Shared Supabase credentials (all services)
│   ├── .langfuse.env                   # Langfuse observability keys
│   ├── .ai-agent.env                   # Ollama + Compliance Service URL
│   ├── .compliance.env                 # GHG emission factors
│   ├── .marketplace.env                # Redis URL + trade lock TTL
│   ├── .redis.env                      # Redis password
│   └── .frontend.env                   # NEXT_PUBLIC_* variables
│
├── 📁 apps/
│   │
│   ├── 📁 gateway/                     # ── API Gateway (FastAPI, port 8000)
│   │   ├── main.py                     # JWT auth · rate limiting · reverse proxy
│   │   ├── requirements.txt
│   │   └── Dockerfile                  # Multi-stage, non-root user
│   │
│   └── 📁 frontend/                    # ── Next.js 14 App Router (port 3000)
│       ├── app/
│       │   ├── layout.tsx              # Root layout + SEO metadata (Inter font)
│       │   ├── page.tsx                # Landing page (FAANG glassmorphism design)
│       │   ├── globals.css             # Design system tokens + utilities
│       │   └── dashboard/
│       │       └── page.tsx            # Main dashboard (metrics, scope breakdown)
│       ├── lib/
│       │   ├── api.ts                  # Typed Gateway API client
│       │   └── supabase/
│       │       ├── client.ts           # Browser client (@supabase/ssr)
│       │       └── server.ts           # Server component client (RSC-safe)
│       ├── tailwind.config.ts          # Brand colour palette (forest green + cyan)
│       ├── next.config.js              # standalone output for Docker
│       ├── postcss.config.js
│       ├── package.json
│       └── Dockerfile                  # Multi-stage (deps → builder → production)
│
├── 📁 services/
│   │
│   ├── 📁 compliance/                  # ── Compliance Service (FastAPI, port 8001)
│   │   ├── main.py                     # GHG Calculator + BRSR report generator
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   ├── 📁 marketplace/                 # ── Marketplace Service (FastAPI, port 8002)
│   │   ├── main.py                     # Order book + Reserve→Commit trade engine
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   │
│   └── 📁 ai-agent/                    # ── AI-Sovereign Service (FastAPI, port 8003)
│       ├── agent.py                    # LangChain agents + Ollama + Langfuse + tools
│       ├── main.py                     # FastAPI wrapper
│       ├── requirements.txt
│       └── Dockerfile                  # Extended start-period for model loading
│
├── 📁 libs/
│   └── 📁 shared-logic/                # ── Shared Python package (installed as -e)
│       ├── __init__.py                 # Public re-exports
│       ├── schemas.py                  # Canonical Pydantic v2 models (all domains)
│       ├── middleware.py               # Global error handler + request-ID middleware
│       ├── supabase_client.py          # BaseRepository + VectorRepository (pgvector)
│       └── requirements.txt
│
├── 📁 supabase/
│   └── 📁 migrations/
│       └── 001_initial_schema.sql      # Full schema: tables, pgvector, RLS, functions
│
├── 📁 docs/
│   └── PROJECT_STRUCTURE.md           # ← You are here
│
├── docker-compose.yml                  # Root orchestration (all 7 services)
├── pyproject.toml                      # Ruff + mypy + pytest config
├── .gitignore
├── LICENSE
└── README.md
```

---

## Service Map

| Service | Port | Internal DNS | Responsibility |
|---------|------|-------------|----------------|
| **API Gateway** | `8000` | `gateway` | JWT auth, rate limiting, reverse proxy |
| **Compliance** | `8001` | `compliance` | GHG math, BRSR reports |
| **Marketplace** | `8002` | `marketplace` | Credit registry, order book, trade settlement |
| **AI Agent** | `8003` | `ai-agent` | LangChain agents, Ollama LLM, Langfuse |
| **Frontend** | `3000` | `frontend` | Next.js App Router UI |
| **Redis** | `6379` | `redis` | Rate-limit counters, distributed trade locks |
| **Ollama** | `11434` | `host.docker.internal` | **HOST machine** — qwen2.5:3b-instruct, nomic-embed-text |

> ⚠️ **Ollama is not a Docker service.** It runs on your host machine.  
> The `ai-agent` container reaches it via `host.docker.internal:11434` (set in `extra_hosts`).  
> All other services communicate over the Docker bridge network `indicarbon_net`. **Only ports 3000 and 8000 are exposed externally.**

---

## Shared Library (`libs/shared-logic`)

The shared library is installed as an editable package (`pip install -e`) into every backend container during the Docker build.

| File | Purpose |
|------|---------|
| `schemas.py` | Single source of truth for all Pydantic models. Covers GHG entries, BRSR reports, carbon credits, orders, trades, and agent runs. |
| `supabase_client.py` | `BaseRepository` (CRUD wrapper over Supabase PostgREST) + `VectorRepository` (pgvector similarity search). Uses `@lru_cache` for connection reuse. |
| `middleware.py` | `register_middleware(app)` — attaches `RequestIDMiddleware`, validation error handler, and generic 500 handler to any FastAPI app in one call. |

---

## Environment Variable Strategy

Each service reads **only** the env files it needs:

```
Service            Reads
─────────────────────────────────────────────────────
gateway            .gateway.env  +  .supabase.env
compliance         .compliance.env  +  .supabase.env
marketplace        .marketplace.env  +  .supabase.env
ai-agent           .ai-agent.env  +  .supabase.env  +  .langfuse.env
frontend           .frontend.env
redis              .redis.env
```

`pydantic-settings` is used in every service for type-safe, validated settings loading.

---

## Database Schema (Supabase)

| Table | Description |
|-------|-------------|
| `organizations` | Company registry with CIN, GSTIN, sector |
| `org_members` | Links Supabase `auth.users` to organisations with roles |
| `emission_entries` | GHG Protocol emission records (Scope 1/2/3) |
| `carbon_credits` | Registry ledger — each row = 1 tonne credit unit |
| `orders` | Buy/sell order book |
| `trades` | Settled trade records with registry serials |
| `embeddings` | pgvector table for RAG (replaces ChromaDB) |
| `agent_runs` | AI agent run history with Langfuse trace URLs |

**Row Level Security (RLS)** is enabled on every table. Users can only see data for organisations they are members of.

---

## Key Design Patterns

### 1. Repository Pattern
```python
class EmissionRepository(BaseRepository):
    def __init__(self):
        super().__init__("emission_entries", admin=True)
    # inherits: find_by_id, insert, update, delete, list_all
```
Every service defines domain repositories that extend `BaseRepository`, keeping Supabase query logic out of route handlers.

### 2. Reserve-then-Commit (Marketplace)
```
1. Acquire Redis distributed lock  (SET NX EX 30)
2. Mark selected credits → RESERVED
3. Transfer ownership in Supabase
4. Record trade
5. Release lock (always, in finally block)
   → On any failure: revert credits to AVAILABLE
```

### 3. pgvector (Replaces ChromaDB)
```sql
-- Stored in Supabase, called by VectorRepository.similarity_search()
SELECT id, content, metadata,
       1 - (embedding <=> query_embedding) AS similarity
FROM   embeddings
WHERE  1 - (embedding <=> query_embedding) > 0.78
ORDER  BY embedding <=> query_embedding
LIMIT  5;
```

### 4. LangChain Tool Calling
The AI Agent has 3 tools that call internal services:

| Tool | Calls |
|------|-------|
| `GHGCalculatorTool` | `POST compliance:8001/ghg/calculate` |
| `BRSRReportTool` | `GET compliance:8001/brsr/report/{org}/{year}` |
| `VectorSearchTool` | Supabase `match_embeddings()` via pgvector |

### 5. Langfuse Observability
Every agent run creates a named trace with:
- Top-level `trace` → session grouping by `run_id`
- `generation` span → LLM call with token usage
- Tool call metadata attached to the generation
- Error-level flagging via `generation.end(level="ERROR")`

View traces at: [cloud.langfuse.com → IndiCarbon project](https://cloud.langfuse.com/project/cmofmp8wb01rtad07c6bju9ra)

---

## Local Ollama Setup

Ollama runs **outside Docker** on your host machine. The `ai-agent` service connects to it via `host.docker.internal:11434`.

| Setting | Value |
|---------|-------|
| `OLLAMA_BASE_URL` (Docker) | `http://host.docker.internal:11434` |
| `OLLAMA_BASE_URL` (local dev) | `http://localhost:11434` |
| `OLLAMA_LLM_MODEL` | `qwen2.5:3b-instruct` |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` |

Models already installed:
```bash
ollama list
# qwen2.5:3b-instruct   357c53fb659c   1.9 GB
# nomic-embed-text      0a109f422b47   274 MB
```

---

## Docker Build Strategy

All Dockerfiles use **3-stage multi-stage builds**:

```dockerfile
# Stage 1: builder    — installs deps, compiles
# Stage 2: production — copies only artifacts, runs as non-root user
```

- Non-root `appuser:appgroup` in every container
- `HEALTHCHECK` on every service with appropriate `start-period`
- Shared library copied into each build context via the root `docker compose` build

---

## API Gateway Routing

```
Public endpoint            → Internal service
──────────────────────────────────────────────
POST /api/v1/ai/*         → ai-agent:8003
POST /api/v1/compliance/* → compliance:8001
POST /api/v1/marketplace/* → marketplace:8002
GET  /health              → Gateway itself
GET  /api/docs            → Swagger UI
```

All routes (except `/health`) require a valid Supabase JWT in the `Authorization: Bearer` header. The decoded JWT payload is forwarded as `X-User-ID` and `X-User-Email` headers to downstream services.
