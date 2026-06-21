from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from shared_logic import register_middleware

from .api.v1.routes import credits, orders, proposals, trades, wallet
from .config import settings

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("marketplace-service")


from shared_logic.database import Base, _get_engine
from .models import credit, order, wallet as wallet_model

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables exist
    Base.metadata.create_all(bind=_get_engine())
    
    app.state.redis = await aioredis.from_url(settings.redis_url, decode_responses=True)
    logger.info("Marketplace service started — env=%s", settings.app_env)
    yield
    await app.state.redis.aclose()
    logger.info("Marketplace service shutdown.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="IndiCarbon — Marketplace Service",
        version=settings.app_version,
        docs_url="/docs",
        redoc_url=None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    register_middleware(app)

    app.include_router(orders.router, prefix="/api/v1/orders", tags=["Order Book"])
    app.include_router(proposals.router, prefix="/api/v1/proposals", tags=["Proposals"])
    app.include_router(credits.router, prefix="/api/v1/credits", tags=["Carbon Credit Registry"])
    app.include_router(trades.router, prefix="/api/v1/trades", tags=["Transaction Ledgers"])
    app.include_router(wallet.router, prefix="/api/v1/wallet", tags=["Wallet"])

    @app.get("/health", tags=["Observability"])
    async def health():
        from shared_logic import ApiResponse

        return ApiResponse(data={"service": "marketplace", "status": "healthy", "version": settings.app_version})

    return app


app = create_app()
