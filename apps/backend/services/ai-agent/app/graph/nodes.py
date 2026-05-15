"""
app/graph/nodes.py
───────────────────
All LangGraph node functions for the IndiCarbon document-analysis pipeline.

Each node is a pure async function:
    async def <node_name>(state: AgentState) -> AgentState

Nodes read from state, do their work, and return a PARTIAL update dict.
LangGraph merges the returned dict into the running state automatically.

Node order (defined in graph.py):
  1. parse_document_node
  2. extract_emissions_node
  3. validate_items_node
  4. call_compliance_node
  5. summarise_node
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List

from langchain_ollama import OllamaLLM
from langchain_core.messages import HumanMessage, SystemMessage

from ..config.settings import get_settings
from ..parsers.document_parser import parse_document
from ..prompts.emission_extraction import (
    get_extraction_prompt,
    get_validation_summary_prompt,
)
from ..registry.compliance_registry import calculate_scope_emissions_api
from ..guardrails.pdf_injection_guard import PDFInjectionGuard, InjectionDetectedException
from ..guardrails.middleware import GuardrailCallbackHandler
from .state import AgentState

logger = logging.getLogger("ai-agent.graph.nodes")

# ─── LLM Factory (singleton within a graph run) ───────────────────────────────


def _get_llm() -> OllamaLLM:
    """Build and return the Ollama LLM instance."""
    s = get_settings()
    return OllamaLLM(
        base_url=s.ollama_base_url,
        model=s.ollama_llm_model,
        temperature=s.ollama_temperature,
        num_predict=s.ollama_num_predict,
    )


# ─── Node 1: Parse Document ───────────────────────────────────────────────────

# Singleton injection guard (stateless, safe to share across requests)
_PDF_INJECTION_GUARD = PDFInjectionGuard(
    use_llm_check=True,
    # Will be overridden at runtime via get_settings() where possible
    ollama_base_url="http://localhost:11434",
)


async def parse_document_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 1 — Document Parsing + PDF Injection Guard.

    Reads raw file bytes from state, delegates to the universal document parser,
    and returns extracted plain text.

    SECURITY: After parsing, the raw text is passed through the PDFInjectionGuard
    to neutralise any prompt injection attempts embedded in the PDF before the
    text is forwarded to any LLM node.

    Handles any format supported by app/parsers/document_parser.py.
    """
    logger.info("[%s] Node: parse_document — filename=%s", state["run_id"], state["filename"])

    steps = list(state.get("graph_steps", []))
    steps.append("parse_document")
    filename = state["filename"]

    try:
        raw_text = parse_document(state["document_bytes"], filename)
        logger.info("[%s] Document parsed: %d chars", state["run_id"], len(raw_text))

        # ── GUARDRAIL: PDF Prompt Injection Guard ─────────────────────────────
        # Re-build guard with the correct Ollama URL from settings
        s = get_settings()
        pdf_guard = PDFInjectionGuard(
            use_llm_check=True,
            ollama_base_url=s.ollama_base_url,
        )
        try:
            raw_text = pdf_guard.sanitise(raw_text, document_name=filename)
            logger.info("[%s] PDF injection guard: PASSED for '%s'", state["run_id"], filename)
        except InjectionDetectedException as inj_exc:
            logger.error(
                "[%s] PDF injection guard: BLOCKED document '%s' — %s",
                state["run_id"], filename, inj_exc,
            )
            return {
                "raw_text": "",
                "graph_steps": steps,
                "errors": list(state.get("errors", [])) + [
                    f"pdf_injection_blocked: {inj_exc}"
                ],
            }
        # ─────────────────────────────────────────────────────────────────────

        # Truncate very large documents to stay within LLM context window
        if len(raw_text) > 120_000:
            logger.warning(
                "[%s] Document too large (%d chars), truncating to 120k",
                state["run_id"], len(raw_text),
            )
            raw_text = raw_text[:120_000] + "\n\n[DOCUMENT TRUNCATED — FIRST 120,000 CHARS SHOWN]"

        return {"raw_text": raw_text, "graph_steps": steps, "errors": list(state.get("errors", []))}

    except ValueError as exc:
        logger.error("[%s] Document parse error: %s", state["run_id"], exc)
        return {
            "raw_text": "",
            "graph_steps": steps,
            "errors": list(state.get("errors", [])) + [f"parse_document: {exc}"],
        }


# ─── Node 2: Extract Emissions ────────────────────────────────────────────────


