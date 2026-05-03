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
    RoleResponse,
    TokenResponse,
    UserProfile,
    VerifyTokenResponse,
)
from ..utils.token_util import _create_app_access_token, _decode_app_access_token

logger = logging.getLogger(__name__)

PLATFORM_ROLES = {"SUPER_ADMIN", "SALES", "GOVT_AUDITOR"}
ORG_ROLES = {"ORG_MANAGER", "ORG_VIEWER"}
DEFAULT_ROLE = "ORG_VIEWER"


# ─── Auth — Pure Functions ────────────────────────────────────────────────────


async def register(
    req: RegisterRequest,
    db: Session,
    supabase_admin: Client,
    supabase_public: Client,
) -> TokenResponse:
    """Register and activate a user through Supabase Auth, then persist app data via ORM."""
    user = None
    try:
        res = supabase_admin.auth.admin.create_user(
            {
                "email": req.email,
                "password": req.password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": req.full_name,
                    "phone_number": req.phone_number,
                    "designation": req.designation,
                    "is_active": True,
                    "email_verified": True,
                    "required": True,
                },
            }
        )
    except Exception as exc:
        detail = _supabase_error_detail(exc) or "Registration failed."
        if "already" in detail.lower() or "registered" in detail.lower():
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

    user = res.user
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Supabase did not return a user.",
        )

    try:
        profile_repo = ProfileRepository(db)
        role_repo = RoleRepository(db)
        user_role_repo = UserRoleRepository(db)

        profile_repo.create(
            user_id=str(user.id),
            full_name=req.full_name,
            phone_number=req.phone_number,
            designation=req.designation,
        )

        default_role = role_repo.find_by_name(DEFAULT_ROLE)
        if default_role:
            user_role_repo.assign(str(user.id), str(default_role.id))
        else:
            logger.warning("Default role %s not found; registered user without role: %s", DEFAULT_ROLE, user.id)

        db.commit()
    except Exception:
        db.rollback()
        try:
            supabase_admin.auth.admin.delete_user(str(user.id))
        except Exception:
            logger.exception("Failed to clean up auth user after profile persistence failed: %s", user.id)
        raise

    logger.info("Registered new user: %s", user.email)

    try:
        session_res = supabase_public.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception as exc:
        detail = _supabase_error_detail(exc) or "Registration succeeded, but login failed."
        raise HTTPException(status_code=status.HTTP_201_CREATED, detail=detail)

    session = session_res.session
    if not session:
        raise HTTPException(status_code=status.HTTP_201_CREATED, detail="Registration succeeded, but no session was returned.")

    return TokenResponse(
        access_token=_create_user_access_token(str(user.id), user.email or req.email, db),
        refresh_token=session.refresh_token,
        expires_in=settings.app_access_token_expires_in,
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
    except Exception as exc:
        detail = _supabase_error_detail(exc) or "Invalid credentials."
        status_code = status.HTTP_403_FORBIDDEN if "confirm" in detail.lower() else status.HTTP_401_UNAUTHORIZED
        raise HTTPException(status_code=status_code, detail=detail)

    user, session = res.user, res.session
    if not user or not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")

    ProfileRepository(db).update_last_login(str(user.id))
    logger.info("User logged in: %s", user.email)

    return TokenResponse(
        access_token=_create_user_access_token(str(user.id), user.email or req.email, db),
        refresh_token=session.refresh_token,
        expires_in=settings.app_access_token_expires_in,
        user_id=UUID(str(user.id)),
        email=user.email or req.email,
    )


async def refresh_token(refresh_token_str: str, supabase: Client, db: Session) -> TokenResponse:
    """Exchange a refresh token for a new access token."""
    try:
        res = supabase.auth.refresh_session(refresh_token_str)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired refresh token.")

    user, session = res.user, res.session
    if not user or not session:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Failed to refresh session.")

    return TokenResponse(
        access_token=_create_user_access_token(str(user.id), user.email or "", db),
        refresh_token=session.refresh_token,
        expires_in=settings.app_access_token_expires_in,
        user_id=UUID(str(user.id)),
        email=user.email or "",
    )


def verify_token(token: str, db: Session) -> VerifyTokenResponse:
    """Decode and validate an app JWT. Returns user context for gateway injection."""
    try:
        payload = _decode_app_access_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise pyjwt.InvalidTokenError("Missing subject claim.")
        exp = payload.get("exp")
        expires_at = datetime.fromtimestamp(exp, tz=timezone.utc) if exp else None

        user_roles = UserRoleRepository(db).get_roles_for_user(user_id) if user_id else []
        role_names = [ur.role.name for ur in user_roles if ur.role]
        organization_ids = [ur.organization_id for ur in user_roles if ur.organization_id]
        primary_role = role_names[0] if role_names else None

        return VerifyTokenResponse(
            valid=True,
            user_id=UUID(user_id) if user_id else None,
            email=payload.get("email"),
            role=primary_role,
            roles=role_names,
            organization_ids=organization_ids,
            expires_at=expires_at,
        )
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")


def get_user_profile(token: str, db: Session, supabase_admin: Client) -> UserProfile:
    """Load profile + roles from DB and combine with Supabase Auth email."""
    try:
        payload = _decode_app_access_token(token)
    except pyjwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token.")
    return _build_user_profile_by_id(user_id, db, supabase_admin)


def _build_user_profile_by_id(user_id: str, db: Session, supabase_admin: Client) -> UserProfile:
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
    organization_ids = [ur.organization_id for ur in user_roles if ur.organization_id]

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
        organization_ids=organization_ids,
    )


