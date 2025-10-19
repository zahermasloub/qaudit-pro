\c auditdb
SET search_path TO core, public;

-- Teams and mappings
CREATE TABLE IF NOT EXISTS teams (team_id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT);
CREATE TABLE IF NOT EXISTS user_depts (user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE, dept_id INT REFERENCES depts(dept_id) ON DELETE CASCADE, PRIMARY KEY(user_id,dept_id));
CREATE TABLE IF NOT EXISTS user_teams (user_id BIGINT REFERENCES users(user_id) ON DELETE CASCADE, team_id INT REFERENCES teams(team_id) ON DELETE CASCADE, PRIMARY KEY(user_id,team_id));

-- Strengthen existing checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audits_dates_ck' AND conrelid = 'core.audits'::regclass) THEN
    ALTER TABLE audits ADD CONSTRAINT audits_dates_ck CHECK (period_end >= period_start);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='audits_status_ck' AND conrelid = 'core.audits'::regclass) THEN
    ALTER TABLE audits ADD CONSTRAINT audits_status_ck CHECK (status IN ('planned','open','in_progress','closed','cancelled'));
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='engagements_status_ck' AND conrelid = 'core.engagements'::regclass) THEN
    ALTER TABLE engagements ADD CONSTRAINT engagements_status_ck CHECK (status IN ('open','in_progress','closed','cancelled'));
  END IF;
END$$;

-- Scopes, procedures, and samples
CREATE TABLE IF NOT EXISTS scopes (
  scope_id BIGSERIAL PRIMARY KEY, engagement_id BIGINT NOT NULL REFERENCES engagements(engagement_id) ON DELETE CASCADE,
  title TEXT NOT NULL, objectives TEXT, in_scope TEXT, out_scope TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$
BEGIN
  IF to_regclass('core.scopes') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='scope_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='id') THEN
        ALTER TABLE scopes RENAME COLUMN id TO scope_id;
      ELSE
        ALTER TABLE scopes ADD COLUMN scope_id BIGSERIAL;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='scope_id' AND data_type <> 'bigint') THEN
      ALTER TABLE scopes ALTER COLUMN scope_id TYPE BIGINT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='scope_id' AND is_nullable='YES') THEN
      ALTER TABLE scopes ALTER COLUMN scope_id SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='title') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='name') THEN
        ALTER TABLE scopes RENAME COLUMN name TO title;
      ELSE
        ALTER TABLE scopes ADD COLUMN title TEXT DEFAULT 'Untitled';
        UPDATE scopes SET title = COALESCE(title, 'Untitled');
        ALTER TABLE scopes ALTER COLUMN title SET NOT NULL;
        ALTER TABLE scopes ALTER COLUMN title DROP DEFAULT;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='title' AND is_nullable='YES') THEN
      ALTER TABLE scopes ALTER COLUMN title SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='engagement_id') THEN
      ALTER TABLE scopes ADD COLUMN engagement_id BIGINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_scopes_engagement' AND conrelid='core.scopes'::regclass) THEN
      BEGIN
        ALTER TABLE scopes ADD CONSTRAINT fk_scopes_engagement FOREIGN KEY (engagement_id) REFERENCES engagements(engagement_id) ON DELETE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='objectives') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='description') THEN
        ALTER TABLE scopes RENAME COLUMN description TO objectives;
      ELSE
        ALTER TABLE scopes ADD COLUMN objectives TEXT;
      END IF;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='in_scope') THEN
      ALTER TABLE scopes ADD COLUMN in_scope TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='out_scope') THEN
      ALTER TABLE scopes ADD COLUMN out_scope TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='scopes' AND column_name='created_at') THEN
      ALTER TABLE scopes ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='core.scopes'::regclass AND contype='p') THEN
      ALTER TABLE scopes ADD PRIMARY KEY (scope_id);
    END IF;
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_scopes_engagement ON scopes(engagement_id);