async def extract_emissions_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 2 — LLM Emission Factor Extraction.

    Sends the parsed document text to Ollama and asks it to extract
    all quantified emission activities as a JSON array.

    Uses prompts from app/prompts/emission_extraction.py which are also
    synced to LangSmith Hub for versioning.
    """
    logger.info("[%s] Node: extract_emissions", state["run_id"])
    steps = list(state.get("graph_steps", []))
    steps.append("extract_emissions")
    errors = list(state.get("errors", []))

    raw_text = state.get("raw_text", "")
    if not raw_text.strip():
        logger.warning("[%s] No document text — skipping extraction", state["run_id"])
        return {
            "emission_items": [],
            "llm_raw_output": "",
            "graph_steps": steps,
            "errors": errors + ["extract_emissions: empty document text"],
        }

    llm = _get_llm()

    prompt = get_extraction_prompt()
    chain = prompt | llm

    # ── GUARDRAIL: attach callback middleware ─────────────────────────────────
    s = get_settings()
    guardrail_handler = GuardrailCallbackHandler(
        original_query=f"Extract emissions from document (org={state.get('organization_id', '')}, fy={state.get('fiscal_year', '')})",
        ollama_base_url=s.ollama_base_url,
        run_id=state["run_id"],
    )
    # ─────────────────────────────────────────────────────────────────────────

    try:
        raw_output: str = await chain.ainvoke(
            {
                "document_text": raw_text[:80_000],
                "fiscal_year": state.get("fiscal_year") or "unknown",
                "organization_id": state.get("organization_id", ""),
            },
            config={"callbacks": [guardrail_handler]},
        )
        logger.info("[%s] LLM extraction response: %d chars", state["run_id"], len(raw_output))
        logger.info(
            "[%s] Guardrail audit (extract): %s",
            state["run_id"], guardrail_handler.audit_summary,
        )

        emission_items = _parse_llm_json_response(raw_output, state["run_id"])

        return {
            "llm_raw_output": raw_output,
            "emission_items": emission_items,
            "graph_steps": steps,
            "errors": errors,
        }

    except Exception as exc:
        logger.error("[%s] LLM extraction error: %s", state["run_id"], exc, exc_info=True)
        return {
            "llm_raw_output": "",
            "emission_items": [],
            "graph_steps": steps,
            "errors": errors + [f"extract_emissions: {exc}"],
        }


def _parse_llm_json_response(raw: str, run_id: str) -> List[Dict[str, Any]]:
    """
    Robustly parse the LLM's JSON array response.
    Handles cases where the model wraps output in markdown fences.
    """
    # Strip optional markdown code fences
    cleaned = raw.strip()
    cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()

    # Find the first '[' and last ']' to isolate the JSON array
    start = cleaned.find("[")
    end = cleaned.rfind("]")
    if start == -1 or end == -1:
        logger.warning("[%s] No JSON array found in LLM output.", run_id)
        return []

    json_str = cleaned[start : end + 1]
    try:
        items = json.loads(json_str)
        if not isinstance(items, list):
            logger.warning("[%s] LLM returned non-list JSON.", run_id)
            return []
        logger.info("[%s] Extracted %d emission items from LLM", run_id, len(items))
        return items
    except json.JSONDecodeError as exc:
        logger.error("[%s] JSON decode error: %s | raw=%s...", run_id, exc, json_str[:200])
        return []


# ─── Node 3: Validate Items ───────────────────────────────────────────────────


VALID_FACTOR_KEYS = {
    "electricity",
    "stationary_combustion",
    "mobile_combustion",
    "business_travel",
    "supply_chain",
    "waste",
}

VALID_UNITS = {
    "kwh", "mwh", "gwh",
    "litre", "liter", "l",
    "kg", "tonne", "mt",
    "km", "miles",
    "unit", "number",
    "m3", "cubic_meter",
}


async def validate_items_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 3 — Validation & Normalisation.

    Filters out malformed items and normalises units.
    Adds warnings (non-fatal) for items with suspicious values.
    """
    logger.info("[%s] Node: validate_items — %d raw items", state["run_id"], len(state.get("emission_items", [])))
    steps = list(state.get("graph_steps", []))
    steps.append("validate_items")
    errors = list(state.get("errors", []))
    warnings: List[str] = []
    validated: List[Dict[str, Any]] = []

    for i, item in enumerate(state.get("emission_items", [])):
        # Required fields
        factor_key = str(item.get("factor_key", "")).lower().strip()
        raw_quantity = item.get("raw_quantity")
        activity_unit = str(item.get("activity_unit", "")).strip()
        year = item.get("year")

        # Validate factor_key
        if factor_key not in VALID_FACTOR_KEYS:
            warnings.append(f"Item {i}: unknown factor_key '{factor_key}' — skipped.")
            continue

        # Validate quantity
        try:
            qty = float(raw_quantity)
            if qty <= 0:
                warnings.append(f"Item {i}: raw_quantity must be > 0 (got {qty}) — skipped.")
                continue
        except (TypeError, ValueError):
            warnings.append(f"Item {i}: invalid raw_quantity '{raw_quantity}' — skipped.")
            continue

        # Validate year
        try:
            yr = int(year)
            if not (2000 <= yr <= 2100):
                warnings.append(f"Item {i}: year {yr} out of range — skipped.")
                continue
        except (TypeError, ValueError):
            # If no year given, use fiscal_year from state
            yr = state.get("fiscal_year") or 2024
            warnings.append(f"Item {i}: missing year, defaulting to {yr}.")

        # Activity unit — normalise but don't reject
        unit = activity_unit.lower().replace(" ", "_") if activity_unit else "unit"

        # Unusually large quantity warning
        if qty > 1_000_000_000:
            warnings.append(f"Item {i}: very large quantity ({qty}) for '{factor_key}' — verify unit.")

        validated.append({
            "factor_key": factor_key,
            "raw_quantity": qty,
            "activity_unit": unit,
            "year": yr,
            "scope_hint": item.get("scope_hint"),
            "source_text": item.get("source_text", ""),
            "document_id": state.get("document_id") or "",
        })

    logger.info(
        "[%s] Validation complete: %d valid, %d warnings",
        state["run_id"], len(validated), len(warnings),
    )

    return {
        "validated_items": validated,
        "validation_warnings": warnings,
        "graph_steps": steps,
        "errors": errors,
    }


