# IndiCarbon AI Agent Features

This document outlines the comprehensive capabilities, architecture, and security layers implemented in the IndiCarbon AI-Agent microservice.

## 1. Enterprise Agent & Tools
The core chatbot operates as a stateful ReAct (Reasoning and Acting) Agent capable of making decisions and executing tools on behalf of the user, fully instrumented via LangChain and LangGraph.

**Available Tools:**
- `get_compliance_reports`: Connects directly to the DB to fetch scope emissions and report statuses.
- `get_organization_users`: Fetches the roster of users and their RBAC roles within an organization.
- `create_new_user`: AI can parse natural language requests to onboard new users.
- `execute_sql_query`: AI can construct SQL statements for advanced analytics or data mutations.

## 2. Human-in-the-Loop (HITL)
To ensure safety in an enterprise environment, destructive actions or state mutations are never executed blindly by the LLM. 

Instead, tools like `create_new_user` and `execute_sql_query` (for `UPDATE`, `INSERT`, `DELETE`) are hard-wired with a Human-in-the-Loop circuit. When invoked, the tool intercepts the request, logs the proposed action to the `hitl_reviews` table as `PENDING`, and informs the LLM that human approval is required.

## 3. Retrieval-Augmented Generation (RAG)
The Agent has deep semantic understanding of organizational documents and context:
- **Vector Embeddings**: Uses Google's `gemini-embedding-2`, truncated to 768 dimensions using Matryoshka Representation Learning to perfectly match the `pgvector` database schema.
- **Background Processing**: Documents are chunked and embedded asynchronously without blocking API responses.
- **Hybrid Context**: Injects structured context (organization metadata, revenue) alongside semantic chunks to provide high-quality responses.

## 4. Multi-Layer Guardrails
The agent is heavily fortified against both user malice and unintended leaks:

- **PII Masking Middleware**: Detects and hashes Personal Identifiable Information (Emails, IP, Indian PII like PAN, Aadhaar, GSTIN) before it ever hits the LLM provider, reverting the hashes before returning to the user.
- **Domain Guard (`IndiCarbonDomainGuard`)**: A dedicated sub-agent evaluator that analyzes inputs to ensure queries strictly relate to IndiCarbon, carbon accounting, or sustainability. Blocks off-topic questions.
- **PDF Injection Guard**: Defends against malicious PDFs containing prompt injection attacks via a 3-layer defense mechanism (Hard Regex, Soft Sanitization, LLM Evaluator).

## 5. Dual-Provider Architecture
The service supports hot-swapping LLM providers via environment configurations without codebase changes.
- **Google Gemini**: Powered by `gemini-2.5-flash` for high-throughput, low-latency enterprise inference.
- **Ollama**: Seamlessly supports fallback or local-first inference using `qwen2.5-coder` or `llama3.1`.

## 6. Full Observability
Every layer of the AI Agent is completely transparent. 
- **Langfuse Tracing**: Explicit `CallbackHandlers` are piped into the agent's core, ensuring that all tool executions, reasoning steps, token usage, and durations are visible in the Langfuse dashboard.
- **LangSmith**: Optional parallel tracing layer for Langchain debugging.
- **Database Auditing**: All interactions are logged in the `agent_interactions` PostgreSQL table.
