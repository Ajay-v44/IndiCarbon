from __future__ import annotations

import pathlib
from enum import Enum
from typing import Any

import httpx
from pydantic_settings import BaseSettings, SettingsConfigDict

from .auth import AuthenticatedUser
from .paths import backend_root

_ROOT = backend_root(pathlib.Path(__file__), 2)


class ServiceName(str, Enum):
    AUTH = "auth"
    COMPLIANCE = "compliance"
    MARKETPLACE = "marketplace"
    AI_AGENT = "ai-agent"
    GATEWAY = "gateway"


class ServiceRegistrySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT / ".envs" / ".services.env"),
        extra="ignore",
    )

    auth_service_url: str = "http://auth:8004"
    compliance_service_url: str = "http://compliance:8001"
    marketplace_service_url: str = "http://marketplace:8002"
    ai_agent_service_url: str = "http://ai-agent:8003"
    gateway_service_url: str = "http://gateway:8000"
    service_client_timeout_seconds: float = 30.0


_settings: ServiceRegistrySettings | None = None


def get_service_registry_settings() -> ServiceRegistrySettings:
    global _settings
    if _settings is None:
        _settings = ServiceRegistrySettings()
    return _settings


def get_service_url(service: ServiceName | str) -> str:
    service_name = ServiceName(service)
    settings = get_service_registry_settings()
    urls = {
        ServiceName.AUTH: settings.auth_service_url,
        ServiceName.COMPLIANCE: settings.compliance_service_url,
        ServiceName.MARKETPLACE: settings.marketplace_service_url,
        ServiceName.AI_AGENT: settings.ai_agent_service_url,
        ServiceName.GATEWAY: settings.gateway_service_url,
    }
    return urls[service_name].rstrip("/")


class ServiceClient:
    def __init__(
        self,
        service: ServiceName | str,
        *,
        caller: str,
        timeout: float | None = None,
    ) -> None:
        settings = get_service_registry_settings()
        self.service = ServiceName(service)
        self.base_url = get_service_url(self.service)
        self.caller = caller
        self.timeout = timeout or settings.service_client_timeout_seconds

    def request(
        self,
        method: str,
        path: str,
        *,
        user: AuthenticatedUser | None = None,
        headers: dict[str, str] | None = None,
        **kwargs: Any,
    ) -> httpx.Response:
        timeout = kwargs.pop("timeout", self.timeout)
        response = httpx.request(
            method,
            self._url(path),
            headers=self._headers(user=user, headers=headers),
            timeout=timeout,
            **kwargs,
        )
        response.raise_for_status()
        return response

    async def arequest(
        self,
        method: str,
        path: str,
        *,
        user: AuthenticatedUser | None = None,
        headers: dict[str, str] | None = None,
        **kwargs: Any,
    ) -> httpx.Response:
        timeout = kwargs.pop("timeout", self.timeout)
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.request(
                method,
                self._url(path),
                headers=self._headers(user=user, headers=headers),
                **kwargs,
            )
        response.raise_for_status()
        return response

    def get_json(self, path: str, **kwargs: Any) -> dict[str, Any]:
        return self.request("GET", path, **kwargs).json()

    def post_json(self, path: str, **kwargs: Any) -> dict[str, Any]:
        return self.request("POST", path, **kwargs).json()

    async def aget_json(self, path: str, **kwargs: Any) -> dict[str, Any]:
        return (await self.arequest("GET", path, **kwargs)).json()

    async def apost_json(self, path: str, **kwargs: Any) -> dict[str, Any]:
        return (await self.arequest("POST", path, **kwargs)).json()

    def _url(self, path: str) -> str:
        return f"{self.base_url}/{path.lstrip('/')}"

    def _headers(
        self,
        *,
        user: AuthenticatedUser | None,
        headers: dict[str, str] | None,
    ) -> dict[str, str]:
        outgoing = {
            "X-Service-Name": self.caller,
            **(headers or {}),
        }
        if user:
            outgoing.update(
                {
                    "X-User-ID": str(user.id),
                    "X-User-Email": user.email or "",
                    "X-User-Roles": ",".join(user.roles),
                    "X-Organization-IDs": ",".join(str(org_id) for org_id in user.organization_ids),
                }
            )
        return outgoing


def get_service_client(
    service: ServiceName | str,
    *,
    caller: str,
    timeout: float | None = None,
) -> ServiceClient:
    return ServiceClient(service, caller=caller, timeout=timeout)