# ─── Node 4: Call Compliance API ─────────────────────────────────────────────


async def call_compliance_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 4 — Compliance Service Integration.

    Sends the validated emission items to the Compliance Service
    calculate_scope_emissions endpoint and stores the result.

    This node is designed so that in future, two different scope groups
    can be submitted to TWO separate API calls in parallel using
    LangGraph's Send() API for fan-out.
    """
    logger.info("[%s] Node: call_compliance — %d items", state["run_id"], len(state.get("validated_items", [])))
    steps = list(state.get("graph_steps", []))
    steps.append("call_compliance")
    errors = list(state.get("errors", []))

    validated_items = state.get("validated_items", [])
    if not validated_items:
        logger.warning("[%s] No validated items — skipping Compliance API call.", state["run_id"])
        return {
            "compliance_result": {"skipped": True, "reason": "No valid emission items extracted"},
            "graph_steps": steps,
            "errors": errors,
        }

    try:
        result = await calculate_scope_emissions_api(
            organization_id=state["organization_id"],
            user_id=state.get("user_id", "ai-agent-system"),
            revenue_crore=state.get("revenue_crore") or 0.0,
            emission_items=validated_items,
        )
        logger.info("[%s] Compliance API response: %s", state["run_id"], str(result)[:200])
        return {"compliance_result": result, "graph_steps": steps, "errors": errors}

    except Exception as exc:
        logger.error("[%s] Compliance API call failed: %s", state["run_id"], exc, exc_info=True)
        return {
            "compliance_result": {"error": str(exc)},
            "graph_steps": steps,
            "errors": errors + [f"call_compliance: {exc}"],
        }


# ─── Node 5: Generate Summary ─────────────────────────────────────────────────


async def summarise_node(state: AgentState) -> Dict[str, Any]:
    """
    Node 5 — Audit Summary Generation.

    Uses the LLM to produce a human-readable, auditor-grade summary
    that combines the extracted items and Compliance API results.
    Prompt is defined in app/prompts/ and synced to LangSmith.
    """
    logger.info("[%s] Node: summarise", state["run_id"])
    steps = list(state.get("graph_steps", []))
    steps.append("summarise")
    errors = list(state.get("errors", []))

    llm = _get_llm()

    items_json = json.dumps(state.get("validated_items", []), indent=2, default=str)
    compliance_json = json.dumps(state.get("compliance_result", {}), indent=2, default=str)

    prompt = get_validation_summary_prompt()
    chain = prompt | llm

    # ── GUARDRAIL: attach callback middleware ─────────────────────────────────
    s = get_settings()
    guardrail_handler = GuardrailCallbackHandler(
        original_query=f"Generate summary for org={state.get('organization_id', '')}, fy={state.get('fiscal_year', '')}",
        ollama_base_url=s.ollama_base_url,
        run_id=state["run_id"],
    )
    # ─────────────────────────────────────────────────────────────────────────

    try:
        summary: str = await chain.ainvoke(
            {
                "emission_items_json": items_json[:5000],
                "compliance_result": compliance_json[:3000],
                "organization_id": state.get("organization_id", ""),
                "fiscal_year": state.get("fiscal_year") or "unknown",
            },
            config={"callbacks": [guardrail_handler]},
        )
        logger.info("[%s] Summary generated: %d chars", state["run_id"], len(summary))
        logger.info(
            "[%s] Guardrail audit (summarise): %s",
            state["run_id"], guardrail_handler.audit_summary,
        )
        return {"summary": summary.strip(), "graph_steps": steps, "errors": errors}

    except Exception as exc:
        logger.error("[%s] Summary generation failed: %s", state["run_id"], exc)
        warnings_str = "; ".join(state.get("validation_warnings", []))
        fallback = (
            f"Extracted {len(state.get('validated_items', []))} emission activities. "
            f"Validation warnings: {warnings_str or 'None'}."
        )
        return {
            "summary": fallback,
            "graph_steps": steps,
            "errors": errors + [f"summarise: {exc}"],
        }
