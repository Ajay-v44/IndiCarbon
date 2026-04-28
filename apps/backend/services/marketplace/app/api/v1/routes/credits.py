from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import get_requesting_user
from ....services import trade_engine as trade_svc

router = APIRouter()


@router.get("", response_model=ApiResponse[list], summary="List carbon credits for an organization")
def list_credits(
    organization_id: str = Query(...),
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    credits = trade_svc.list_credits(organization_id, db)
    return ApiResponse(data=credits, message=f"{len(credits)} credits found.")


@router.post("/retire", response_model=ApiResponse[dict], summary="Retire carbon credits (permanent)")
def retire_credits(
    credit_ids: list[str],
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = trade_svc.retire_credits(credit_ids, user_id, db)
    return ApiResponse(data=result, message=f"{result['retired_count']} credits retired.")
