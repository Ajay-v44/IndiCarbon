from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db, get_supabase_client

from ....dependencies import AuthenticatedUser, get_current_user
from ....schemas.auth import UserProfile, AdminUserCreateRequest
from ....services import auth_service as auth_svc

router = APIRouter()


@router.post("", response_model=ApiResponse[UserProfile], summary="Create a new user (admin only)")
def create_user(
    req: AdminUserCreateRequest,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.create_user_as_admin(
        requesting_user_id=str(user.id),
        email=req.email,
        password=req.password,
        full_name=req.full_name,
        role_id=str(req.role_id),
        organization_id=str(req.organization_id) if req.organization_id else None,
        db=db,
        supabase_admin=supabase_admin,
    )
    return ApiResponse(data=profile, message="User created successfully.")


@router.get("/me", response_model=ApiResponse[UserProfile], summary="Get authenticated user's profile")
def get_own_profile(
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_visible_user_profile(str(user.id), str(user.id), db, supabase_admin)
    return ApiResponse(data=profile)


@router.get("", response_model=ApiResponse[list[UserProfile]], summary="List visible users")
def list_users(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[UserProfile]]:
    supabase_admin = get_supabase_client(use_service_role=True)
    users = auth_svc.list_user_profiles(str(user.id), db, supabase_admin, limit=limit, offset=offset)
    return ApiResponse(data=users, message=f"{len(users)} users found.")


@router.get("/{target_user_id}", response_model=ApiResponse[UserProfile], summary="Get profile by ID (admin)")
def get_profile_by_id(
    target_user_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_visible_user_profile(target_user_id, str(user.id), db, supabase_admin)
    return ApiResponse(data=profile)


@router.delete("/{target_user_id}", response_model=ApiResponse[dict], summary="Deactivate a user (admin only)")
def delete_user(
    target_user_id: str,
    user: AuthenticatedUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ApiResponse[dict]:
    supabase_admin = get_supabase_client(use_service_role=True)
    auth_svc.deactivate_user_as_admin(
        requesting_user_id=str(user.id),
        target_user_id=target_user_id,
        db=db,
        supabase_admin=supabase_admin,
    )
    return ApiResponse(data={"deleted_id": target_user_id}, message="User deactivated successfully.")
