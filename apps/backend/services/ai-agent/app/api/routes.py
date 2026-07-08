"""
app/api/routes.py
──────────────────
FastAPI route definitions for the AI-Agent service.

Endpoints:
  GET  /health                      → Liveness probe
  POST /api/v1/analyse-document     → Document analysis pipeline (LangGraph)
  GET  /api/v1/graph-schema         → Returns the graph structure (dev tool)
  POST /api/v1/prompts/push         → Push prompts to LangSmith Hub

All endpoints follow the IndiCarbon ApiResponse envelope pattern.
"""
from __future__ import annotations

import logging
import base64
import json
import asyncio
from typing import Optional
from contextlib import contextmanager
from starlette.websockets import WebSocketState

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, Request, UploadFile, status, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from shared_logic import AuthenticatedUser, get_current_user, get_db
from sarvamai import AsyncSarvamAI, AudioOutput, EventResponse
from ..config.settings import get_settings

from ..schemas.agent import AgentRegistryCreate, AgentRegistryResponse, AgentRegistryUpdate
from ..schemas.chat import ChatHistoryResponse, ChatRequest, ChatResponse
from ..schemas.agent_schemas import DocumentAnalysisResult
from ..services import agent_service as agent_svc
from ..services.chat_service import get_chat_history, run_chat
from ..services.document_analysis_service import run_document_analysis
from ..services.project_analysis_service import run_project_document_extraction

logger = logging.getLogger("ai-agent.api.routes")

router = APIRouter()

# ─── Health ───────────────────────────────────────────────────────────────────


@router.get(
    "/health",
    tags=["Observability"],
    summary="Liveness probe",
)
async def health() -> dict:
    """Returns service health status. Used by Docker health checks and load balancers."""
    return {"success": True, "data": {"service": "ai-agent", "status": "healthy"}}


# ─── Document Analysis ────────────────────────────────────────────────────────


@router.post(
    "/api/v1/analyse-document",
    response_model=dict,
    tags=["Document Analysis"],
    summary="Analyse a sustainability document and extract emission factors",
    description="""
Upload any sustainability/ESG document (PDF, DOCX, Excel, CSV, HTML, image).

The agent will use tools to:
1. Parse the document into plain text.
2. Find the fiscal year from the text.
3. Call emission factors API.
4. Call calculate emissions API.
    """,
)
@router.post(
    "/api/v1/ai/analyse-document",
    response_model=dict,
    include_in_schema=False,
)
async def analyse_document(
    file: UploadFile = File(..., description="Sustainability/ESG document to analyse"),
    revenue_crore: Optional[float] = Form(None, description="Revenue in crore INR for BRSR intensity"),
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    """
    Main document analysis endpoint.

    Accepts multipart/form-data with the file + metadata fields.
    Returns the full DocumentAnalysisResult.
    """
    from shared_logic import AuthenticatedUser, get_current_user
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No filename provided.")

    # Enforce file size limit: 50 MB
    file_bytes = await file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum allowed size is 50 MB.",
        )

    logger.info(
        "Document analysis request: user_id=%s file=%s size=%d bytes",
        user.id, file.filename, len(file_bytes)
    )

    try:
        result: DocumentAnalysisResult = await run_document_analysis(
            document_bytes=file_bytes,
            filename=file.filename,
            user=user,
            revenue_crore=revenue_crore,
        )

        return {
            "success": True,
            "message": "Document analysis complete.",
            "data": result.model_dump(mode="json"),
        }

    except ValueError as exc:
        # Unsupported file format
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except Exception as exc:
        logger.error("Document analysis endpoint error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis pipeline failed: {exc}",
        )


# ─── Responsible AI Chatbot ──────────────────────────────────────────────────


