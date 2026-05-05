"""
app/config/settings.py
─────────────────────
Centralised settings for the IndiCarbon AI-Agent service.
All configuration is read from environment files using pydantic-settings.
A singleton pattern ensures settings are loaded once per process.
"""
from __future__ import annotations

import pathlib
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

# Resolve the backend root (4 levels up: settings → config → app → ai-agent → services → backend)
_HERE = pathlib.Path(__file__).resolve()
_SERVICE_ROOT = _HERE.parent.parent.parent            # .../ai-agent/
_BACKEND_ROOT = _SERVICE_ROOT.parent.parent.parent    # .../backend/
_ENVS = _BACKEND_ROOT / ".envs"


class Settings(BaseSettings):
    """
    All settings for the AI-Agent service.
    Environment files are loaded in priority order (last wins on conflict).
    """
    model_config = SettingsConfigDict(
        env_file=[
            str(_ENVS / ".ai-agent.env"),
            str(_ENVS / ".services.env"),
            str(_ENVS / ".langfuse.env"),
            str(_ENVS / ".supabase.env"),
        ],
        extra="ignore",
    )

    # ── Ollama ────────────────────────────────────────────────────────────────
    # Use http://localhost:11434 for local dev; host.docker.internal for Docker
    ollama_base_url: str = "http://localhost:11434"
    ollama_llm_model: str = "qwen2.5:3b-instruct"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_temperature: float = 0.1
    ollama_num_predict: int = 2048

    # ── Langfuse ─────────────────────────────────────────────────────────────
    langfuse_secret_key: str = ""
    langfuse_public_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"
    langfuse_debug: bool = False

    # ── LangSmith ────────────────────────────────────────────────────────────
    langsmith_api_key: str = ""
    langsmith_endpoint: str = "https://api.smith.langchain.com"
    langsmith_project: str = "IndiCarbon-AI-Agent"
    langchain_tracing_v2: bool = True

    # ── Downstream Services ───────────────────────────────────────────────────
    compliance_service_url: str = "http://localhost:8001"
    auth_service_url: str = "http://localhost:8004"
    service_client_timeout_seconds: float = 30.0

    # ── Graph ─────────────────────────────────────────────────────────────────
    # Maximum LangGraph node iterations before forced termination
    graph_max_iterations: int = 10


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Return the singleton Settings instance.
    Uses lru_cache so that env files are parsed exactly once.
    """
    return Settings()
