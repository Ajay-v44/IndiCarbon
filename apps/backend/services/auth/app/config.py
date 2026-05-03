from __future__ import annotations

import pathlib
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic.paths import backend_root

_ROOT = backend_root(pathlib.Path(__file__), 3)


class AuthSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".auth.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "1.0.0"
    log_level: str = "INFO"
    allowed_origins: str = "http://localhost:3000"

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str

    app_jwt_secret: str
    app_jwt_algorithm: str = "HS256"
    app_access_token_expires_in: int = 36000

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = AuthSettings()
