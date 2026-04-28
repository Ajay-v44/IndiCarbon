from __future__ import annotations

import logging
import uuid
from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from ..models.emission import EmissionReport
from ..repositories.emission_repo import EmissionFactorRepository, EmissionReportRepository
from ..schemas.emission import (
    BRSRReportResponse,
    EmissionReportCreate,
    EmissionReportResponse,
    EmissionSummaryResponse,
    GHGScope,
)

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