@router.post(
    "/api/v1/chat",
    response_model=dict,
    tags=["AI Chatbot"],
    summary="Ask the responsible organization-scoped IndiCarbon chatbot",
)
@router.post(
    "/api/v1/ai/chat",
    response_model=dict,
    include_in_schema=False,
)
async def chat(
    req: ChatRequest,
    background_tasks: BackgroundTasks,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """
    Token-authenticated RAG chatbot.

    The organization and user are resolved from the token/gateway headers. The
    request body intentionally does not accept organization_id, preventing users
    from switching org scope by payload.
    """
    try:
        result: ChatResponse = await run_chat(
            req=req,
            user=user,
            db=db,
            background_tasks=background_tasks,
        )
        return {
            "success": True,
            "message": "Chat response generated.",
            "data": result.model_dump(mode="json"),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Chat endpoint error: %s", exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chatbot failed: {exc}",
        )


@router.get(
    "/api/v1/chat/history",
    response_model=dict,
    tags=["AI Chatbot"],
    summary="List the authenticated user's persisted chat history",
)
@router.get(
    "/api/v1/ai/chat/history",
    response_model=dict,
    include_in_schema=False,
)
async def chat_history(
    limit: int = 50,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result: ChatHistoryResponse = get_chat_history(user=user, db=db, limit=min(limit, 100), offset=offset)
    return {
        "success": True,
        "message": "Chat history fetched.",
        "data": result.model_dump(mode="json"),
    }


# ─── Agent Registry CRUD ─────────────────────────────────────────────────────


@router.post(
    "/api/v1/agents/registry",
    response_model=dict,
    tags=["AI Agents"],
    summary="Create an agent registry record",
)
@router.post("/api/v1/ai/agents/registry", response_model=dict, include_in_schema=False)
async def create_agent_registry(
    req: AgentRegistryCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result: AgentRegistryResponse = agent_svc.create_agent_registry(req, db)
    return {"success": True, "message": "Agent registry record created.", "data": result.model_dump(mode="json")}


@router.get(
    "/api/v1/agents/registry",
    response_model=dict,
    tags=["AI Agents"],
    summary="List agent registry records",
)
@router.get("/api/v1/ai/agents/registry", response_model=dict, include_in_schema=False)
async def list_agent_registry(
    limit: int = 100,
    offset: int = 0,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.list_agent_registry(db, limit=min(limit, 200), offset=offset)
    return {
        "success": True,
        "message": "Agent registry records fetched.",
        "data": [item.model_dump(mode="json") for item in result],
    }


@router.get(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Get an agent registry record",
)
@router.get("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def get_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.get_agent_registry(agent_id, db)
    return {"success": True, "message": "Agent registry record fetched.", "data": result.model_dump(mode="json")}


@router.patch(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Update an agent registry record",
)
@router.patch("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def update_agent_registry(
    agent_id: str,
    req: AgentRegistryUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.update_agent_registry(agent_id, req, db)
    return {"success": True, "message": "Agent registry record updated.", "data": result.model_dump(mode="json")}


@router.delete(
    "/api/v1/agents/registry/{agent_id}",
    response_model=dict,
    tags=["AI Agents"],
    summary="Delete an agent registry record",
)
@router.delete("/api/v1/ai/agents/registry/{agent_id}", response_model=dict, include_in_schema=False)
async def delete_agent_registry(
    agent_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    result = agent_svc.delete_agent_registry(agent_id, db)
    return {"success": True, "message": "Agent registry record deleted.", "data": result}


# ─── Graph Schema (Dev Tool) ──────────────────────────────────────────────────


@router.get(
    "/api/v1/graph-schema",
    tags=["Developer"],
    summary="Return the LangGraph document analysis graph structure",
)
async def graph_schema() -> dict:
    """Returns the graph node/edge structure for documentation and debugging."""
    from ..graph.document_graph import get_document_analysis_graph
    graph = get_document_analysis_graph()
    return {
        "success": True,
        "data": {
            "nodes": list(graph.nodes.keys()) if hasattr(graph, "nodes") else [],
            "description": "document_analysis: parse → extract → validate → call_compliance → summarise",
        },
    }


# ─── Prompt Management ────────────────────────────────────────────────────────


@router.post(
    "/api/v1/prompts/push",
    tags=["Developer"],
    summary="Push prompts to LangSmith Hub",
)
async def push_prompts() -> dict:
    """
    Push all IndiCarbon prompt templates to LangSmith Hub for versioning.
    Idempotent — safe to call multiple times.
    """
    from ..prompts.emission_extraction import push_prompts_to_langsmith
    push_prompts_to_langsmith()
    return {"success": True, "message": "Prompts pushed to LangSmith Hub."}


# ─── Carbon Project Document Extraction ───────────────────────────────────────

@router.post(
    "/api/v1/ai/analyse-project",
    response_model=dict,
    tags=["Carbon Projects"],
    summary="Analyze a carbon reduction project document (PDF) and extract details",
)
async def analyse_project_document(
    file: UploadFile = File(..., description="Project document/PDD PDF to analyze"),
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict:
    """
    Parse the project document and extract project metadata such as name, type, metrics, registry, etc.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    file_bytes = await file.read()
    if len(file_bytes) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large. Maximum size is 25 MB.")

    try:
        extraction = await run_project_document_extraction(file_bytes, file.filename)
        return {
            "success": True,
            "data": extraction.model_dump(),
            "message": "AI successfully extracted project details from the document."
        }
    except Exception as exc:
        logger.error("Failed to analyze project document: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc))


def clean_text_for_tts(text: str) -> list[str]:
    import re
    # Remove markdown tables completely (or lines containing | )
    lines = text.split("\n")
    clean_lines = []
    for line in lines:
        if '|' in line:
            continue
        if re.match(r'^\s*[-*_]{3,}\s*$', line):
            continue
        clean_lines.append(line)
    
    text = "\n".join(clean_lines)

    # Remove markdown titles and headers
    text = re.sub(r'#+\s*', '', text)
    # Remove bold and italic formatting
    text = re.sub(r'\*+', '', text)
    text = re.sub(r'_+', '', text)
    # Remove list indicators
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)
    # Remove links [text](url) -> text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    
    # Split by newlines and sentence punctuation
    parts = re.split(r'\n+|(?<=[.?!])\s+', text)
    
    clean_parts = []
    for part in parts:
        part_clean = part.strip()
        # Remove any remaining raw punctuation-only lines (preserve all unicode alphanumeric characters)
        part_clean = re.sub(r'[^\w\s.,?!₹$/%+-]', '', part_clean)
        part_clean = part_clean.strip()
        if part_clean and len(re.sub(r'[^\w]', '', part_clean)) > 0:
            clean_parts.append(part_clean)
            
    return clean_parts




@router.websocket("/api/v1/ai/voice")
async def websocket_voice_endpoint(
    websocket: WebSocket,
    token: Optional[str] = None
):
    """
    WebSocket endpoint for real-time voice chat with the IndiCarbon agent.
    Streams microphone input from client to Sarvam STT,
    executes agentic tools via run_chat,
    and streams agent response audio from Sarvam TTS to client.
    """
    # 1. Accept WebSocket
    await websocket.accept()
    
    # 2. Authenticate
    if not token:
        token = websocket.query_params.get("token")
        
    user: Optional[AuthenticatedUser] = None
    try:
        from shared_logic.auth import AUTH_SERVICE_URL, AuthenticatedUser, _resolve_organization_id
        import httpx
        from uuid import UUID
        
        s = get_settings()
        
        # Check for dev tokens or bypass for local testing
        if token == "mock-dev-token" or (s.app_env == "development" and not token):
            # Fallback mock user if no token in development
            user = AuthenticatedUser(
                id=UUID("00000000-0000-0000-0000-000000000000"),
                email="dev@indicarbon.com",
                roles=["ADMIN"],
                organization_id=UUID("11111111-1111-1111-1111-111111111111")
            )
        else:
            async with httpx.AsyncClient() as client:
                resp = await client.post(
                    f"{AUTH_SERVICE_URL}/api/v1/auth/verify",
                    json={"token": token},
                )
                resp.raise_for_status()
                data = resp.json().get("data", {})
                if not data.get("valid") or not data.get("user_id"):
                    raise ValueError("Invalid token validation response.")
                user = AuthenticatedUser(
                    id=UUID(data.get("user_id")),
                    email=data.get("email"),
                    roles=data.get("roles", []),
                    organization_id=_resolve_organization_id(
                        data.get("organization_id"),
                        data.get("organization_ids"),
                    ),
                )
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        try:
            await websocket.send_json({"type": "error", "value": f"Authentication failed: {str(e)}"})
            await websocket.close()
        except Exception:
            pass
        return

    logger.info(f"WebSocket voice connection authenticated for user: {user.id}")
    try:
        await websocket.send_json({"type": "status", "value": "connected"})
    except Exception:
        return

    # Setup Sarvam AI client
    s = get_settings()
    sarvam_client = AsyncSarvamAI(api_subscription_key=s.sarvam_api_key)

    lang = websocket.query_params.get("lang") or "unknown"
    valid_langs = {
        "unknown", "en-IN", "hi-IN", "bn-IN", "ta-IN", "te-IN", "gu-IN", "kn-IN", 
        "ml-IN", "mr-IN", "pa-IN", "od-IN", "as-IN", "ur-IN", "ne-IN", "kok-IN", 
        "ks-IN", "sd-IN", "sa-IN", "sat-IN", "mni-IN", "brx-IN", "mai-IN", "doi-IN"
    }
    if lang not in valid_langs:
        lang = "unknown"

    try:
        # Loop for multiple turns in a single websocket session
        while True:
            # Send status: ready to listen
            await websocket.send_json({"type": "status", "value": "listening"})
            
            try:
                # Connect to Sarvam STT streaming
                async with sarvam_client.speech_to_text_streaming.connect(
                    model="saaras:v3",
                    mode="transcribe",
                    language_code=lang,
                    input_audio_codec="pcm_s16le",
                    high_vad_sensitivity="true",
                    vad_signals="true"
                ) as stt_ws:
                    
                    end_speech_event = asyncio.Event()
                    transcript_container = [""]
                    
                    async def read_client_microphone():
                        try:
                            while not end_speech_event.is_set():
                                msg = await websocket.receive()
                                if "bytes" in msg and msg["bytes"]:
                                    chunk = msg["bytes"]
                                    # Forward raw PCM bytes to Sarvam STT (expects base64 encoded string)
                                    chunk_base64 = base64.b64encode(chunk).decode("utf-8")
                                    await stt_ws.transcribe(
                                        audio=chunk_base64,
                                        encoding="audio/wav"
                                    )
                                elif "text" in msg and msg["text"]:
                                    try:
                                        data = json.loads(msg["text"])
                                        if data.get("type") == "stop":
                                            logger.info("Client requested stop listening.")
                                            end_speech_event.set()
                                            break
                                    except json.JSONDecodeError:
                                        pass
                        except WebSocketDisconnect:
                            logger.info("WebSocket client disconnected in read_client_microphone task.")
                            end_speech_event.set()
                        except Exception as exc:
                            logger.error(f"Error in read_client_microphone: {exc}")
                            end_speech_event.set()

                    async def read_stt_responses():
                        try:
                            async for message in stt_ws:
                                if message.type == "data":
                                    if message.data.transcript:
                                        transcript_container[0] = message.data.transcript
                                        # Send intermediate transcript to client
                                        await websocket.send_json({
                                            "type": "transcript",
                                            "value": transcript_container[0],
                                            "is_final": False
                                        })
                                elif message.type == "events":
                                    if message.data.signal_type == "END_SPEECH":
                                        logger.info("Sarvam VAD detected END_SPEECH.")
                                        end_speech_event.set()
                                        break
                        except Exception as exc:
                            logger.error(f"Error in read_stt_responses: {exc}")
                            end_speech_event.set()

                    # Start concurrent read and write tasks for STT
                    mic_task = asyncio.create_task(read_client_microphone())
                    stt_task = asyncio.create_task(read_stt_responses())
                    
                    # Wait until speech ends
                    await asyncio.wait([mic_task, stt_task], return_when=asyncio.FIRST_COMPLETED)
                    
                    # Cancel pending tasks
                    mic_task.cancel()
                    stt_task.cancel()
                    
                    # Flush the STT stream
                    await stt_ws.flush()
                    
                    # Get final transcript (it may arrive after flush)
                    try:
                        async with asyncio.timeout(0.5):
                            async for message in stt_ws:
                                if message.type == "data" and message.data.transcript:
                                    transcript_container[0] = message.data.transcript
                    except Exception:
                        pass
            except Exception as exc:
                logger.error(f"Failed to connect to Sarvam STT streaming: {exc}")
                await websocket.send_json({"type": "error", "value": "Speech service is temporarily unavailable. Retrying..."})
                await asyncio.sleep(2.0)
                continue

            final_transcript = transcript_container[0].strip()
            if not final_transcript:
                logger.info("No speech detected.")
                await websocket.send_json({"type": "status", "value": "no_speech"})
                await asyncio.sleep(0.5)
                continue

            logger.info(f"Final STT Transcript: {final_transcript}")
            
            # Send final transcript to client
            await websocket.send_json({
                "type": "transcript",
                "value": final_transcript,
                "is_final": True
            })

            # Check for exit commands
            if final_transcript.lower() in ("exit", "quit", "stop", "goodbye"):
                await websocket.send_json({"type": "status", "value": "exiting"})
                break

            # ─── Fast-Path Voice Orchestration (Front-Desk) ───
            # Immediately acknowledge the user request verbally to prevent latency dead-air.
            ack_text = "Got it. Let me look into that for you..."
            lower_transcript = final_transcript.lower()
            if any(w in lower_transcript for w in ["calculate", "emission", "footprint", "scope", "ghg", "brsr"]):
                ack_text = "Checking our carbon accounting registry and calculating emissions now."
            elif any(w in lower_transcript for w in ["credit", "buy", "sell", "trade", "mint", "marketplace"]):
                ack_text = "Accessing the carbon credit ledger and checking order books."

            # Immediately switch to speaking state for acknowledgment
            await websocket.send_json({"type": "status", "value": "speaking"})
            
            # Create interrupt event
            interrupt_event = asyncio.Event()
            
            # Listener for client interrupts during the entire transaction
            async def listen_for_interrupt(running_tasks: list[asyncio.Task]):
                try:
                    while not interrupt_event.is_set():
                        msg = await websocket.receive()
                        if "text" in msg and msg["text"]:
                            try:
                                data = json.loads(msg["text"])
                                if data.get("type") == "interrupt":
                                    logger.info("User requested interrupt during agent loop!")
                                    interrupt_event.set()
                                    for t in running_tasks:
                                        if not t.done():
                                            t.cancel()
                                    break
                            except json.JSONDecodeError:
                                pass
                except Exception as exc:
                    logger.debug(f"Interrupt listener error: {exc}")

            # List to track all active tasks for the current turn
            active_tasks = []
            
            # Start interrupt listener
            interrupt_listener = asyncio.create_task(listen_for_interrupt(active_tasks))

            # Task 1: Play the fast-path acknowledgement
            async def play_acknowledgement():
                try:
                    async with sarvam_client.text_to_speech_streaming.connect(
                        model="bulbul:v3",
                        send_completion_event="true"
                    ) as tts_ws:
                        await tts_ws.configure(
                            target_language_code="en-IN",
                            speaker="ritu",
                            output_audio_codec="linear16",
                            speech_sample_rate=24000
                        )
                        await tts_ws.convert(ack_text)
                        await tts_ws.flush()
                        
                        async for message in tts_ws:
                            if interrupt_event.is_set():
                                break
                            if isinstance(message, AudioOutput):
                                await websocket.send_json({
                                    "type": "audio",
                                    "value": message.data.audio
                                })
                            elif isinstance(message, EventResponse) and message.data.event_type == "final":
                                break
                except Exception as e:
                    logger.error(f"Fast-path TTS acknowledgement failed: {e}")

            ack_task = asyncio.create_task(play_acknowledgement())
            active_tasks.append(ack_task)
            
            # Wait for acknowledgment to complete or be interrupted
            await asyncio.wait([ack_task], return_when=asyncio.FIRST_COMPLETED)
            
            if interrupt_event.is_set():
                logger.info("Transaction interrupted during acknowledgement.")
                interrupt_listener.cancel()
                await websocket.send_json({"type": "status", "value": "listening"})
                continue
                
            # Once acknowledgment finishes, switch to thinking state
            await websocket.send_json({"type": "status", "value": "thinking"})
            
            # Task 2: Execute Multi-Agent Graph in background
            async def execute_multi_agent_pipeline():
                from ..graph.multi_agent_graph import build_multi_agent_graph
                from ..services.chat_service import _get_chat_llm
                from ..config.observability import build_langfuse_handler
                from ..graph.chat_tools import build_chat_tools
                from langchain_core.messages import HumanMessage
                import uuid
                
                db_context = contextmanager(get_db)
                with db_context() as db_session:
                    llm = _get_chat_llm()
                    
                    # Build dynamic context-aware tools
                    chat_tools_list = build_chat_tools(db_session, str(user.organization_id), user)
                    chat_tools_map = {t.name: t for t in chat_tools_list}
                    
                    compliance_tools = [
                        get_emission_factors,
                        calculate_scope_emissions,
                        chat_tools_map["get_compliance_reports"],
                        chat_tools_map["get_organization_details"]
                    ]
                    
                    marketplace_tools = [
                        calculate_carbon_credits,
                        chat_tools_map["get_wallet_balance"],
                        chat_tools_map["get_wallet_transactions"],
                        chat_tools_map["get_carbon_market_book"],
                        chat_tools_map["place_carbon_order"],
                        chat_tools_map["submit_carbon_proposal"],
                        chat_tools_map["list_carbon_proposals"],
                        chat_tools_map["respond_carbon_proposal"]
                    ]
                    
                    graph = build_multi_agent_graph(llm, compliance_tools, marketplace_tools)
                    
                    # Setup Langfuse handler for complete traceability
                    run_uuid = uuid.uuid4()
                    langfuse_handler = build_langfuse_handler(str(run_uuid), "multi_agent_voice", str(user.organization_id))
                    
                    initial_state = {
                        "messages": [HumanMessage(content=final_transcript)],
                        "organization_id": str(user.organization_id),
                        "user_id": str(user.id),
                        "extracted_metrics": {},
                        "next_agent": "supervisor"
                    }
                    
                    # Execute multi-agent graph with complete trace passing
                    final_state = await graph.ainvoke(
                        initial_state,
                        config={
                            "configurable": {"thread_id": str(user.id)},
                            "callbacks": [langfuse_handler],
                            "recursion_limit": 6,
                            "metadata": {
                                "langfuse_session_id": f"voice-{user.id}",
                                "langfuse_user_id": str(user.id),
                            }
                        }
                    )
                    
                    # Get the final response from state
                    last_msg = final_state["messages"][-1]
                    return last_msg.content

            graph_task = asyncio.create_task(execute_multi_agent_pipeline())
            active_tasks.append(graph_task)
            
            # Wait for graph execution to complete
            await asyncio.wait([graph_task], return_when=asyncio.FIRST_COMPLETED)
            
            if interrupt_event.is_set():
                logger.info("Transaction interrupted during graph thinking.")
                interrupt_listener.cancel()
                await websocket.send_json({"type": "status", "value": "listening"})
                continue
                
            try:
                agent_answer = graph_task.result()
                logger.info(f"Agent response: {agent_answer}")
            except Exception as e:
                logger.error(f"Multi-agent execution failed: {e}")
                await websocket.send_json({"type": "error", "value": f"Agent error: {str(e)}"})
                interrupt_listener.cancel()
                continue
                
            # Send the text response
            await websocket.send_json({
                "type": "response",
                "value": agent_answer
            })
            
            # Task 3: Stream the final response audio
            await websocket.send_json({"type": "status", "value": "speaking"})
            sentences = clean_text_for_tts(agent_answer)
            
            if sentences:
                # Detect language dynamically to choose correct TTS configuration
                target_lang = "en-IN"
                SUPPORTED_TTS_LANGUAGES = {"en-IN", "hi-IN", "bn-IN", "ta-IN", "te-IN", "gu-IN", "kn-IN", "ml-IN", "mr-IN", "pa-IN", "od-IN"}
                try:
                    lid_resp = await sarvam_client.text.identify_language(input=agent_answer)
                    if lid_resp.language_code and lid_resp.language_code in SUPPORTED_TTS_LANGUAGES:
                        target_lang = lid_resp.language_code
                        logger.info(f"Dynamically identified response language for TTS: {target_lang}")
                except Exception as e:
                    logger.warning(f"Failed to identify language for TTS, falling back to en-IN: {e}")

                async def play_response_tts():
                    try:
                        async with sarvam_client.text_to_speech_streaming.connect(
                            model="bulbul:v3",
                            send_completion_event="true"
                        ) as res_tts_ws:
                            await res_tts_ws.configure(
                                target_language_code=target_lang,
                                speaker="ritu",
                                output_audio_codec="linear16",
                                speech_sample_rate=24000,
                                min_buffer_size=30,
                                max_chunk_length=150
                            )
                            for sentence in sentences:
                                if interrupt_event.is_set():
                                    break
                                await res_tts_ws.convert(sentence)
                                await asyncio.sleep(0.01)
                            
                            if not interrupt_event.is_set():
                                await res_tts_ws.flush()
                                
                            async for msg in res_tts_ws:
                                if interrupt_event.is_set():
                                    break
                                if isinstance(msg, AudioOutput):
                                    await websocket.send_json({
                                        "type": "audio",
                                        "value": msg.data.audio
                                    })
                                elif isinstance(msg, EventResponse) and msg.data.event_type == "final":
                                    break
                    except Exception as exc:
                        logger.warning(f"Sarvam TTS stream closed/encountered exception: {exc}")

                tts_playback_task = asyncio.create_task(play_response_tts())
                active_tasks.append(tts_playback_task)
                
                await asyncio.wait([tts_playback_task], return_when=asyncio.FIRST_COMPLETED)
                
            # Clean up the interrupt listener
            interrupt_listener.cancel()
            
            if interrupt_event.is_set():
                logger.info("Speaking cancelled due to user interrupt.")
                await websocket.send_json({"type": "status", "value": "listening"})
                continue
                
            # Send playback complete signal to client and wait a tiny bit
            await websocket.send_json({"type": "playback_complete"})
            await asyncio.sleep(1.0)

    except (WebSocketDisconnect, RuntimeError) as e:
        # Starlette raises RuntimeError when writing to a closed socket
        if isinstance(e, RuntimeError) and "close message has been sent" not in str(e):
            logger.error(f"Error in WebSocket voice endpoint: {e}", exc_info=True)
        else:
            logger.info(f"WebSocket connection closed for user {user.id if user else 'unknown'}")
    except Exception as e:
        logger.error(f"Error in WebSocket voice endpoint: {e}", exc_info=True)
        try:
            if websocket.client_state != WebSocketState.DISCONNECTED:
                await websocket.send_json({"type": "error", "value": f"Server error: {str(e)}"})
        except Exception:
            pass

