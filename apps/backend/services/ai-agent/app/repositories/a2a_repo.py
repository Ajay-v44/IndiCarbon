from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from ..models.a2a import A2AMessageRecord, A2ATaskRecord


class A2ATaskRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> A2ATaskRecord:
        record = A2ATaskRecord(id=uuid.uuid4(), **kwargs)
        self.db.add(record)
        self.db.flush()
        return record

    def get_by_task_id(self, task_id: str) -> Optional[A2ATaskRecord]:
        return self.db.query(A2ATaskRecord).filter(A2ATaskRecord.task_id == task_id).first()

    def update_state(self, task_id: str, state: str, **kwargs) -> Optional[A2ATaskRecord]:
        record = self.get_by_task_id(task_id)
        if not record:
            return None
        record.state = state
        record.updated_at = datetime.now(timezone.utc)
        for key, value in kwargs.items():
            if value is not None and hasattr(record, key):
                setattr(record, key, value)
        self.db.flush()
        return record

    def list_tasks(
        self,
        organization_id: Optional[str] = None,
        state: Optional[str] = None,
        skill_id: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[A2ATaskRecord]:
        q = self.db.query(A2ATaskRecord)
        if organization_id:
            q = q.filter(A2ATaskRecord.organization_id == organization_id)
        if state:
            q = q.filter(A2ATaskRecord.state == state)
        if skill_id:
            q = q.filter(A2ATaskRecord.skill_id == skill_id)
        return q.order_by(A2ATaskRecord.created_at.desc()).offset(offset).limit(limit).all()

    def count_tasks(self, organization_id: Optional[str] = None) -> int:
        q = self.db.query(func.count(A2ATaskRecord.id))
        if organization_id:
            q = q.filter(A2ATaskRecord.organization_id == organization_id)
        return q.scalar() or 0

    def get_activity_stats(self, organization_id: Optional[str] = None) -> dict[str, Any]:
        q = self.db.query(A2ATaskRecord)
        if organization_id:
            q = q.filter(A2ATaskRecord.organization_id == organization_id)

        all_tasks = q.all()
        total = len(all_tasks)
        if total == 0:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "failed_tasks": 0,
                "blocked_tasks": 0,
                "avg_duration_ms": 0.0,
                "total_tokens": 0,
                "tasks_by_state": {},
                "tasks_by_skill": {},
                "tasks_by_org": {},
            }

        tasks_by_state: dict[str, int] = {}
        tasks_by_skill: dict[str, int] = {}
        tasks_by_org: dict[str, int] = {}
        total_duration = 0
        total_tokens = 0
        completed = 0
        failed = 0
        blocked = 0

        for t in all_tasks:
            tasks_by_state[t.state] = tasks_by_state.get(t.state, 0) + 1
            if t.skill_id:
                tasks_by_skill[t.skill_id] = tasks_by_skill.get(t.skill_id, 0) + 1
            org_key = str(t.organization_id) if t.organization_id else "unknown"
            tasks_by_org[org_key] = tasks_by_org.get(org_key, 0) + 1
            total_duration += t.duration_ms or 0
            total_tokens += t.token_usage or 0
            if t.state == "completed":
                completed += 1
            elif t.state == "failed":
                failed += 1
            if t.guardrail_blocked:
                blocked += 1

        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "failed_tasks": failed,
            "blocked_tasks": blocked,
            "avg_duration_ms": round(total_duration / total, 1) if total else 0.0,
            "total_tokens": total_tokens,
            "tasks_by_state": tasks_by_state,
            "tasks_by_skill": tasks_by_skill,
            "tasks_by_org": tasks_by_org,
        }


class A2AMessageRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, **kwargs) -> A2AMessageRecord:
        record = A2AMessageRecord(id=uuid.uuid4(), **kwargs)
        self.db.add(record)
        self.db.flush()
        return record

    def list_by_task(self, task_id: str, limit: int = 100) -> list[A2AMessageRecord]:
        return (
            self.db.query(A2AMessageRecord)
            .filter(A2AMessageRecord.task_id == task_id)
            .order_by(A2AMessageRecord.created_at)
            .limit(limit)
            .all()
        )
