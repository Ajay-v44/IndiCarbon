from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from shared_logic import register_middleware

from .api.v1.routes import agents

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("ai-agent-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    from agent import IndiCarbonAgentFactory
    logger.info("Loading AI Agent Factory (Ollama model)...")
    app.state.agent_factory = IndiCarbonAgentFactory()
    logger.info("AI Agent Service ready.")
    yield
    app.state.agent_factory = None


def create_app() -> FastAPI:
    app = FastAPI(
        title="IndiCarbon — AI Agent Service",
        version="1.0.0",
        docs_url="/docs",
        redoc_url=None,
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    register_middleware(app)

    app.include_router(agents.router, prefix="/api/v1/agents", tags=["AI Agents"])

    @app.get("/health", tags=["Observability"])
    async def health():
        from shared_logic import ApiResponse

        return ApiResponse(data={"service": "ai-agent", "status": "healthy"})

    return app


app = create_app()
