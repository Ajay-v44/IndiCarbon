from fastapi import Header

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db, get_supabase_client

from ....dependencies import get_requesting_user
from ....schemas.auth import UserProfile
from ....services import auth_service as auth_svc

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserProfile], summary="Get authenticated user's profile")
def get_own_profile(
    token: str,
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_user_profile(token, db, supabase_admin)
    return ApiResponse(data=profile)


@router.get("", response_model=ApiResponse[list[UserProfile]], summary="List visible users")
def list_users(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    requesting_user: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[list[UserProfile]]:
    supabase_admin = get_supabase_client(use_service_role=True)
    users = auth_svc.list_user_profiles(requesting_user, db, supabase_admin, limit=limit, offset=offset)
    return ApiResponse(data=users, message=f"{len(users)} users found.")


@router.get("/{user_id}", response_model=ApiResponse[UserProfile], summary="Get profile by ID (admin)")
def get_profile_by_id(
    user_id: str,
    requesting_user: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_visible_user_profile(user_id, requesting_user, db, supabase_admin)
    return ApiResponse(data=profile)
