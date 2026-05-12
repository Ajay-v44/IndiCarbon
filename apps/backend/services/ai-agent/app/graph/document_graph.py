from __future__ import annotations

import logging
from functools import lru_cache

from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from langgraph.store.memory import InMemoryStore
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage

from .state import AuditorState
from .tools import get_emission_factors, calculate_scope_emissions
from ..config.settings import get_settings

logger = logging.getLogger("ai-agent.graph")

def build_document_analysis_graph():
    """
    Construct and compile the document analysis LangGraph agent with the 3-Tier Memory Architecture:
    1. Working Memory: AuditorState (state_schema)
    2. Episodic Memory: MemorySaver (checkpointer)
    3. Semantic Memory: InMemoryStore / Postgres (store)
    """
    s = get_settings()
    llm = ChatOllama(
        base_url=s.ollama_base_url,
        model=s.ollama_llm_model,
        temperature=s.ollama_temperature,
    )
    
    tools = [get_emission_factors, calculate_scope_emissions]
    
    sys_prompt = SystemMessage(content=(
        "You are an industry standard document analysis agent. "
        "You will be given the text of a sustainability document along with the organization_id, user_id, revenue_crore, and document_id. "
        "Your task is to: "
        "1. Extract the reporting year from the document text. "
        "2. Call get_emission_factors to get the available emission factors for that year. "
        "3. Identify all quantified emission activities in the document text. "
        "4. Map each extracted emission to the correct factor_key from the available emission factors. "
        "5. Prepare the data and call calculate_scope_emissions with the payload. "
        "6. Return a summary of the extracted items and the compliance result."
    ))
    
    episodic_memory = MemorySaver()
    semantic_memory = InMemoryStore() # Can be replaced with PostgresStore for vector_store (Postgres)
    
    compiled = create_react_agent(
        llm, 
        tools, 
        prompt=sys_prompt, 
        state_schema=AuditorState, 
        checkpointer=episodic_memory,
        store=semantic_memory
    )
    logger.info("Document analysis graph compiled successfully with 3-Tier Memory.")
    return compiled

@lru_cache(maxsize=1)
def get_document_analysis_graph():
    return build_document_analysis_graph()
