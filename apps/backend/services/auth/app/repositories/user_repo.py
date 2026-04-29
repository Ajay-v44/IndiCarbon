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
        existing = self.find_by_id(user_id)
        if existing:
            existing.full_name = full_name or existing.full_name
            existing.phone_number = phone_number or existing.phone_number
            existing.designation = designation or existing.designation
            existing.is_active = True
            self.db.flush()
            return existing

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

    def list_all(self, limit: int = 50, offset: int = 0) -> list[Profile]:
        return self.db.query(Profile).order_by(Profile.created_at.desc()).limit(limit).offset(offset).all()

    def list_for_organizations(self, organization_ids: list[str], limit: int = 50, offset: int = 0) -> list[Profile]:
        if not organization_ids:
            return []
        return (
            self.db.query(Profile)
            .join(UserRole, Profile.id == UserRole.user_id)
            .filter(UserRole.organization_id.in_([_uuid.UUID(org_id) for org_id in organization_ids]))
            .distinct()
            .order_by(Profile.created_at.desc())
            .limit(limit)
            .offset(offset)
            .all()
        )


class RoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_name(self, name: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.name == name).first()

    def find_by_id(self, role_id: str) -> Optional[Role]:
        return self.db.query(Role).filter(Role.id == role_id).first()

    def list_all(self) -> list[Role]:
        return self.db.query(Role).order_by(Role.name.asc()).all()


class UserRoleRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def assign(self, user_id: str, role_id: str, organization_id: Optional[str] = None) -> UserRole:
        existing = (
            self.db.query(UserRole)
            .filter(UserRole.user_id == user_id, UserRole.role_id == role_id)
            .filter(UserRole.organization_id == (_uuid.UUID(organization_id) if organization_id else None))
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

    def get_role_names_for_user(self, user_id: str) -> list[str]:
        return [user_role.role.name for user_role in self.get_roles_for_user(user_id) if user_role.role]

    def get_organization_ids_for_user(self, user_id: str) -> list[str]:
        return [
            str(user_role.organization_id)
            for user_role in self.get_roles_for_user(user_id)
            if user_role.organization_id
        ]

    def shares_organization(self, user_id: str, target_user_id: str) -> bool:
        user_orgs = set(self.get_organization_ids_for_user(user_id))
        target_orgs = set(self.get_organization_ids_for_user(target_user_id))
        return bool(user_orgs.intersection(target_orgs))
