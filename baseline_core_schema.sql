\c auditdb
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION postgres;
SET search_path TO core, public;

CREATE TABLE IF NOT EXISTS roles (role_id SERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL CHECK (char_length(name)<=64), description TEXT);
CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL CHECK (char_length(username)<=64),
  display_name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT,
  password_hash TEXT NOT NULL, password_algo TEXT NOT NULL DEFAULT 'argon2id',
  is_active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_users_username ON users(username);
CREATE TABLE IF NOT EXISTS user_roles (user_id BIGINT, role_id INT, PRIMARY KEY(user_id,role_id));

CREATE TABLE IF NOT EXISTS orgs (org_id SERIAL PRIMARY KEY, name TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS depts (dept_id SERIAL PRIMARY KEY, org_id INT NOT NULL REFERENCES orgs(org_id) ON DELETE RESTRICT, name TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_depts_org ON depts(org_id);

CREATE TABLE IF NOT EXISTS audits (
  audit_id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, org_id INT REFERENCES orgs(org_id),
  period_start DATE NOT NULL, period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned', created_by BIGINT REFERENCES users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagements (
  engagement_id BIGSERIAL PRIMARY KEY, audit_id BIGINT NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  dept_id INT REFERENCES depts(dept_id), scope TEXT, status TEXT NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(), closed_at TIMESTAMPTZ, team_id INT
);
CREATE INDEX IF NOT EXISTS ix_engagements_audit ON engagements(audit_id);
CREATE INDEX IF NOT EXISTS ix_engagements_dept  ON engagements(dept_id);

CREATE TABLE IF NOT EXISTS attachments (
  attachment_id BIGSERIAL PRIMARY KEY, engagement_id BIGINT,
  file_name TEXT NOT NULL, file_ext TEXT, file_size_bytes BIGINT NOT NULL,
  content_type TEXT, storage_path TEXT NOT NULL, sha256 TEXT NOT NULL,
  uploaded_by BIGINT, uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_quarantined BOOLEAN NOT NULL DEFAULT FALSE, notes TEXT
);
DO $$BEGIN
  IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='fk_attachments_engagement_id' AND conrelid='core.attachments'::regclass)
  THEN ALTER TABLE attachments ADD CONSTRAINT fk_attachments_engagement_id FOREIGN KEY(engagement_id) REFERENCES engagements(engagement_id) ON DELETE CASCADE; END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_attachments_eng ON attachments(engagement_id);
CREATE INDEX IF NOT EXISTS ix_attachments_sha ON attachments(sha256);

CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(user_id),
  action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='audit_logs' AND column_name='entity') THEN
    ALTER TABLE audit_logs ADD COLUMN entity TEXT DEFAULT 'unknown';
    UPDATE audit_logs SET entity = 'unknown' WHERE entity IS NULL;
    ALTER TABLE audit_logs ALTER COLUMN entity DROP DEFAULT;
    ALTER TABLE audit_logs ALTER COLUMN entity SET NOT NULL;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='audit_logs' AND column_name='entity_id') THEN
    ALTER TABLE audit_logs ADD COLUMN entity_id TEXT;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='audit_logs' AND column_name='details') THEN
    ALTER TABLE audit_logs ADD COLUMN details JSONB;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='audit_logs' AND column_name='created_at') THEN
    ALTER TABLE audit_logs ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_time ON audit_logs(entity, created_at);
