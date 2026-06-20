-- Migration: Create system_logs table
-- Run this against your Supabase/PostgreSQL database.
-- This table stores all system logs and errors captured by the SystemLogger.

CREATE TABLE IF NOT EXISTS system_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level           VARCHAR(16)  NOT NULL,
    service         VARCHAR(64)  NOT NULL,
    message         TEXT         NOT NULL,

    organization_id UUID,
    user_id         UUID,
    request_id      VARCHAR(64),

    http_method     VARCHAR(10),
    http_path       VARCHAR(512),
    http_status     VARCHAR(6),
    duration_ms     VARCHAR(16),

    stack_trace     TEXT,
    metadata        JSONB,

    is_resolved     VARCHAR(5)   NOT NULL DEFAULT 'false',
    resolved_by     UUID,
    resolved_at     TIMESTAMPTZ,

    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS ix_system_logs_level          ON system_logs (level);
CREATE INDEX IF NOT EXISTS ix_system_logs_service        ON system_logs (service);
CREATE INDEX IF NOT EXISTS ix_system_logs_organization_id ON system_logs (organization_id);
CREATE INDEX IF NOT EXISTS ix_system_logs_request_id     ON system_logs (request_id);
CREATE INDEX IF NOT EXISTS ix_system_logs_created_at     ON system_logs (created_at);
CREATE INDEX IF NOT EXISTS ix_system_logs_org_level      ON system_logs (organization_id, level);
CREATE INDEX IF NOT EXISTS ix_system_logs_service_level  ON system_logs (service, level);

-- Enable Row Level Security (optional, for Supabase)
-- ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Auto-cleanup: delete logs older than 90 days (run via pg_cron or scheduled task)
-- DELETE FROM system_logs WHERE created_at < now() - INTERVAL '90 days';
