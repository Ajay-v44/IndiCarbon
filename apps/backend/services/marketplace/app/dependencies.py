from __future__ import annotations

from fastapi import HTTPException, Request
from shared_logic import AuthenticatedUser, get_current_user, get_requesting_user, require_organization_access


def get_redis(request: Request):
    """Retrieve the Redis pool stored in app state during lifespan."""
    redis = getattr(request.app.state, "redis", None)
    if redis is None:
        raise HTTPException(status_code=503, detail="Redis unavailable.")
    return redis


__all__ = [
    "AuthenticatedUser",
    "get_current_user",
    "get_requesting_user",
    "require_organization_access",
    "get_redis",
]
