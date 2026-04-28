from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from shared_logic import register_middleware

from .api.v1.routes import documents, emissions
from .config import settings

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("compliance-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Compliance service started — env=%s", settings.app_env)
    yield
    logger.info("Compliance service shutdown.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="IndiCarbon — Compliance Service",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url=None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    register_middleware(app)

    app.include_router(emissions.router, prefix="/api/v1/emissions", tags=["GHG Emissions"])
    app.include_router(documents.router, prefix="/api/v1/documents", tags=["Document Vault"])

    @app.get("/health", tags=["Observability"])
    async def health():
        from shared_logic import ApiResponse

        return ApiResponse(data={"service": "compliance", "status": "healthy", "version": settings.app_version})

    return app


app = create_app()
