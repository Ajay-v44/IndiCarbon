-- A2A (Agent-to-Agent) Protocol Tables
-- Tracks all A2A task lifecycle and messages per organization

CREATE TABLE IF NOT EXISTS a2a_tasks (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id       VARCHAR(100) NOT NULL UNIQUE,
    session_id    VARCHAR(100),
    organization_id UUID,
    user_id       UUID,
    skill_id      VARCHAR(100),
    state         VARCHAR(30) NOT NULL DEFAULT 'submitted',
    query         TEXT NOT NULL,
    answer        TEXT,
    artifacts     JSONB DEFAULT '[]'::jsonb,
    history       JSONB DEFAULT '[]'::jsonb,
    metadata      JSONB DEFAULT '{}'::jsonb,
    token_usage   INTEGER DEFAULT 0,
    duration_ms   INTEGER DEFAULT 0,
    guardrail_blocked BOOLEAN DEFAULT FALSE,
    guardrail_audit   JSONB DEFAULT '{}'::jsonb,
    sender_agent_id   UUID REFERENCES agent_registry(id),
    error_message     TEXT,
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS a2a_messages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id    VARCHAR(100) NOT NULL,
    role       VARCHAR(10) NOT NULL,
    parts      JSONB NOT NULL,
    metadata   JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_org ON a2a_tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_state ON a2a_tasks(state);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_session ON a2a_tasks(session_id);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_created ON a2a_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_a2a_tasks_skill ON a2a_tasks(skill_id);
CREATE INDEX IF NOT EXISTS idx_a2a_messages_task ON a2a_messages(task_id);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_a2a_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_a2a_tasks_updated_at ON a2a_tasks;
CREATE TRIGGER trg_a2a_tasks_updated_at
    BEFORE UPDATE ON a2a_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_a2a_tasks_updated_at();