CREATE TABLE IF NOT EXISTS test_procedures (
  procedure_id BIGSERIAL PRIMARY KEY, engagement_id BIGINT NOT NULL REFERENCES engagements(engagement_id) ON DELETE CASCADE,
  title TEXT NOT NULL, steps TEXT, expected_result TEXT, created_by BIGINT REFERENCES users(user_id), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_procedures_engagement ON test_procedures(engagement_id);

CREATE TABLE IF NOT EXISTS samples (
  sample_id BIGSERIAL PRIMARY KEY, procedure_id BIGINT NOT NULL REFERENCES test_procedures(procedure_id) ON DELETE CASCADE,
  reference TEXT, picked_at TIMESTAMPTZ NOT NULL DEFAULT now(), picked_by BIGINT REFERENCES users(user_id), meta JSONB
);
CREATE INDEX IF NOT EXISTS ix_samples_procedure ON samples(procedure_id);

-- Extend attachments with optional foreign keys
ALTER TABLE IF EXISTS attachments
  ADD COLUMN IF NOT EXISTS procedure_id BIGINT REFERENCES test_procedures(procedure_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sample_id    BIGINT REFERENCES samples(sample_id) ON DELETE SET NULL;

-- Risks, controls, and bridges
CREATE TABLE IF NOT EXISTS risks (
  risk_id BIGSERIAL PRIMARY KEY, org_id INT REFERENCES orgs(org_id), dept_id INT REFERENCES depts(dept_id),
  title TEXT NOT NULL, description TEXT, inherent_score SMALLINT CHECK(inherent_score BETWEEN 1 AND 25),
  residual_score SMALLINT CHECK(residual_score BETWEEN 1 AND 25), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$
BEGIN
  IF to_regclass('core.risks') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='risk_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='id') THEN
        ALTER TABLE risks RENAME COLUMN id TO risk_id;
      ELSE
        ALTER TABLE risks ADD COLUMN risk_id BIGSERIAL;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='risk_id' AND data_type <> 'bigint') THEN
      ALTER TABLE risks ALTER COLUMN risk_id TYPE BIGINT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='risk_id' AND is_nullable='YES') THEN
      ALTER TABLE risks ALTER COLUMN risk_id SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='core.risks'::regclass AND contype='p') THEN
      BEGIN
        ALTER TABLE risks ADD PRIMARY KEY (risk_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='title') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='name') THEN
        ALTER TABLE risks RENAME COLUMN name TO title;
      ELSE
        ALTER TABLE risks ADD COLUMN title TEXT;
      END IF;
    END IF;
    UPDATE risks SET title = COALESCE(NULLIF(title,''),'Untitled risk') WHERE title IS NULL OR title = '';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='title' AND is_nullable='YES') THEN
      ALTER TABLE risks ALTER COLUMN title SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='org_id') THEN
      ALTER TABLE risks ADD COLUMN org_id INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='dept_id') THEN
      ALTER TABLE risks ADD COLUMN dept_id INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='inherent_score') THEN
      ALTER TABLE risks ADD COLUMN inherent_score SMALLINT CHECK(inherent_score BETWEEN 1 AND 25);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='residual_score') THEN
      ALTER TABLE risks ADD COLUMN residual_score SMALLINT CHECK(residual_score BETWEEN 1 AND 25);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='created_at') THEN
      ALTER TABLE risks ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_risks_org_id' AND conrelid='core.risks'::regclass) THEN
      BEGIN
        ALTER TABLE risks ADD CONSTRAINT fk_risks_org_id FOREIGN KEY (org_id) REFERENCES orgs(org_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_risks_dept_id' AND conrelid='core.risks'::regclass) THEN
      BEGIN
        ALTER TABLE risks ADD CONSTRAINT fk_risks_dept_id FOREIGN KEY (dept_id) REFERENCES depts(dept_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='risks_inherent_score_check' AND conrelid='core.risks'::regclass)
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='inherent_score') THEN
      BEGIN
        ALTER TABLE risks ADD CONSTRAINT risks_inherent_score_check CHECK(inherent_score BETWEEN 1 AND 25);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='risks_residual_score_check' AND conrelid='core.risks'::regclass)
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='risks' AND column_name='residual_score') THEN
      BEGIN
        ALTER TABLE risks ADD CONSTRAINT risks_residual_score_check CHECK(residual_score BETWEEN 1 AND 25);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_risks_dept ON risks(dept_id);

