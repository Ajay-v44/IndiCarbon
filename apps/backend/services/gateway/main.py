from __future__ import annotations

import logging
import pathlib
from contextlib import asynccontextmanager
from typing import Any

import httpx
import redis.asyncio as aioredis
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic import ApiResponse, register_middleware
from shared_logic.database import get_db
from shared_logic.system_logger import SystemLogRepository
from shared_logic.paths import backend_root

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("gateway")

_ROOT = backend_root(pathlib.Path(__file__), 2, container_parent_index=0)


# ─── Settings ─────────────────────────────────────────────────────────────────


class GatewaySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".gateway.env"),
            str(_ROOT / ".envs" / ".auth.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    auth_service_url: str
    compliance_service_url: str
    marketplace_service_url: str
    ai_agent_service_url: str

    redis_url: str
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    app_jwt_secret: str
    app_jwt_algorithm: str = "HS256"
    allowed_origins: str = "http://localhost:3000"

    gateway_client_timeout: float = 30.0
    ai_service_timeout: float = 120.0

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = GatewaySettings()


# ─── App State ────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = await aioredis.from_url(settings.redis_url, decode_responses=True)
    app.state.http = httpx.AsyncClient(timeout=httpx.Timeout(settings.gateway_client_timeout))
    logger.info("Gateway started — env=%s version=%s", settings.app_env, settings.app_version)
    yield
    await app.state.redis.aclose()
    await app.state.http.aclose()
    logger.info("Gateway shutdown complete.")


# ─── App Init ─────────────────────────────────────────────────────────────────


app = FastAPI(
    title="IndiCarbon AI — API Gateway",
    version=settings.app_version,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

register_middleware(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Rate Limiting ────────────────────────────────────────────────────────────


async def rate_limit(request: Request) -> None:
    redis = getattr(request.app.state, "redis", None)
    if not redis:
        return
    client_ip = request.client.host if request.client else "unknown"
    key = f"ratelimit:{client_ip}"
    pipe = redis.pipeline()
    pipe.incr(key)
    pipe.expire(key, settings.rate_limit_window_seconds)
    try:
        results = await pipe.execute()
        if results[0] > settings.rate_limit_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: {settings.rate_limit_requests} req/{settings.rate_limit_window_seconds}s",
            )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.warning(f"Redis rate limiting failed: {e}")


# ─── Auth Policy ──────────────────────────────────────────────────────────────


PUBLIC_ROUTES: set[tuple[str, str]] = {
    ("POST", "/api/v1/auth/register"),
    ("POST", "/api/v1/auth/login"),
    ("POST", "/api/v1/auth/refresh"),
    ("POST", "/api/v1/auth/verify"),
    ("GET", "/api/v1/auth/roles"),
    ("GET", "/api/v1/emissions/factors"),
    ("GET", "/.well-known/agent.json"),
    ("GET", "/.well-known/agent-card.json"),
}


def _bearer_token(request: Request) -> str:
    authorization = request.headers.get("Authorization", "")
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    return token.strip()


async def _verify_token(request: Request) -> dict[str, Any]:
    http: httpx.AsyncClient = request.app.state.http
    token = _bearer_token(request)
    try:
        resp = await http.post(f"{settings.auth_service_url}/api/v1/auth/verify", json={"token": token})
    except httpx.HTTPError as exc:
        logger.warning("Token verification request failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable.",
        )
    if resp.status_code == status.HTTP_401_UNAUTHORIZED:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    if resp.status_code >= 400:
        logger.warning("Token verification failed with status %s: %s", resp.status_code, resp.text)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service unavailable.",
        )
    payload = resp.json().get("data") or {}
    if not payload.get("valid") or not payload.get("user_id"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    return payload


async def require_auth(request: Request) -> None:
    request.state.auth_context = await _verify_token(request)


async def require_auth_unless_public(request: Request) -> None:
    if (request.method.upper(), request.url.path.rstrip("/")) in PUBLIC_ROUTES:
        return
    await require_auth(request)


def _forward_headers(request: Request) -> dict[str, str]:
    excluded_headers = {
        "host",
        "content-length",
        "transfer-encoding",
        "x-user-id",
        "x-user-email",
        "x-user-roles",
        "x-organization-id",
        "x-organization-ids",
    }
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower() not in excluded_headers
    }

    headers["X-Request-ID"] = getattr(request.state, "request_id", "")
    auth_context = getattr(request.state, "auth_context", None)
    if auth_context:
        headers["X-User-ID"] = str(auth_context["user_id"])
        headers["X-User-Email"] = auth_context.get("email") or ""
        headers["X-User-Roles"] = ",".join(auth_context.get("roles") or [])
        organization_id = auth_context.get("organization_id")
        organization_ids = auth_context.get("organization_ids") or []
        if not organization_id and organization_ids:
            organization_id = organization_ids[0]
        headers["X-Organization-ID"] = str(organization_id) if organization_id else ""
    return headers



async def _proxy(request: Request, upstream_url: str, timeout: float | None = None) -> JSONResponse:
    """Forwards request to internal service."""
    http: httpx.AsyncClient = request.app.state.http
    query = str(request.url.query)
    target = f"{upstream_url}{request.url.path}" + (f"?{query}" if query else "")
    body = await request.body()

    headers = _forward_headers(request)

    kwargs = {}
    if timeout is not None:
        kwargs["timeout"] = timeout

    resp = await http.request(
        method=request.method,
        url=target,
        headers=headers,
        content=body,
        follow_redirects=True,
        **kwargs
    )
    return JSONResponse(
        content=resp.json(),
        status_code=resp.status_code,
        headers={"X-Request-ID": getattr(request.state, "request_id", ""), "X-Served-By": "IndiCarbon-Gateway"},
    )


# ─── Health ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Observability"])
async def health():
    return ApiResponse(data={"status": "healthy", "version": settings.app_version})


# ─── Auth Service — PUBLIC (no JWT required) ──────────────────────────────────


@app.api_route(
    "/api/v1/auth/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Auth"],
    dependencies=[Depends(rate_limit), Depends(require_auth_unless_public)],
)
async def auth_proxy(request: Request, path: str):
    """
    Gateway to the Auth Service.
    Public auth endpoints are allowlisted; all other auth endpoints require
    a verified token and receive gateway-injected user context.
    """
    http: httpx.AsyncClient = request.app.state.http
    query = str(request.url.query)
    target = f"{settings.auth_service_url}/api/v1/auth/{path}" + (f"?{query}" if query else "")
    body = await request.body()
    headers = _forward_headers(request)

    resp = await http.request(method=request.method, url=target, headers=headers, content=body)
    return JSONResponse(content=resp.json(), status_code=resp.status_code)


