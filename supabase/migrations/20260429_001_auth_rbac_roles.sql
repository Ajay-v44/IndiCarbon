-- IndiCarbon Auth RBAC tables and defaults.
-- Run in Supabase SQL Editor if your project was created from the older schema.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name    TEXT,
    phone_number VARCHAR(20) UNIQUE,
    designation  TEXT,
    is_active    BOOLEAN DEFAULT TRUE,
    last_login   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_roles (
    id              UUID DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE
);

ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid();
UPDATE user_roles SET id = gen_random_uuid() WHERE id IS NULL;
ALTER TABLE user_roles ALTER COLUMN id SET NOT NULL;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'user_roles'::regclass
          AND conname = 'user_roles_pkey'
    ) THEN
        ALTER TABLE user_roles DROP CONSTRAINT user_roles_pkey;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'user_roles'::regclass
          AND conname = 'user_roles_pkey'
    ) THEN
        ALTER TABLE user_roles ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_scope_unique
    ON user_roles (user_id, role_id, COALESCE(organization_id, '00000000-0000-0000-0000-000000000000'::uuid));

INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN',  'Full platform access for IndiCarbon staff'),
    ('SALES',        'IndiCarbon sales team access'),
    ('GOVT_AUDITOR', 'External auditor read-only access'),
    ('ORG_MANAGER',  'Organization manager access within one organization'),
    ('ORG_VIEWER',   'Read-only access within one organization')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_self_access" ON profiles;
CREATE POLICY "profiles_self_access" ON profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "roles_authenticated_read" ON roles;
CREATE POLICY "roles_authenticated_read" ON roles
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "user_roles_self_read" ON user_roles;
CREATE POLICY "user_roles_self_read" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);
