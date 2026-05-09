from __future__ import annotations

import os
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
import httpx

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8004")

class AuthenticatedUser(BaseModel):
    id: UUID
    email: str | None = None
    roles: list[str] = Field(default_factory=list)
    organization_id: UUID | None = None

    def has_role(self, role_name: str) -> bool:
        return role_name in self.roles

    def can_access_organization(self, organization_id: str | UUID) -> bool:
        if self.has_role("SUPER_ADMIN"):
            return True
        if self.organization_id is None:
            return False
        org_id = UUID(str(organization_id))
        return org_id == self.organization_id


async def get_current_user(request: Request) -> AuthenticatedUser:
    user_id = request.headers.get("X-User-ID")
    if user_id:
        organization_id = _resolve_organization_id(
            request.headers.get("X-Organization-ID"),
            request.headers.get("X-Organization-IDs"),
        )
        roles = [
            role.strip()
            for role in request.headers.get("X-User-Roles", "").split(",")
            if role.strip()
        ]
        return AuthenticatedUser(
            id=UUID(user_id),
            email=request.headers.get("X-User-Email") or None,
            roles=roles,
            organization_id=organization_id,
        )

    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    
    token = auth_header.replace("Bearer ", "").strip()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{AUTH_SERVICE_URL}/api/v1/auth/verify",
                json={"token": token},
            )
            response.raise_for_status()
            data = response.json().get("data", {})
            return AuthenticatedUser(
                id=UUID(data.get("user_id")),
                email=data.get("email"),
                roles=data.get("roles", []),
                organization_id=_resolve_organization_id(
                    data.get("organization_id"),
                    data.get("organization_ids"),
                ),
            )
        except httpx.HTTPStatusError as e:
            detail = "Invalid token."
            try:
                detail = e.response.json().get("message", detail)
            except:
                pass
            raise HTTPException(status_code=e.response.status_code, detail=detail)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid user context: {str(e)}",
            )


def get_requesting_user(user: AuthenticatedUser = Depends(get_current_user)) -> str:
    return str(user.id)


def _resolve_organization_id(
    organization_id: str | UUID | None,
    organization_ids: str | list[str | UUID] | None,
) -> UUID | None:
    if organization_id:
        return UUID(str(organization_id))
    if isinstance(organization_ids, str):
        organization_ids = [org_id.strip() for org_id in organization_ids.split(",") if org_id.strip()]
    if organization_ids:
        return UUID(str(organization_ids[0]))
    return None


def require_organization_access(user: AuthenticatedUser, organization_id: str | UUID) -> None:
    if not user.can_access_organization(organization_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this organization.",
        )
