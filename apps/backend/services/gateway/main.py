from __future__ import annotations

import logging
import pathlib
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as aioredis
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic import ApiResponse, register_middleware
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

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = GatewaySettings()


# ─── App State ────────────────────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis = await aioredis.from_url(settings.redis_url, decode_responses=True)
    app.state.http = httpx.AsyncClient(timeout=httpx.Timeout(30.0))
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


# ─── JWT Auth (direct decode — fast path, no round-trip to auth service) ──────





async def _proxy(request: Request, upstream_url: str) -> JSONResponse:
    """Forwards request to internal service."""
    http: httpx.AsyncClient = request.app.state.http
    query = str(request.url.query)
    target = f"{upstream_url}{request.url.path}" + (f"?{query}" if query else "")
    body = await request.body()

    headers = {
        k: v
        for k, v in request.headers.items()
    }
    headers["X-Request-ID"] = getattr(request.state, "request_id", "")
    for h in ("host", "content-length", "transfer-encoding"):
        headers.pop(h, None)

    resp = await http.request(method=request.method, url=target, headers=headers, content=body)
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
    dependencies=[Depends(rate_limit)],
)
async def auth_proxy(request: Request, path: str):
    """
    Public gateway to the Auth Service.
    Login, register, refresh, roles, and token verify do NOT require a JWT.
    If a JWT is provided, user context is injected for protected auth actions
    such as role assignment.
    """
    http: httpx.AsyncClient = request.app.state.http
    query = str(request.url.query)
    target = f"{settings.auth_service_url}/api/v1/auth/{path}" + (f"?{query}" if query else "")
    body = await request.body()
    headers = {
        k: v
        for k, v in request.headers.items()
        if k.lower()
        not in (
            "host",
            "content-length",
        )
    }
    headers["X-Request-ID"] = getattr(request.state, "request_id", "")

    resp = await http.request(method=request.method, url=target, headers=headers, content=body)
    return JSONResponse(content=resp.json(), status_code=resp.status_code)


# ─── Auth Service — PROTECTED ─────────────────────────────────────────────────


@app.api_route(
    "/api/v1/users/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Users"],
    dependencies=[Depends(rate_limit)],
)
async def users_proxy(request: Request, path: str):
    return await _proxy(request, settings.auth_service_url)


@app.api_route(
    "/api/v1/organizations/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Organizations"],
    dependencies=[Depends(rate_limit)],
)
async def organizations_proxy(request: Request, path: str):
    return await _proxy(request, settings.auth_service_url)


# ─── Compliance Service ───────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/compliance/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Compliance"],
    dependencies=[Depends(rate_limit)],
)
async def compliance_proxy(request: Request, path: str):
    return await _proxy(request, settings.compliance_service_url)


# ─── Marketplace Service ──────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/marketplace/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit)],
)
async def marketplace_proxy(request: Request, path: str):
    return await _proxy(request, settings.marketplace_service_url)


# ─── AI Agent Service ─────────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/ai/{path:path}",
    methods=["GET", "POST"],
    tags=["AI Agent"],
    dependencies=[Depends(rate_limit)],
)
async def ai_agent_proxy(request: Request, path: str):
    return await _proxy(request, settings.ai_agent_service_url)
