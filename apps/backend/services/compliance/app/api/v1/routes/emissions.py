from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....schemas.emission import (
    BRSRReportResponse,
    EmissionReportCreate,
    EmissionReportResponse,
    EmissionSummaryResponse,
)
from ....services import ghg_service as ghg_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[EmissionReportResponse], summary="Submit an emission report entry")
def create_emission_report(
    req: EmissionReportCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[EmissionReportResponse]:
    require_organization_access(user, req.organization_id)
    report = ghg_svc.create_emission_report(req, str(user.id), db)
    return ApiResponse(data=report, message="Emission report submitted.")


@router.get("/summary", response_model=ApiResponse[EmissionSummaryResponse], summary="Aggregated scope totals")
def get_emission_summary(
    organization_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[EmissionSummaryResponse]:
    require_organization_access(user, organization_id)
    summary = ghg_svc.get_emission_summary(organization_id, period_start, period_end, db)
    return ApiResponse(data=summary)


@router.get("/brsr", response_model=ApiResponse[BRSRReportResponse], summary="Generate SEBI BRSR compliance report")
def generate_brsr(
    organization_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    revenue_crore: Optional[float] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[BRSRReportResponse]:
    require_organization_access(user, organization_id)
    report = ghg_svc.generate_brsr_report(organization_id, period_start, period_end, revenue_crore, db)
    return ApiResponse(data=report, message="BRSR report generated.")


@router.get("/factors", response_model=ApiResponse[list], summary="List active emission factors")
def list_factors(
    vintage_year: Optional[int] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    factors = ghg_svc.list_emission_factors(vintage_year, db)
    return ApiResponse(data=factors, message=f"{len(factors)} factors found.")
