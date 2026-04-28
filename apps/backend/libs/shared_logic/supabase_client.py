"""
libs/shared-logic/supabase_client.py
Centralised Supabase client factory — Repository Pattern.
All services import from here to ensure a single connection strategy.
"""
from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Optional
from uuid import UUID

from shared_logic.paths import backend_root
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import Client, create_client

logger = logging.getLogger(__name__)


# ─── Settings ─────────────────────────────────────────────────────────────────


import pathlib as _pathlib
_ROOT = backend_root(_pathlib.Path(__file__), 2)

class SupabaseSettings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ROOT / ".envs" / ".supabase.env"),
        extra="ignore",
    )

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    supabase_jwt_secret: str
    supabase_vector_table: str = "embeddings"
    supabase_vector_dimension: int = 768


@lru_cache
def get_supabase_settings() -> SupabaseSettings:
    return SupabaseSettings()


# ─── Client Factory ───────────────────────────────────────────────────────────


@lru_cache
def get_supabase_client(use_service_role: bool = False) -> Client:
    """
    Returns a cached Supabase client.

    Args:
        use_service_role: If True, uses the service-role key (bypasses RLS).
                          Always False for end-user operations.
    """
    settings = get_supabase_settings()
    key = settings.supabase_service_role_key if use_service_role else settings.supabase_anon_key
    client = create_client(settings.supabase_url, key)
    logger.info("Supabase client initialised (service_role=%s)", use_service_role)
    return client


# ─── Base Repository ──────────────────────────────────────────────────────────


class BaseRepository:
    """
    Abstract repository base — all domain repositories extend this.
    Provides atomic helpers that wrap Supabase PostgREST calls.
    """

    def __init__(self, table: str, *, admin: bool = False) -> None:
        self._table = table
        self._client: Client = get_supabase_client(use_service_role=admin)

    # ── CRUD helpers ──────────────────────────────────────────────────────────

    def find_by_id(self, record_id: UUID | str) -> Optional[dict[str, Any]]:
        res = (
            self._client.table(self._table)
            .select("*")
            .eq("id", str(record_id))
            .single()
            .execute()
        )
        return res.data

    def insert(self, payload: dict[str, Any]) -> dict[str, Any]:
        res = self._client.table(self._table).insert(payload).execute()
        return res.data[0]

    def update(self, record_id: UUID | str, payload: dict[str, Any]) -> dict[str, Any]:
        res = (
            self._client.table(self._table)
            .update(payload)
            .eq("id", str(record_id))
            .execute()
        )
        return res.data[0]

    def delete(self, record_id: UUID | str) -> None:
        self._client.table(self._table).delete().eq("id", str(record_id)).execute()

    def list_all(
        self,
        filters: Optional[dict[str, Any]] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        q = self._client.table(self._table).select("*").limit(limit).offset(offset)
        if filters:
            for col, val in filters.items():
                q = q.eq(col, val)
        return q.execute().data


# ─── Vector Repository (pgvector via Supabase) ────────────────────────────────


class VectorRepository:
    """
    Stores and queries vector embeddings in Supabase using the pgvector extension.
    Replaces ChromaDB — all embeddings live in Postgres.

    Required SQL (run once in Supabase SQL editor):
    ─────────────────────────────────────────────────
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS embeddings (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        content     TEXT NOT NULL,
        metadata    JSONB,
        embedding   VECTOR(768),
        created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 100);

    CREATE OR REPLACE FUNCTION match_embeddings(
        query_embedding VECTOR(768),
        match_threshold FLOAT,
        match_count     INT
    )
    RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity FLOAT)
    LANGUAGE SQL STABLE
    AS $$
        SELECT id, content, metadata,
               1 - (embedding <=> query_embedding) AS similarity
        FROM   embeddings
        WHERE  1 - (embedding <=> query_embedding) > match_threshold
        ORDER  BY embedding <=> query_embedding
        LIMIT  match_count;
    $$;
    """

    def __init__(self) -> None:
        settings = get_supabase_settings()
        self._client: Client = get_supabase_client(use_service_role=True)
        self._table = settings.supabase_vector_table

    def upsert_embedding(
        self,
        content: str,
        embedding: list[float],
        metadata: Optional[dict[str, Any]] = None,
    ) -> str:
        """Stores an embedding and returns the assigned ID."""
        res = self._client.table(self._table).insert(
            {
                "content": content,
                "embedding": embedding,
                "metadata": metadata or {},
            }
        ).execute()
        return res.data[0]["id"]

    def similarity_search(
        self,
        query_embedding: list[float],
        match_threshold: float = 0.78,
        match_count: int = 5,
    ) -> list[dict[str, Any]]:
        """Returns semantically similar documents using cosine similarity."""
        res = self._client.rpc(
            "match_embeddings",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
            },
        ).execute()
        return res.data or []
