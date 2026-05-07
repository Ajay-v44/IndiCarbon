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
    organization_ids: list[UUID] = Field(default_factory=list)

    def has_role(self, role_name: str) -> bool:
        return role_name in self.roles

    def can_access_organization(self, organization_id: str | UUID) -> bool:
        if self.has_role("SUPER_ADMIN"):
            return True
        org_id = UUID(str(organization_id))
        return org_id in self.organization_ids


async def get_current_user(request: Request) -> AuthenticatedUser:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header.",
        )
    
    token = auth_header.replace("Bearer ", "").strip()
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/api/v1/users/me",
                params={"token": token}
            )
            response.raise_for_status()
            data = response.json().get("data", {})
            return AuthenticatedUser(
                id=UUID(data.get("id")),
                email=data.get("email"),
                roles=data.get("roles", []),
                organization_ids=[UUID(org_id) for org_id in data.get("organization_ids", [])],
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


def require_organization_access(user: AuthenticatedUser, organization_id: str | UUID) -> None:
    if not user.can_access_organization(organization_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this organization.",
        )
