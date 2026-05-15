"""
services/ai-agent/agent.py
IndiCarbon AI — AI-Sovereign Agent Service

Architecture:
  ┌───────────────────────────────────────────────────────────┐
  │  Langfuse Tracer (Observability)                          │
  │  ┌─────────────────────────────────────────────────────┐  │
  │  │  LangChain AgentExecutor                            │  │
  │  │   ├── Ollama LLM (qwen2.5:3b-instruct, host:11434) │  │
  │  │   └── Tools:                                        │  │
  │  │        ├── GHGCalculatorTool → Compliance Service   │  │
  │  │        ├── BRSRReportTool    → Compliance Service   │  │
  │  │        └── VectorSearchTool  → Supabase pgvector    │  │
  │  └─────────────────────────────────────────────────────┘  │
  └───────────────────────────────────────────────────────────┘

Agents:
  - Auditor   : Validates GHG data quality, flags anomalies, ensures BRSR compliance.
  - Strategist: Recommends decarbonisation pathways and credit purchase strategies.
"""
from __future__ import annotations

import logging
import pathlib
import time
import uuid
from datetime import datetime
from typing import Any, Type

import httpx
from langchain_classic.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import ChatPromptTemplate, PromptTemplate
from langchain_core.tools import BaseTool
from langchain_community.llms import Ollama
from langfuse import Langfuse
from langfuse.langchain import CallbackHandler as LangfuseCallbackHandler
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from shared_logic import ServiceName, get_service_client
from shared_logic.paths import backend_root
from shared_logic.supabase_client import VectorRepository
from app.prompts.emission_extraction import get_auditor_prompt, get_strategist_prompt
from app.guardrails.pii_masker import PIIMasker
from app.guardrails.domain_guard import IndiCarbonDomainGuard, OFF_TOPIC_RESPONSE
from app.guardrails.middleware import GuardrailCallbackHandler

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("ai-agent")


# ─── Settings ─────────────────────────────────────────────────────────────────


_ROOT = backend_root(pathlib.Path(__file__), 2, container_parent_index=0)

class AgentSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".ai-agent.env"),
            str(_ROOT / ".envs" / ".services.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
            str(_ROOT / ".envs" / ".langfuse.env"),
        ],
        extra="ignore",
    )
    # host.docker.internal when running in Docker; localhost for local dev
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_llm_model: str = "qwen2.5-coder:14b"
    ollama_embed_model: str = "nomic-embed-text"

    langfuse_secret_key: str
    langfuse_public_key: str
    langfuse_host: str = "https://cloud.langfuse.com"
    langfuse_debug: bool = False


_settings: AgentSettings | None = None


def get_settings() -> AgentSettings:
    global _settings
    if _settings is None:
        _settings = AgentSettings()
    return _settings


# ─── Langfuse Initialisation ──────────────────────────────────────────────────


def get_langfuse_client() -> Langfuse:
    s = get_settings()
    return Langfuse(
        secret_key=s.langfuse_secret_key,
        public_key=s.langfuse_public_key,
        host=s.langfuse_host,
        debug=s.langfuse_debug,
    )


def get_langfuse_handler(run_id: str, agent_type: str) -> LangfuseCallbackHandler:
    """Creates a per-run Langfuse callback handler with rich trace metadata."""
    s = get_settings()
    return LangfuseCallbackHandler(
        public_key=s.langfuse_public_key,
    )


# ─── LangChain Tools ──────────────────────────────────────────────────────────


class GHGCalculatorInput(BaseModel):
    organization_id: str = Field(description="UUID of the organisation")
    fiscal_year: int = Field(description="Fiscal year e.g. 2024")
    scope: str = Field(description="One of: scope_1, scope_2, scope_3")
    category: str = Field(description="Emission category e.g. electricity")
    activity_data: float = Field(description="Quantity of the activity")
    activity_unit: str = Field(description="Unit of the activity e.g. kWh")


