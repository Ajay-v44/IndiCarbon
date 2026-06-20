"""
libs/shared_logic/system_logger.py
───────────────────────────────────
Standalone, reusable async system log & error capture module.

Design principles:
  - Fire-and-forget: logs are captured via background tasks, never blocking
    the request/response cycle.
  - Organization-scoped: every log entry can be tagged with an org ID for
    multi-tenant filtering.
  - Transport-agnostic core: the LogRecord is a plain dataclass; persistence
    is handled by pluggable backends (default: PostgreSQL via SQLAlchemy).
  - Reusable: zero coupling to any specific project. Import, configure the
    DB engine, and call capture().

Usage (in any FastAPI service)::

    from shared_logic.system_logger import SystemLogger

    logger = SystemLogger.get_instance()
    logger.capture(
        level="ERROR",
        service="compliance",
        message="Benchmark not found for sector 'logistics'",
        organization_id="e2b4ff43-...",
        request_id="abc-123",
        stack_trace=traceback.format_exc(),
        metadata={"sector": "logistics", "fiscal_year": 2026},
    )
"""
from __future__ import annotations

import asyncio
import logging
import traceback
import uuid
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Deque, Optional

from sqlalchemy import (
    Column,
    DateTime,
    Index,
    String,
    Text,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Session

from .database import Base, _get_session_factory

py_logger = logging.getLogger("system_logger")


# ─── Log Level Enum ─────────────────────────────────────────────────────────


class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"


# ─── SQLAlchemy Model ────────────────────────────────────────────────────────


class SystemLogEntry(Base):
    """
    Persistent system log / error record.
    Table: system_logs
    """
    __tablename__ = "system_logs"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    level = Column(String(16), nullable=False, index=True)
    service = Column(String(64), nullable=False, index=True)
    message = Column(Text, nullable=False)

    organization_id = Column(PG_UUID(as_uuid=True), nullable=True, index=True)
    user_id = Column(PG_UUID(as_uuid=True), nullable=True)
    request_id = Column(String(64), nullable=True, index=True)

    http_method = Column(String(10), nullable=True)
    http_path = Column(String(512), nullable=True)
    http_status = Column(String(6), nullable=True)
    duration_ms = Column(String(16), nullable=True)

    stack_trace = Column(Text, nullable=True)
    metadata_ = Column("metadata", JSONB, nullable=True)

    is_resolved = Column(String(5), nullable=False, server_default=text("'false'"))
    resolved_by = Column(PG_UUID(as_uuid=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    __table_args__ = (
        Index("ix_system_logs_created_at", "created_at"),
        Index("ix_system_logs_org_level", "organization_id", "level"),
        Index("ix_system_logs_service_level", "service", "level"),
    )

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": str(self.id),
            "level": self.level,
            "service": self.service,
            "message": self.message,
            "organization_id": str(self.organization_id) if self.organization_id else None,
            "user_id": str(self.user_id) if self.user_id else None,
            "request_id": self.request_id,
            "http_method": self.http_method,
            "http_path": self.http_path,
            "http_status": self.http_status,
            "duration_ms": self.duration_ms,
            "stack_trace": self.stack_trace,
            "metadata": self.metadata_,
            "is_resolved": self.is_resolved == "true",
            "resolved_by": str(self.resolved_by) if self.resolved_by else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ─── In-Memory Buffer (for burst protection) ────────────────────────────────


@dataclass
class _LogBuffer:
    """Ring buffer that batches writes to reduce DB round-trips under load."""
    max_size: int = 50
    flush_interval_seconds: float = 2.0
    _queue: Deque[dict[str, Any]] = field(default_factory=deque)
    _flush_task: Optional[asyncio.Task] = field(default=None, repr=False)

    def append(self, record: dict[str, Any]) -> None:
        self._queue.append(record)
        if len(self._queue) >= self.max_size:
            self._trigger_flush()

    def _trigger_flush(self) -> None:
        try:
            loop = asyncio.get_running_loop()
            if self._flush_task is None or self._flush_task.done():
                self._flush_task = loop.create_task(self._flush())
        except RuntimeError:
            self._flush_sync()

    async def _flush(self) -> None:
        if not self._queue:
            return
        batch = []
        while self._queue:
            batch.append(self._queue.popleft())
        _persist_batch(batch)

    def _flush_sync(self) -> None:
        if not self._queue:
            return
        batch = list(self._queue)
        self._queue.clear()
        _persist_batch(batch)

    async def periodic_flush(self) -> None:
        """Background loop that flushes remaining items periodically."""
        while True:
            await asyncio.sleep(self.flush_interval_seconds)
            await self._flush()


def _persist_batch(batch: list[dict[str, Any]]) -> None:
    """Write a batch of log records to the database in a single transaction."""
    if not batch:
        return
    try:
        factory = _get_session_factory()
        db: Session = factory()
        try:
            for record in batch:
                entry = SystemLogEntry(**record)
                db.add(entry)
            db.commit()
        except Exception:
            db.rollback()
            py_logger.error(
                "Failed to persist %d log records: %s",
                len(batch),
                traceback.format_exc(),
            )
        finally:
            db.close()
    except Exception:
        py_logger.error("Cannot obtain DB session for log persistence: %s", traceback.format_exc())


# ─── SystemLogger Singleton ──────────────────────────────────────────────────


class SystemLogger:
    """
    Async-safe, singleton system logger.

    All public methods are non-blocking. Logs are buffered in memory and
    flushed to PostgreSQL in batches via a background asyncio task.
    """

    _instance: Optional[SystemLogger] = None
    _buffer: _LogBuffer

    def __init__(self) -> None:
        self._buffer = _LogBuffer()
        self._bg_task: Optional[asyncio.Task] = None

    @classmethod
    def get_instance(cls) -> SystemLogger:
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def start_background_flush(self) -> None:
        """Start the periodic flush loop. Call once during app lifespan startup."""
        try:
            loop = asyncio.get_running_loop()
            if self._bg_task is None or self._bg_task.done():
                self._bg_task = loop.create_task(self._buffer.periodic_flush())
                py_logger.info("SystemLogger background flush started")
        except RuntimeError:
            pass

    def capture(
        self,
        *,
        level: str = "ERROR",
        service: str = "unknown",
        message: str,
        organization_id: str | None = None,
        user_id: str | None = None,
        request_id: str | None = None,
        http_method: str | None = None,
        http_path: str | None = None,
        http_status: int | str | None = None,
        duration_ms: int | str | None = None,
        stack_trace: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """
        Fire-and-forget log capture. Never raises, never blocks.
        """
        try:
            record: dict[str, Any] = {
                "id": uuid.uuid4(),
                "level": level.upper(),
                "service": service,
                "message": message[:4096],
                "organization_id": _safe_uuid(organization_id),
                "user_id": _safe_uuid(user_id),
                "request_id": str(request_id)[:64] if request_id else None,
                "http_method": str(http_method)[:10] if http_method else None,
                "http_path": str(http_path)[:512] if http_path else None,
                "http_status": str(http_status)[:6] if http_status else None,
                "duration_ms": str(duration_ms)[:16] if duration_ms else None,
                "stack_trace": stack_trace[:16384] if stack_trace else None,
                "metadata_": metadata,
                "is_resolved": "false",
                "created_at": datetime.now(timezone.utc),
            }
            self._buffer.append(record)
        except Exception:
            py_logger.debug("SystemLogger.capture failed silently: %s", traceback.format_exc())

    def capture_exception(
        self,
        exc: Exception,
        *,
        service: str = "unknown",
        message: str | None = None,
        organization_id: str | None = None,
        user_id: str | None = None,
        request_id: str | None = None,
        http_method: str | None = None,
        http_path: str | None = None,
        http_status: int | str | None = None,
        duration_ms: int | str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Convenience wrapper that extracts message and stack trace from an exception."""
        self.capture(
            level="ERROR",
            service=service,
            message=message or f"{type(exc).__name__}: {exc}",
            organization_id=organization_id,
            user_id=user_id,
            request_id=request_id,
            http_method=http_method,
            http_path=http_path,
            http_status=http_status,
            duration_ms=duration_ms,
            stack_trace=traceback.format_exception(type(exc), exc, exc.__traceback__)
            and "".join(traceback.format_exception(type(exc), exc, exc.__traceback__)),
            metadata=metadata,
        )

    def flush_sync(self) -> None:
        """Force-flush the buffer synchronously (for shutdown)."""
        self._buffer._flush_sync()


# ─── Repository (query layer for admin API) ─────────────────────────────────


class SystemLogRepository:
    """Read/write access to system_logs for the admin API."""

    def __init__(self, db: Session) -> None:
        self._db = db

    def list_logs(
        self,
        *,
        organization_id: str | None = None,
        service: str | None = None,
        level: str | None = None,
        is_resolved: bool | None = None,
        search: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[SystemLogEntry]:
        q = self._db.query(SystemLogEntry)

        if organization_id:
            q = q.filter(SystemLogEntry.organization_id == organization_id)
        if service:
            q = q.filter(SystemLogEntry.service == service)
        if level:
            q = q.filter(SystemLogEntry.level == level)
        if is_resolved is not None:
            q = q.filter(SystemLogEntry.is_resolved == ("true" if is_resolved else "false"))
        if search:
            q = q.filter(SystemLogEntry.message.ilike(f"%{search}%"))

        return (
            q.order_by(SystemLogEntry.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count_logs(
        self,
        *,
        organization_id: str | None = None,
        service: str | None = None,
        level: str | None = None,
        is_resolved: bool | None = None,
        search: str | None = None,
    ) -> int:
        q = self._db.query(SystemLogEntry)

        if organization_id:
            q = q.filter(SystemLogEntry.organization_id == organization_id)
        if service:
            q = q.filter(SystemLogEntry.service == service)
        if level:
            q = q.filter(SystemLogEntry.level == level)
        if is_resolved is not None:
            q = q.filter(SystemLogEntry.is_resolved == ("true" if is_resolved else "false"))
        if search:
            q = q.filter(SystemLogEntry.message.ilike(f"%{search}%"))

        return q.count()

    def get_stats(self, organization_id: str | None = None) -> dict[str, Any]:
        base = self._db.query(SystemLogEntry)
        if organization_id:
            base = base.filter(SystemLogEntry.organization_id == organization_id)

        total = base.count()
        unresolved = base.filter(SystemLogEntry.is_resolved == "false").count()
        errors = base.filter(SystemLogEntry.level == "ERROR").count()
        warnings = base.filter(SystemLogEntry.level == "WARNING").count()
        criticals = base.filter(SystemLogEntry.level == "CRITICAL").count()

        services_raw = (
            self._db.query(SystemLogEntry.service)
            .distinct()
            .all()
        )
        services = [r[0] for r in services_raw]

        return {
            "total": total,
            "unresolved": unresolved,
            "errors": errors,
            "warnings": warnings,
            "criticals": criticals,
            "services": services,
        }

    def resolve(self, log_id: str, resolved_by: str | None = None) -> SystemLogEntry | None:
        entry = self._db.query(SystemLogEntry).filter(SystemLogEntry.id == log_id).first()
        if entry:
            entry.is_resolved = "true"
            entry.resolved_by = _safe_uuid(resolved_by)
            entry.resolved_at = datetime.now(timezone.utc)
            self._db.flush()
        return entry

    def bulk_resolve(self, log_ids: list[str], resolved_by: str | None = None) -> int:
        now = datetime.now(timezone.utc)
        count = (
            self._db.query(SystemLogEntry)
            .filter(SystemLogEntry.id.in_(log_ids))
            .update(
                {
                    SystemLogEntry.is_resolved: "true",
                    SystemLogEntry.resolved_by: _safe_uuid(resolved_by),
                    SystemLogEntry.resolved_at: now,
                },
                synchronize_session="fetch",
            )
        )
        self._db.flush()
        return count

    def delete_old(self, days: int = 90) -> int:
        cutoff = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
        from datetime import timedelta
        cutoff = cutoff - timedelta(days=days)
        count = (
            self._db.query(SystemLogEntry)
            .filter(SystemLogEntry.created_at < cutoff)
            .delete(synchronize_session="fetch")
        )
        self._db.flush()
        return count


# ─── Helpers ─────────────────────────────────────────────────────────────────


def _safe_uuid(value: str | None) -> uuid.UUID | None:
    if not value:
        return None
    try:
        return uuid.UUID(str(value))
    except (ValueError, AttributeError):
        return None
