from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db

from ....dependencies import AuthenticatedUser, get_current_user, require_organization_access
from ....schemas.wallet import AdminAddFundsRequest
from ....services import wallet_service as wallet_svc

router = APIRouter()


@router.get("", response_model=ApiResponse[dict], summary="Get wallet for an organization")
def get_wallet(
    organization_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    require_organization_access(user, organization_id)
    wallet = wallet_svc.get_wallet(organization_id, db)
    return ApiResponse(data=wallet, message="Wallet retrieved.")


@router.get("/all", response_model=ApiResponse[list], summary="List all wallets (admin)")
def list_all_wallets(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    wallets = wallet_svc.get_all_wallets(db)
    return ApiResponse(data=wallets, message=f"{len(wallets)} wallets found.")


@router.post("/admin/add-funds", response_model=ApiResponse[dict], summary="Admin: add funds to org wallet")
def admin_add_funds(
    req: AdminAddFundsRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = wallet_svc.admin_add_funds(
        org_id=req.organization_id,
        amount=req.amount,
        description=req.description,
        admin_user_id=str(user.id),
        db=db,
    )
    return ApiResponse(data=result, message=f"₹{req.amount} added to wallet.")


@router.get("/transactions", response_model=ApiResponse[list], summary="List wallet transactions for an org")
def list_transactions(
    organization_id: str = Query(...),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    require_organization_access(user, organization_id)
    txns = wallet_svc.list_transactions(organization_id, db)
    return ApiResponse(data=txns, message=f"{len(txns)} transactions found.")


@router.get("/transactions/all", response_model=ApiResponse[list], summary="List all transactions (admin)")
def list_all_transactions(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list]:
    txns = wallet_svc.list_all_transactions(db)
    return ApiResponse(data=txns, message=f"{len(txns)} transactions found.")
