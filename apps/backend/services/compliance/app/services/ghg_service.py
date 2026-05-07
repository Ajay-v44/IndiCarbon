from datetime import timezone
from datetime import datetime
from ..models.emission import MonthlyEmissionsSummary
from ..models.emission import SectorBenchmarks
from ..registry.auth_registry import get_org_by_id
from typing import List

import logging
import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from ..models.emission import EmissionReport
from ..repositories.emission_repo import EmissionFactorRepository, EmissionReportRepository
from ..schemas.emission import (
    BRSRReportResponse,
    EmissionReportCreate,
    EmissionReportResponse,
    EmissionSummaryResponse,
    GHGScope,
)
from shared_logic.schemas.compilance_schema import CalculateScopeEmissionsRequest
from shared_logic.auth import AuthenticatedUser
logger = logging.getLogger(__name__)

_DEFAULT_FACTORS: dict[str, Decimal] = {
    "stationary_combustion": Decimal("2.68"),
    "mobile_combustion": Decimal("2.31"),
    "electricity": Decimal("0.82"),
    "business_travel": Decimal("0.255"),
    "supply_chain": Decimal("1.0"),
    "waste": Decimal("0.58"),
}


# ─── GHG — Pure Functions ────────────────────────────────────────────────────


def create_emission_report(
    req: EmissionReportCreate, user_id: str, db: Session
) -> EmissionReportResponse:
    """
    Calculate tCO2e = (raw_quantity × emission_factor) / 1000
    and persist as an emission_report row.
    """
    factor_repo = EmissionFactorRepository(db)
    factor_record = None
    factor_value: Decimal

    if req.factor_key:
        vintage = req.reporting_period_end.year
        factor_record = factor_repo.find_active(req.factor_key, vintage) or factor_repo.find_active(
            req.factor_key, vintage - 1
        )
        factor_value = Decimal(str(factor_record.factor_value)) if factor_record else _DEFAULT_FACTORS.get(
            req.factor_key, Decimal("1.0")
        )
    else:
        factor_value = Decimal("1.0")

    calculated_tco2e = (req.raw_quantity * factor_value / Decimal("1000")).quantize(Decimal("0.000001"))

    report_repo = EmissionReportRepository(db)
    report = report_repo.create(
        id=uuid.uuid4(),
        organization_id=req.organization_id,
        reporting_period_start=req.reporting_period_start,
        reporting_period_end=req.reporting_period_end,
        scope_type=req.scope_type.value,
        raw_quantity=req.raw_quantity,
        activity_unit=req.activity_unit,
        calculated_tco2e=calculated_tco2e,
        factor_used_id=factor_record.id if factor_record else None,
        document_evidence_id=req.document_evidence_id,
        audit_status="PENDING_AI_VERIFICATION",
        created_by=uuid.UUID(user_id),
    )

    logger.info("Emission report %s created: %.6f tCO2e (org=%s)", report.id, calculated_tco2e, req.organization_id)
    return _report_to_response(report)


def get_emission_summary(
    org_id: str, period_start: date, period_end: date, db: Session
) -> EmissionSummaryResponse:
    """Aggregate tCO2e totals per scope for the given organization and period."""
    entries = EmissionReportRepository(db).get_by_org_and_period(org_id, period_start, period_end)
    scope_totals = {s.value: 0.0 for s in GHGScope}
    for e in entries:
        if e.scope_type in scope_totals:
            scope_totals[e.scope_type] += float(e.calculated_tco2e or 0)

    return EmissionSummaryResponse(
        organization_id=org_id,
        period_start=period_start,
        period_end=period_end,
        scope_totals_tco2e=scope_totals,
        grand_total_tco2e=sum(scope_totals.values()),
        report_count=len(entries),
    )


def generate_brsr_report(
    org_id: str,
    period_start: date,
    period_end: date,
    revenue_crore: Optional[float],
    db: Session,
) -> BRSRReportResponse:
    """Generate a SEBI BRSR-compliant GHG report for the given period."""
    summary = get_emission_summary(org_id, period_start, period_end, db)
    s1 = summary.scope_totals_tco2e.get(GHGScope.SCOPE_1.value, 0.0)
    s2 = summary.scope_totals_tco2e.get(GHGScope.SCOPE_2.value, 0.0)
    s3 = summary.scope_totals_tco2e.get(GHGScope.SCOPE_3.value, 0.0)
    total = s1 + s2 + s3
    return BRSRReportResponse(
        organization_id=org_id,
        period_start=period_start,
        period_end=period_end,
        scope1_total_tco2e=s1,
        scope2_total_tco2e=s2,
        scope3_total_tco2e=s3,
        grand_total_tco2e=total,
        intensity_per_revenue_crore=total / revenue_crore if revenue_crore else None,
    )


def list_emission_factors(vintage_year: Optional[int], db: Session) -> list[dict]:
    """Return all active emission factors, optionally filtered by vintage year."""
    factors = EmissionFactorRepository(db).list_active(vintage_year=vintage_year)
    return [
        {
            "id": str(f.id),
            "factor_key": f.factor_key,
            "factor_value": float(f.factor_value),
            "unit": f.unit,
            "vintage_year": f.vintage_year,
            "source_agency": f.source_agency,
            "is_active": f.is_active,
        }
        for f in factors
    ]


