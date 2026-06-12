from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....services import trade_engine as trade_svc

router = APIRouter()


@router.get("", response_model=ApiResponse[list], summary="List transaction ledgers (trades) for an organization")
def list_trades(
    organization_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    trades = trade_svc.list_trades(organization_id, db)
    return ApiResponse(data=trades, message=f"{len(trades)} trades found.")
