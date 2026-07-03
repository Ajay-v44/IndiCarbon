"""
app/services/project_analysis_service.py
──────────────────────────────────────────
AI-powered document analysis service to extract carbon project metadata
directly from uploaded project design documents (PDD), audits, or spreadsheets.
Uses structured output parsing for reliability.
"""
from __future__ import annotations

import logging
from typing import Optional, List
from pydantic import BaseModel, Field

from ..config.settings import get_settings
from ..parsers.document_parser import parse_document

logger = logging.getLogger("ai-agent.services.project_analysis")


class ProjectExtractionResult(BaseModel):
    name: str = Field(..., description="A concise, descriptive name for the carbon offset project.")
    project_type: str = Field(..., description="The type of carbon project. Must be one of: Solar, Wind, Biomass, Afforestation, Energy Efficiency, Fuel Switching, Hydrogen, Waste Heat Recovery, Methane Capture, Other.")
    description: str = Field(..., description="A detailed summary of the project's activities and expected environmental impact.")
    registry: Optional[str] = Field(None, description="The carbon registry specified (e.g. VERRA, Gold Standard, BEE, CCTS, CDM).")
    project_lifetime_years: Optional[int] = Field(None, description="The lifetime of the project in years.")
    
    # Input metrics extracted
    energy_produced_mwh: Optional[float] = Field(None, description="Annual renewable energy produced in MWh, if mentioned.")
    fuel_switched_litre: Optional[float] = Field(None, description="Annual fossil fuel displaced in litres, if mentioned.")
    waste_diverted_tonnes: Optional[float] = Field(None, description="Annual waste diverted from landfill in tonnes, if mentioned.")
    trees_planted: Optional[int] = Field(None, description="Total trees planted, if mentioned.")
    area_hectares: Optional[float] = Field(None, description="Total project area in hectares, if mentioned.")
    
    # User estimates
    estimated_annual_reduction_tco2e: Optional[float] = Field(None, description="Expected annual greenhouse gas emission reductions in tonnes of CO2 equivalent.")
    estimated_credits: Optional[float] = Field(None, description="Expected total carbon credits generated over the project lifetime.")
    submitted_documents: List[str] = Field(default=[], description="List of document types detected as present or referenced (e.g., Project Design Document, Energy Audit Report, Monitoring Report).")