def list_user_profiles(
    requesting_user_id: str,
    db: Session,
    supabase_admin: Client,
    limit: int = 50,
    offset: int = 0,
) -> list[UserProfile]:
    """SUPER_ADMIN sees all users; org users see users in their assigned organizations."""
    user_role_repo = UserRoleRepository(db)
    role_names = user_role_repo.get_role_names_for_user(requesting_user_id)
    if "SUPER_ADMIN" in role_names:
        profiles = ProfileRepository(db).list_all(limit=limit, offset=offset)
    else:
        org_ids = user_role_repo.get_organization_ids_for_user(requesting_user_id)
        profiles = ProfileRepository(db).list_for_organizations(org_ids, limit=limit, offset=offset)
    return [_profile_to_user_response(profile, db, supabase_admin) for profile in profiles]


def get_visible_user_profile(
    target_user_id: str,
    requesting_user_id: str,
    db: Session,
    supabase_admin: Client,
) -> UserProfile:
    if target_user_id != requesting_user_id:
        _require_user_visible(requesting_user_id, target_user_id, db)
    return _build_user_profile_by_id(target_user_id, db, supabase_admin)


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

    if role.name in ORG_ROLES and not organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{role.name}' must be assigned with an organization_id.",
        )
    if role.name in PLATFORM_ROLES and organization_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role '{role.name}' is platform-wide and should not include organization_id.",
        )

    user_role_repo = UserRoleRepository(db)
    user_role_repo.assign(target_user_id, str(role.id), organization_id)
    return {"user_id": target_user_id, "role": role_name, "organization_id": organization_id}


def assign_role_as_admin(
    requesting_user_id: str,
    target_user_id: str,
    role_name: str,
    organization_id: str | None,
    db: Session,
) -> dict:
    _require_super_admin(requesting_user_id, db)
    return assign_role_to_user(target_user_id, role_name, organization_id, db)


def list_roles(db: Session) -> list[RoleResponse]:
    return [
        RoleResponse(id=role.id, name=role.name, description=role.description)
        for role in RoleRepository(db).list_all()
    ]


def require_super_admin(user_id: str, db: Session) -> None:
    _require_super_admin(user_id, db)


def user_can_access_organization(user_id: str, organization_id: str, db: Session) -> bool:
    user_role_repo = UserRoleRepository(db)
    role_names = user_role_repo.get_role_names_for_user(user_id)
    if "SUPER_ADMIN" in role_names:
        return True
    return organization_id in user_role_repo.get_organization_ids_for_user(user_id)


def user_organization_ids(user_id: str, db: Session) -> list[str]:
    return UserRoleRepository(db).get_organization_ids_for_user(user_id)


def _profile_to_user_response(profile, db: Session, supabase_admin: Client) -> UserProfile:
    return _build_user_profile_by_id(str(profile.id), db, supabase_admin)


def _create_user_access_token(user_id: str, email: str, db: Session) -> str:
    user_role_repo = UserRoleRepository(db)
    return _create_app_access_token(
        user_id,
        email,
        roles=user_role_repo.get_role_names_for_user(user_id),
        organization_ids=user_role_repo.get_organization_ids_for_user(user_id),
    )




def _require_user_visible(requesting_user_id: str, target_user_id: str, db: Session) -> None:
    user_role_repo = UserRoleRepository(db)
    if "SUPER_ADMIN" in user_role_repo.get_role_names_for_user(requesting_user_id):
        return
    if user_role_repo.shares_organization(requesting_user_id, target_user_id):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You cannot view this user.")


def _require_super_admin(user_id: str, db: Session) -> None:
    if "SUPER_ADMIN" not in UserRoleRepository(db).get_role_names_for_user(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="SUPER_ADMIN role required.")


def _supabase_error_detail(exc: Exception) -> str:
    for attr in ("message", "error_description", "detail"):
        value = getattr(exc, attr, None)
        if value:
            return str(value)
    return str(exc)
