from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db, get_supabase_client

from ....dependencies import AuthenticatedUser, get_current_user
from ....schemas.auth import (
    AssignRoleRequest,
    CreateRoleRequest,
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
    supabase_admin = get_supabase_client(use_service_role=True)
    supabase_public = get_supabase_client(use_service_role=False)
    token = await auth_svc.register(req, db, supabase_admin, supabase_public)
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
    token = await auth_svc.refresh_token(req.refresh_token, supabase, db)
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
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    result = auth_svc.assign_role_as_admin(
        str(user.id),
        str(req.user_id),
        str(req.role_id),
        str(req.organization_id) if req.organization_id else None,
        db,
    )
    return ApiResponse(data=result, message=f"Role ID '{req.role_id}' assigned.")


@router.get("/roles", response_model=ApiResponse[list[RoleResponse]], summary="List available RBAC roles")
def list_roles(
    exclude_internal: bool = Query(False, description="Whether to exclude internal roles"),
    db: Session = Depends(get_db),
) -> ApiResponse[list[RoleResponse]]:
    roles = auth_svc.list_roles(db, exclude_internal=exclude_internal)
    return ApiResponse(data=roles, message=f"{len(roles)} roles found.")


@router.get(
    "/roles/verify-internal",
    response_model=ApiResponse[dict],
    summary="Double check if the current user has any internal role",
)
def verify_internal_role(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    has_internal = auth_svc.has_internal_role(str(user.id), db)
    return ApiResponse(data={"has_internal_role": has_internal})


@router.post(
    "/roles",
    response_model=ApiResponse[RoleResponse],
    summary="Create a new RBAC role (admin only)",
)
def create_role(
    req: CreateRoleRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[RoleResponse]:
    result = auth_svc.create_role_as_admin(
        requesting_user_id=str(user.id),
        name=req.name,
        description=req.description,
        permissions=req.permissions,
        is_internal=req.is_internal,
        db=db,
    )
    return ApiResponse(data=result, message=f"Role '{req.name}' created.")
