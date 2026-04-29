from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db, get_supabase_client

from ....dependencies import get_requesting_user
from ....schemas.auth import (
    AssignRoleRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    RoleResponse,
    TokenResponse,
    VerifyTokenRequest,
    VerifyTokenResponse,
)
from ....services import auth_service as auth_svc

router = APIRouter()


@router.post("/register", response_model=ApiResponse[TokenResponse], summary="Register a new user")
async def register(
    req: RegisterRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    supabase = get_supabase_client(use_service_role=False)
    token = await auth_svc.register(req, db, supabase)
    return ApiResponse(data=token, message="Registration successful.")


@router.post("/login", response_model=ApiResponse[TokenResponse], summary="Login with email + password")
async def login(
    req: LoginRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    supabase = get_supabase_client(use_service_role=False)
    token = await auth_svc.login(req, db, supabase)
    return ApiResponse(data=token, message="Login successful.")


@router.post("/refresh", response_model=ApiResponse[TokenResponse], summary="Refresh access token")
async def refresh(
    req: RefreshRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[TokenResponse]:
    supabase = get_supabase_client(use_service_role=False)
    token = await auth_svc.refresh_token(req.refresh_token, supabase)
    return ApiResponse(data=token, message="Token refreshed.")


@router.post(
    "/verify",
    response_model=ApiResponse[VerifyTokenResponse],
    summary="Verify a JWT (service-to-service endpoint, used by gateway)",
)
def verify(
    req: VerifyTokenRequest,
    db: Session = Depends(get_db),
) -> ApiResponse[VerifyTokenResponse]:
    result = auth_svc.verify_token(req.token, db)
    return ApiResponse(data=result)


@router.post("/roles/assign", response_model=ApiResponse[dict], summary="Assign RBAC role (admin only)")
def assign_role(
    req: AssignRoleRequest,
    requesting_user: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = auth_svc.assign_role_as_admin(
        requesting_user,
        str(req.user_id),
        req.role_name,
        str(req.organization_id) if req.organization_id else None,
        db,
    )
    return ApiResponse(data=result, message=f"Role '{req.role_name}' assigned.")


@router.get("/roles", response_model=ApiResponse[list[RoleResponse]], summary="List available RBAC roles")
def list_roles(db: Session = Depends(get_db)) -> ApiResponse[list[RoleResponse]]:
    roles = auth_svc.list_roles(db)
    return ApiResponse(data=roles, message=f"{len(roles)} roles found.")
