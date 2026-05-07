"""
main.py
────────
IndiCarbon AI-Agent Service — FastAPI Application Entry Point.

Startup sequence:
  1. Configure LangSmith environment variables (before any LangChain import).
  2. Compile the LangGraph document-analysis graph (warm-up).
  3. Optionally push prompts to LangSmith Hub.
  4. Start accepting requests.

Run locally:
    cd apps/backend/services/ai-agent
    uvicorn main:app --reload --port 8003

Docker:
    CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
"""
from __future__ import annotations

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─── LangSmith must be configured BEFORE importing any LangChain module ───────
from app.config.observability import configure_langsmith, get_langfuse_client
from app.config.settings import get_settings
from app.graph.document_graph import get_document_analysis_graph
from app.api.routes import router
from app.prompts.emission_extraction import push_prompts_to_langsmith

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("ai-agent.main")


# ─── Lifespan ─────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup / shutdown lifecycle handler.

    Startup:
      - Configure LangSmith tracing.
      - Pre-compile the LangGraph graph (avoids cold-start latency on first request).
      - Verify Langfuse connectivity.
      - Push prompts to LangSmith Hub (idempotent).

    Shutdown:
      - Flush remaining Langfuse traces.
    """
    logger.info("=== IndiCarbon AI-Agent Service Starting ===")

    # 1. Configure LangSmith (must be first)
    configure_langsmith()

    # 2. Pre-compile LangGraph graph
    logger.info("Compiling LangGraph document analysis graph...")
    graph = get_document_analysis_graph()
    logger.info("LangGraph graph compiled: %s", type(graph).__name__)

    # 3. Verify Langfuse
    try:
        lf = get_langfuse_client()
        lf.auth_check()
        logger.info("Langfuse connectivity: OK")
    except Exception as exc:
        logger.warning("Langfuse connectivity check failed (non-fatal): %s", exc)

    # 4. Push prompts to LangSmith (background, non-blocking)
    try:
        push_prompts_to_langsmith()
    except Exception as exc:
        logger.warning("LangSmith prompt push failed (non-fatal): %s", exc)

    s = get_settings()
    logger.info(
        "Service ready | model=%s | ollama=%s | langfuse=%s",
        s.ollama_llm_model,
        s.ollama_base_url,
        s.langfuse_host,
    )
    logger.info("=== AI-Agent Service Ready ===")

    yield  # ── Application is live ──

    # Shutdown
    logger.info("Shutting down — flushing Langfuse traces...")
    try:
        get_langfuse_client().flush()
    except Exception:
        pass
    logger.info("=== AI-Agent Service Stopped ===")


# ─── FastAPI Application ──────────────────────────────────────────────────────


app = FastAPI(
    title="IndiCarbon AI-Agent Service",
    description=(
        "LangGraph-powered document analysis pipeline for GHG emission factor extraction. "
        "Integrates with Ollama (local LLM), Langfuse (observability), and LangSmith (prompt versioning)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Tighten in production via environment variable
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register Routes ───────────────────────────────────────────────────────────
app.include_router(router)
