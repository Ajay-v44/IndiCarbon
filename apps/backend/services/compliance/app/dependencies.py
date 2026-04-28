from __future__ import annotations

from fastapi import Header, HTTPException, status


def get_requesting_user(x_user_id: str = Header(default="")) -> str:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user context provided. Ensure request passes through the gateway.",
        )
    return x_user_id
