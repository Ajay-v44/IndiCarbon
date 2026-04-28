from __future__ import annotations

import pathlib

from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic.paths import backend_root

_ROOT = backend_root(pathlib.Path(__file__), 3)


class MarketplaceSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".marketplace.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    redis_url: str
    trade_lock_ttl_seconds: int = 30

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str


settings = MarketplaceSettings()