def _report_to_response(r: EmissionReport) -> EmissionReportResponse:
    return EmissionReportResponse(
        id=r.id,
        organization_id=r.organization_id,
        reporting_period_start=r.reporting_period_start,
        reporting_period_end=r.reporting_period_end,
        scope_type=r.scope_type,
        raw_quantity=r.raw_quantity,
        activity_unit=r.activity_unit,
        calculated_tco2e=r.calculated_tco2e,
        factor_used_id=r.factor_used_id,
        audit_status=r.audit_status,
        document_evidence_id=r.document_evidence_id,
    )

async def calculate_scope_emissions(
    req: List[CalculateScopeEmissionsRequest],
    user: AuthenticatedUser,
    revenue_crore:float,
    db: Session,
) :
    current_month=datetime.now(timezone.utc)
    total_tco2e=0.0
    for data in req:
        emission_factor_repo=EmissionFactorRepository(db)
        
        factor_rec = emission_factor_repo.find_by_factor_and_year(data.factor_key,data.year)
        if not factor_rec:
           db.add(EmissionReport(
            organization_id=user.organization_id,
            reporting_period_start=date(data.year,1,1),
            reporting_period_end=date(data.year,12,31),
            scope_type="None",
            raw_quantity=data.raw_quantity,
            activity_unit="None",
            calculated_tco2e=None,
            factor_used_id=None,
            document_evidence_id=data.document_id,
            audit_status="MISSING_FACTOR",
            created_by=uuid.UUID(user.user_id),
           ))
        else:
            tco2=data.raw_quantity * factor_rec.factor_value / Decimal("1000")
            db.add(EmissionReport(
                organization_id=user.organization_id,
                reporting_period_start=date(data.year,1,1),
                reporting_period_end=date(data.year,12,31),
                scope_type=factor_rec.scope,
                raw_quantity=data.raw_quantity,
                activity_unit=data.activity_unit,
                calculated_tco2e=tco2,
                factor_used_id=factor_rec.id,
                document_evidence_id=data.document_id,
                audit_status="PENDING_AI_VERIFICATION",
                created_by=uuid.UUID(user.user_id),
            ))
            total_tco2e+=tco2
    db.commit()
    await calculate_monthly_brsr_score(user.organization_id,revenue_crore,total_tco2e,current_month,db)
    return {"message":"calculation successful"}


def brsr_score(total_tco2e:float, revenue_cr:float, target_intensity:float ) ->float:
    actual_intensity = total_tco2e / revenue_cr if revenue_cr > 0 else Decimal("0")
    
    # 3. Calculate Compliance Gap (Difference from Regulatory Goalpost)
    # Negative gap = Under the limit (Green/Good)
    # Positive gap = Over the limit (Liability/Needs Credits)
    compliance_gap = actual_intensity - target_intensity
    
    # 4. Generate Score (0-100 scale where 100 is perfectly clean)
    # Logic: If gap is 0 or negative, score is 100. If gap is positive, reduce score.
    if compliance_gap <= 0:
        compliance_score = 100.0
    else:
        # Example: Penalty reduction based on how far they exceeded the target
        compliance_score = max(0, 100 - float((compliance_gap / target_intensity) * 100))

    return compliance_score

async def calculate_monthly_brsr_score(org_id:str, revenue_crore:float,new_tco2e:float,current_month:date,db:Session):
    org=await get_org_by_id(org_id)
    sector_benchmark=db.query(SectorBenchmarks).filter(or_(SectorBenchmarks.sector_name==org.industry_sector, SectorBenchmarks.sub_sector==org.industry_sector)).filter(SectorBenchmarks.compliance_year==current_month.year).first()
    if not sector_benchmark:
        return {"message":"benchmark not found"}
    
    monthly_emission_summary=db.query(MonthlyEmissionsSummary).filter(MonthlyEmissionsSummary.organization_id==org_id).filter(MonthlyEmissionsSummary.month_year==current_month).first()
    if not monthly_emission_summary:
        score=brsr_score(new_tco2e,revenue_crore,sector_benchmark.target_intensity)
        db.add(MonthlyEmissionsSummary(
            organization_id=org_id,
            month_year=current_month,
            total_monthly_tco2e=new_tco2e,
            monthly_revenue_cr=revenue_crore,
            calculated_score=score,
            is_locked=False
        ))
    else:
        monthly_emission_summary.total_monthly_tco2e+=new_tco2e
        monthly_emission_summary.monthly_revenue_cr=revenue_crore
        score=brsr_score(monthly_emission_summary.total_monthly_tco2e,monthly_emission_summary.monthly_revenue_cr,sector_benchmark.target_intensity)
        monthly_emission_summary.calculated_score=score
        monthly_emission_summary.updated_at=datetime.now(timezone.utc)
        
    