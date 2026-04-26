-- ═══════════════════════════════════════════════════════════════════════════
-- IndiCarbon AI — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ─────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ─── Organizations ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    cin             TEXT UNIQUE,                        -- Company Identification Number
    gstin           TEXT,
    sector          TEXT,
    revenue_crore   NUMERIC(18, 2),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_member_read" ON organizations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM org_members WHERE organization_id = organizations.id
        )
    );

-- ─── Org Members (link Supabase auth users to orgs) ─────────────────────────

CREATE TABLE IF NOT EXISTS org_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role            TEXT NOT NULL DEFAULT 'viewer',    -- admin | editor | viewer
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_own_rows" ON org_members
    FOR SELECT USING (auth.uid() = user_id);

-- ─── Emission Entries ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS emission_entries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    fiscal_year         INTEGER NOT NULL,
    scope               TEXT NOT NULL CHECK (scope IN ('scope_1', 'scope_2', 'scope_3')),
    category            TEXT NOT NULL,
    activity_data       NUMERIC(18, 6) NOT NULL,
    activity_unit       TEXT NOT NULL,
    emission_factor_used NUMERIC(18, 6) NOT NULL,
    co2e_tonnes         NUMERIC(18, 6) NOT NULL,
    notes               TEXT,
    created_by          UUID,
    calculated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_emission_org_year ON emission_entries(organization_id, fiscal_year);
ALTER TABLE emission_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "emission_org_member" ON emission_entries
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
        )
    );

-- ─── Carbon Credits (Registry Ledger) ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS carbon_credits (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registry_serial TEXT UNIQUE NOT NULL,
    project_id      UUID NOT NULL,
    vintage_year    INTEGER NOT NULL,
    standard        TEXT NOT NULL,                      -- Verra VCS | Gold Standard | CDM
    quantity_tonnes NUMERIC(18, 6) NOT NULL,
    status          TEXT NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'reserved', 'retired', 'cancelled')),
    owner_org_id    UUID NOT NULL REFERENCES organizations(id),
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    retired_at      TIMESTAMPTZ
);

CREATE INDEX idx_credit_owner     ON carbon_credits(owner_org_id);
CREATE INDEX idx_credit_project   ON carbon_credits(project_id, vintage_year);
CREATE INDEX idx_credit_status    ON carbon_credits(status);

ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "credit_owner_read" ON carbon_credits
    FOR SELECT USING (
        owner_org_id IN (
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
        )
    );

-- ─── Orders ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    side                TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    credit_project_id   UUID NOT NULL,
    vintage_year        INTEGER NOT NULL,
    quantity_tonnes     NUMERIC(18, 6) NOT NULL,
    price_per_tonne_inr NUMERIC(18, 2) NOT NULL,
    status              TEXT NOT NULL DEFAULT 'open'
                            CHECK (status IN ('open', 'filled', 'partially_filled', 'cancelled')),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_org    ON orders(organization_id);
CREATE INDEX idx_order_status ON orders(status, side, credit_project_id, vintage_year);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_org_member" ON orders
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
        )
    );

-- ─── Trades ──────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS trades (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_org_id        UUID NOT NULL REFERENCES organizations(id),
    seller_org_id       UUID NOT NULL REFERENCES organizations(id),
    credit_ids          UUID[] NOT NULL,
    quantity_tonnes     NUMERIC(18, 6) NOT NULL,
    price_per_tonne_inr NUMERIC(18, 2) NOT NULL,
    total_value_inr     NUMERIC(18, 2) NOT NULL,
    registry_serials    TEXT[] NOT NULL,
    settled_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trade_buyer  ON trades(buyer_org_id);
CREATE INDEX idx_trade_seller ON trades(seller_org_id);

ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_participant_read" ON trades
    FOR SELECT USING (
        buyer_org_id IN (SELECT organization_id FROM org_members WHERE user_id = auth.uid())
        OR
        seller_org_id IN (SELECT organization_id FROM org_members WHERE user_id = auth.uid())
    );

-- ─── Vector Embeddings (replaces ChromaDB) ────────────────────────────────────

CREATE TABLE IF NOT EXISTS embeddings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content     TEXT NOT NULL,
    metadata    JSONB DEFAULT '{}',
    embedding   VECTOR(768),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- IVFFlat index for fast approximate nearest-neighbour search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Similarity search function (called by VectorRepository)
CREATE OR REPLACE FUNCTION match_embeddings(
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count     INT
)
RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE
AS $$
    SELECT
        id,
        content,
        metadata,
        1 - (embedding <=> query_embedding) AS similarity
    FROM   embeddings
    WHERE  1 - (embedding <=> query_embedding) > match_threshold
    ORDER  BY embedding <=> query_embedding
    LIMIT  match_count;
$$;

-- Embeddings are service-role only (AI agent) — no RLS user policy needed
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;

-- ─── Agent Run History ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_runs (
    id              UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id),
    agent_type      TEXT NOT NULL CHECK (agent_type IN ('auditor', 'strategist')),
    query           TEXT NOT NULL,
    answer          TEXT NOT NULL,
    tool_calls      JSONB DEFAULT '[]',
    trace_url       TEXT,
    duration_ms     INTEGER,
    completed_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_run_org ON agent_runs(organization_id);

ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agent_run_org_member" ON agent_runs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
        )
    );
