# IndiCarbon — Project Overview

## What It Is

IndiCarbon AI is a full-stack SaaS platform for **carbon accounting, regulatory compliance, and carbon credit trading** focused on the Indian sustainability ecosystem. It targets Indian enterprises that need to:

- Track and report GHG emissions (Scope 1/2/3 per GHG Protocol)
- Generate SEBI BRSR (Business Responsibility & Sustainability Report) automatically
- Buy and sell verified carbon credits (Verra VCS, Gold Standard)
- Use AI agents to analyze emissions data and model reduction strategies

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend framework | Next.js 16.2.4 (React 19.2.4), App Router |
| Language | TypeScript (strict mode throughout) |
| State management | Redux Toolkit 2.x + react-redux |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova style) |
| Charts | Recharts |
| Animation | Framer Motion + tw-animate-css |
| Icons | Lucide React |
| Toast | Sonner |
| Theme | next-themes (dark/light) |
| HTTP client | Axios |
| Backend | Python FastAPI (5 microservices) |
| Database | Supabase (PostgreSQL + pgvector extension) |
| Cache / Locking | Redis |
| AI / LLM | Ollama (local) + LangChain ReAct agents |
| LLM Observability | Langfuse |
| Orchestration | Docker Compose |

## Monorepo Structure

```
IndiCarbon/
├── apps/
│   ├── frontend/                  # Next.js application (port 3000)
│   │   └── src/
│   │       ├── app/               # App Router pages & layouts
│   │       ├── components/        # React components
│   │       ├── store/             # Redux store, slices, hooks
│   │       └── lib/               # Axios client, API service files, utils
│   └── backend/
│       ├── services/
│       │   ├── gateway/           # API Gateway (port 8000)
│       │   ├── auth/              # Auth Service (port 8004)
│       │   ├── compliance/        # Compliance Service (port 8001)
│       │   ├── marketplace/       # Marketplace Service (port 8002)
│       │   └── ai-agent/          # AI Agent Service (port 8003)
│       ├── libs/                  # Shared Python libraries across services
│       └── .envs/                 # Per-service environment config files
├── supabase/                      # Database migrations
├── docs/                          # Project documentation
│   └── context/                   # LLM context files (this folder)
└── docker-compose.yml             # Full-stack orchestration
```

## Service Ports

| Service | Port |
|---------|------|
| Frontend (Next.js) | 3000 |
| API Gateway | 8000 |
| Auth Service | 8004 |
| Compliance Service | 8001 |
| Marketplace Service | 8002 |
| AI Agent Service | 8003 |
| Ollama (host machine, not Docker) | 11434 |

All frontend traffic enters through the **Gateway at port 8000**. Frontend never calls other service ports directly.

## Key Environment Config

**Frontend** (`apps/frontend/.env` / env file):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend** (in `apps/backend/.envs/`):
- `.supabase.env` — Supabase DB URL, Anon Key, Service Role Key, JWT Secret
- `.services.env` — Inter-service discovery URLs
- `.redis.env` — Redis password, host, port
- `.langfuse.env` — Langfuse public + secret keys for LLM tracing
- `.ai-agent.env` — Ollama host (`host.docker.internal:11434`), model names
- `.auth.env`, `.compliance.env`, `.marketplace.env`, `.gateway.env`

## Authentication

- JWT-based; tokens stored in browser `localStorage` as key `indicarbon_tokens`
- Token payload includes: `access_token`, `refresh_token`, `token_type`, `expires_in`, `user_id`, `email`, `roles`, `organization_id`, `is_internal`
- **Internal users** (`is_internal=true` / SUPER_ADMIN role) → access `/admin`
- **Regular users** → access `/dashboard`, marketplace, portfolio, chat, simulator, settings

## Three Feature Pillars

1. **Compliance** — GHG emissions entry, BRSR report generation, document audit trail
2. **Marketplace** — Carbon credit buy/sell order book with ACID trade settlement
3. **AI Agent** — LangChain ReAct agents for compliance queries and emissions strategy