class GHGCalculatorTool(BaseTool):
    """
    LangChain Tool: calls the Compliance Service /ghg/calculate endpoint.
    The agent uses this to compute CO2e for a given emission entry.
    """
    name: str = "ghg_calculator"
    description: str = (
        "Calculates CO2e tonnes for a single emission activity using the GHG Protocol. "
        "Use when the user provides energy consumption, fuel usage, or other emission data. "
        "Input: organization_id, fiscal_year, scope (scope_1/2/3), category, "
        "activity_data (quantity), activity_unit (e.g. kWh, litre)."
    )
    args_schema: Type[BaseModel] = GHGCalculatorInput

    def _run(self, **kwargs: Any) -> str:  # type: ignore[override]
        s = get_settings()
        payload = {
            "organization_id": kwargs["organization_id"],
            "fiscal_year": kwargs["fiscal_year"],
            "scope": kwargs["scope"],
            "category": kwargs["category"],
            "activity_data": kwargs["activity_data"],
            "activity_unit": kwargs["activity_unit"],
        }
        try:
            resp = get_service_client(ServiceName.COMPLIANCE, caller="ai-agent").request(
                "POST",
                "/ghg/calculate",
                json=payload,
                headers={"X-User-ID": "ai-agent-system"},
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json()
            result = data.get("data", {})
            return (
                f"Calculation complete. CO2e = {result.get('co2e_tonnes')} tonnes "
                f"(scope: {result.get('scope')}, category: {result.get('category')}, "
                f"factor used: {result.get('emission_factor_used')} kg CO2e/{kwargs['activity_unit']})."
            )
        except Exception as exc:
            logger.error("GHGCalculatorTool error: %s", exc)
            return f"Error calling Compliance Service: {exc}"

    async def _arun(self, **kwargs: Any) -> str:  # type: ignore[override]
        return self._run(**kwargs)


class BRSRReportInput(BaseModel):
    organization_id: str = Field(description="UUID of the organisation")
    fiscal_year: int = Field(description="Fiscal year")
    revenue_crore: float | None = Field(None, description="Revenue in crore INR for intensity calculation")


class BRSRReportTool(BaseTool):
    """
    LangChain Tool: fetches a SEBI BRSR compliance summary from the Compliance Service.
    """
    name: str = "brsr_report"
    description: str = (
        "Fetches a SEBI BRSR-compliant GHG emissions summary for an organisation. "
        "Returns Scope 1, 2, 3 totals and emission intensity. "
        "Use when the user asks about BRSR compliance, ESG reports, or annual GHG summary."
    )
    args_schema: Type[BaseModel] = BRSRReportInput

    def _run(self, organization_id: str, fiscal_year: int, revenue_crore: float | None = None) -> str:
        params = {}
        if revenue_crore:
            params["revenue_crore"] = revenue_crore
        try:
            resp = get_service_client(ServiceName.COMPLIANCE, caller="ai-agent").request(
                "GET",
                f"/brsr/report/{organization_id}/{fiscal_year}",
                params=params,
                headers={"X-User-ID": "ai-agent-system"},
                timeout=20.0,
            )
            resp.raise_for_status()
            data = resp.json().get("data", {})
            return (
                f"BRSR Report FY{fiscal_year}: "
                f"Scope 1 = {data.get('scope1_total_tco2e')} tCO2e, "
                f"Scope 2 = {data.get('scope2_total_tco2e')} tCO2e, "
                f"Scope 3 = {data.get('scope3_total_tco2e')} tCO2e, "
                f"Total = {data.get('total_tco2e')} tCO2e."
            )
        except Exception as exc:
            logger.error("BRSRReportTool error: %s", exc)
            return f"Error fetching BRSR report: {exc}"

    async def _arun(self, *args: Any, **kwargs: Any) -> str:
        return self._run(*args, **kwargs)


class VectorSearchInput(BaseModel):
    query: str = Field(description="Natural language search query")
    match_count: int = Field(default=5, description="Number of results to return")


class VectorSearchTool(BaseTool):
    """
    LangChain Tool: semantic search over Supabase pgvector embeddings.
    Used to retrieve relevant regulatory documents, project descriptions, etc.
    """
    name: str = "vector_search"
    description: str = (
        "Searches the IndiCarbon knowledge base for relevant documents using semantic similarity. "
        "Use for regulatory queries, project standards (Verra VCS, Gold Standard), "
        "or when context from internal documents is needed."
    )
    args_schema: Type[BaseModel] = VectorSearchInput

    def _run(self, query: str, match_count: int = 5) -> str:
        s = get_settings()
        try:
            # Embed the query using Ollama
            embed_resp = httpx.post(
                f"{s.ollama_base_url}/api/embeddings",
                json={"model": s.ollama_embed_model, "prompt": query},
                timeout=30.0,
            )
            embed_resp.raise_for_status()
            embedding = embed_resp.json()["embedding"]

            # Search Supabase pgvector
            vector_repo = VectorRepository()
            results = vector_repo.similarity_search(
                query_embedding=embedding,
                match_count=match_count,
            )

            if not results:
                return "No relevant documents found in the knowledge base."

            formatted = "\n".join(
                f"[{i+1}] (similarity={r.get('similarity', 0):.2f}) {r.get('content', '')[:300]}"
                for i, r in enumerate(results)
            )
            return f"Found {len(results)} relevant documents:\n{formatted}"

        except Exception as exc:
            logger.error("VectorSearchTool error: %s", exc)
            return f"Vector search error: {exc}"

    async def _arun(self, *args: Any, **kwargs: Any) -> str:
        return self._run(*args, **kwargs)


# ─── Prompt Templates ─────────────────────────────────────────────────────────




# ─── Agent Factory ────────────────────────────────────────────────────────────


class IndiCarbonAgentFactory:
    """
    Factory that constructs LangChain AgentExecutors backed by Ollama LLMs.
    Each agent run is fully traced in Langfuse with span-level granularity.
    """

    def __init__(self) -> None:
        s = get_settings()
        self._llm = Ollama(
            base_url=s.ollama_base_url,
            model=s.ollama_llm_model,
            temperature=0.1,        # Low temp for factual compliance work
            top_p=0.9,
            num_predict=1024,       # qwen2.5:3b has smaller context window
        )
        self._tools = [
            GHGCalculatorTool(),
            BRSRReportTool(),
            VectorSearchTool(),
        ]
        logger.info(
            "AgentFactory initialised: model=%s tools=%s",
            s.ollama_llm_model,
            [t.name for t in self._tools],
        )

    def build_executor(self, agent_type: str) -> AgentExecutor:
        if agent_type == "strategist":
            prompt = get_strategist_prompt()
        else:
            prompt = get_auditor_prompt()
        agent = create_react_agent(self._llm, self._tools, prompt)
        return AgentExecutor(
            agent=agent,
            tools=self._tools,
            verbose=True,
            max_iterations=8,
            handle_parsing_errors=True,
            return_intermediate_steps=True,
        )

    async def run(
        self,
        agent_type: str,
        query: str,
        organization_id: str,
        fiscal_year: int | None = None,
        run_id: str | None = None,
    ) -> dict[str, Any]:
        run_id = run_id or str(uuid.uuid4())
        start_ms = int(time.time() * 1000)

        # ── GUARDRAIL Step 1: PII masking on raw user input ───────────────────
        _pii = PIIMasker(use_spacy=False)
        masked_query, pii_matches = _pii.mask(query)
        if pii_matches:
            logger.info(
                "[%s] Agent PII masked in input — %d entities: %s",
                run_id, len(pii_matches), [m.pii_type for m in pii_matches],
            )

        # ── GUARDRAIL Step 2: Domain guard — INPUT gate ─────────────────────
        s = get_settings()
        _domain_guard = IndiCarbonDomainGuard(
            ollama_base_url=s.ollama_base_url,
            fail_open=True,
        )
        input_verdict = _domain_guard.check_input(masked_query)
        logger.info(
            "[%s] Domain guard INPUT — verdict=%s reason=%s",
            run_id, input_verdict.verdict_raw, input_verdict.reason,
        )
        if not input_verdict.allowed:
            logger.warning("[%s] Query blocked as off-topic: %s", run_id, masked_query[:80])
            return {
                "run_id": run_id,
                "agent_type": agent_type,
                "organization_id": organization_id,
                "query": masked_query,
                "answer": OFF_TOPIC_RESPONSE,
                "tool_calls": [],
                "trace_url": None,
                "duration_ms": int(time.time() * 1000) - start_ms,
                "completed_at": datetime.utcnow().isoformat(),
                "guardrail_blocked": True,
                "guardrail_reason": input_verdict.reason,
            }

        handler = get_langfuse_handler(run_id, agent_type)
        # ── GUARDRAIL Step 3: attach GuardrailCallbackHandler alongside Langfuse ─
        guardrail_handler = GuardrailCallbackHandler(
            original_query=masked_query,
            ollama_base_url=s.ollama_base_url,
            run_id=run_id,
        )
        executor = self.build_executor(agent_type)

        try:
            result = await executor.ainvoke(
                {"input": masked_query},
                config={
                    "callbacks": [handler, guardrail_handler],
                    "run_name": f"indicarbon.{agent_type}.{run_id}",
                    "metadata": {
                        "langfuse_session_id": run_id,
                        "langfuse_user_id": organization_id,
                        "agent_type": agent_type,
                        "fiscal_year": fiscal_year,
                        "query_length": len(masked_query),
                        "pii_masked_count": len(pii_matches),
                        "domain_verdict_input": input_verdict.verdict_raw,
                        "model": get_settings().ollama_llm_model,
                    },
                },
            )

            answer = result.get("output", "No response generated.")
            intermediate = result.get("intermediate_steps", [])
            tool_calls = [
                {
                    "tool": step[0].tool,
                    "input": step[0].tool_input,
                    "output": step[1][:500],  # Truncate for storage
                }
                for step in intermediate
                if len(step) == 2
            ]

            # ── GUARDRAIL Step 4: Domain guard — OUTPUT gate ────────────────
            output_verdict = _domain_guard.check_output(masked_query, answer)
            logger.info(
                "[%s] Domain guard OUTPUT — verdict=%s reason=%s",
                run_id, output_verdict.verdict_raw, output_verdict.reason,
            )
            if not output_verdict.allowed:
                logger.warning("[%s] Agent output blocked as unsafe.", run_id)
                from app.guardrails.domain_guard import UNSAFE_OUTPUT_RESPONSE
                answer = UNSAFE_OUTPUT_RESPONSE

            # ── GUARDRAIL Step 5: PII masking on output ─────────────────────
            masked_answer, out_pii = _pii.mask(answer)
            if out_pii:
                logger.info(
                    "[%s] Agent PII masked in output — %d entities", run_id, len(out_pii)
                )
            answer = masked_answer

            duration_ms = int(time.time() * 1000) - start_ms
            audit = guardrail_handler.audit_summary

            try:
                get_langfuse_client().flush()
            except Exception:
                pass

            logger.info(
                "Agent run complete: run_id=%s agent=%s duration_ms=%d tool_calls=%d guardrail=%s",
                run_id, agent_type, duration_ms, len(tool_calls), audit,
            )

            return {
                "run_id": run_id,
                "agent_type": agent_type,
                "organization_id": organization_id,
                "query": masked_query,
                "answer": answer,
                "tool_calls": tool_calls,
                "trace_url": f"{get_settings().langfuse_host}/trace/{run_id}",
                "duration_ms": duration_ms,
                "completed_at": datetime.utcnow().isoformat(),
                "guardrail_audit": audit,
            }

        except Exception as exc:
            try:
                get_langfuse_client().flush()
            except Exception:
                pass
            logger.error("Agent run failed: %s", exc, exc_info=True)
            raise
