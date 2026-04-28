from __future__ import annotations

from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from ..models.emission import EmissionFactor, EmissionReport


class EmissionReportRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> EmissionReport:
        report = EmissionReport(**kwargs)
        self.db.add(report)
        self.db.flush()
        return report

    def get_by_org_and_period(
        self, org_id: str, period_start: date, period_end: date
    ) -> list[EmissionReport]:
        return (
            self.db.query(EmissionReport)
            .filter(
                EmissionReport.organization_id == org_id,
                EmissionReport.reporting_period_start >= period_start,
                EmissionReport.reporting_period_end <= period_end,
            )
            .all()
        )


class EmissionFactorRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_active(self, factor_key: str, vintage_year: int) -> Optional[EmissionFactor]:
        return (
            self.db.query(EmissionFactor)
            .filter(
                EmissionFactor.factor_key == factor_key,
                EmissionFactor.vintage_year == vintage_year,
                EmissionFactor.is_active.is_(True),
            )
            .first()
        )

    def list_active(self, vintage_year: Optional[int] = None) -> list[EmissionFactor]:
        q = self.db.query(EmissionFactor).filter(EmissionFactor.is_active.is_(True))
        if vintage_year:
            q = q.filter(EmissionFactor.vintage_year == vintage_year)
        return q.order_by(EmissionFactor.factor_key).all()
