from __future__ import annotations

from fastapi import Header, HTTPException, status
import jwt
from shared_logic import AuthenticatedUser

from .config import settings


def get_current_user(
    x_user_id: str = Header(default=""),
    x_user_email: str = Header(default=""),
    x_user_roles: str = Header(default=""),
    x_organization_id: str = Header(default=""),
    authorization: str = Header(default=""),
) -> AuthenticatedUser:
    """Resolve the authenticated user from gateway context or a bearer token."""
    if x_user_id:
        return AuthenticatedUser(
            id=x_user_id,
            email=x_user_email or None,
            roles=[role.strip() for role in x_user_roles.split(",") if role.strip()],
            organization_id=x_organization_id or None,
        )

    payload = verify_token_payload(authorization)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    organization_ids = payload.get("organization_ids") or []
    return AuthenticatedUser(
        id=user_id,
        email=payload.get("email"),
        roles=payload.get("roles") or [],
        organization_id=payload.get("organization_id") or (organization_ids[0] if organization_ids else None),
    )


def verify_token_payload(authorization: str = Header(default="")) -> dict:
    """
    Verify app JWT and return the decoded payload.
    Used internally by other services calling the /verify endpoint.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(
            token,
            settings.app_jwt_secret,
            algorithms=[settings.app_jwt_algorithm],
            audience="authenticated",
            issuer="indicarbon-auth",
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token expired.")
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}")
