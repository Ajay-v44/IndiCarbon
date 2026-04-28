from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=2)
    phone_number: Optional[str] = None
    designation: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: UUID
    email: str


class RefreshRequest(BaseModel):
    refresh_token: str


class VerifyTokenRequest(BaseModel):
    token: str


class VerifyTokenResponse(BaseModel):
    valid: bool
    user_id: Optional[UUID] = None
    email: Optional[str] = None
    role: Optional[str] = None
    expires_at: Optional[datetime] = None


class UserProfile(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    is_active: bool = True
    last_login: Optional[datetime] = None
    created_at: datetime
    roles: list[str] = []


class AssignRoleRequest(BaseModel):
    user_id: UUID
    role_name: str
    organization_id: Optional[UUID] = None
