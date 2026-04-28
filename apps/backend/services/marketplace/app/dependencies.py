from __future__ import annotations

from fastapi import Header, HTTPException, Request, status


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user context. All requests must pass through the gateway.",
        )
    return x_user_id


def get_redis(request: Request):
    """Retrieve the Redis pool stored in app state during lifespan."""
    redis = getattr(request.app.state, "redis", None)
    if redis is None:
        raise HTTPException(status_code=503, detail="Redis unavailable.")
    return redis
