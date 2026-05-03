from __future__ import annotations

from fastapi import Header, HTTPException, status
import jwt

from .config import settings


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    """Extract authenticated user ID injected by the gateway."""
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user context provided.",
        )
    return x_user_id


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
