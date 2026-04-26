"""
apps/gateway/main.py
IndiCarbon AI — API Gateway
Responsibilities:
  - JWT validation via Supabase
  - Rate limiting via Redis (sliding-window)
  - Reverse-proxy routing to internal microservices
  - Global error handling (via shared middleware)
"""
from __future__ import annotations

import logging
import pathlib
import sys
from contextlib import asynccontextmanager

import httpx
import redis.asyncio as aioredis
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ensure shared_logic is importable both locally and inside Docker
_shared = str(pathlib.Path(__file__).resolve().parents[2] / "libs" / "shared-logic")
if _shared not in sys.path:
    sys.path.insert(0, _shared)

from shared_logic import ApiResponse, register_middleware

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("gateway")


# ─── Settings ─────────────────────────────────────────────────────────────────


_ROOT = pathlib.Path(__file__).resolve().parents[2]

class GatewaySettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".gateway.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )

    app_env: str = "development"
    app_version: str = "1.0.0"
    log_level: str = "INFO"

    compliance_service_url: str
    marketplace_service_url: str
    ai_agent_service_url: str

    redis_url: str
    rate_limit_requests: int = 100
    rate_limit_window_seconds: int = 60

    supabase_url: str
    supabase_jwt_secret: str

    allowed_origins: str = "http://localhost:3000"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = GatewaySettings()


# ─── Startup / Shutdown ───────────────────────────────────────────────────────


redis_pool: aioredis.Redis | None = None
http_client: httpx.AsyncClient | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global redis_pool, http_client
    redis_pool = await aioredis.from_url(settings.redis_url, decode_responses=True)
    http_client = httpx.AsyncClient(timeout=httpx.Timeout(30.0))
    logger.info("Gateway started — env=%s version=%s", settings.app_env, settings.app_version)
    yield
    await redis_pool.aclose()
    await http_client.aclose()
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
    """Sliding-window rate limiter keyed on IP address."""
    if not redis_pool:
        return  # Skip during tests / startup

    client_ip = request.client.host if request.client else "unknown"
    key = f"ratelimit:{client_ip}"

    pipe = redis_pool.pipeline()
    pipe.incr(key)
    pipe.expire(key, settings.rate_limit_window_seconds)
    results = await pipe.execute()
    count = results[0]

    if count > settings.rate_limit_requests:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded: {settings.rate_limit_requests} requests "
                   f"per {settings.rate_limit_window_seconds}s",
        )


# ─── JWT Auth ─────────────────────────────────────────────────────────────────


async def verify_jwt(request: Request) -> dict:
    """
    Validates the Supabase JWT from the Authorization header.
    Returns the decoded payload (includes `sub` = user UUID).
    """
    import jwt  # PyJWT

    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    token = auth_header.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}")


# ─── Proxy Helper ─────────────────────────────────────────────────────────────


async def _proxy(
    request: Request,
    upstream_url: str,
    strip_prefix: str,
    token_payload: dict,
) -> JSONResponse:
    """Forwards the request to an internal service, injecting user context headers."""
    if not http_client:
        raise HTTPException(status_code=503, detail="Gateway not ready.")

    path = request.url.path.removeprefix(strip_prefix)
    query = str(request.url.query)
    target = f"{upstream_url}{path}" + (f"?{query}" if query else "")
    body = await request.body()

    upstream_headers = dict(request.headers)
    upstream_headers["X-User-ID"] = token_payload.get("sub", "")
    upstream_headers["X-User-Email"] = token_payload.get("email", "")
    upstream_headers["X-Request-ID"] = getattr(request.state, "request_id", "")
    # Remove hop-by-hop headers
    for h in ("host", "content-length", "transfer-encoding"):
        upstream_headers.pop(h, None)

    upstream_resp = await http_client.request(
        method=request.method,
        url=target,
        headers=upstream_headers,
        content=body,
    )

    return JSONResponse(
        content=upstream_resp.json(),
        status_code=upstream_resp.status_code,
        headers={
            "X-Request-ID": getattr(request.state, "request_id", ""),
            "X-Served-By": "IndiCarbon-Gateway",
        },
    )


# ─── Health ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Observability"])
async def health():
    return ApiResponse(data={"status": "healthy", "version": settings.app_version})


# ─── Routing — Compliance ─────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/compliance/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Compliance"],
    dependencies=[Depends(rate_limit)],
)
async def compliance_proxy(
    request: Request,
    path: str,
    token_payload: dict = Depends(verify_jwt),
):
    return await _proxy(
        request,
        settings.compliance_service_url,
        strip_prefix="/api/v1/compliance",
        token_payload=token_payload,
    )


# ─── Routing — Marketplace ────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/marketplace/{path:path}",
    methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    tags=["Marketplace"],
    dependencies=[Depends(rate_limit)],
)
async def marketplace_proxy(
    request: Request,
    path: str,
    token_payload: dict = Depends(verify_jwt),
):
    return await _proxy(
        request,
        settings.marketplace_service_url,
        strip_prefix="/api/v1/marketplace",
        token_payload=token_payload,
    )


# ─── Routing — AI Agent ───────────────────────────────────────────────────────


@app.api_route(
    "/api/v1/ai/{path:path}",
    methods=["GET", "POST"],
    tags=["AI Agent"],
    dependencies=[Depends(rate_limit)],
)
async def ai_agent_proxy(
    request: Request,
    path: str,
    token_payload: dict = Depends(verify_jwt),
):
    return await _proxy(
        request,
        settings.ai_agent_service_url,
        strip_prefix="/api/v1/ai",
        token_payload=token_payload,
    )
