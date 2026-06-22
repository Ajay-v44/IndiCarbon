# A2A Protocol (Agent-to-Agent) — IndiCarbon AI

IndiCarbon implements the [Agent2Agent (A2A) Protocol v0.3.0](https://a2a-protocol.org/v0.3.0/specification/) — enabling any external AI agent to discover, authenticate, and communicate with the IndiCarbon carbon intelligence engine using the standard JSON-RPC 2.0 binding (camelCase wire format, `kind` discriminators, SSE streaming).

---

## Overview

The A2A (Agent-to-Agent) protocol provides a standardised way for AI agents to:

1. **Discover** agent capabilities via a public Agent Card
2. **Authenticate** using existing JWT-based auth
3. **Send tasks** with structured messages
4. **Track lifecycle** through well-defined state transitions
5. **Receive artifacts** (structured responses)

All A2A interactions pass through the same **4-layer guardrail pipeline** as the IndiCarbon chatbot:

| Layer | Purpose |
|-------|---------|
| PII Masking | SHA-256 hashes emails, phone numbers, Aadhaar before LLM processing |
| Domain Guard | LLM classifier rejects off-topic / harmful queries |
| Injection Defense | Detects prompt injection attempts in input |
| Output Validation | Domain guard on output + PII masking on response |

---

## Agent Discovery

The IndiCarbon A2A agent is discoverable at the standard well-known endpoint (v0.3.0 path; the legacy `/.well-known/agent.json` is also served for backward compatibility):

```
GET /.well-known/agent-card.json
```

This endpoint is **public** (no authentication required) and returns the Agent Card:

```json
{
  "protocolVersion": "0.3.0",
  "name": "IndiCarbon AI Agent",
  "description": "India's AI-native sustainability compliance & carbon trading assistant...",
  "url": "https://indicarbon.ajayv.online/api/v1/a2a",
  "preferredTransport": "JSONRPC",
  "provider": {
    "organization": "IndiCarbon AI",
    "url": "https://indicarbon.ajayv.online"
  },
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "securitySchemes": {
    "bearer": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
  },
  "security": [{ "bearer": [] }],
  "defaultInputModes": ["text/plain"],
  "defaultOutputModes": ["text/plain"],
  "skills": [...]
}
```

---

## Skills

The IndiCarbon A2A agent exposes 5 skills:

| Skill ID | Name | Description |
|----------|------|-------------|
| `carbon-accounting` | Carbon Accounting | Calculate and analyse GHG emissions (Scope 1/2/3) |
| `brsr-compliance` | BRSR Compliance | Generate SEBI BRSR disclosures and compliance checks |
| `document-analysis` | Document Analysis | Extract emission data from sustainability reports |
| `carbon-trading` | Carbon Trading | Carbon credit pricing, order book, trading advisory |
| `strategy-advisory` | Strategy Advisory | Decarbonisation strategies and reduction roadmaps |

Each skill includes example queries and tags for routing.

---

## Authentication

A2A endpoints (except `/.well-known/agent.json`) require a valid JWT bearer token:

```bash
# Get a token
curl -X POST https://indicarbon.ajayv.online/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@company.com", "password": "secret"}'

# Use the token for A2A calls
curl -X POST https://indicarbon.ajayv.online/api/v1/a2a \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '...'
```

---

## API Endpoints

### JSON-RPC 2.0 (Standard A2A)

```
POST /api/v1/a2a
```

Accepts JSON-RPC 2.0 requests with the following methods:

| Method | Description |
|--------|-------------|
| `message/send` | Send a message; agent processes it as a task (blocking) |
| `message/stream` | Send a message and receive task updates as SSE events |
| `tasks/get` | Retrieve task by ID |
| `tasks/cancel` | Cancel a non-terminal task |
| `tasks/resubscribe` | Re-subscribe to a task's update stream |
| `tasks/send` | **Legacy alias** for `message/send` (0.2.x compatibility) |

**Example — Send Message:**

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "method": "message/send",
  "params": {
    "message": {
      "role": "user",
      "kind": "message",
      "messageId": "f3a1...",
      "parts": [
        {"kind": "text", "text": "Calculate our Scope 1 emissions from 12,000L diesel consumption"}
      ],
      "metadata": { "skill_id": "carbon-accounting" }
    }
  }
}
```

**Response (a Task object, `kind: "task"`):**

```json
{
  "jsonrpc": "2.0",
  "id": "req-001",
  "result": {
    "id": "task-9f2c...",
    "contextId": "ctx-abc123",
    "kind": "task",
    "status": {
      "state": "completed",
      "message": {
        "role": "agent",
        "kind": "message",
        "parts": [{"kind": "text", "text": "Based on 12,000L of diesel..."}]
      },
      "timestamp": "2026-06-21T18:30:00Z"
    },
    "artifacts": [
      {"artifactId": "artifact-...", "name": "response", "parts": [{"kind": "text", "text": "..."}]}
    ],
    "metadata": {
      "durationMs": 1850,
      "tokenUsage": 420,
      "guardrailAudit": {
        "input_pii_masked": 0,
        "domain_verdict_input": "allowed",
        "domain_verdict_output": "allowed"
      }
    }
  }
}
```

**Streaming (`message/stream`)** uses the same `params`, requires `Accept: text/event-stream`, and emits a sequence of SSE `data:` lines — each a JSON-RPC result wrapping a `status-update` (`submitted` → `working` → terminal `final: true`) or `artifact-update` event.

### REST API (Convenience)

For simpler integrations, a REST API is also available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/a2a/tasks` | Send a new task |
| GET | `/api/v1/a2a/tasks` | List tasks (with filters) |
| GET | `/api/v1/a2a/tasks/{task_id}` | Get task by ID |
| POST | `/api/v1/a2a/tasks/{task_id}/cancel` | Cancel a task |
| GET | `/api/v1/a2a/stats` | Activity statistics (admin) |

