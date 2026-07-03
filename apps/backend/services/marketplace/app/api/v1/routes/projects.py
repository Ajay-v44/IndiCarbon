from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends, Form, HTTPException, Query, UploadFile, File
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....models.project import CarbonProject
from ....models.credit import CarbonCredit
from ....config import settings as svc_settings

router = APIRouter()


# ─── Schemas ─────────────────────────────────────────────────────────────────

class SubmitProjectRequest(BaseModel):
    organization_id: str
    name: str = Field(..., min_length=3, max_length=255)
    project_type: str = Field(..., description="Solar|Wind|Biomass|Methane Capture|Afforestation|Carbon Capture|Fuel Switching|Energy Efficiency|Hydrogen|Waste Heat Recovery|Other")
    description: Optional[str] = None
    registry: Optional[str] = None
    # Input metrics for AI credit calculation
    energy_produced_mwh: Optional[float] = Field(None, ge=0, description="Annual renewable energy in MWh")
    fuel_switched_litre: Optional[float] = Field(None, ge=0, description="Annual fossil fuel displaced in litres")
    waste_diverted_tonnes: Optional[float] = Field(None, ge=0, description="Annual waste diverted from landfill in tonnes")
    trees_planted: Optional[int] = Field(None, ge=0, description="Total trees planted")
    area_hectares: Optional[float] = Field(None, ge=0, description="Project area in hectares")
    # User estimates (optional, AI will also compute)
    estimated_annual_reduction_tco2e: Optional[float] = Field(None, ge=0)
    estimated_credits: Optional[float] = Field(None, ge=0)
    project_lifetime_years: Optional[int] = Field(None, ge=1, le=100)
    submitted_documents: Optional[list[str]] = None


class UpdateProjectStatusRequest(BaseModel):
    status: str = Field(..., pattern="^(PENDING|UNDER_REVIEW|VERIFIED|REJECTED)$")
    reviewer_notes: Optional[str] = None
    admin_approved_credits: Optional[float] = Field(None, ge=0, description="Admin can override AI credit estimate")


