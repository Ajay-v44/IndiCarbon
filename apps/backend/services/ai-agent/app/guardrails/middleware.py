"""
app/guardrails/middleware.py
─────────────────────────────
LangChain Middleware + Callback wiring for IndiCarbon guardrails.

TWO integration points, because the codebase has two agent architectures:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATH A — LangGraph document analysis graph  (document_graph.py)
        Uses: langgraph.prebuilt.create_react_agent (new API)
        Uses: langchain.agents.create_agent middleware= list
        → PIIMiddleware (LangChain native) + custom detectors
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATH B — AgentExecutor  (agent.py)
        Uses: create_react_agent + AgentExecutor (legacy API)
        Does NOT support middleware= list
        → GuardrailCallbackHandler (BaseCallbackHandler)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PII coverage matrix:
  Built-in PIIMiddleware  → email, credit_card, ip, mac_address, url
  Custom-detector PIIMiddleware → PAN, Aadhaar, GSTIN, Phone_IN, SSN
  Our PIIMasker (callable) is the detector passed via detector= arg.

Guardrail execution order:
  ┌─────────────────────────────────────────────────────────────────┐
  │ [1] PIIMiddleware (native) — email, credit_card, ip            │
  │ [2] PIIMiddleware (custom) — PAN, Aadhaar, GSTIN, Phone_IN     │
  │     ↓ before_model hook fires BEFORE the LLM sees the message  │
  │ [3] IndiCarbonDomainGuard — INPUT gate (llama3.1:8b)          │
  │     ↓ main agent runs                                           │
  │ [4] IndiCarbonDomainGuard — OUTPUT gate (llama3.1:8b)         │
  │ [5] PIIMiddleware (apply_to_output=True) — mask in response    │
  └─────────────────────────────────────────────────────────────────┘
"""
from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.outputs import LLMResult
from langchain.agents.middleware import PIIMiddleware
from langchain.agents.middleware.pii import PIIMatch

from .pii_masker import PIIMasker
from .domain_guard import (
    IndiCarbonDomainGuard,
    OffTopicException,
    OFF_TOPIC_RESPONSE,
    UNSAFE_OUTPUT_RESPONSE,
)

logger = logging.getLogger("ai-agent.guardrails.middleware")


# ─── Custom detector functions (fed into PIIMiddleware's detector= arg) ───────
# Each function takes a string and returns list[PIIMatch] — the format
# LangChain's PIIMiddleware expects from a custom detector callable.

def _detect_pan(text: str) -> list[PIIMatch]:
    """Detect Indian PAN (ABCDE1234F) for PIIMiddleware."""
    pattern = re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b")
    return [
        PIIMatch(type="PAN", value=m.group(), start=m.start(), end=m.end())
        for m in pattern.finditer(text)
    ]


