from __future__ import annotations

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import get_requesting_user
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
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[EmissionReportResponse]:
    report = ghg_svc.create_emission_report(req, user_id, db)
    return ApiResponse(data=report, message="Emission report submitted.")


@router.get("/summary", response_model=ApiResponse[EmissionSummaryResponse], summary="Aggregated scope totals")
def get_emission_summary(
    organization_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[EmissionSummaryResponse]:
    summary = ghg_svc.get_emission_summary(organization_id, period_start, period_end, db)
    return ApiResponse(data=summary)


@router.get("/brsr", response_model=ApiResponse[BRSRReportResponse], summary="Generate SEBI BRSR compliance report")
def generate_brsr(
    organization_id: str = Query(...),
    period_start: date = Query(...),
    period_end: date = Query(...),
    revenue_crore: Optional[float] = Query(None),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[BRSRReportResponse]:
    report = ghg_svc.generate_brsr_report(organization_id, period_start, period_end, revenue_crore, db)
    return ApiResponse(data=report, message="BRSR report generated.")


@router.get("/factors", response_model=ApiResponse[list], summary="List active emission factors")
def list_factors(
    vintage_year: Optional[int] = Query(None),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    factors = ghg_svc.list_emission_factors(vintage_year, db)
    return ApiResponse(data=factors, message=f"{len(factors)} factors found.")