CREATE TABLE IF NOT EXISTS controls (
  control_id BIGSERIAL PRIMARY KEY, org_id INT REFERENCES orgs(org_id), dept_id INT REFERENCES depts(dept_id),
  title TEXT NOT NULL, description TEXT, control_type TEXT CHECK(control_type IN ('preventive','detective','corrective')), frequency TEXT, owner TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$
BEGIN
  IF to_regclass('core.controls') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='control_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='id') THEN
        ALTER TABLE controls RENAME COLUMN id TO control_id;
      ELSE
        ALTER TABLE controls ADD COLUMN control_id BIGSERIAL;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='control_id' AND data_type <> 'bigint') THEN
      ALTER TABLE controls ALTER COLUMN control_id TYPE BIGINT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='control_id' AND is_nullable='YES') THEN
      ALTER TABLE controls ALTER COLUMN control_id SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='core.controls'::regclass AND contype='p') THEN
      BEGIN
        ALTER TABLE controls ADD PRIMARY KEY (control_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='title') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='name') THEN
        ALTER TABLE controls RENAME COLUMN name TO title;
      ELSE
        ALTER TABLE controls ADD COLUMN title TEXT;
      END IF;
    END IF;
    UPDATE controls SET title = COALESCE(NULLIF(title,''),'Untitled control') WHERE title IS NULL OR title = '';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='title' AND is_nullable='YES') THEN
      ALTER TABLE controls ALTER COLUMN title SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='org_id') THEN
      ALTER TABLE controls ADD COLUMN org_id INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='dept_id') THEN
      ALTER TABLE controls ADD COLUMN dept_id INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='description') THEN
      ALTER TABLE controls ADD COLUMN description TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='control_type') THEN
      ALTER TABLE controls ADD COLUMN control_type TEXT CHECK(control_type IN ('preventive','detective','corrective'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='frequency') THEN
      ALTER TABLE controls ADD COLUMN frequency TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='owner') THEN
      ALTER TABLE controls ADD COLUMN owner TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='created_at') THEN
      ALTER TABLE controls ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_controls_org_id' AND conrelid='core.controls'::regclass) THEN
      BEGIN
        ALTER TABLE controls ADD CONSTRAINT fk_controls_org_id FOREIGN KEY (org_id) REFERENCES orgs(org_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_controls_dept_id' AND conrelid='core.controls'::regclass) THEN
      BEGIN
        ALTER TABLE controls ADD CONSTRAINT fk_controls_dept_id FOREIGN KEY (dept_id) REFERENCES depts(dept_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='controls_control_type_check' AND conrelid='core.controls'::regclass)
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='controls' AND column_name='control_type') THEN
      BEGIN
        ALTER TABLE controls ADD CONSTRAINT controls_control_type_check CHECK(control_type IN ('preventive','detective','corrective'));
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_controls_dept ON controls(dept_id);

CREATE TABLE IF NOT EXISTS procedure_risks (procedure_id BIGINT REFERENCES test_procedures(procedure_id) ON DELETE CASCADE, risk_id BIGINT REFERENCES risks(risk_id) ON DELETE CASCADE, PRIMARY KEY(procedure_id, risk_id));
CREATE TABLE IF NOT EXISTS procedure_controls (procedure_id BIGINT REFERENCES test_procedures(procedure_id) ON DELETE CASCADE, control_id BIGINT REFERENCES controls(control_id) ON DELETE CASCADE, PRIMARY KEY(procedure_id, control_id));

-- Findings, recommendations, and actions
CREATE TABLE IF NOT EXISTS findings (
  finding_id BIGSERIAL PRIMARY KEY, engagement_id BIGINT NOT NULL REFERENCES engagements(engagement_id) ON DELETE CASCADE,
  title TEXT NOT NULL, description TEXT, severity TEXT NOT NULL CHECK(severity IN ('low','medium','high','critical')),
  root_cause TEXT, impact TEXT, likelihood SMALLINT CHECK(likelihood BETWEEN 1 AND 5),
  created_by BIGINT REFERENCES users(user_id), created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed'))
);
CREATE INDEX IF NOT EXISTS ix_findings_engagement ON findings(engagement_id);
CREATE INDEX IF NOT EXISTS ix_findings_severity   ON findings(severity);

