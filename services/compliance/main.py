"""
services/compliance/main.py
IndiCarbon AI — Compliance Service
Handles:
  - GHG Emissions Math (Scope 1, 2, 3) per GHG Protocol
  - SEBI BRSR report generation
  - Emission factor lookups from Supabase
"""
from __future__ import annotations

import logging
import pathlib
import sys
import uuid
from datetime import datetime
from decimal import Decimal

from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic_settings import BaseSettings, SettingsConfigDict

# Ensure shared_logic is importable both locally and inside Docker
_shared = str(pathlib.Path(__file__).resolve().parents[2] / "libs" / "shared-logic")
if _shared not in sys.path:
    sys.path.insert(0, _shared)

from shared_logic import (
    ApiResponse,
    BRSRReport,
    EmissionEntryRequest,
    EmissionResult,
    GHGScope,
    register_middleware,
)
from shared_logic.supabase_client import BaseRepository, get_supabase_settings

logging.basicConfig(
    stream=sys.stdout,
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("compliance")


# ─── Settings ─────────────────────────────────────────────────────────────────


_ROOT = pathlib.Path(__file__).resolve().parents[2]

class ComplianceSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[
            str(_ROOT / ".envs" / ".compliance.env"),
            str(_ROOT / ".envs" / ".supabase.env"),
        ],
        extra="ignore",
    )
    app_env: str = "development"
    ghg_grid_emission_factor_in: Decimal = Decimal("0.82")
    ghg_default_scope3_factor: Decimal = Decimal("1.0")


settings = ComplianceSettings()

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="IndiCarbon — Compliance Service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)
register_middleware(app)


# ─── Repositories ─────────────────────────────────────────────────────────────


class EmissionRepository(BaseRepository):
    def __init__(self) -> None:
        super().__init__("emission_entries", admin=True)

    def get_org_year(self, org_id: str, fiscal_year: int) -> list[dict]:
        return (
            self._client.table(self._table)
            .select("*")
            .eq("organization_id", org_id)
            .eq("fiscal_year", fiscal_year)
            .execute()
            .data
        )


def get_emission_repo() -> EmissionRepository:
    return EmissionRepository()


# ─── GHG Math Engine ──────────────────────────────────────────────────────────


class GHGCalculator:
    """
    Pure-function GHG Protocol calculator.
    Formula: CO2e (tonnes) = Activity Data × Emission Factor
    """

    # Default emission factors (kg CO2e per unit)
    DEFAULT_FACTORS: dict[str, Decimal] = {
        "stationary_combustion": Decimal("2.68"),   # Diesel litre
        "mobile_combustion": Decimal("2.31"),        # Petrol litre
        "electricity": Decimal("0.82"),              # India grid kWh (CEA 2023)
        "business_travel": Decimal("0.255"),         # Economy class per km
        "supply_chain": Decimal("1.0"),              # Generic tonne-km
        "waste": Decimal("0.58"),                    # Mixed waste kg
    }

    @classmethod
    def calculate(cls, req: EmissionEntryRequest) -> Decimal:
        factor = req.emission_factor or cls.DEFAULT_FACTORS.get(
            req.category.value, Decimal("1.0")
        )
        # Convert kg → tonnes
        co2e_kg = req.activity_data * factor
        co2e_tonnes = co2e_kg / Decimal("1000")
        return co2e_tonnes.quantize(Decimal("0.000001"))

    @classmethod
    def get_factor_used(cls, req: EmissionEntryRequest) -> Decimal:
        return req.emission_factor or cls.DEFAULT_FACTORS.get(
            req.category.value, Decimal("1.0")
        )


# ─── Internal header extraction ───────────────────────────────────────────────


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    if not x_user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No user context.")
    return x_user_id


# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/health", tags=["Observability"])
async def health():
    return ApiResponse(data={"service": "compliance", "status": "healthy"})