# ─── Auth Service — PROTECTED ─────────────────────────────────────────────────


@app.api_route(
    "/api/v1/users",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def users_root_proxy(request: Request):
    return await _proxy(request, settings.auth_service_url)


@app.api_route(
    "/api/v1/users/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Users"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def users_proxy(request: Request, path: str):
    return await _proxy(request, settings.auth_service_url)


@app.api_route(
    "/api/v1/organizations",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def organizations_root_proxy(request: Request):
    return await _proxy(request, settings.auth_service_url)


@app.api_route(
    "/api/v1/organizations/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Organizations"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def organizations_proxy(request: Request, path: str):
    return await _proxy(request, settings.auth_service_url)


# ─── Compliance Service ───────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/compliance",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth_unless_public)],
)
async def compliance_root_proxy(request: Request):
    return await _proxy(request, settings.compliance_service_url)


@app.api_route(
    "/api/v1/compliance/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Compliance"],
    dependencies=[Depends(rate_limit), Depends(require_auth_unless_public)],
)
async def compliance_proxy(request: Request, path: str):
    return await _proxy(request, settings.compliance_service_url)


@app.api_route(
    "/api/v1/emissions",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth_unless_public)],
)
async def emissions_root_proxy(request: Request):
    return await _proxy(request, settings.compliance_service_url)


@app.api_route(
    "/api/v1/emissions/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Compliance"],
    dependencies=[Depends(rate_limit), Depends(require_auth_unless_public)],
)
async def emissions_proxy(request: Request, path: str):
    return await _proxy(request, settings.compliance_service_url)


