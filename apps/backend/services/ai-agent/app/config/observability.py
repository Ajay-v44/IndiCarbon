"""
app/config/observability.py
────────────────────────────
Initialises Langfuse (v4+) and LangSmith tracing for every agent run.

Langfuse v4 API changes:
  - No longer uses langfuse.trace() / trace.generation()
  - Tracing is done via @langfuse.observe() decorator or context managers
  - The LangChain callback handler moved to langfuse.langchain.CallbackHandler
  - Auth check is: langfuse.auth_check()
"""
from __future__ import annotations

import os
import logging
from functools import lru_cache

from langfuse import Langfuse
from langfuse.langchain import CallbackHandler as LangfuseCallbackHandler

from .settings import get_settings

logger = logging.getLogger("ai-agent.observability")


def configure_langsmith() -> None:
    """
    Inject LangSmith credentials into the process environment so that
    LangChain automatically picks them up for tracing.
    Must be called at startup before any LangChain object is instantiated.
    """
    s = get_settings()
    os.environ["LANGCHAIN_TRACING_V2"] = "true" if s.langchain_tracing_v2 else "false"
    os.environ["LANGCHAIN_ENDPOINT"] = s.langsmith_endpoint
    os.environ["LANGCHAIN_API_KEY"] = s.langsmith_api_key
    os.environ["LANGCHAIN_PROJECT"] = s.langsmith_project
    # Langfuse v4 also reads from environment
    os.environ["LANGFUSE_SECRET_KEY"] = s.langfuse_secret_key
    os.environ["LANGFUSE_PUBLIC_KEY"] = s.langfuse_public_key
    os.environ["LANGFUSE_HOST"] = s.langfuse_host
    logger.info(
        "LangSmith tracing configured: project=%s endpoint=%s",
        s.langsmith_project,
        s.langsmith_endpoint,
    )


@lru_cache(maxsize=1)
def get_langfuse_client() -> Langfuse:
    """
    Return the singleton Langfuse client (v4+).
    Thread-safe and shared across requests.
    """
    s = get_settings()
    client = Langfuse(
        secret_key=s.langfuse_secret_key,
        public_key=s.langfuse_public_key,
        host=s.langfuse_host,
    )
    logger.info("Langfuse v4 client initialised: host=%s", s.langfuse_host)
    return client


def build_langfuse_handler(
    run_id: str,
    agent_type: str,
    organization_id: str,
) -> LangfuseCallbackHandler:
    """
    Build a per-request Langfuse LangChain callback handler (v4+).
    Each invocation gets its own trace with rich metadata.

    Args:
        run_id:          Unique run identifier (UUID string).
        agent_type:      Agent graph name (e.g. "document_extractor").
        organization_id: The org context for this run.

    Returns:
        A LangfuseCallbackHandler ready to be passed to graph.invoke() config.
    """
    s = get_settings()
    return LangfuseCallbackHandler(
        secret_key=s.langfuse_secret_key,
        public_key=s.langfuse_public_key,
        host=s.langfuse_host,
        trace_name=f"indicarbon.{agent_type}",
        session_id=run_id,
        user_id=organization_id,
        tags=["indicarbon", agent_type, "production"],
        metadata={
            "agent_type": agent_type,
            "model": s.ollama_llm_model,
            "organization_id": organization_id,
        },
    )
