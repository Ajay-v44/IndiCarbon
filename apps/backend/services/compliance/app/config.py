from __future__ import annotations

import pathlib
from decimal import Decimal

from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic.paths import backend_root

_ROOT = backend_root(pathlib.Path(__file__), 3)


class ComplianceSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".compliance.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    ghg_grid_emission_factor_in: Decimal = Decimal("0.82")
    ghg_default_scope3_factor: Decimal = Decimal("1.0")

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    storage_bucket: str = "IndiCarbon"


settings = ComplianceSettings()