async def run_project_document_extraction(document_bytes: bytes, filename: str) -> ProjectExtractionResult:
    """
    Parse the project document and use LLM structured output to extract metadata.
    """
    # 1. Parse text from the document
    try:
        raw_text = parse_document(document_bytes, filename)
    except Exception as exc:
        logger.error("Failed to parse project document %s: %s", filename, exc)
        raise ValueError(f"Could not read document contents: {exc}")

    if not raw_text.strip():
        raise ValueError("The uploaded document appears to be empty or unreadable.")

    # Truncate text if extremely long to fit context windows
    truncated_text = raw_text[:50000]

    # 2. Initialize the LLM based on provider settings
    s = get_settings()
    llm = None
    if s.llm_provider == "openai":
        from langchain_openai import ChatOpenAI
        llm = ChatOpenAI(
            model=s.openai_chat_model,
            api_key=s.openai_api_key,
            base_url=s.openai_api_base or None,
            temperature=s.openai_temperature,
        )
    elif s.llm_provider == "google":
        from langchain_google_genai import ChatGoogleGenerativeAI
        llm = ChatGoogleGenerativeAI(
            model=s.gemini_chat_model,
            google_api_key=s.google_api_key,
            temperature=s.ollama_temperature,
        )
    else:
        from langchain_community.chat_models import ChatOllama
        llm = ChatOllama(
            base_url=s.ollama_base_url,
            model=s.ollama_llm_model,
            temperature=s.ollama_temperature,
        )

    # 3. Request structured output
    structured_llm = llm.with_structured_output(ProjectExtractionResult)
    
    system_prompt = (
        "You are an expert carbon audit assistant. Your job is to read the attached sustainability, "
        "engineering, or project design document (PDD) and extract project metadata for carbon credit eligibility. "
        "Be conservative and precise. Extract metrics ONLY if they are explicitly mentioned in the text. "
        "Map the project type strictly to one of: Solar, Wind, Biomass, Afforestation, Energy Efficiency, "
        "Fuel Switching, Hydrogen, Waste Heat Recovery, Methane Capture, Other. "
        "Look for registry names (like VERRA, Gold Standard, BEE, CDM). "
        "List any document types identified in the text under submitted_documents (e.g., 'Project Design Document', "
        "'Monitoring Report', 'Energy Audit Report')."
    )

    messages = [
        ("system", system_prompt),
        ("user", f"Analyze the following document contents and extract the carbon project metadata:\n\n{truncated_text}")
    ]

    try:
        # Try structured output first
        structured_llm = llm.with_structured_output(ProjectExtractionResult)
        result: ProjectExtractionResult = await structured_llm.ainvoke(messages)
        return result
    except Exception as exc:
        logger.warning("LLM structured output failed, falling back to manual JSON extraction prompt: %s", exc)
        
        # Fallback prompt asking explicitly for a raw JSON block
        json_prompt = (
            "You are an expert carbon audit assistant. Read the document text and extract the project details. "
            "Return ONLY a valid JSON object matching this schema:\n"
            "{\n"
            '  "name": "Concise name of the project",\n'
            '  "project_type": "One of: Solar, Wind, Biomass, Afforestation, Energy Efficiency, Fuel Switching, Hydrogen, Waste Heat Recovery, Methane Capture, Other",\n'
            '  "description": "Detailed description of the project and impact",\n'
            '  "registry": "VERRA, Gold Standard, BEE, CCTS, CDM or null",\n'
            '  "project_lifetime_years": integer_lifetime_or_null,\n'
            '  "energy_produced_mwh": annual_mwh_or_null,\n'
            '  "fuel_switched_litre": annual_litres_or_null,\n'
            '  "waste_diverted_tonnes": annual_tonnes_or_null,\n'
            '  "trees_planted": total_trees_or_null,\n'
            '  "area_hectares": total_hectares_or_null,\n'
            '  "estimated_annual_reduction_tco2e": annual_reduction_tco2e_or_null,\n'
            '  "estimated_credits": total_credits_or_null,\n'
            '  "submitted_documents": ["List", "of", "document", "types", "detected"]\n'
            "}\n\n"
            "Respond ONLY with the JSON object. Do not include any conversational introduction, markdown wraps, or explanation."
        )
        
        fallback_messages = [
            ("system", json_prompt),
            ("user", f"Analyze the following document contents and extract the carbon project metadata:\n\n{truncated_text}")
        ]
        
        try:
            resp = await llm.ainvoke(fallback_messages)
            content = resp.content if hasattr(resp, "content") else str(resp)
            
            import re
            import json
            
            cleaned = content.strip()
            # Strip optional markdown code fences
            cleaned = re.sub(r"^```(?:json)?", "", cleaned, flags=re.IGNORECASE).strip()
            cleaned = re.sub(r"```$", "", cleaned).strip()
            
            # Find the first '{' and last '}' to isolate the JSON object
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start == -1 or end == -1:
                raise ValueError("No JSON object block found in AI response.")
                
            json_str = cleaned[start : end + 1]
            data = json.loads(json_str)
            
            # Helper to convert to floats safely
            def to_float(val):
                if val is None:
                    return None
                try:
                    return float(val)
                except (ValueError, TypeError):
                    return None

            # Helper to convert to ints safely
            def to_int(val):
                if val is None:
                    return None
                try:
                    return int(val)
                except (ValueError, TypeError):
                    return None

            # Map values with safe fallbacks
            return ProjectExtractionResult(
                name=data.get("name") or "Unnamed Carbon Project",
                project_type=data.get("project_type") or "Other",
                description=data.get("description") or "AI extracted project.",
                registry=data.get("registry"),
                project_lifetime_years=to_int(data.get("project_lifetime_years")),
                energy_produced_mwh=to_float(data.get("energy_produced_mwh")),
                fuel_switched_litre=to_float(data.get("fuel_switched_litre")),
                waste_diverted_tonnes=to_float(data.get("waste_diverted_tonnes")),
                trees_planted=to_int(data.get("trees_planted")),
                area_hectares=to_float(data.get("area_hectares")),
                estimated_annual_reduction_tco2e=to_float(data.get("estimated_annual_reduction_tco2e")),
                estimated_credits=to_float(data.get("estimated_credits")),
                submitted_documents=data.get("submitted_documents") or [],
            )
        except Exception as fallback_exc:
            logger.error("LLM project extraction fallback failed: %s", fallback_exc)
            raise RuntimeError(f"AI failed to extract metadata from the document: {fallback_exc} (Original error: {exc})")
