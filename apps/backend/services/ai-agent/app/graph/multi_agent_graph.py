import logging
from typing import Literal, Dict, Any, List
from pydantic import BaseModel, Field

from langchain_core.language_models import BaseChatModel
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

from .state import MultiAgentState
from .tools import get_emission_factors, calculate_scope_emissions, calculate_carbon_credits

logger = logging.getLogger("ai-agent.graph.multi_agent")

# 1. Pydantic Structured Output Schema for the Router
class RouteDecision(BaseModel):
    """
    Pydantic schema for structured routing decision by the Supervisor.
    """
    next_agent: Literal["compliance", "marketplace", "FINISH"] = Field(
        ...,
        description="Select 'compliance' for GHG/emissions/BRSR queries, 'marketplace' for credit trading/minting, or 'FINISH' if the query is resolved."
    )
    reasoning: str = Field(
        ...,
        description="Brief reasoning for choosing this agent."
    )

# 2. Supervisor Node Generator
def create_supervisor_node(llm: BaseChatModel) -> Any:
    # Supervisor prompt template guiding coordination with loop prevention
    supervisor_prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are the Supervisor Agent (Head Chef) for IndiCarbon AI.\n"
            "Your job is to coordinate a team of specialized agents to answer the user's request.\n\n"
            "Specialized Workers:\n"
            "- 'compliance': Exclusive access to emission factors and scope calculations. Handles compliance queries, BRSR, and GHG accounting.\n"
            "- 'marketplace': Exclusive access to carbon credit estimations and trading queries. Handles credit ledger and auto-minting.\n\n"
            "CRITICAL RULES:\n"
            "1. If a worker ('compliance' or 'marketplace') has already executed and provided a response in the message history, do NOT route to any worker again. Route to 'FINISH' immediately.\n"
            "2. If the user request does not require specialized compliance or marketplace tools, route to 'FINISH' immediately.\n\n"
            "Analyze the conversation history. Decide the next worker to route to or choose 'FINISH' if the task is complete.\n"
            "Organization ID: {organization_id}. User ID: {user_id}."
        )),
        MessagesPlaceholder(variable_name="messages"),
    ])
    
    # Bind structured output to ensure reliable routing decisions
    structured_llm = llm.with_structured_output(RouteDecision)
    
    async def supervisor_node(state: MultiAgentState) -> Dict[str, Any]:
        # Fast path check for greetings to avoid routing LLM latency entirely
        messages = state["messages"]
        last_user_msg = ""
        for msg in reversed(messages):
            if isinstance(msg, HumanMessage):
                last_user_msg = msg.content.lower().strip()
                break
        
        if last_user_msg in ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"]:
            logger.info("Supervisor fast-path: Greeting detected, routing to FINISH.")
            return {
                "next_agent": "FINISH",
                "messages": [
                    SystemMessage(content="Supervisor Fast-Path: Greeting detected, routing to FINISH.")
                ]
            }

        # Check if a worker has already run to prevent infinite loops
        worker_has_run = False
        from langchain_core.messages import AIMessage
        for msg in messages:
            # ReAct worker outputs an AIMessage containing their response
            if isinstance(msg, AIMessage) and msg.content:
                worker_has_run = True
                break
        
        if worker_has_run:
            logger.info("Supervisor loop prevention: Worker has already executed, routing to FINISH.")
            return {
                "next_agent": "FINISH",
                "messages": [
                    SystemMessage(content="Supervisor Loop Prevention: Worker has already executed, routing to FINISH.")
                ]
            }

        prompt = supervisor_prompt.partial(
            organization_id=state.get("organization_id", "unknown"),
            user_id=state.get("user_id", "unknown")
        )
        chain = prompt | structured_llm
        
        try:
            decision: RouteDecision = await chain.ainvoke({"messages": state["messages"]})
            logger.info(f"Supervisor Decision: next_agent={decision.next_agent}, reason={decision.reasoning}")
            
            return {
                "next_agent": decision.next_agent,
                "messages": [
                    SystemMessage(content=f"[Supervisor] Routed to: {decision.next_agent}. Reason: {decision.reasoning}")
                ]
            }
        except Exception as e:
            logger.error(f"Supervisor node structured output failed: {e}", exc_info=True)
            # Safe fallback routing
            return {"next_agent": "FINISH"}

    return supervisor_node

