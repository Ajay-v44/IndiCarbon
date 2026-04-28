from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared_logic import register_middleware

from .api.v1.routes import auth, organizations, users
from .config import settings

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("auth-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Auth service started — env=%s", settings.app_env)
    yield
    logger.info("Auth service shutdown.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="IndiCarbon — Auth Service",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url=None,
        openapi_url="/openapi.json",
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

    app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
    app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
    app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["Organizations"])

    @app.get("/health", tags=["Observability"])
    async def health():
        from shared_logic import ApiResponse

        return ApiResponse(data={"service": "auth", "status": "healthy", "version": settings.app_version})

    return app


app = create_app()