**REST Send Task:**

```bash
curl -X POST https://indicarbon.ajayv.online/api/v1/a2a/tasks \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What carbon credits are available for purchase?",
    "skill_id": "carbon-trading",
    "session_id": "optional-session-uuid"
  }'
```

**List Tasks with Filters:**

```bash
curl "https://indicarbon.ajayv.online/api/v1/a2a/tasks?state=completed&skill_id=carbon-accounting&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## Task Lifecycle

Tasks follow the A2A v0.2.1 state machine:

```
submitted → working → completed
                    → failed
                    → canceled (via tasks/cancel)
         → input-required (HITL)
```

| State | Description |
|-------|-------------|
| `submitted` | Task received, queued for processing |
| `working` | Agent is actively processing |
| `input-required` | Blocked waiting for human input (HITL) |
| `completed` | Task finished successfully with artifacts |
| `failed` | Task failed (execution error or output guardrail block) |
| `rejected` | Input rejected by the domain guard (off-topic / unsafe) |
| `canceled` | Task was canceled by the client |
| `auth-required` | Additional authentication required to proceed |
| `unknown` | State could not be determined |

---

## Guardrail Pipeline

Every A2A task passes through the full guardrail chain:

```
Input → PII Mask → Domain Guard → LLM Processing → Output Guard → PII Unmask → Response
```

### PII Masking
- Detects emails, phone numbers, Aadhaar numbers, PAN cards
- Replaces with SHA-256 hashes before LLM processing
- Restores original values in the response

### Domain Guard
- Fast-path keyword matching (allow/deny lists)
- LLM-based classification fallback for ambiguous queries
- Rejects queries outside the carbon/sustainability domain

### Injection Defense
- Detects prompt injection patterns in user input
- Blocks social engineering and jailbreak attempts

### Output Validation
- Domain guard applied to LLM output
- PII masking on response before delivery
- Audit trail recorded for every task

The `guardrail_audit` field in task metadata provides full transparency:

```json
{
  "guardrail_audit": {
    "pii_masked": true,
    "pii_entities_found": ["email"],
    "domain_guard": "allowed",
    "domain_guard_reason": "Carbon accounting query",
    "injection_detected": false,
    "output_guard": "allowed"
  }
}
```

---

## Activity Monitoring (Admin)

> **Multi-tenant scoping:** `/api/v1/a2a/tasks` and `/api/v1/a2a/stats` are scoped to the caller's organization. Only users holding an `ADMIN` / `ORG_ADMIN` / `SUPER_ADMIN` role may pass an explicit `organization_id` or view cross-organization data. Non-admins always see only their own org's tasks.

The `/api/v1/a2a/stats` endpoint provides activity statistics (cross-organization for admins):

```json
{
  "total_tasks": 1247,
  "completed_tasks": 1102,
  "failed_tasks": 89,
  "blocked_tasks": 56,
  "avg_duration_ms": 2340,
  "total_tokens": 524000,
  "tasks_by_state": {"completed": 1102, "failed": 89, "canceled": 56},
  "tasks_by_skill": {"carbon-accounting": 450, "brsr-compliance": 320, ...},
  "tasks_by_org": {"org-uuid-1": 200, "org-uuid-2": 150, ...}
}
```

The admin dashboard provides:
- Real-time task activity table across all organisations
- State/skill/org filtering
- Per-task inspection with full guardrail audit trails
- Latency and token usage tracking

---

## Integration Examples

### Python (httpx)

```python
import httpx

BASE = "https://indicarbon.ajayv.online"

# Authenticate
resp = httpx.post(f"{BASE}/api/v1/auth/login", json={
    "email": "agent@company.com",
    "password": "secret"
})
token = resp.json()["data"]["access_token"]
headers = {"Authorization": f"Bearer {token}"}

