from __future__ import annotations

from fastapi import APIRouter, Request, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....services import trade_engine as trade_svc
from ....repositories.credit_repo import CreditRepository

from pydantic import BaseModel, Field

router = APIRouter()


class MintCreditsRequest(BaseModel):
    organization_id: str
    quantity: int = Field(..., gt=0)
    vintage_year: int
    project_type: str


class RetireByQuantityRequest(BaseModel):
    organization_id: str
    quantity: int = Field(..., gt=0, description="Number of credits to retire permanently")


class ApplyToEmissionsRequest(BaseModel):
    organization_id: str
    quantity: int = Field(..., gt=0, description="Number of credits to apply against emissions (reduces Net Carbon Position)")


@router.get("", response_model=ApiResponse[list], summary="List carbon credits for an organization")
def list_credits(
    organization_id: str = Query(...),
    status: str = Query(None, description="Filter by status: ISSUED|APPLIED|RETIRED|PENDING_TRANSFER"),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    repo = CreditRepository(db)
    credits = repo.find_by_owner(organization_id, status=status)
    return ApiResponse(
        data=[{
            "id": str(c.id),
            "serial_number": c.serial_number,
            "project_type": c.project_type,
            "vintage_year": c.vintage_year,
            "status": c.status,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        } for c in credits],
        message=f"{len(credits)} credits found.",
    )



@router.get("/portfolio", response_model=ApiResponse[dict], summary="Net Carbon Position — gross emissions vs offsets applied")
def get_portfolio_summary(
    organization_id: str = Query(...),
    request: Request = None,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Returns the full carbon credit portfolio including Net Carbon Position:
      Net Position = Gross Emissions - (Applied Credits + Retired Credits)

    Credit status semantics:
      ISSUED   — owned and available (does NOT yet reduce emissions)
      APPLIED  — explicitly applied against emissions (REDUCES Net Carbon Position)
      RETIRED  — permanently burned (also reduces Net Carbon Position)
    """
    require_organization_access(user, organization_id)

    repo = CreditRepository(db)
    portfolio = repo.get_portfolio_summary(organization_id)

    # Fetch gross emissions from compliance service
    gross_emissions_tco2e = 0.0
    try:
        import httpx
        from ....config import settings as svc_settings
        headers = {}
        if request and request.headers.get("authorization"):
            headers["authorization"] = request.headers.get("authorization")
        resp = httpx.get(
            f"{svc_settings.compliance_service_url}/api/v1/emissions/summary",
            params={
                "organization_id": organization_id,
                "period_start": "2026-01-01",
                "period_end": "2026-12-31",
            },
            headers=headers,
            timeout=5.0,
        )
        if resp.status_code == 200:
            data = resp.json().get("data", {})
            gross_emissions_tco2e = float(data.get("grand_total_tco2e", 0.0))
    except Exception:
        pass

    # Net position = Gross - (Applied + Retired). ISSUED credits do NOT count yet.
    total_offset_tco2e = portfolio["total_offset_tco2e"]
    net_position = max(0.0, gross_emissions_tco2e - total_offset_tco2e)
    offset_pct = (total_offset_tco2e / gross_emissions_tco2e * 100) if gross_emissions_tco2e > 0 else 0.0
    credits_for_net_zero = max(0, int(net_position))

    return ApiResponse(
        data={
            **portfolio,
            "gross_emissions_tco2e": gross_emissions_tco2e,
            "net_carbon_position_tco2e": net_position,
            "offset_coverage_pct": round(offset_pct, 2),
            "credits_needed_for_net_zero": credits_for_net_zero,
        },
        message="Portfolio summary fetched.",
    )


@router.get("/ledger", response_model=ApiResponse[dict], summary="Full credit transaction ledger for an organization")
def get_credit_ledger(
    organization_id: str = Query(...),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """Returns all credit events (Issued, Applied, Retired, Sold) as a ledger."""
    require_organization_access(user, organization_id)
    repo = CreditRepository(db)
    result = repo.get_credit_ledger(organization_id, limit=limit, offset=offset)
    return ApiResponse(data=result, message=f"{len(result['ledger'])} ledger entries found.")


@router.post("/apply-to-emissions", response_model=ApiResponse[dict], summary="Apply credits to reduce Net Carbon Position")
def apply_credits_to_emissions(
    req: ApplyToEmissionsRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    """
    Explicitly apply N ISSUED credits against the organization's carbon emissions.
    This changes their status from ISSUED → APPLIED.

    Applied credits immediately reduce the Net Carbon Position:
      Net Position = Gross Emissions - (Applied + Retired)

    This is different from 'retiring' — Applied credits can be tracked as
    internal offset certificates, while Retired credits are permanently burned.
    """
    require_organization_access(user, req.organization_id)
    repo = CreditRepository(db)
    applied_ids = repo.apply_to_emissions(req.organization_id, req.quantity)
    db.commit()
    actual = len(applied_ids)
    if actual == 0:
        raise HTTPException(
            status_code=400,
            detail="No ISSUED credits available to apply. Purchase or earn credits first.",
        )
    return ApiResponse(
        data={
            "applied_count": actual,
            "applied_ids": applied_ids,
            "tco2e_offset": float(actual),
        },
        message=f"{actual} credits applied to emissions. Your Net Carbon Position has been reduced by {actual} tCO₂e.",
    )


@router.post("/retire", response_model=ApiResponse[dict], summary="Retire carbon credits by specific IDs (permanent)")
def retire_credits(
    credit_ids: list[str],
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.retire_credits(credit_ids, str(user.id), db)
    return ApiResponse(data=result, message=f"{result['retired_count']} credits retired.")


@router.post("/retire-by-quantity", response_model=ApiResponse[dict], summary="Permanently retire N credits (FIFO)")
def retire_credits_by_quantity(
    req: RetireByQuantityRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    require_organization_access(user, req.organization_id)
    repo = CreditRepository(db)
    retired_ids = repo.retire_by_quantity(req.organization_id, req.quantity)
    db.commit()
    actual = len(retired_ids)
    if actual == 0:
        raise HTTPException(status_code=400, detail="No ISSUED credits available to retire.")
    return ApiResponse(
        data={"retired_count": actual, "retired_ids": retired_ids},
        message=f"{actual} carbon credits permanently retired. This action is irreversible.",
    )


@router.post("/admin/mint", response_model=ApiResponse[dict], summary="Admin: mint carbon credits for an organization")
def mint_credits(
    req: MintCreditsRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    if "SUPER_ADMIN" not in (user.roles or []):
        raise HTTPException(status_code=403, detail="Only Super Admins can mint carbon credits.")

    from ....models.credit import CarbonCredit
    import uuid

    created_credits = []
    for _ in range(req.quantity):
        serial = f"CCT-{uuid.uuid4().hex[:8].upper()}-{req.organization_id[:8]}"
        credit = CarbonCredit(
            serial_number=serial,
            vintage_year=req.vintage_year,
            project_type=req.project_type,
            initial_owner_id=uuid.UUID(req.organization_id),
            current_owner_id=uuid.UUID(req.organization_id),
            status="ISSUED",
        )
        db.add(credit)
        created_credits.append(credit)

    db.commit()

    return ApiResponse(
        data={
            "organization_id": req.organization_id,
            "quantity": req.quantity,
            "vintage_year": req.vintage_year,
            "project_type": req.project_type,
        },
        message=f"Successfully minted {req.quantity} carbon credits.",
    )
