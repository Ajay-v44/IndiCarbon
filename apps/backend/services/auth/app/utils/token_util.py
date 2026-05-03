import jwt as pyjwt
from datetime import datetime, timedelta, timezone

from ..config import settings


def _create_app_access_token(
    user_id: str,
    email: str,
    roles: list[str] | None = None,
    organization_ids: list[str] | None = None,
) -> str:
    now = datetime.now(tz=timezone.utc)
    expires_at = now + timedelta(seconds=settings.app_access_token_expires_in)
    payload = {
        "sub": user_id,
        "email": email,
        "roles": roles or [],
        "organization_ids": organization_ids or [],
        "aud": "authenticated",
        "iss": "indicarbon-auth",
        "iat": now,
        "exp": expires_at,
    }
    return pyjwt.encode(payload, settings.app_jwt_secret, algorithm=settings.app_jwt_algorithm)


def _decode_app_access_token(token: str) -> dict:
    return pyjwt.decode(
        token,
        settings.app_jwt_secret,
        algorithms=[settings.app_jwt_algorithm],
        audience="authenticated",
        issuer="indicarbon-auth",
    )
