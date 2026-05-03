from __future__ import annotations

from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from pydantic import BaseModel, Field, ValidationError


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


def get_current_user(
    x_user_id: str = Header(default=""),
    x_user_email: str = Header(default=""),
    x_user_roles: str = Header(default=""),
    x_organization_ids: str = Header(default=""),
) -> AuthenticatedUser:
    if not x_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user context provided. Ensure request passes through the gateway.",
        )

    try:
        return AuthenticatedUser(
            id=UUID(x_user_id),
            email=x_user_email or None,
            roles=_split_header_list(x_user_roles),
            organization_ids=[UUID(value) for value in _split_header_list(x_organization_ids)],
        )
    except (ValueError, ValidationError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user context.")


def get_requesting_user(user: AuthenticatedUser = Depends(get_current_user)) -> str:
    return str(user.id)


def require_organization_access(user: AuthenticatedUser, organization_id: str | UUID) -> None:
    if not user.can_access_organization(organization_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access this organization.",
        )


def _split_header_list(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]