CREATE TABLE IF NOT EXISTS recommendations (
  rec_id BIGSERIAL PRIMARY KEY, finding_id BIGINT NOT NULL REFERENCES findings(finding_id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL, priority TEXT NOT NULL CHECK(priority IN ('low','medium','high','critical')),
  owner_dept_id INT REFERENCES depts(dept_id), due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','closed','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ix_recs_finding ON recommendations(finding_id);

CREATE TABLE IF NOT EXISTS actions (
  action_id BIGSERIAL PRIMARY KEY, rec_id BIGINT NOT NULL REFERENCES recommendations(rec_id) ON DELETE CASCADE,
  action_title TEXT NOT NULL, action_detail TEXT, owner_user_id BIGINT REFERENCES users(user_id),
  due_date DATE, status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','in_progress','done','cancelled')),
  progress_pct SMALLINT DEFAULT 0 CHECK(progress_pct BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), closed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS ix_actions_rec   ON actions(rec_id);
CREATE INDEX IF NOT EXISTS ix_actions_owner ON actions(owner_user_id);

-- Status history and trigger
CREATE TABLE IF NOT EXISTS status_history (
  hist_id BIGSERIAL PRIMARY KEY, entity TEXT NOT NULL, entity_id BIGINT NOT NULL,
  old_status TEXT, new_status TEXT NOT NULL, changed_by BIGINT REFERENCES users(user_id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
DO $$
BEGIN
  IF to_regclass('core.status_history') IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='hist_id') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='id') THEN
        ALTER TABLE status_history RENAME COLUMN id TO hist_id;
      ELSE
        ALTER TABLE status_history ADD COLUMN hist_id BIGSERIAL;
      END IF;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='hist_id' AND data_type <> 'bigint') THEN
      ALTER TABLE status_history ALTER COLUMN hist_id TYPE BIGINT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='hist_id' AND is_nullable='YES') THEN
      ALTER TABLE status_history ALTER COLUMN hist_id SET NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='core.status_history'::regclass AND contype='p') THEN
      BEGIN
        ALTER TABLE status_history ADD PRIMARY KEY (hist_id);
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='entity') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='entity_type') THEN
        ALTER TABLE status_history RENAME COLUMN entity_type TO entity;
      ELSE
        ALTER TABLE status_history ADD COLUMN entity TEXT;
      END IF;
    END IF;
    UPDATE status_history SET entity = COALESCE(NULLIF(entity,''),'unknown') WHERE entity IS NULL OR entity = '';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='entity' AND is_nullable='YES') THEN
      ALTER TABLE status_history ALTER COLUMN entity SET NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='entity_id' AND data_type <> 'bigint') THEN
      ALTER TABLE status_history ALTER COLUMN entity_id TYPE BIGINT;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='changed_by' AND data_type <> 'bigint') THEN
      ALTER TABLE status_history ALTER COLUMN changed_by TYPE BIGINT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='status_history' AND column_name='changed_at') THEN
      ALTER TABLE status_history ADD COLUMN changed_at TIMESTAMPTZ NOT NULL DEFAULT now();
    END IF;
  END IF;
END$$;
CREATE INDEX IF NOT EXISTS ix_status_history_entity ON status_history(entity, entity_id, changed_at);

CREATE OR REPLACE FUNCTION log_finding_status_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO status_history(entity, entity_id, old_status, new_status, changed_by)
    VALUES ('finding', NEW.finding_id, OLD.status, NEW.status, NEW.created_by);
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_finding_status ON findings;
CREATE TRIGGER trg_finding_status AFTER UPDATE OF status ON findings FOR EACH ROW EXECUTE FUNCTION log_finding_status_change();

-- Row-level security policies
ALTER TABLE engagements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE findings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE actions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments     ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION core.fn_user_in_scope(u_id BIGINT, d_id INT, t_id INT)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE AS $$
BEGIN
  IF d_id IS NOT NULL AND EXISTS(SELECT 1 FROM user_depts WHERE user_id=u_id AND dept_id=d_id) THEN RETURN TRUE; END IF;
  IF t_id IS NOT NULL AND EXISTS(SELECT 1 FROM user_teams WHERE user_id=u_id AND team_id=t_id) THEN RETURN TRUE; END IF;
  RETURN FALSE;
END $$;

DROP POLICY IF EXISTS p_engagements_read ON engagements;
CREATE POLICY p_engagements_read ON engagements FOR SELECT USING (
  core.fn_user_in_scope(current_setting('app.user_id', true)::BIGINT, dept_id, team_id)
);

DROP POLICY IF EXISTS p_findings_read ON findings;
CREATE POLICY p_findings_read ON findings FOR SELECT USING (
  EXISTS(SELECT 1 FROM engagements e
         WHERE e.engagement_id=findings.engagement_id
           AND core.fn_user_in_scope(current_setting('app.user_id', true)::BIGINT, e.dept_id, e.team_id))
);

DROP POLICY IF EXISTS p_recs_read ON recommendations;
CREATE POLICY p_recs_read ON recommendations FOR SELECT USING (
  EXISTS(SELECT 1 FROM findings f JOIN engagements e ON e.engagement_id=f.engagement_id
         WHERE f.finding_id=recommendations.finding_id
           AND core.fn_user_in_scope(current_setting('app.user_id', true)::BIGINT, e.dept_id, e.team_id))
);

DROP POLICY IF EXISTS p_actions_read ON actions;
CREATE POLICY p_actions_read ON actions FOR SELECT USING (
  EXISTS(SELECT 1 FROM recommendations r
           JOIN findings f ON f.finding_id=r.finding_id
           JOIN engagements e ON e.engagement_id=f.engagement_id
         WHERE r.rec_id=actions.rec_id
           AND core.fn_user_in_scope(current_setting('app.user_id', true)::BIGINT, e.dept_id, e.team_id))
);

DROP POLICY IF EXISTS p_attachments_read ON attachments;
CREATE POLICY p_attachments_read ON attachments FOR SELECT USING (
  EXISTS(SELECT 1 FROM engagements e
         WHERE e.engagement_id=attachments.engagement_id
           AND core.fn_user_in_scope(current_setting('app.user_id', true)::BIGINT, e.dept_id, e.team_id))
);
