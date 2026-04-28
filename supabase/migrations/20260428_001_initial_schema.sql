-- IndiCarbon AI — Full Schema Migration
-- Run this in the Supabase SQL Editor once.

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ─── 1. Roles Definition ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN',   'Full platform access for IndiCarbon staff'),
    ('SALES',         'IndiCarbon sales team — view orgs and credits'),
    ('GOVT_AUDITOR',  'Government / external auditor — read-only verified data'),
    ('ORG_MANAGER',   'Client org manager — full access within their org'),
    ('ORG_VIEWER',    'Client org viewer — read-only within their org')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. User Profiles ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name    TEXT,
    phone_number VARCHAR(20) UNIQUE,
    designation  TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    last_login   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. RBAC Mapping ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
    user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role_id         UUID REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID,
    PRIMARY KEY (user_id, role_id)
);

-- ─── 4. Organizations ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name                TEXT NOT NULL,
    trade_name                TEXT,
    industry_sector           VARCHAR(100),
    registration_number       VARCHAR(100) UNIQUE,
    tax_id                    VARCHAR(100) UNIQUE,
    headquarters_address      TEXT,
    employee_count_bracket    VARCHAR(50),
    annual_turnover_bracket   VARCHAR(50),
    sustainability_contact_email TEXT,
    subscription_status       VARCHAR(50) DEFAULT 'TRIAL',
    onboarding_date           TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Document Vault ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_vault (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    uploader_id     UUID REFERENCES profiles(id),
    doc_type        VARCHAR(50),
    bucket_name     TEXT NOT NULL DEFAULT 'IndiCarbon',
    file_path       TEXT NOT NULL,
    file_hash       TEXT,
    mime_type       VARCHAR(100),
    is_verified     BOOLEAN DEFAULT FALSE,
    verified_by     UUID REFERENCES profiles(id),
    metadata        JSONB,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Emission Factor Registry ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emission_factors (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factor_key    VARCHAR(100) NOT NULL,
    factor_value  DECIMAL NOT NULL,
    unit          VARCHAR(50) NOT NULL,
    vintage_year  INTEGER NOT NULL,
    source_agency TEXT,
    is_active     BOOLEAN DEFAULT TRUE,
    UNIQUE (factor_key, vintage_year)
);

INSERT INTO emission_factors (factor_key, factor_value, unit, vintage_year, source_agency) VALUES
    ('grid_india',          0.82,  'kgCO2e/kWh', 2024, 'CEA'),
    ('diesel_combustion',   2.68,  'kgCO2e/L',   2024, 'IPCC'),
    ('petrol_combustion',   2.31,  'kgCO2e/L',   2024, 'IPCC'),
    ('air_travel_economy',  0.255, 'kgCO2e/km',  2024, 'ICAO'),
    ('supply_chain_tkm',    1.0,   'kgCO2e/tkm', 2024, 'GHG Protocol'),
    ('waste_mixed',         0.58,  'kgCO2e/kg',  2024, 'BEE'),
    ('grid_india',          0.82,  'kgCO2e/kWh', 2025, 'CEA'),
    ('diesel_combustion',   2.68,  'kgCO2e/L',   2025, 'IPCC'),
    ('petrol_combustion',   2.31,  'kgCO2e/L',   2025, 'IPCC')
ON CONFLICT (factor_key, vintage_year) DO NOTHING;

-- ─── 7. Emission Reports ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emission_reports (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id        UUID REFERENCES organizations(id) ON DELETE CASCADE,
    reporting_period_start DATE NOT NULL,
    reporting_period_end   DATE NOT NULL,
    scope_type             VARCHAR(10),
    document_evidence_id   UUID REFERENCES document_vault(id),
    raw_quantity           DECIMAL,
    activity_unit          VARCHAR(50),
    calculated_tco2e       DECIMAL,
    factor_used_id         UUID REFERENCES emission_factors(id),
    audit_status           VARCHAR(50) DEFAULT 'PENDING_AI_VERIFICATION',
    created_by             UUID REFERENCES profiles(id),
    created_at             TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. Agent Registry ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_registry (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_name    VARCHAR(100),
    agent_type    VARCHAR(50),
    model_version TEXT,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. Agent Interactions (A2A Bus) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_interactions (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_agent_id   UUID REFERENCES agent_registry(id),
    receiver_agent_id UUID REFERENCES agent_registry(id),
    session_id        UUID,
    message_payload   JSONB,
    token_usage       INTEGER,
    response_time_ms  INTEGER,
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 10. Human-in-the-Loop Reviews ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hitl_reviews (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id       UUID REFERENCES organizations(id),
    agent_interaction_id  UUID REFERENCES agent_interactions(id),
    issue_detected        TEXT,
    ai_suggestion         TEXT,
    human_decision        VARCHAR(50),
    reviewer_id           UUID REFERENCES profiles(id),
    reviewed_at           TIMESTAMPTZ
);

-- ─── 11. Carbon Credit Registry ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carbon_credits (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number     VARCHAR(100) UNIQUE NOT NULL,
    vintage_year      INTEGER NOT NULL,
    project_type      VARCHAR(100),
    initial_owner_id  UUID REFERENCES organizations(id),
    current_owner_id  UUID REFERENCES organizations(id),
    status            VARCHAR(20) DEFAULT 'ISSUED',
    created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. Market Orders ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    order_type      VARCHAR(10) NOT NULL,
    quantity        INTEGER NOT NULL,
    price_per_unit  DECIMAL NOT NULL,
    status          VARCHAR(20) DEFAULT 'OPEN',
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Vector Embeddings (pgvector) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS embeddings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content    TEXT NOT NULL,
    metadata   JSONB,
    embedding  VECTOR(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS embeddings_vector_idx
    ON embeddings USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

CREATE OR REPLACE FUNCTION match_embeddings(
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count     INT
)
RETURNS TABLE (id UUID, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
    SELECT id, content, metadata,
           1 - (embedding <=> query_embedding) AS similarity
    FROM   embeddings
    WHERE  1 - (embedding <=> query_embedding) > match_threshold
    ORDER  BY embedding <=> query_embedding
    LIMIT  match_count;
$$;

-- ─── Row-Level Security ────────────────────────────────────────────────────────
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_vault    ENABLE ROW LEVEL SECURITY;
ALTER TABLE emission_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits    ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_orders     ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "profiles_self_access" ON profiles
    FOR ALL USING (auth.uid() = id);

-- Service role bypasses RLS (all backend services use service-role key)
