"""
app/prompts/emission_extraction.py
────────────────────────────────────
Centralised Prompt Management for IndiCarbon AI.

This module provides the PromptManager which pulls versioned prompts from the
LangSmith Prompt Hub. Local hardcoded prompts are disabled to ensure
single-source-of-truth in the Hub.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Dict

from langsmith import Client
from langchain_core.prompts import ChatPromptTemplate

logger = logging.getLogger("ai-agent.prompts")

class PromptManager:
    """
    Manages fetching and caching of prompts from LangSmith Hub.
    """
    def __init__(self):
        self.client = Client()
        # Internal cache to avoid redundant network calls within a single process lifecycle
        self._cache: Dict[str, Any] = {}

    def pull(self, name: str) -> Any:
        """
        Pull a prompt from LangSmith Hub by name.
        Uses local cache if already fetched.
        """
        if name in self._cache:
            return self._cache[name]

        try:
            logger.info("Pulling prompt from LangSmith Hub: %s", name)
            # Pulling with include_model=False as we handle models in our factory
            prompt = self.client.pull_prompt(name)
            self._cache[name] = prompt
            return prompt
        except Exception as exc:
            logger.error("Failed to pull prompt '%s' from LangSmith: %s", name, exc)
            raise RuntimeError(f"Critical Prompt Missing: {name}. Ensure it exists in LangSmith Hub.") from exc

# Singleton instance
prompts = PromptManager()

# Prompt Names (Constants for type safety)
EMISSION_EXTRACTION_NAME = "indicarbon-emission-extraction-v1"
VALIDATION_SUMMARY_NAME = "indicarbon-emission-validation-summary-v1"
AUDITOR_AGENT_NAME = "indicarbon-auditor-agent-v1"
STRATEGIST_AGENT_NAME = "indicarbon-strategist-agent-v1"

def get_extraction_prompt():
    return prompts.pull(EMISSION_EXTRACTION_NAME)

def get_validation_summary_prompt():
    return prompts.pull(VALIDATION_SUMMARY_NAME)

def get_auditor_prompt():
    return prompts.pull(AUDITOR_AGENT_NAME)

def get_strategist_prompt():
    return prompts.pull(STRATEGIST_AGENT_NAME)
