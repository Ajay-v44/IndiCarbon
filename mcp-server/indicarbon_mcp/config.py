"""Configuration for IndiCarbon MCP server."""

from __future__ import annotations

import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class MCPSettings(BaseSettings):
    """Runtime settings — all values can be overridden via environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="INDICARBON_",
        env_file=".env",
        extra="ignore",
    )

    gateway_url: str = Field(
        default="http://localhost:8000",
        description="Base URL of the IndiCarbon API Gateway.",
    )
    request_timeout: float = Field(
        default=30.0,
        description="Default HTTP request timeout in seconds.",
    )
    ai_timeout: float = Field(
        default=120.0,
        description="Timeout for AI agent requests (longer analysis tasks).",
    )

    # Optional pre-seeded credentials (avoids needing to call login first)
    email: str | None = Field(default=None, description="Pre-configured login email.")
    password: str | None = Field(default=None, description="Pre-configured login password.")


# Singleton instance loaded once at import
settings = MCPSettings()
