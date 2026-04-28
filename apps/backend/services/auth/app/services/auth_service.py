from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import UUID

import jwt as pyjwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from supabase import Client

from ..config import settings
from ..repositories.user_repo import ProfileRepository, RoleRepository, UserRoleRepository
from ..schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserProfile,
    VerifyTokenResponse,
)

logger = logging.getLogger(__name__)


# ─── Auth — Pure Functions ────────────────────────────────────────────────────


async def register(
    req: RegisterRequest,
    db: Session,
    supabase: Client,
) -> TokenResponse:
    """Register a new user via Supabase Auth, then persist profile + default role."""
    try:
        res = supabase.auth.sign_up({"email": req.email, "password": req.password})
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    user, session = res.user, res.session
    if not user or not session:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Email may already be in use.",
        )

    profile_repo = ProfileRepository(db)
    role_repo = RoleRepository(db)
    user_role_repo = UserRoleRepository(db)

    profile_repo.create(
        user_id=str(user.id),
        full_name=req.full_name,
        phone_number=req.phone_number,
        designation=req.designation,
    )

    default_role = role_repo.find_by_name("ORG_VIEWER")
    if default_role:
        user_role_repo.assign(str(user.id), str(default_role.id))

    logger.info("Registered new user: %s", user.email)

    return TokenResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_in=session.expires_in or 3600,
        user_id=UUID(str(user.id)),
        email=user.email or req.email,
    )


async def login(
    req: LoginRequest,
    db: Session,
    supabase: Client,
) -> TokenResponse:
    """Authenticate via Supabase Auth and update last_login timestamp."""
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    user, session = res.user, res.session
    if not user or not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    ProfileRepository(db).update_last_login(str(user.id))
    logger.info("User logged in: %s", user.email)

    return TokenResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_in=session.expires_in or 3600,
        user_id=UUID(str(user.id)),
        email=user.email or req.email,
    )


async def refresh_token(refresh_token_str: str, supabase: Client) -> TokenResponse:
    """Exchange a refresh token for a new access token."""
    try:
        res = supabase.auth.refresh_session(refresh_token_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")

    user, session = res.user, res.session
    if not user or not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to refresh session.")

    return TokenResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_in=session.expires_in or 3600,
        user_id=UUID(str(user.id)),
        email=user.email or "",
    )


def verify_token(token: str, db: Session) -> VerifyTokenResponse:
    """Decode and validate a Supabase JWT. Returns user context for gateway injection."""
    try:
        payload = pyjwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        user_id = payload.get("sub")
        exp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else None

        user_roles = UserRoleRepository(db).get_roles_for_user(user_id) if user_id else []
        role_names = [ur.role.name for ur in user_roles if ur.role]
        primary_role = role_names[0] if role_names else None

        return VerifyTokenResponse(
            valid=True,
            user_id=UUID(user_id) if user_id else None,
            email=payload.get("email"),
            role=primary_role,
            expires_at=expires_at,
        )
    except pyjwt.ExpiredSignatureError:
        return VerifyTokenResponse(valid=False)
    except pyjwt.InvalidTokenError:
        return VerifyTokenResponse(valid=False)


def get_user_profile(user_id: str, db: Session, supabase_admin: Client) -> UserProfile:
    """Load profile + roles from DB and combine with Supabase Auth email."""
    profile = ProfileRepository(db).find_by_id(user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found.")

    try:
        auth_user = supabase_admin.auth.admin.get_user_by_id(user_id)
        email = auth_user.user.email if auth_user.user else ""
    except Exception:
        email = ""

    user_roles = UserRoleRepository(db).get_roles_for_user(user_id)
    role_names = [ur.role.name for ur in user_roles if ur.role]

    return UserProfile(
        id=profile.id,
        email=email,
        full_name=profile.full_name,
        phone_number=profile.phone_number,
        designation=profile.designation,
        is_active=profile.is_active,
        last_login=profile.last_login,
        created_at=profile.created_at,
        roles=role_names,
    )


def assign_role_to_user(
    target_user_id: str,
    role_name: str,
    organization_id: str | None,
    db: Session,
) -> dict:
    """Assign an RBAC role to a user, optionally scoped to an organization."""
    role = RoleRepository(db).find_by_name(role_name)
    if not role:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Role '{role_name}' not found.")

    user_role_repo = UserRoleRepository(db)
    user_role_repo.assign(target_user_id, str(role.id), organization_id)
    return {"user_id": target_user_id, "role": role_name, "organization_id": organization_id}