def _detect_aadhaar(text: str) -> list[PIIMatch]:
    """Detect Indian Aadhaar (12-digit) for PIIMiddleware."""
    pattern = re.compile(r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b")
    return [
        PIIMatch(type="AADHAAR", value=m.group(), start=m.start(), end=m.end())
        for m in pattern.finditer(text)
    ]


def _detect_gstin(text: str) -> list[PIIMatch]:
    """Detect Indian GSTIN for PIIMiddleware."""
    pattern = re.compile(r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b")
    return [
        PIIMatch(type="GSTIN", value=m.group(), start=m.start(), end=m.end())
        for m in pattern.finditer(text)
    ]


def _detect_phone_in(text: str) -> list[PIIMatch]:
    """Detect Indian mobile numbers for PIIMiddleware."""
    pattern = re.compile(r"\b(?:\+91[\s\-]?)?[6-9]\d{9}\b")
    return [
        PIIMatch(type="PHONE_IN", value=m.group(), start=m.start(), end=m.end())
        for m in pattern.finditer(text)
    ]


def _detect_ssn(text: str) -> list[PIIMatch]:
    """Detect US SSN (for multinational docs) for PIIMiddleware."""
    pattern = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
    return [
        PIIMatch(type="SSN", value=m.group(), start=m.start(), end=m.end())
        for m in pattern.finditer(text)
    ]


# ─── build_pii_middleware_stack() ─────────────────────────────────────────────


def build_pii_middleware_stack(
    strategy: str = "hash",
    apply_to_input: bool = True,
    apply_to_output: bool = True,
    apply_to_tool_results: bool = True,
) -> list[PIIMiddleware]:
    """
    Build the full PII middleware stack using LangChain's native PIIMiddleware.

    Combines:
      • Built-in PIIMiddleware types: email, credit_card, ip, mac_address
      • Custom-detector PIIMiddleware: PAN, Aadhaar, GSTIN, Phone_IN, SSN

    Strategy defaults to ``hash`` so that the same PII maps to the same
    pseudonymous token across a session (consistent pronoun references, debugging).

    Args:
        strategy:               "hash" | "redact" | "mask" | "block"
        apply_to_input:         Mask PII in user messages before LLM call.
        apply_to_output:        Mask PII in AI messages before returning to user.
        apply_to_tool_results:  Mask PII in tool results before feeding back to LLM.

    Returns:
        list[PIIMiddleware] ready to pass to ``create_agent(middleware=[...])``.

    Usage::
        from langchain.agents import create_agent
        agent = create_agent(model, tools, middleware=build_pii_middleware_stack())
    """
    shared = dict(
        strategy=strategy,
        apply_to_input=apply_to_input,
        apply_to_output=apply_to_output,
        apply_to_tool_results=apply_to_tool_results,
    )

    return [
        # ── LangChain native built-ins ──────────────────────────────────────
        PIIMiddleware("email", **shared),
        PIIMiddleware("credit_card", **shared),
        PIIMiddleware("ip", **shared),
        PIIMiddleware("mac_address", **shared),
        # ── India-specific custom detectors ─────────────────────────────────
        PIIMiddleware("PAN",      detector=_detect_pan,      **shared),
        PIIMiddleware("AADHAAR",  detector=_detect_aadhaar,  **shared),
        PIIMiddleware("GSTIN",    detector=_detect_gstin,    **shared),
        PIIMiddleware("PHONE_IN", detector=_detect_phone_in, **shared),
        PIIMiddleware("SSN",      detector=_detect_ssn,      **shared),
    ]


# ─── GuardrailCallbackHandler ─────────────────────────────────────────────────
# Used for PATH B: AgentExecutor (legacy API that doesn't support middleware=)


class GuardrailCallbackHandler(BaseCallbackHandler):
    """
    LangChain BaseCallbackHandler for the AgentExecutor path (agent.py).

    The new `create_agent` API handles PII via PIIMiddleware= above.
    This handler covers the legacy AgentExecutor path and provides:
      • PII masking via PIIMasker (regex, same patterns as above)
      • Domain guard INPUT/OUTPUT gate via IndiCarbonDomainGuard
      • Audit summary for Langfuse metadata

    Attach via::
        executor.ainvoke(inputs, config={"callbacks": [GuardrailCallbackHandler(...)]})
    """

    raise_on_input_violation: bool = True
    raise_on_output_violation: bool = False

    def __init__(
        self,
        original_query: str = "",
        ollama_base_url: str = "http://localhost:11434",
        evaluator_model: str = "qwen2.5:3b-instruct",
        run_id: Optional[str] = None,
    ) -> None:
        super().__init__()
        self._query = original_query
        self._run_id = run_id or "unknown"
        # regex-only PIIMasker for the callback path (spaCy too slow inline)
        self._pii = PIIMasker(use_spacy=False)
        self._domain_guard = IndiCarbonDomainGuard(
            ollama_base_url=ollama_base_url,
            evaluator_model=evaluator_model,
            fail_open=True,
        )
        self._input_pii_matches: list = []
        self._output_pii_matches: list = []
        self._domain_verdict_input: str = "not_checked"
        self._domain_verdict_output: str = "not_checked"

    # ── Chain hooks ───────────────────────────────────────────────────────────

    def on_chain_start(
        self,
        serialized: Dict[str, Any],
        inputs: Dict[str, Any],
        *,
        run_id: UUID,
        **kwargs: Any,
    ) -> None:
        input_text = inputs.get("input", "") or inputs.get("query", "")
        if not input_text:
            return

        # PII mask
        masked_text, pii_matches = self._pii.mask(input_text)
        self._input_pii_matches = pii_matches
        if pii_matches:
            logger.info(
                "[%s] Callback PII masked in input — %d entities: %s",
                self._run_id, len(pii_matches), [m.pii_type for m in pii_matches],
            )
            if "input" in inputs:
                inputs["input"] = masked_text
            if "query" in inputs:
                inputs["query"] = masked_text

        # Domain guard — INPUT gate
        verdict = self._domain_guard.check_input(masked_text or input_text)
        self._domain_verdict_input = verdict.verdict_raw
        logger.info(
            "[%s] Callback domain INPUT — verdict=%s reason=%s",
            self._run_id, verdict.verdict_raw, verdict.reason,
        )
        if not verdict.allowed and self.raise_on_input_violation:
            raise OffTopicException(
                f"Query blocked by IndiCarbon domain guard: {verdict.reason}"
            )

    def on_chain_end(
        self,
        outputs: Dict[str, Any],
        *,
        run_id: UUID,
        **kwargs: Any,
    ) -> None:
        output_text = outputs.get("output", "") or outputs.get("answer", "")
        if not output_text:
            return

        # Domain guard — OUTPUT gate
        verdict = self._domain_guard.check_output(self._query, output_text)
        self._domain_verdict_output = verdict.verdict_raw
        logger.info(
            "[%s] Callback domain OUTPUT — verdict=%s reason=%s",
            self._run_id, verdict.verdict_raw, verdict.reason,
        )
        if not verdict.allowed:
            logger.warning("[%s] Callback OUTPUT blocked — replacing.", self._run_id)
            if "output" in outputs:
                outputs["output"] = UNSAFE_OUTPUT_RESPONSE
            if "answer" in outputs:
                outputs["answer"] = UNSAFE_OUTPUT_RESPONSE
            return

        # PII mask on output
        masked_output, out_pii = self._pii.mask(output_text)
        self._output_pii_matches = out_pii
        if out_pii:
            logger.info(
                "[%s] Callback PII masked in output — %d entities", self._run_id, len(out_pii)
            )
            if "output" in outputs:
                outputs["output"] = masked_output
            if "answer" in outputs:
                outputs["answer"] = masked_output

    def on_llm_start(
        self,
        serialized: Dict[str, Any],
        prompts: List[str],
        *,
        run_id: UUID,
        **kwargs: Any,
    ) -> None:
        for i, prompt in enumerate(prompts):
            masked, matches = self._pii.mask(prompt)
            if matches:
                logger.info(
                    "[%s] Callback PII masked in LLM prompt[%d] — %d entities",
                    self._run_id, i, len(matches),
                )
                prompts[i] = masked

    def on_llm_end(self, response: LLMResult, *, run_id: UUID, **kwargs: Any) -> None:
        logger.debug("[%s] Callback: LLM generation complete.", self._run_id)

    def on_chain_error(
        self,
        error: Union[Exception, KeyboardInterrupt],
        *,
        run_id: UUID,
        **kwargs: Any,
    ) -> None:
        logger.error("[%s] Callback: Chain error — %s", self._run_id, error)

    @property
    def audit_summary(self) -> Dict[str, Any]:
        """Return guardrail activity for Langfuse trace metadata."""
        return {
            "input_pii_masked": len(self._input_pii_matches),
            "input_pii_types": list({m.pii_type for m in self._input_pii_matches}),
            "output_pii_masked": len(self._output_pii_matches),
            "output_pii_types": list({m.pii_type for m in self._output_pii_matches}),
            "domain_verdict_input": self._domain_verdict_input,
            "domain_verdict_output": self._domain_verdict_output,
        }


# ─── Convenience helper ───────────────────────────────────────────────────────


def apply_guardrails_to_chain(
    chain: Any,
    query: str,
    ollama_base_url: str = "http://localhost:11434",
    run_id: Optional[str] = None,
) -> tuple[Any, GuardrailCallbackHandler]:
    """
    Attach GuardrailCallbackHandler to a LangChain Runnable (AgentExecutor path).

    For the create_agent path, use build_pii_middleware_stack() instead.

    Returns (chain_with_callbacks, handler).
    """
    handler = GuardrailCallbackHandler(
        original_query=query,
        ollama_base_url=ollama_base_url,
        run_id=run_id,
    )
    return chain.with_config({"callbacks": [handler]}), handler
