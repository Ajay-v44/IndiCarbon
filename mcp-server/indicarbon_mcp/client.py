"""
HTTP client with automatic token management for the IndiCarbon API Gateway.

Responsibilities:
  - Stateful bearer token storage (access + refresh)
  - Auto-login on first call when credentials are configured
  - Transparent token refresh on 401
  - Typed request/response helpers
"""

from __future__ import annotations

import logging
import threading
from typing import Any

import httpx

from .config import settings

logger = logging.getLogger(__name__)

# ─── Thread-safe token store ──────────────────────────────────────────────────

_lock = threading.Lock()
_access_token: str | None = None
_refresh_token: str | None = None


def set_tokens(access: str, refresh: str) -> None:
    global _access_token, _refresh_token
    with _lock:
        _access_token = access
        _refresh_token = refresh


def clear_tokens() -> None:
    global _access_token, _refresh_token
    with _lock:
        _access_token = None
        _refresh_token = None


def get_access_token() -> str | None:
    with _lock:
        return _access_token


def get_refresh_token() -> str | None:
    with _lock:
        return _refresh_token


# ─── Low-level HTTP helpers ───────────────────────────────────────────────────

def _client(timeout: float | None = None) -> httpx.Client:
    return httpx.Client(
        base_url=settings.gateway_url,
        timeout=timeout or settings.request_timeout,
    )


def _auth_headers() -> dict[str, str]:
    token = get_access_token()
    if not token:
        raise RuntimeError(
            "Not authenticated. Call indicarbon_login first, or set "
            "INDICARBON_EMAIL / INDICARBON_PASSWORD environment variables."
        )
    return {"Authorization": f"Bearer {token}"}


# ─── Public helpers ───────────────────────────────────────────────────────────

def login(email: str, password: str) -> dict[str, Any]:
    """Authenticate and persist tokens. Returns full token response dict."""
    with _client() as c:
        resp = c.post("/api/v1/auth/login", json={"email": email, "password": password})
    resp.raise_for_status()
    body = resp.json()
    data = body.get("data") or body
    set_tokens(data["access_token"], data["refresh_token"])
    logger.info("Logged in as %s", data.get("email"))
    return data


def _try_refresh() -> bool:
    """Attempt silent refresh. Returns True if succeeded."""
    rt = get_refresh_token()
    if not rt:
        return False
    try:
        with _client() as c:
            resp = c.post("/api/v1/auth/refresh", json={"refresh_token": rt})
        if resp.status_code == 200:
            data = resp.json().get("data") or resp.json()
            set_tokens(data["access_token"], data["refresh_token"])
            logger.debug("Token refreshed silently.")
            return True
    except Exception as exc:
        logger.warning("Silent refresh failed: %s", exc)
    return False


def _auto_login() -> None:
    """Auto-login from environment if credentials are configured."""
    if settings.email and settings.password:
        try:
            login(settings.email, settings.password)
        except Exception as exc:
            logger.warning("Auto-login failed: %s", exc)


def request(
    method: str,
    path: str,
    *,
    json: Any = None,
    params: dict | None = None,
    files: dict | None = None,
    headers: dict | None = None,
    timeout: float | None = None,
) -> Any:
    """
    Authenticated request to the gateway. Handles:
      - Auto-login if not yet authenticated
      - 401 → silent refresh → retry
      - Returns parsed JSON body (raises httpx.HTTPStatusError on failure)
    """
    # Ensure we have a token
    if not get_access_token():
        _auto_login()

    auth = _auth_headers()
    merged_headers = {**(headers or {}), **auth}

    def _do() -> httpx.Response:
        with _client(timeout) as c:
            return c.request(
                method,
                path,
                json=json,
                params=params,
                files=files,
                headers=merged_headers,
            )

    resp = _do()

    # Handle 401 with a single silent refresh attempt
    if resp.status_code == 401 and _try_refresh():
        merged_headers.update(_auth_headers())
        resp = _do()

    resp.raise_for_status()
    return resp.json()


# Convenience wrappers
def get(path: str, params: dict | None = None, timeout: float | None = None) -> Any:
    return request("GET", path, params=params, timeout=timeout)


def post(path: str, json: Any = None, files: dict | None = None, timeout: float | None = None) -> Any:
    return request("POST", path, json=json, files=files, timeout=timeout)


def patch(path: str, json: Any = None) -> Any:
    return request("PATCH", path, json=json)


def delete(path: str, json: Any = None) -> Any:
    return request("DELETE", path, json=json)
