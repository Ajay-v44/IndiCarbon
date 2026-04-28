from __future__ import annotations

import uuid as _uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from ..models.user import Profile, Role, UserRole


class ProfileRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, user_id: str) -> Optional[Profile]:
        return self.db.query(Profile).filter(Profile.id == user_id).first()

    def create(self, user_id: str, full_name: str, phone_number: Optional[str], designation: Optional[str]) -> Profile:
        profile = Profile(
            id=_uuid.UUID(user_id),
            full_name=full_name,
            phone_number=phone_number,
            designation=designation,
            is_active=True,
        )
        self.db.add(profile)
        self.db.flush()
        return profile

    def update_last_login(self, user_id: str) -> None:
        self.db.query(Profile).filter(Profile.id == user_id).update(
            {"last_login": datetime.now(timezone.utc)}
        )


class RoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == name).first()

    def find_by_id(self, role_id: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.id == role_id).first()


class UserRoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def assign(self, user_id: str, role_id: str, organization_id: Optional[str] = None) -> UserRole:
        existing = (
            self.db.query(UserRole)
            .filter(UserRole.user_id == user_id, UserRole.role_id == role_id)
            .first()
        )
        if existing:
            return existing

        user_role = UserRole(
            user_id=_uuid.UUID(user_id),
            role_id=_uuid.UUID(role_id),
            organization_id=_uuid.UUID(organization_id) if organization_id else None,
        )
        self.db.add(user_role)
        self.db.flush()
        return user_role

    def get_roles_for_user(self, user_id: str) -> list[UserRole]:
        return (
            self.db.query(UserRole)
            .join(Role, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == user_id)
            .all()
        )
