"""
services/ai-agent/main.py
FastAPI application layer for the AI-Agent Service.
"""
from __future__ import annotations

import logging
import pathlib
import sys
import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Header, HTTPException, status

# Ensure shared_logic is importable both locally and inside Docker
_shared = str(pathlib.Path(__file__).resolve().parents[2] / "libs" / "shared-logic")
if _shared not in sys.path:
    sys.path.insert(0, _shared)

from shared_logic import AgentRunRequest, AgentRunResponse, ApiResponse, register_middleware

# Absolute import — works with `uvicorn main:app` and inside Docker
from agent import IndiCarbonAgentFactory

logging.basicConfig(stream=sys.stdout, level=logging.INFO,
                    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s")
logger = logging.getLogger("ai-agent.api")

# ─── App ──────────────────────────────────────────────────────────────────────

agent_factory: IndiCarbonAgentFactory | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent_factory
    logger.info("Initialising AI Agent Factory (loading Ollama model)...")
    agent_factory = IndiCarbonAgentFactory()
    logger.info("AI Agent Service ready.")
    yield
    agent_factory = None


app = FastAPI(
    title="IndiCarbon — AI Agent Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)
register_middleware(app)


# ─── Helpers ──────────────────────────────────────────────────────────────────


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No user context.")
    return x_user_id


def get_factory() -> IndiCarbonAgentFactory:
    if agent_factory is None:
        raise HTTPException(status_code=503, detail="Agent service not ready.")
    return agent_factory


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Observability"])
async def health():
    return ApiResponse(data={"service": "ai-agent", "status": "healthy"})


@app.post(
    "/run",
    response_model=ApiResponse[AgentRunResponse],
    tags=["Agents"],
    summary="Run an AI agent (Auditor or Strategist) against an organisation's data",
)
async def run_agent(
    req: AgentRunRequest,
    user_id: str = Depends(get_requesting_user),
    factory: IndiCarbonAgentFactory = Depends(get_factory),
) -> ApiResponse[AgentRunResponse]:
    run_id = str(uuid.uuid4())
    result = await factory.run(
        agent_type=req.agent_type.value,
        query=req.query,
        organization_id=str(req.organization_id),
        fiscal_year=req.fiscal_year,
        run_id=run_id,
    )
    response = AgentRunResponse(**result)
    return ApiResponse(data=response, message="Agent run completed.")