@app.api_route(
    "/api/v1/documents",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def documents_root_proxy(request: Request):
    return await _proxy(request, settings.compliance_service_url)


@app.api_route(
    "/api/v1/documents/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Compliance"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def documents_proxy(request: Request, path: str):
    return await _proxy(request, settings.compliance_service_url)


# ─── Marketplace Service ──────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/marketplace",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def marketplace_root_proxy(request: Request):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/marketplace/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def marketplace_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/orders",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def orders_root_proxy(request: Request):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/orders/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def orders_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/proposals",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def proposals_root_proxy(request: Request):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/proposals/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def proposals_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/credits",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def credits_root_proxy(request: Request):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/credits/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def credits_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


# ─── Wallet ──────────────────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/wallet",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def wallet_root_proxy(request: Request):
    return await _proxy(request, settings.marketplace_service_url)


@app.api_route(
    "/api/v1/wallet/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def wallet_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


# ─── A2A Protocol (Agent-to-Agent) ────────────────────────────────────────


@app.get(
    "/.well-known/agent-card.json",
    tags=["A2A Protocol"],
    dependencies=[Depends(rate_limit)],
)
async def a2a_agent_card(request: Request):
    """Public A2A Agent Card for agent discovery (v0.3.0 path, no auth required)."""
    return await _proxy(request, settings.ai_agent_service_url)


@app.get(
    "/.well-known/agent.json",
    tags=["A2A Protocol"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit)],
)
async def a2a_agent_card_legacy(request: Request):
    """Legacy A2A Agent Card path (0.2.x) — kept for backward compatibility."""
    return await _proxy(request, settings.ai_agent_service_url)


@app.api_route(
    "/api/v1/a2a",
    methods=["POST"],
    tags=["A2A Protocol"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def a2a_jsonrpc_proxy(request: Request):
    """A2A JSON-RPC 2.0 endpoint for inter-agent communication."""
    return await _proxy(request, settings.ai_agent_service_url, timeout=settings.ai_service_timeout)


@app.api_route(
    "/api/v1/a2a/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["A2A Protocol"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def a2a_proxy(request: Request, path: str):
    """A2A REST API proxy — tasks, stats, cancel."""
    return await _proxy(request, settings.ai_agent_service_url, timeout=settings.ai_service_timeout)


# ─── AI Agent Service ─────────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/analyse-document",
    methods=["POST"],
    tags=["AI Agent"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def analyse_document_proxy(request: Request):
    return await _proxy(request, settings.ai_agent_service_url, timeout=settings.ai_service_timeout)


@app.api_route(
    "/api/v1/ai",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    include_in_schema=False,
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def ai_agent_root_proxy(request: Request):
    return await _proxy(request, settings.ai_agent_service_url, timeout=settings.ai_service_timeout)


@app.api_route(
    "/api/v1/ai/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["AI Agent"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def ai_agent_proxy(request: Request, path: str):
    return await _proxy(request, settings.ai_agent_service_url, timeout=settings.ai_service_timeout)


# ─── System Logs (Admin-Only) ────────────────────────────────────────────────


def _require_admin(request: Request) -> None:
    """Raise 403 unless the authenticated user has an admin role."""
    auth_ctx = getattr(request.state, "auth_context", None)
    if not auth_ctx:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")
    roles = auth_ctx.get("roles") or []
    if not any(r.upper() in {"ADMIN", "ORG_ADMIN", "SUPER_ADMIN"} for r in roles):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required.")


@app.get(
    "/api/v1/system-logs",
    tags=["System Logs"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def list_system_logs(
    request: Request,
    organization_id: str | None = None,
    service: str | None = None,
    level: str | None = None,
    is_resolved: bool | None = None,
    search: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    _require_admin(request)
    db = next(get_db())
    try:
        repo = SystemLogRepository(db)
        logs = repo.list_logs(
            organization_id=organization_id,
            service=service,
            level=level,
            is_resolved=is_resolved,
            search=search,
            limit=min(limit, 200),
            offset=offset,
        )
        total = repo.count_logs(
            organization_id=organization_id,
            service=service,
            level=level,
            is_resolved=is_resolved,
            search=search,
        )
        return ApiResponse(data={
            "logs": [entry.to_dict() for entry in logs],
            "total": total,
            "limit": limit,
            "offset": offset,
        })
    finally:
        db.close()


@app.get(
    "/api/v1/system-logs/stats",
    tags=["System Logs"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def system_log_stats(
    request: Request,
    organization_id: str | None = None,
):
    _require_admin(request)
    db = next(get_db())
    try:
        repo = SystemLogRepository(db)
        stats = repo.get_stats(organization_id=organization_id)
        return ApiResponse(data=stats)
    finally:
        db.close()


@app.post(
    "/api/v1/system-logs/{log_id}/resolve",
    tags=["System Logs"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def resolve_system_log(request: Request, log_id: str):
    _require_admin(request)
    auth_ctx = getattr(request.state, "auth_context", {})
    db = next(get_db())
    try:
        repo = SystemLogRepository(db)
        entry = repo.resolve(log_id, resolved_by=auth_ctx.get("user_id"))
        if not entry:
            raise HTTPException(status_code=404, detail="Log entry not found.")
        db.commit()
        return ApiResponse(data=entry.to_dict(), message="Log resolved.")
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@app.post(
    "/api/v1/system-logs/bulk-resolve",
    tags=["System Logs"],
    dependencies=[Depends(rate_limit), Depends(require_auth)],
)
async def bulk_resolve_system_logs(request: Request):
    _require_admin(request)
    auth_ctx = getattr(request.state, "auth_context", {})
    body = await request.json()
    log_ids = body.get("log_ids", [])
    if not log_ids:
        raise HTTPException(status_code=400, detail="log_ids required.")
    db = next(get_db())
    try:
        repo = SystemLogRepository(db)
        count = repo.bulk_resolve(log_ids, resolved_by=auth_ctx.get("user_id"))
        db.commit()
        return ApiResponse(data={"resolved_count": count}, message=f"{count} logs resolved.")
    except HTTPException:
        raise
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
