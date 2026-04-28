# IndiCarbon Backend — Industry-Standard Architecture

## Architecture Overview

```
External Client
    │
    ▼
┌─────────────────────────────────┐
│  API Gateway  :8000             │  ← Rate limit, JWT decode, proxy
│  apps/gateway/main.py           │
└──────┬────────┬────────┬────────┘
       │        │        │
  [public]  [public]  [protected via X-User-ID header]
       │        │        │
┌──────▼──┐  ┌──▼──────────────────────────────────┐
│  Auth   │  │  Compliance  │  Marketplace  │  AI   │
│ :8004   │  │   :8001      │   :8002       │ :8003 │
└────┬────┘  └──────────────┴───────────────┴───────┘
     │                        │
  Supabase Auth SDK     SQLAlchemy ORM → Supabase PostgreSQL
```

## Design Principles Applied

| Principle | Implementation |
|---|---|
| **ORM Models** | SQLAlchemy `Base` subclasses — pure table definitions only |
| **Repositories** | Classes that wrap SQLAlchemy queries — injected via `Depends` |
| **Services** | Pure functions — no classes, no `self` |
| **Routes** | Inject `db: Session = Depends(get_db)`, call service functions directly |
| **Gateway** | Single entry point — public auth routes + protected proxy routes |

## Folder Structure (per service)

```
services/{service}/
├── app/
│   ├── main.py           ← App factory (create_app) only
│   ├── config.py         ← Pydantic BaseSettings
│   ├── dependencies.py   ← FastAPI Depends() helpers
│   ├── models/           ← SQLAlchemy ORM Table Definitions
│   │   └── *.py          ← class Foo(Base): __tablename__ = ...
│   ├── repositories/     ← Data access classes (Session injected)
│   │   └── *_repo.py     ← class FooRepository: def find_by_id(...)
│   ├── schemas/          ← Pydantic request/response models
│   │   └── *.py
│   ├── services/         ← PROCEDURE-ORIENTED (pure functions)
│   │   └── *.py          ← def create_foo(req, db: Session) -> FooResponse
│   └── api/v1/routes/    ← HTTP layer, no business logic
│       └── *.py
├── Dockerfile
└── requirements.txt
```

## Services & Supabase Tables

| Service | Port | Tables |
|---|---|---|
| **auth** | 8004 | `profiles`, `roles`, `user_roles`, `organizations` |
| **compliance** | 8001 | `emission_factors`, `emission_reports`, `document_vault` |
| **marketplace** | 8002 | `carbon_credits`, `market_orders`, `trades` |
| **ai-agent** | 8003 | `agent_registry`, `agent_interactions`, `hitl_reviews` |

## Database Strategy

```python
# shared_logic/database.py
class Base(DeclarativeBase): pass   # All ORM models extend this

def get_db() -> Generator[Session, None, None]:
    db = SessionFactory()
    try:
        yield db
        db.commit()
    except:
        db.rollback(); raise
    finally:
        db.close()
```

Connection: `SUPABASE_DB_URL` in `.envs/.supabase.env`  
Format: `postgresql://postgres.[ref]:[pwd]@aws-0-[region].pooler.supabase.com:6543/postgres`

## Gateway Routing

| Path | JWT Required | Upstream |
|---|---|---|
| `POST /api/v1/auth/register` | ❌ | auth:8004 |
| `POST /api/v1/auth/login` | ❌ | auth:8004 |
| `POST /api/v1/auth/refresh` | ❌ | auth:8004 |
| `POST /api/v1/auth/verify` | ❌ | auth:8004 |
| `GET /api/v1/users/*` | ✅ | auth:8004 |
| `GET/POST /api/v1/organizations/*` | ✅ | auth:8004 |
| `* /api/v1/compliance/*` | ✅ | compliance:8001 |
| `* /api/v1/marketplace/*` | ✅ | marketplace:8002 |
| `* /api/v1/ai/*` | ✅ | ai-agent:8003 |

> [!IMPORTANT]
> Set `SUPABASE_DB_URL` correctly in `.envs/.supabase.env` before running.
> The pooler URL format (port 6543) is required for Supabase's transaction pooler.
> Run the migration SQL in `supabase/migrations/20260428_001_initial_schema.sql` first.

> [!TIP]
> Service-to-service calls go through the **gateway** for traceability.
> Each downstream service trusts the `X-User-ID` header injected by the gateway.
