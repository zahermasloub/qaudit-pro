-- baseline_core_schema.sql
-- الغرض: إنشاء المخطط core وجميع الجداول الأساسية المشار إليها في Phase 3 بأقل أعمدة لازمة للتكامل. آمن للإعادة (IF NOT EXISTS).
-- التشغيل: psql -U postgres -d auditdb -f baseline_core_schema.sql

\c auditdb
CREATE SCHEMA IF NOT EXISTS core AUTHORIZATION postgres;
SET search_path TO core, public;


-- إعادة تعريف users ليكون العمود الأساسي user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='id') THEN
    ALTER TABLE core.users RENAME COLUMN id TO user_id;
    BEGIN
      ALTER TABLE core.users DROP CONSTRAINT users_pkey;
    EXCEPTION WHEN undefined_object THEN NULL; END;
    ALTER TABLE core.users ADD PRIMARY KEY (user_id);
  END IF;
END$$;

-- تأكد من وجود الأعمدة الأخرى (للتكامل)
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS password_algo TEXT DEFAULT 'argon2id';
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE core.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
CREATE INDEX IF NOT EXISTS ix_users_username ON core.users(username);


CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE,
  role_id INT    REFERENCES roles(role_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 2) هيكل الجهات/الأقسام
CREATE TABLE IF NOT EXISTS orgs (
  org_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS depts (
  dept_id SERIAL PRIMARY KEY,
  org_id INT NOT NULL REFERENCES orgs(org_id) ON DELETE RESTRICT,
  name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_depts_org ON depts(org_id);

-- 3) برنامج التدقيق والارتباطات
CREATE TABLE IF NOT EXISTS audits (
  audit_id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  org_id INT REFERENCES orgs(org_id),
  period_start DATE NOT NULL,
  period_end DATE   NOT NULL,
  status TEXT NOT NULL DEFAULT 'planned',
  created_by BIGINT REFERENCES users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS engagements (
  engagement_id BIGSERIAL PRIMARY KEY,
  audit_id BIGINT NOT NULL REFERENCES audits(audit_id) ON DELETE CASCADE,
  dept_id INT REFERENCES depts(dept_id),
  scope TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ,
  team_id INT
);
CREATE INDEX IF NOT EXISTS ix_engagements_audit ON engagements(audit_id);
CREATE INDEX IF NOT EXISTS ix_engagements_dept ON engagements(dept_id);

-- 4) المرفقات (Metadata فقط؛ الملفات على NTFS)
CREATE TABLE IF NOT EXISTS attachments (
  attachment_id BIGSERIAL PRIMARY KEY,
  engagement_id BIGINT REFERENCES engagements(engagement_id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_ext TEXT,
  file_size_bytes BIGINT NOT NULL,
  content_type TEXT,
  storage_path TEXT NOT NULL,
  sha256 TEXT NOT NULL,
  uploaded_by BIGINT REFERENCES users(user_id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_quarantined BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS ix_attachments_eng ON attachments(engagement_id);
CREATE INDEX IF NOT EXISTS ix_attachments_sha ON attachments(sha256);

-- 5) سجل تدقيق للنظام
CREATE TABLE IF NOT EXISTS audit_logs (
  log_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(user_id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_audit_logs_entity_time ON audit_logs(entity, created_at);

-- 6) دالة تحديث الطابع الزمني (اختيارية)
CREATE OR REPLACE FUNCTION core.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
DROP TRIGGER IF EXISTS trg_users_touch ON users;
CREATE TRIGGER trg_users_touch BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
