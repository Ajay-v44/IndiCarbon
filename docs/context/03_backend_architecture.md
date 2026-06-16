# IndiCarbon — Backend Architecture

All backend code lives under `apps/backend/`. Five Python FastAPI microservices, orchestrated via Docker Compose. All external traffic enters through the **API Gateway**.

## Service Overview

| Service | Port | Directory | Responsibility |
|---------|------|-----------|---------------|
| **Gateway** | 8000 | `services/gateway/` | Reverse proxy, CORS, rate limiting, request routing |
| **Auth** | 8004 | `services/auth/` | JWT issue/verify/refresh, user CRUD, org management, role assignment |
| **Compliance** | 8001 | `services/compliance/` | Emissions entry, Scope 1/2/3 calculations, BRSR report generation, document management, benchmarks |
| **Marketplace** | 8002 | `services/marketplace/` | Carbon credit listing, order placement, order book, trade settlement |
| **AI Agent** | 8003 | `services/ai-agent/` | LangChain agents, document analysis, chat history, agent registry |

Frontend only calls `http://localhost:8000/api/v1/...` — the Gateway routes internally to the correct service.

## Shared Libraries (`apps/backend/libs/`)

Shared Python packages used across services — likely contains: DB client setup, auth utilities (JWT decode helpers), shared Pydantic models, logging config.

## Database: Supabase (PostgreSQL + pgvector)

Managed Postgres with the `pgvector` extension for AI embedding storage.

**Key tables** (inferred from domain + API):
- `users`, `organizations`, `roles`, `user_roles`
- `emission_entries`, `emission_factors`, `scope_calculations`
- `documents` (audit facility documents)
- `benchmarks` (sector intensity targets)
- `carbon_credits`, `market_orders`, `trades`
- `chat_messages`, `chat_sessions`
- `agent_registry`

Migrations are in `supabase/` at the project root.

## Cache & Locking: Redis

- **Rate limiting** (Gateway): prevents API abuse
- **Trade order locking** (Marketplace): Redis distributed locks prevent double-spend during credit settlement
- **Session management** (Auth): token blacklisting / refresh tracking

## AI / LLM Stack

```
User message
    │
    ▼
AI Agent Service (port 8003)
    │
    ├── LangChain ReAct Agent
    │       ├── Persona: Auditor  (compliance queries, emission factor lookups)
    │       └── Persona: Strategist (emissions forecasting, reduction strategy)
    │
    ├── Tool calls:
    │       ├── pgvector similarity search (Supabase) — document & knowledge retrieval
    │       ├── Compliance Service API — live emissions data
    │       └── Marketplace Service API — credit availability
    │
    └── Ollama (host machine, port 11434)
            ├── Chat/Reasoning: qwen2.5:3b-instruct
            └── Embeddings:     nomic-embed-text
```

**Guardrail stack** on every message:
1. PII masking (strips personal data before LLM)
2. Domain guard (rejects off-topic / non-carbon queries)
3. PDF injection protection (sanitizes document content)

**Observability**: Langfuse traces every LLM call (token usage, latency, prompt/response), used for debugging and compliance audit.

## Marketplace Trade Settlement Pattern

**Reserve → Commit** (ACID-safe with Redis locks):
1. Buyer places order → credits **reserved** (locked in Redis, status = `RESERVED`)
2. Matching engine pairs buyer/seller
3. On successful match → credits **committed** (ownership transferred, Redis lock released)
4. On failure/timeout → credits **released** back to seller

This prevents double-spend under concurrent order placement.

## Environment Configuration (`apps/backend/.envs/`)

| File | Contents |
|------|---------|
| `.supabase.env` | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET` |
| `.services.env` | Internal URLs for service-to-service calls (e.g. `AUTH_SERVICE_URL=http://auth:8004`) |
| `.redis.env` | `REDIS_PASSWORD`, `REDIS_HOST`, `REDIS_PORT` |
| `.langfuse.env` | `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY` |
| `.ai-agent.env` | `OLLAMA_HOST=http://host.docker.internal:11434`, `LLM_MODEL=qwen2.5:3b-instruct`, `EMBED_MODEL=nomic-embed-text` |
| `.auth.env` | JWT secret, token expiry config |
| `.compliance.env` | Service-specific settings |
| `.marketplace.env` | Trade lock TTL, order expiry |
| `.gateway.env` | `ALLOWED_ORIGINS`, upstream service URLs |

## Docker Compose

Services run in Docker; Ollama runs directly on the host machine and is accessed inside Docker via `host.docker.internal:11434`. Redis also runs as a Docker container.
