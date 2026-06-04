from typing import List

from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db,schemas

from shared_logic.schemas.compilance_schema import CalculateScopeEmissionsRequest
from fastapi import HTTPException,status

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....schemas.emission import (
    BRSRReportResponse,
    EmissionReportCreate,
    EmissionReportResponse,
    EmissionSummaryResponse,
    SectorBenchmarkCreate,
    SectorBenchmarkUpdate,
    SectorBenchmarkResponse,
)
from ....services import ghg_service as ghg_svc
from ....models.emission import SectorBenchmarks
import uuid

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
    period_start: date = Query(...),
    period_end: date = Query(...),
    revenue_crore: Optional[float] = Query(None),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[BRSRReportResponse]:
    require_organization_access(user, user.organization_id)
    report = ghg_svc.generate_brsr_report(user.organization_id, period_start, period_end, revenue_crore, db)
    return ApiResponse(data=report, message="BRSR report generated.")


@router.get("/factors", response_model=ApiResponse[list], summary="List active emission factors")
def list_factors(
    vintage_year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    factors = ghg_svc.list_emission_factors(vintage_year, db)
    return ApiResponse(data=factors, message=f"{len(factors)} factors found.")


@router.post("/calculate_scope_emissions",response_model=schemas.Message, summary="Calculate and store scope emissions")
async def calculate_scope_emissions(
    revenue_crore:float,
    document_id:str,
    req:List[CalculateScopeEmissionsRequest],
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        require_organization_access(user, user.organization_id)
        return await ghg_svc.calculate_scope_emissions(req,user,revenue_crore,document_id, db)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/benchmarks", response_model=ApiResponse[List[SectorBenchmarkResponse]], summary="List all sector benchmarks (super admin / team only)")
def list_benchmarks(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[List[SectorBenchmarkResponse]]:
    if not (user.has_role("SUPER_ADMIN") or user.has_role("SALES")):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SUPER_ADMIN or SALES role required.")
    
    benchmarks = db.query(SectorBenchmarks).all()
    data = []
    for b in benchmarks:
        data.append(SectorBenchmarkResponse(
            id=b.id,
            sector_name=b.sector_name,
            sub_sector=b.sub_sector,
            target_intensity=b.target_intensity,
            intensity_unit=b.intensity_unit,
            compliance_year=b.compliance_year,
            reduction_target_pct=b.reduction_target_pct,
            is_ccts_obligated=b.is_ccts_obligated,
            regulatory_framework=b.regulatory_framework,
        ))
    return ApiResponse(data=data)


@router.post("/benchmarks", response_model=ApiResponse[SectorBenchmarkResponse], summary="Create sector benchmark (super admin only)")
def create_benchmark(
    req: SectorBenchmarkCreate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[SectorBenchmarkResponse]:
    if not user.has_role("SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SUPER_ADMIN role required.")
    
    existing = db.query(SectorBenchmarks).filter(
        SectorBenchmarks.sector_name == req.sector_name,
        SectorBenchmarks.sub_sector == req.sub_sector,
        SectorBenchmarks.compliance_year == req.compliance_year
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Benchmark already exists for this sector, sub-sector, and year.")
    
    benchmark = SectorBenchmarks(
        id=uuid.uuid4(),
        sector_name=req.sector_name,
        sub_sector=req.sub_sector,
        target_intensity=req.target_intensity,
        intensity_unit=req.intensity_unit,
        compliance_year=req.compliance_year,
        reduction_target_pct=req.reduction_target_pct,
        is_ccts_obligated=req.is_ccts_obligated,
        regulatory_framework=req.regulatory_framework,
    )
    db.add(benchmark)
    db.commit()
    db.refresh(benchmark)
    
    res = SectorBenchmarkResponse(
        id=benchmark.id,
        sector_name=benchmark.sector_name,
        sub_sector=benchmark.sub_sector,
        target_intensity=benchmark.target_intensity,
        intensity_unit=benchmark.intensity_unit,
        compliance_year=benchmark.compliance_year,
        reduction_target_pct=benchmark.reduction_target_pct,
        is_ccts_obligated=benchmark.is_ccts_obligated,
        regulatory_framework=benchmark.regulatory_framework,
    )
    return ApiResponse(data=res, message="Sector benchmark created.")


@router.put("/benchmarks/{benchmark_id}", response_model=ApiResponse[SectorBenchmarkResponse], summary="Update sector benchmark (super admin only)")
def update_benchmark(
    benchmark_id: str,
    req: SectorBenchmarkUpdate,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[SectorBenchmarkResponse]:
    if not user.has_role("SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SUPER_ADMIN role required.")
    
    try:
        b_id = uuid.UUID(benchmark_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid benchmark UUID.")
        
    benchmark = db.query(SectorBenchmarks).filter(SectorBenchmarks.id == b_id).first()
    if not benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sector benchmark not found.")
        
    if req.sector_name is not None:
        benchmark.sector_name = req.sector_name
    if req.sub_sector is not None:
        benchmark.sub_sector = req.sub_sector
    if req.target_intensity is not None:
        benchmark.target_intensity = req.target_intensity
    if req.intensity_unit is not None:
        benchmark.intensity_unit = req.intensity_unit
    if req.compliance_year is not None:
        benchmark.compliance_year = req.compliance_year
    if req.reduction_target_pct is not None:
        benchmark.reduction_target_pct = req.reduction_target_pct
    if req.is_ccts_obligated is not None:
        benchmark.is_ccts_obligated = req.is_ccts_obligated
    if req.regulatory_framework is not None:
        benchmark.regulatory_framework = req.regulatory_framework
        
    db.commit()
    db.refresh(benchmark)
    
    res = SectorBenchmarkResponse(
        id=benchmark.id,
        sector_name=benchmark.sector_name,
        sub_sector=benchmark.sub_sector,
        target_intensity=benchmark.target_intensity,
        intensity_unit=benchmark.intensity_unit,
        compliance_year=benchmark.compliance_year,
        reduction_target_pct=benchmark.reduction_target_pct,
        is_ccts_obligated=benchmark.is_ccts_obligated,
        regulatory_framework=benchmark.regulatory_framework,
    )
    return ApiResponse(data=res, message="Sector benchmark updated.")


@router.delete("/benchmarks/{benchmark_id}", response_model=ApiResponse[dict], summary="Delete sector benchmark (super admin only)")
def delete_benchmark(
    benchmark_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    if not user.has_role("SUPER_ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SUPER_ADMIN role required.")
    
    try:
        b_id = uuid.UUID(benchmark_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid benchmark UUID.")
        
    benchmark = db.query(SectorBenchmarks).filter(SectorBenchmarks.id == b_id).first()
    if not benchmark:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sector benchmark not found.")
        
    db.delete(benchmark)
    db.commit()
    return ApiResponse(data={"deleted_id": benchmark_id}, message="Sector benchmark deleted.")

    