# 3. Worker Node Factory
def make_worker_node(agent_name: str, llm: BaseChatModel, tools: list, system_prompt: str) -> Any:
    """
    Factory function to initialize a specialized worker node with scoped tools and system prompt.
    Automatically routes back to the supervisor upon task completion.
    """
    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=system_prompt
    )
    
    async def worker_node(state: MultiAgentState) -> Dict[str, Any]:
        logger.info(f"Executing worker node: {agent_name}")
        result = await agent.ainvoke({"messages": state["messages"]})
        
        # Capture worker's messages and reset next_agent to 'supervisor'
        return {
            "messages": result["messages"],
            "next_agent": "supervisor"
        }
        
    return worker_node

# 4. Responder Node Generator
def create_responder_node(llm: BaseChatModel) -> Any:
    """
    Ensures the graph returns a valid assistant response. If a worker already answered,
    it passes the message through. If no worker ran, it answers the query directly.
    """
    async def responder_node(state: MultiAgentState) -> Dict[str, Any]:
        messages = state["messages"]
        # Find the last message that is not a SystemMessage
        last_non_sys = None
        for msg in reversed(messages):
            if not isinstance(msg, SystemMessage):
                last_non_sys = msg
                break
                
        from langchain_core.messages import AIMessage
        if last_non_sys and isinstance(last_non_sys, AIMessage):
            logger.info("Responder: Worker response found. Passing through.")
            return {}
            
        logger.info("Responder: No worker response found. Generating direct answer.")
        # Filter out supervisor system logs to keep LLM context clean
        filtered_messages = [msg for msg in messages if not isinstance(msg, SystemMessage)]
        response = await llm.ainvoke(filtered_messages)
        return {
            "messages": [response]
        }
    return responder_node

# 5. Worker Configuration & System Prompts
COMPLIANCE_SYSTEM_PROMPT = """You are the Compliance Auditor Agent for IndiCarbon AI.
You specialize in calculating greenhouse gas (GHG) emissions and generating SEBI Business Responsibility and Sustainability Reporting (BRSR) compliance reports.
You have exclusive access to:
- `get_emission_factors`
- `calculate_scope_emissions`

Ensure your calculations are accurate and comply with the GHG Protocol. Do not attempt to buy, sell, or trade carbon credits. Focus strictly on compliance auditing.
"""

MARKETPLACE_SYSTEM_PROMPT = """You are the Carbon Credit Broker Agent for IndiCarbon AI.
You specialize in the carbon credit market, order books, credit ledgers, and carbon credit issuance/minting pipelines.
You have exclusive access to:
- `calculate_carbon_credits`
- (Order book and ledger tools will be provided in subsequent integrations)

Analyze Vintage, Registry, Project Type, and Ownership. Differentiate clearly between Gross Emissions, Net Emissions, Retired Credits, and Available Credits. Compute: Net Carbon Position = Gross Emissions - Retired Carbon Credits. Focus strictly on credit transactions and market portfolio impact. Do not calculate raw Scope 1, 2, or 3 emissions.
"""

# 6. Graph Compilation
def build_multi_agent_graph(llm: BaseChatModel, compliance_tools: list, marketplace_tools: list) -> Any:
    # Initialize state graph
    workflow = StateGraph(MultiAgentState)
    
    # Add Supervisor node
    workflow.add_node("supervisor", create_supervisor_node(llm))
    
    # Add Worker nodes
    workflow.add_node(
        "compliance_worker", 
        make_worker_node("compliance_worker", llm, compliance_tools, COMPLIANCE_SYSTEM_PROMPT)
    )
    
    workflow.add_node(
        "marketplace_worker", 
        make_worker_node("marketplace_worker", llm, marketplace_tools, MARKETPLACE_SYSTEM_PROMPT)
    )
    
    # Add Responder node
    workflow.add_node("responder", create_responder_node(llm))
    
    # Routing edges
    def route_next(state: MultiAgentState) -> str:
        return state["next_agent"]
    
    # Set entry point
    workflow.set_entry_point("supervisor")
    
    # Define supervisor routing
    workflow.add_conditional_edges(
        "supervisor",
        route_next,
        {
            "compliance": "compliance_worker",
            "marketplace": "marketplace_worker",
            "FINISH": "responder"
        }
    )
    
    # Workers always return to supervisor
    workflow.add_edge("compliance_worker", "supervisor")
    workflow.add_edge("marketplace_worker", "supervisor")
    
    # Responder is the final step
    workflow.add_edge("responder", END)
    
    # Compile graph with MemorySaver checkpointer for state persistence
    memory = MemorySaver()
    return workflow.compile(checkpointer=memory)