# Send A2A task
task = httpx.post(f"{BASE}/api/v1/a2a/tasks", headers=headers, json={
    "query": "Calculate Scope 2 emissions for 450,000 kWh grid electricity",
    "skill_id": "carbon-accounting"
}).json()

print(task["status"]["state"])  # "completed"
print(task["artifacts"][0]["parts"][0]["text"])  # The response
```

### JavaScript/TypeScript

```typescript
const BASE = "https://indicarbon.ajayv.online";

// Authenticate
const { data } = await fetch(`${BASE}/api/v1/auth/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "agent@company.com", password: "secret" })
}).then(r => r.json());

// Send A2A task via JSON-RPC
const result = await fetch(`${BASE}/api/v1/a2a`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${data.access_token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: "1",
    method: "tasks/send",
    params: {
      id: crypto.randomUUID(),
      message: {
        role: "user",
        parts: [{ type: "text", text: "Generate BRSR report for FY2025" }]
      },
      metadata: { skill_id: "brsr-compliance" }
    }
  })
}).then(r => r.json());

console.log(result.result.status.state); // "completed"
```

### cURL (JSON-RPC)

```bash
curl -X POST https://indicarbon.ajayv.online/api/v1/a2a \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "demo-1",
    "method": "tasks/send",
    "params": {
      "id": "'$(uuidgen)'",
      "message": {
        "role": "user",
        "parts": [{"type": "text", "text": "List available carbon credits under ₹500/tCO2"}]
      },
      "metadata": {"skill_id": "carbon-trading"}
    }
  }'
```

---

## Error Handling

### JSON-RPC Errors

| Code | Meaning |
|------|---------|
| -32700 | Parse error (malformed JSON) |
| -32600 | Invalid request (missing required fields) |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32000 | Task not found |
| -32001 | Guardrail blocked |
| -32002 | Task already completed/canceled |

### REST Errors

Standard HTTP status codes with JSON error body:

```json
{
  "detail": "Domain guard blocked: query is not related to carbon/sustainability"
}
```

---

## Architecture

```
External Agent
     │
     ▼
┌─────────────────────────────────────────┐
│  API Gateway (:8000)                    │
│  ├── /.well-known/agent.json (public)   │
│  └── /api/v1/a2a/* (auth required)     │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  AI-Agent Service (:8003)               │
│  ├── A2A Routes (JSON-RPC + REST)       │
│  ├── A2A Service                        │
│  │   ├── PII Masking                    │
│  │   ├── Domain Guard                   │
│  │   ├── Chat Pipeline (LangChain)      │
│  │   ├── Output Guard                   │
│  │   └── Task Persistence               │
│  └── A2A Repository (PostgreSQL)        │
└─────────────────────────────────────────┘
```

---

## Database Schema

### a2a_tasks

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Internal ID |
| task_id | TEXT (unique) | A2A protocol task ID |
| session_id | TEXT | Conversation session |
| organization_id | UUID | Owning organisation |
| user_id | UUID | Requesting user |
| skill_id | TEXT | Target skill |
| state | TEXT | Current lifecycle state |
| query | TEXT | User's input query |
| answer | TEXT | Agent's response |
| artifacts | JSONB | A2A artifacts array |
| history | JSONB | Message history |
| metadata | JSONB | Extra metadata |
| token_usage | INTEGER | Tokens consumed |
| duration_ms | INTEGER | Processing time |
| guardrail_blocked | BOOLEAN | Was blocked by guardrails |
| guardrail_audit | JSONB | Full audit trail |
| error_message | TEXT | Error details (if failed) |
| created_at | TIMESTAMPTZ | Task creation time |
| updated_at | TIMESTAMPTZ | Last state change |

### a2a_messages

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Internal ID |
| task_id | TEXT (FK) | Parent task |
| role | TEXT | "user" or "agent" |
| parts | JSONB | Message parts array |
| metadata | JSONB | Message metadata |
| created_at | TIMESTAMPTZ | Message time |

---

## Comparison: A2A vs MCP

| Feature | MCP | A2A |
|---------|-----|-----|
| **Purpose** | Tool calling (function invocation) | Agent communication (task delegation) |
| **Protocol** | JSON-RPC with tool schemas | JSON-RPC with task lifecycle |
| **State** | Stateless (per-call) | Stateful (task persists) |
| **Discovery** | Client config | `/.well-known/agent.json` |
| **Use case** | "Call this function with these args" | "Here's a task, tell me when done" |
| **IndiCarbon** | 40 tools for direct API access | 5 skills for conversational tasks |

Both are available simultaneously — use MCP for structured operations (place an order, submit a report) and A2A for open-ended tasks (analyse our emissions, generate compliance strategy).
