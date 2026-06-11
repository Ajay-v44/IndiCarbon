# IndiCarbon AI — Agent Design and Engineering Rules (`rules.md`)

This guide establishes the architectural, engineering, design, and performance principles that every AI agent and developer must strictly follow when extending, building, or interacting with the IndiCarbon ecosystem. 

---

## 1. Core Philosophy: Determinism and Auditability
All agents must act as **deterministic tools** wrapped in cognitive frameworks. 
* **State Control**: Agents should never bypass the Redux store in the frontend or write directly to databases in the backend. 
* **Auditability**: Every write operation (Compliance, Marketplace, AI chat) must attach standard headers (`X-Request-ID`, `X-User-ID`, `X-Organization-ID`) to ensure full audit trails.
* **Semantic Isolation**: Tools and skills must be isolated, single-purpose, and clearly documented.

---

## 2. API Design & Gateway Standards
Any new API endpoint or backend microservice must align with the API Gateway architecture:
* **Gateway-First Routing**: Downstream services are isolated inside the Docker network (`indicarbon_net`). Direct public exposure is strictly prohibited. All requests must route via the Gateway (port `8000`).
* **Standard Response Envelope**: All endpoints must return JSON matching the `ApiResponse` schema:
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "OK",
    "request_id": "uuid-v4",
    "timestamp": "ISO-8601-datetime"
  }
  ```
* **Pydantic Validation**: All Python parameters must use strict Pydantic model contracts with descriptive `Field` attributes to enable automatic LLM parameter extraction.
* **TypeScript Contracts**: The frontend must register matching contracts in `src/lib/api/types.ts`.

---

## 3. Frontend Styling & Design Aesthetics
To ensure a state-of-the-art user experience, any frontend changes or additions must conform to the following premium design system:
* **Harmonious Palette**: Do not use generic, plain primary colors (e.g. plain `#00FF00` or `#FF0000`). Use curated dark-mode HSL gradients, glassmorphism (`glass` styles), and deep emerald/green/teal themes representing carbon offset tech.
* **Typography**: Stick to the Google Font hierarchy (e.g., *Inter*, *Outfit*, or *Cabinet Grotesk*).
* **Interactions**: Integrate smooth CSS transitions (`transition-all duration-300`) and hover states on all cards, buttons, and registry items.
* **No Placeholders**: Never use generic placeholder images. UI components must show realistic metrics or generated visual assets.

---

## 4. Performance Focus
All services must optimize for maximum efficiency and speed:
* **Database Optimization**: Avoid manual post-query filtering. Utilize eager loading (`joinedload` in SQLAlchemy), indexed foreign keys, and raw SQL queries only when performing complex vector distance searches.
* **Network & Gateway**: Leverage `httpx.AsyncClient` in the Gateway proxy to prevent event-loop blockage. Keep connections alive with pooled connection clients.
* **Frontend State**: Leverage Redux Toolkit slices to cache data in memory and prevent redundant REST API roundtrips.

---

## 5. Security & HITL Guardrails
* **No Direct Mutations**: Write operations (INSERT, UPDATE, DELETE) inside the Marketplace and Compliance services must enforce role-based access checks.
* **Human-in-the-Loop (HITL)**: Highly sensitive operations (e.g., carbon trade settlement, document vault deletions, registry approvals) require an explicit multi-step verification state machine. Any flagged policy violation must be logged for administrator review in the database.
* **Domain Lock**: The AI Agent must run through prompt-guardrail validators (like LangGraph schema filters) to reject off-topic inquiries or prompt-injection attempts.

---

## 6. Agent Skill Design Guidelines
Based on *Microsoft Agent Framework* and *BlueBag AI* specifications:
1. **Schema Description Integrity**: Every parameter in the skill JSON metadata must include a detailed, human-like `description` explaining the exact format expected (e.g., "YYYY-MM-DD" for dates).
2. **Error Recovery**: If a skill returns an HTTP error, the wrapper must normalize the response so the agent can self-correct parameters (e.g., converting a invalid date range) rather than crashing.
3. **Idempotency**: All executing skills that alter state must support request de-duplication via unique client-supplied hashes or request identifiers.