def _project_to_dict(p: CarbonProject) -> dict:
    docs = []
    if p.submitted_documents:
        try:
            docs = json.loads(p.submitted_documents)
        except Exception:
            docs = p.submitted_documents.split(",") if p.submitted_documents else []
    return {
        "id": str(p.id),
        "organization_id": str(p.organization_id),
        "name": p.name,
        "project_type": p.project_type,
        "description": p.description,
        "registry": p.registry,
        "status": p.status,
        # Input metrics
        "energy_produced_mwh": p.energy_produced_mwh,
        "fuel_switched_litre": p.fuel_switched_litre,
        "waste_diverted_tonnes": p.waste_diverted_tonnes,
        "trees_planted": p.trees_planted,
        "area_hectares": p.area_hectares,
        # Estimates
        "estimated_annual_reduction_tco2e": p.estimated_annual_reduction_tco2e,
        "estimated_credits": p.estimated_credits,
        "project_lifetime_years": p.project_lifetime_years,
        # AI evaluation
        "ai_estimated_credits": p.ai_estimated_credits,
        "ai_annual_reduction_tco2e": p.ai_annual_reduction_tco2e,
        "ai_methodology": p.ai_methodology,
        "ai_confidence_score": p.ai_confidence_score,
        "ai_evaluation_notes": p.ai_evaluation_notes,
        "ai_evaluated_at": p.ai_evaluated_at.isoformat() if p.ai_evaluated_at else None,
        # Admin / issuance
        "admin_approved_credits": p.admin_approved_credits,
        "credits_issued": p.credits_issued,
        "reviewer_notes": p.reviewer_notes,
        "submitted_documents": docs,
        # Timestamps
        "submitted_at": p.submitted_at.isoformat() if p.submitted_at else None,
        "reviewed_at": p.reviewed_at.isoformat() if p.reviewed_at else None,
        "verified_at": p.verified_at.isoformat() if p.verified_at else None,
    }


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("", response_model=ApiResponse[dict], summary="Submit a carbon reduction project for verification")
def submit_project(
    req: SubmitProjectRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    require_organization_access(user, req.organization_id)

    project = CarbonProject(
        id=uuid.uuid4(),
        organization_id=uuid.UUID(req.organization_id),
        submitted_by_id=user.id,
        name=req.name,
        project_type=req.project_type,
        description=req.description,
        registry=req.registry,
        energy_produced_mwh=req.energy_produced_mwh,
        fuel_switched_litre=req.fuel_switched_litre,
        waste_diverted_tonnes=req.waste_diverted_tonnes,
        trees_planted=req.trees_planted,
        area_hectares=req.area_hectares,
        estimated_annual_reduction_tco2e=req.estimated_annual_reduction_tco2e,
        estimated_credits=req.estimated_credits,
        project_lifetime_years=req.project_lifetime_years,
        submitted_documents=json.dumps(req.submitted_documents or []),
        status="PENDING",
        submitted_at=datetime.now(timezone.utc),
    )
    db.add(project)

    # Auto-trigger AI credit calculation if input metrics are present
    if any([req.energy_produced_mwh, req.fuel_switched_litre,
            req.waste_diverted_tonnes, req.trees_planted, req.area_hectares]):
        try:
            _run_ai_credit_evaluation(project, db, commit=False)
        except Exception:
            pass  # Don't fail submission if AI evaluation errors

    db.commit()
    db.refresh(project)
    return ApiResponse(
        data=_project_to_dict(project),
        message="Project submitted. AI credit evaluation completed." if project.ai_estimated_credits else
                "Project submitted successfully. It is now pending IndiCarbon review.",
    )


@router.post("/{project_id}/evaluate", response_model=ApiResponse[dict], summary="Run AI credit evaluation on a project")
def evaluate_project_credits(
    project_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Re-runs the AI carbon credit calculator for the project.
    Uses input metrics (energy_produced_mwh, trees_planted etc.) to compute
    estimated credits using India-specific CDM emission factors.
    """
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID.")

    project = db.query(CarbonProject).filter(CarbonProject.id == pid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    require_organization_access(user, str(project.organization_id))

    _run_ai_credit_evaluation(project, db, commit=True)
    return ApiResponse(data=_project_to_dict(project), message="AI credit evaluation completed.")


def _run_ai_credit_evaluation(project: CarbonProject, db: Session, commit: bool = True):
    """Call AI agent's calculate_carbon_credits tool via direct import."""
    from ....services.credit_calculator import calculate_project_credits
    result = calculate_project_credits(
        project_type=project.project_type,
        energy_produced_mwh=project.energy_produced_mwh,
        fuel_switched_litre=project.fuel_switched_litre,
        waste_diverted_tonnes=project.waste_diverted_tonnes,
        trees_planted=project.trees_planted,
        area_hectares=project.area_hectares,
        project_lifetime_years=project.project_lifetime_years or 10,
    )
    project.ai_estimated_credits = result["estimated_credits"]
    project.ai_annual_reduction_tco2e = result["annual_reduction_tco2e"]
    project.ai_methodology = result["methodology"]
    project.ai_confidence_score = result["confidence_score"]
    project.ai_evaluation_notes = result["notes"]
    project.ai_evaluated_at = datetime.now(timezone.utc)
    if commit:
        db.commit()
        db.refresh(project)


@router.get("", response_model=ApiResponse[dict], summary="List carbon projects for an organization")
def list_projects(
    organization_id: str = Query(...),
    status: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    require_organization_access(user, organization_id)
    q = db.query(CarbonProject).filter(CarbonProject.organization_id == uuid.UUID(organization_id))
    if status:
        q = q.filter(CarbonProject.status == status.upper())
    total = q.count()
    projects = q.order_by(CarbonProject.submitted_at.desc()).offset(offset).limit(limit).all()
    return ApiResponse(
        data={
            "projects": [_project_to_dict(p) for p in projects],
            "total": total,
            "limit": limit,
            "offset": offset,
        },
        message=f"{len(projects)} projects found.",
    )


@router.get("/admin/all", response_model=ApiResponse[dict], summary="Admin: list all projects across all organizations")
def list_all_projects(
    status: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    if "SUPER_ADMIN" not in (user.roles or []) and "GOVT_AUDITOR" not in (user.roles or []):
        raise HTTPException(status_code=403, detail="Super Admin or Govt Auditor access required.")
    q = db.query(CarbonProject)
    if status:
        q = q.filter(CarbonProject.status == status.upper())
    total = q.count()
    projects = q.order_by(CarbonProject.submitted_at.desc()).offset(offset).limit(limit).all()
    return ApiResponse(
        data={
            "projects": [_project_to_dict(p) for p in projects],
            "total": total,
            "limit": limit,
            "offset": offset,
        },
        message=f"{len(projects)} projects found.",
    )


@router.get("/{project_id}", response_model=ApiResponse[dict], summary="Get a carbon project by ID")
def get_project(
    project_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID.")
    project = db.query(CarbonProject).filter(CarbonProject.id == pid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    require_organization_access(user, str(project.organization_id))
    return ApiResponse(data=_project_to_dict(project), message="Project fetched.")


@router.patch("/{project_id}/status", response_model=ApiResponse[dict], summary="Admin: update project status — auto-mints credits on VERIFIED")
def update_project_status(
    project_id: str,
    req: UpdateProjectStatusRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Update project verification status.
    When status is set to VERIFIED:
    - Uses admin_approved_credits (if set) or ai_estimated_credits or estimated_credits
    - Auto-mints that quantity of carbon credits to the organization's account
    - Credits are ISSUED status and immediately available for trading or applying to emissions
    """
    if "SUPER_ADMIN" not in (user.roles or []) and "GOVT_AUDITOR" not in (user.roles or []):
        raise HTTPException(status_code=403, detail="Super Admin or Govt Auditor access required.")
    try:
        pid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid project ID.")

    project = db.query(CarbonProject).filter(CarbonProject.id == pid).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")

    project.status = req.status
    project.reviewer_notes = req.reviewer_notes
    project.reviewed_by_id = user.id
    project.reviewed_at = datetime.now(timezone.utc)

    # Store admin credit override if provided
    if req.admin_approved_credits is not None:
        project.admin_approved_credits = req.admin_approved_credits

    credits_minted = 0
    if req.status == "VERIFIED":
        project.verified_at = datetime.now(timezone.utc)

        # Determine final credit quantity: admin override > AI estimate > user estimate
        credit_qty = int(
            project.admin_approved_credits
            or project.ai_estimated_credits
            or project.estimated_credits
            or 0
        )

        if credit_qty > 0:
            org_id = project.organization_id
            serial = f"CCT-{uuid.uuid4().hex[:16].upper()}-{str(org_id)[:8]}"
            credit = CarbonCredit(
                id=uuid.uuid4(),
                serial_number=serial,
                vintage_year=datetime.now(timezone.utc).year,
                project_type=project.project_type,
                initial_owner_id=org_id,
                current_owner_id=org_id,
                status="ISSUED",
                quantity=credit_qty,
                created_at=datetime.now(timezone.utc)
            )
            db.add(credit)
            db.flush()

            project.credits_issued = credit_qty
            credits_minted = credit_qty

    db.commit()
    db.refresh(project)

    msg = f"Project status updated to {req.status}."
    if credits_minted > 0:
        msg += f" {credits_minted} carbon credits minted to organization account."

    return ApiResponse(data={**_project_to_dict(project), "credits_minted": credits_minted}, message=msg)
