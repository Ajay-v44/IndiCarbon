# IndiCarbon — LLM Context Index

This folder gives AI assistants (and developers) a complete picture of the IndiCarbon codebase without needing to explore it first. Load these files in order for maximum context.

| File | What it covers |
|------|---------------|
| [01_project_overview.md](01_project_overview.md) | Stack, monorepo layout, service ports, environment config |
| [02_frontend_architecture.md](02_frontend_architecture.md) | All routes, components, Redux slices, auth guard, styling system |
| [03_backend_architecture.md](03_backend_architecture.md) | 5 FastAPI microservices, Supabase/pgvector, Redis, Ollama, Langfuse |
| [04_domain_concepts.md](04_domain_concepts.md) | Carbon accounting (BRSR/GHG Protocol), marketplace trading, AI agent personas |
| [05_api_layer.md](05_api_layer.md) | Axios client, JWT pattern, all API service endpoints, Redux thunk convention |

## Quick Summary

**IndiCarbon AI** is a full-stack SaaS platform for India-focused carbon accounting, regulatory compliance (BRSR/CPCB/NDC), and carbon credit trading (Verra VCS, Gold Standard).

- **Frontend**: Next.js 16 (React 19) + TypeScript + Redux Toolkit + Tailwind CSS v4 at `apps/frontend/`
- **Backend**: 5 FastAPI microservices (Gateway → Auth/Compliance/Marketplace/AI-Agent) at `apps/backend/`
- **Database**: Supabase (PostgreSQL + pgvector)
- **AI**: Ollama (local LLMs) + LangChain ReAct agents + Langfuse observability
- **All frontend API calls** go to `http://localhost:8000` (Gateway) with JWT Bearer tokens

## How to Use This Context

Paste individual files into your LLM context as needed:
- Working on frontend UI? Load `02_frontend_architecture.md`
- Adding a backend endpoint? Load `03_backend_architecture.md`
- Unfamiliar with the domain? Start with `04_domain_concepts.md`
- Adding Redux/API integration? Load `05_api_layer.md`
