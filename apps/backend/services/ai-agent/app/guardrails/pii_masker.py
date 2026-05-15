"""
app/guardrails/pii_masker.py
─────────────────────────────
PII Detection, Masking, and SHA-256 Hashing for IndiCarbon AI.

Strategy:
  - Regex-based fast detection for well-structured PII (email, phone, PAN, Aadhaar, credit card).
  - spaCy NER (if available) for unstructured PERSON / ORG names.
  - Detected PII is replaced with a bracketed label and its SHA-256 hash token:
        john@example.com  →  [EMAIL:a1b2c3d4]
  - A PII manifest is returned so callers can audit what was masked.

Why hashing instead of full redaction?
  - The hash is deterministic — the same PII maps to the same token across a session,
    which preserves pronoun consistency in multi-turn conversations.
  - The raw value is NEVER stored; only the hex digest is logged.
"""
from __future__ import annotations

import hashlib
import logging
import re
from dataclasses import dataclass, field
from typing import List, Optional, Tuple

logger = logging.getLogger("ai-agent.guardrails.pii")

# ─── Regex Patterns ───────────────────────────────────────────────────────────

_PATTERNS: List[Tuple[str, re.Pattern[str]]] = [
    # Email
    ("EMAIL", re.compile(
        r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b"
    )),
    # Indian PAN (ABCDE1234F)
    ("PAN", re.compile(
        r"\b[A-Z]{5}[0-9]{4}[A-Z]\b"
    )),
    # Indian Aadhaar (12 digits, optionally space/dash separated)
    ("AADHAAR", re.compile(
        r"\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b"
    )),
    # Credit / Debit card (13–19 digits, optionally space/dash separated)
    ("CREDIT_CARD", re.compile(
        r"\b(?:\d[ \-]?){13,19}\b"
    )),
    # Indian mobile (starts with 6–9, 10 digits)
    ("PHONE_IN", re.compile(
        r"\b(?:\+91[\s\-]?)?[6-9]\d{9}\b"
    )),
    # Generic international phone
    ("PHONE", re.compile(
        r"\b(?:\+\d{1,3}[\s\-]?)?\(?\d{2,4}\)?[\s.\-]?\d{3,4}[\s.\-]?\d{4}\b"
    )),
    # IPv4
    ("IP_ADDRESS", re.compile(
        r"\b(?:\d{1,3}\.){3}\d{1,3}\b"
    )),
    # SSN / US social (for multinational documents)
    ("SSN", re.compile(
        r"\b\d{3}-\d{2}-\d{4}\b"
    )),
    # GSTIN (15-char alphanumeric Indian GST)
    ("GSTIN", re.compile(
        r"\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b"
    )),
]


# ─── Data Model ───────────────────────────────────────────────────────────────


@dataclass
class PIIMatch:
    """Represents a single detected PII entity."""
    pii_type: str
    original: str
    hash_token: str   # First 8 hex chars of SHA-256
    start: int
    end: int


# ─── PIIMasker ────────────────────────────────────────────────────────────────


class PIIMasker:
    """
    Detects and masks PII in text.

    Usage::

        masker = PIIMasker()
        masked_text, matches = masker.mask("Email me at ceo@acme.com")
        # masked_text → "Email me at [EMAIL:a1b2c3d4]"
        # matches     → [PIIMatch(pii_type='EMAIL', ...)]
    """

    def __init__(self, use_spacy: bool = True) -> None:
        self._nlp = None
        if use_spacy:
            try:
                import spacy  # type: ignore
                self._nlp = spacy.load("en_core_web_sm")
                logger.info("spaCy NER loaded for PII masking.")
            except (ImportError, OSError) as exc:
                logger.warning(
                    "spaCy NER unavailable (%s) — falling back to regex-only PII masking.", exc
                )

    # ── Public API ────────────────────────────────────────────────────────────

    def mask(self, text: str) -> Tuple[str, List[PIIMatch]]:
        """
        Return (masked_text, list_of_matches).
        Replaces each PII occurrence with [TYPE:hash_token].
        """
        matches: List[PIIMatch] = []

        # Step 1: regex-based detection
        regex_matches = self._detect_regex(text)
        matches.extend(regex_matches)

        # Step 2: spaCy NER for PERSON / ORG names
        if self._nlp:
            ner_matches = self._detect_ner(text)
            matches.extend(ner_matches)

        # Step 3: deduplicate overlapping matches (keep longest)
        matches = self._deduplicate(matches)

        # Step 4: apply substitutions right-to-left so offsets stay valid
        masked = text
        for m in sorted(matches, key=lambda x: x.start, reverse=True):
            replacement = f"[{m.pii_type}:{m.hash_token}]"
            masked = masked[: m.start] + replacement + masked[m.end :]

        if matches:
            logger.info(
                "PIIMasker: masked %d PII entities (%s)",
                len(matches),
                [m.pii_type for m in matches],
            )

        return masked, matches

    def mask_dict(self, data: dict) -> Tuple[dict, List[PIIMatch]]:
        """Recursively mask PII in all string values of a dict."""
        all_matches: List[PIIMatch] = []
        result = {}
        for k, v in data.items():
            if isinstance(v, str):
                masked_v, m = self.mask(v)
                result[k] = masked_v
                all_matches.extend(m)
            elif isinstance(v, dict):
                result[k], m = self.mask_dict(v)
                all_matches.extend(m)
            else:
                result[k] = v
        return result, all_matches

    # ── Internal helpers ──────────────────────────────────────────────────────

    @staticmethod
    def _hash(value: str) -> str:
        """Return first 8 hex chars of SHA-256(value)."""
        return hashlib.sha256(value.encode("utf-8")).hexdigest()[:8]

    def _detect_regex(self, text: str) -> List[PIIMatch]:
        matches: List[PIIMatch] = []
        for pii_type, pattern in _PATTERNS:
            for m in pattern.finditer(text):
                raw = m.group()
                matches.append(PIIMatch(
                    pii_type=pii_type,
                    original=raw,
                    hash_token=self._hash(raw),
                    start=m.start(),
                    end=m.end(),
                ))
        return matches

    def _detect_ner(self, text: str) -> List[PIIMatch]:
        """Use spaCy to detect PERSON and ORG entities."""
        matches: List[PIIMatch] = []
        doc = self._nlp(text[:100_000])  # guard against huge docs
        for ent in doc.ents:
            if ent.label_ in {"PERSON", "ORG"}:
                matches.append(PIIMatch(
                    pii_type=ent.label_,
                    original=ent.text,
                    hash_token=self._hash(ent.text),
                    start=ent.start_char,
                    end=ent.end_char,
                ))
        return matches

    @staticmethod
    def _deduplicate(matches: List[PIIMatch]) -> List[PIIMatch]:
        """Remove overlapping matches; keep the one with the largest span."""
        if not matches:
            return matches
        sorted_m = sorted(matches, key=lambda x: (x.start, -(x.end - x.start)))
        deduped: List[PIIMatch] = []
        last_end = -1
        for m in sorted_m:
            if m.start >= last_end:
                deduped.append(m)
                last_end = m.end
        return deduped
