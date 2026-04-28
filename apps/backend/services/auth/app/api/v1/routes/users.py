from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from shared_logic import ApiResponse, get_db, get_supabase_client

from ....dependencies import get_requesting_user
from ....schemas.auth import UserProfile
from ....services import auth_service as auth_svc

router = APIRouter()


@router.get("/me", response_model=ApiResponse[UserProfile], summary="Get authenticated user's profile")
def get_own_profile(
    user_id: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_user_profile(user_id, db, supabase_admin)
    return ApiResponse(data=profile)


@router.get("/{user_id}", response_model=ApiResponse[UserProfile], summary="Get profile by ID (admin)")
def get_profile_by_id(
    user_id: str,
    requesting_user: str = Depends(get_requesting_user),
    db: Session = Depends(get_db),
) -> ApiResponse[UserProfile]:
    supabase_admin = get_supabase_client(use_service_role=True)
    profile = auth_svc.get_user_profile(user_id, db, supabase_admin)
    return ApiResponse(data=profile)
