"""
app/graph/document_graph.py
────────────────────────────
Builds and compiles the IndiCarbon Document Analysis LangGraph.

Graph topology:
  START
    │
    ▼
  parse_document ──────────────────────────────────────────────┐
    │                                                           │
    ▼                                                           │
  extract_emissions ────────────────────────────────────────── │
    │                                                           │
    ▼                                                           │
  validate_items ──────────────────────────────────────────── │
    │                                                           │
    ▼                                                           │
  call_compliance   (← future: fan-out per scope via Send())   │
    │                                                           │
    ▼                                                           │
  summarise ───────────────────────────────────────────────────┘
    │
    ▼
  END

EXTENSIBILITY
─────────────
To add a second parallel API call (e.g. submit to Marketplace):
  1. Create a new node function in nodes.py.
  2. Add it as a parallel branch after validate_items using:
         graph.add_node("call_marketplace", call_marketplace_node)
         graph.add_edge("validate_items", "call_marketplace")
         graph.add_edge("validate_items", "call_compliance")
  3. Add a merge node that waits for both branches.
  This is the fan-out/fan-in pattern enabled by LangGraph's Send() API.
"""
from __future__ import annotations

import logging
from functools import lru_cache

from langgraph.graph import END, START, StateGraph

from .nodes import (
    call_compliance_node,
    extract_emissions_node,
    parse_document_node,
    summarise_node,
    validate_items_node,
)
from .state import AgentState

logger = logging.getLogger("ai-agent.graph")


def build_document_analysis_graph() -> StateGraph:
    """
    Construct and compile the document analysis LangGraph.

    Returns a compiled graph ready to be invoked with:
        result = await graph.ainvoke(initial_state, config=config)
    """
    # Create a new StateGraph using our AgentState TypedDict
    graph = StateGraph(AgentState)

    # ── Register Nodes ────────────────────────────────────────────────────────
    graph.add_node("parse_document", parse_document_node)
    graph.add_node("extract_emissions", extract_emissions_node)
    graph.add_node("validate_items", validate_items_node)
    graph.add_node("call_compliance", call_compliance_node)
    graph.add_node("summarise", summarise_node)

    # ── Define Edges (execution order) ────────────────────────────────────────
    graph.add_edge(START, "parse_document")
    graph.add_edge("parse_document", "extract_emissions")
    graph.add_edge("extract_emissions", "validate_items")
    graph.add_edge("validate_items", "call_compliance")
    graph.add_edge("call_compliance", "summarise")
    graph.add_edge("summarise", END)

    compiled = graph.compile()
    logger.info("Document analysis graph compiled successfully.")
    return compiled


@lru_cache(maxsize=1)
def get_document_analysis_graph():
    """
    Return the singleton compiled graph.
    The graph is compiled once at startup and reused across requests.
    Thread-safe because LangGraph compiled graphs are stateless.
    """
    return build_document_analysis_graph()
