"""
app/guardrails/__init__.py
──────────────────────────
IndiCarbon AI-Agent — Guardrail Stack

Exports:
    PIIMasker               — PII detection, masking, and SHA-256 hashing (regex + spaCy)
    PIIMatch                — Single PII entity match dataclass
    PDFInjectionGuard       — Blocks prompt-injection patterns embedded in PDFs
    InjectionDetectedException — Raised when a PDF is blocked
    IndiCarbonDomainGuard   — llama3.1:8b sub-agent enforces on-topic constraint
    OffTopicException        — Raised when a query is off-topic
    build_pii_middleware_stack — Returns list[PIIMiddleware] for use with create_agent
    GuardrailCallbackHandler — BaseCallbackHandler for legacy AgentExecutor path
    apply_guardrails_to_chain — Convenience wrapper attaching callbacks to a chain
"""
from .pii_masker import PIIMasker, PIIMatch
from .pdf_injection_guard import PDFInjectionGuard, InjectionDetectedException
from .domain_guard import IndiCarbonDomainGuard, OffTopicException
from .middleware import (
    GuardrailCallbackHandler,
    apply_guardrails_to_chain,
    build_pii_middleware_stack,
)

__all__ = [
    "PIIMasker",
    "PIIMatch",
    "PDFInjectionGuard",
    "InjectionDetectedException",
    "IndiCarbonDomainGuard",
    "OffTopicException",
    "build_pii_middleware_stack",
    "GuardrailCallbackHandler",
    "apply_guardrails_to_chain",
]
