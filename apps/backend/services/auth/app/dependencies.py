from __future__ import annotations

from fastapi import Header, HTTPException, status
import jwt

from .config import settings


def get_requesting_user(
    x_user_id: str = Header(default=""),
    authorization: str = Header(default=""),
) -> str:
    """
    Resolve the authenticated user.
    External callers send Authorization: Bearer <token>; the gateway may also
    pass X-User-ID after it verifies the token.
    """
    if x_user_id:
        return x_user_id

    payload = verify_token_payload(authorization)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    return str(user_id)


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