@app.post(
    "/ghg/calculate",
    response_model=ApiResponse[EmissionResult],
    tags=["GHG Math"],
    summary="Calculate CO2e for a single emission entry",
)
async def calculate_emission(
    req: EmissionEntryRequest,
    user_id: str = Depends(get_requesting_user),
    repo: EmissionRepository = Depends(get_emission_repo),
) -> ApiResponse[EmissionResult]:
    co2e = GHGCalculator.calculate(req)
    factor = GHGCalculator.get_factor_used(req)

    entry_id = uuid.uuid4()
    record = {
        "id": str(entry_id),
        "organization_id": str(req.organization_id),
        "fiscal_year": req.fiscal_year,
        "scope": req.scope.value,
        "category": req.category.value,
        "activity_data": float(req.activity_data),
        "activity_unit": req.activity_unit,
        "emission_factor_used": float(factor),
        "co2e_tonnes": float(co2e),
        "created_by": user_id,
        "calculated_at": datetime.utcnow().isoformat(),
    }
    repo.insert(record)

    result = EmissionResult(
        entry_id=entry_id,
        organization_id=req.organization_id,
        scope=req.scope,
        category=req.category,
        activity_data=req.activity_data,
        activity_unit=req.activity_unit,
        emission_factor_used=factor,
        co2e_tonnes=co2e,
        fiscal_year=req.fiscal_year,
        calculated_at=datetime.utcnow(),
    )
    return ApiResponse(data=result, message="Emission entry recorded.")


@app.get(
    "/ghg/summary/{organization_id}/{fiscal_year}",
    response_model=ApiResponse[dict],
    tags=["GHG Math"],
    summary="Aggregate Scope 1/2/3 totals for an org and fiscal year",
)
async def get_ghg_summary(
    organization_id: str,
    fiscal_year: int,
    user_id: str = Depends(get_requesting_user),
    repo: EmissionRepository = Depends(get_emission_repo),
) -> ApiResponse[dict]:
    entries = repo.get_org_year(organization_id, fiscal_year)

    totals: dict[str, Decimal] = {
        GHGScope.SCOPE_1.value: Decimal("0"),
        GHGScope.SCOPE_2.value: Decimal("0"),
        GHGScope.SCOPE_3.value: Decimal("0"),
    }
    for e in entries:
        scope = e.get("scope", "")
        if scope in totals:
            totals[scope] += Decimal(str(e.get("co2e_tonnes", 0)))

    return ApiResponse(
        data={
            "organization_id": organization_id,
            "fiscal_year": fiscal_year,
            "scope_totals_tco2e": {k: float(v) for k, v in totals.items()},
            "grand_total_tco2e": float(sum(totals.values())),
            "entry_count": len(entries),
        }
    )


@app.get(
    "/brsr/report/{organization_id}/{fiscal_year}",
    response_model=ApiResponse[BRSRReport],
    tags=["SEBI BRSR"],
    summary="Generate a SEBI BRSR-compliant GHG report",
)
async def generate_brsr_report(
    organization_id: str,
    fiscal_year: int,
    revenue_crore: float | None = None,
    user_id: str = Depends(get_requesting_user),
    repo: EmissionRepository = Depends(get_emission_repo),
) -> ApiResponse[BRSRReport]:
    entries = repo.get_org_year(organization_id, fiscal_year)

    scope_map: dict[str, Decimal] = {s.value: Decimal("0") for s in GHGScope}
    for e in entries:
        scope = e.get("scope", "")
        if scope in scope_map:
            scope_map[scope] += Decimal(str(e.get("co2e_tonnes", 0)))

    total = sum(scope_map.values())
    intensity = (
        Decimal(str(total)) / Decimal(str(revenue_crore))
        if revenue_crore
        else None
    )

    report = BRSRReport(
        organization_id=uuid.UUID(organization_id),  # type: ignore[arg-type]
        fiscal_year=fiscal_year,
        scope1_total_tco2e=scope_map[GHGScope.SCOPE_1.value],
        scope2_total_tco2e=scope_map[GHGScope.SCOPE_2.value],
        scope3_total_tco2e=scope_map[GHGScope.SCOPE_3.value],
        total_tco2e=total,
        intensity_per_revenue_crore=intensity,
    )
    return ApiResponse(data=report, message="BRSR report generated.")
