from __future__ import annotations

import pathlib
from functools import lru_cache
from typing import Generator

from shared_logic.paths import backend_root
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker
from pydantic_settings import BaseSettings, SettingsConfigDict

_ROOT = backend_root(pathlib.Path(__file__), 2)


class _DBSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT / ".envs" / ".supabase.env"),
        extra="ignore",
    )
    supabase_db_url: str


@lru_cache
def _get_db_settings() -> _DBSettings:
    return _DBSettings()


@lru_cache
def _get_engine():
    url = _get_db_settings().supabase_db_url
    return create_engine(
        url,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        echo=False,
    )


_SessionFactory: sessionmaker | None = None


def _get_session_factory() -> sessionmaker:
    global _SessionFactory
    if _SessionFactory is None:
        _SessionFactory = sessionmaker(
            bind=_get_engine(),
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )
    return _SessionFactory


class Base(DeclarativeBase):
    """Shared declarative base — all ORM models in every service extend this."""
    pass


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency — yields a SQLAlchemy session per request."""
    factory = _get_session_factory()
    db: Session = factory()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
