-- phase3_schema.sql
-- يوسّع نموذج البيانات في مخطط core لمرحلة "Phase 3" على PostgreSQL 18.
-- ينشئ جداول فرق العمل، الصلاحيات، الإجراءات، المخاطر، الضوابط، العينات، ويوسّع attachments.
-- يضيف قيود CHECK للحالات والأولويات، ويفعّل RLS على الجداول الحساسة.
-- يجب تنفيذ الملف على قاعدة auditdb (psql -d auditdb -f phase3_schema.sql).

-- فرق العمل
CREATE TABLE core.teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT
);

-- ربط المستخدمين بالأقسام
CREATE TABLE core.user_depts (
    user_id INT REFERENCES core.users(id) ON DELETE CASCADE,
    dept_id INT REFERENCES core.depts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, dept_id)
);

-- ربط المستخدمين بالفرق
CREATE TABLE core.user_teams (
    user_id INT REFERENCES core.users(id) ON DELETE CASCADE,
    team_id INT REFERENCES core.teams(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, team_id)
);

-- الصلاحيات/النطاقات
CREATE TABLE core.scopes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) NOT NULL UNIQUE,
    description TEXT
);

-- إجراءات الاختبار
CREATE TABLE core.test_procedures (
    id SERIAL PRIMARY KEY,
    engagement_id INT REFERENCES core.engagements(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(24) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending','in_progress','done','skipped','cancelled'))
);

-- العينات
CREATE TABLE core.samples (
    id SERIAL PRIMARY KEY,
    procedure_id INT REFERENCES core.test_procedures(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    status VARCHAR(24) NOT NULL DEFAULT 'pending',
    CHECK (status IN ('pending','in_progress','done','skipped','cancelled'))
);

-- توسيع attachments
ALTER TABLE core.attachments
    ADD COLUMN procedure_id INT REFERENCES core.test_procedures(id),
    ADD COLUMN sample_id INT REFERENCES core.samples(id);

-- المخاطر
CREATE TABLE core.risks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    risk_level VARCHAR(16) NOT NULL,
    CHECK (risk_level IN ('low','medium','high','critical'))
);

-- الضوابط
CREATE TABLE core.controls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    control_type VARCHAR(16) NOT NULL,
    CHECK (control_type IN ('preventive','detective','corrective'))
);

-- ربط الإجراءات بالمخاطر
CREATE TABLE core.procedure_risks (
    procedure_id INT REFERENCES core.test_procedures(id) ON DELETE CASCADE,
    risk_id INT REFERENCES core.risks(id) ON DELETE CASCADE,
    PRIMARY KEY (procedure_id, risk_id)
);

-- ربط الإجراءات بالضوابط
CREATE TABLE core.procedure_controls (
    procedure_id INT REFERENCES core.test_procedures(id) ON DELETE CASCADE,
    control_id INT REFERENCES core.controls(id) ON DELETE CASCADE,
    PRIMARY KEY (procedure_id, control_id)
);

-- النتائج/الملاحظات
CREATE TABLE core.findings (
    id SERIAL PRIMARY KEY,
    engagement_id INT REFERENCES core.engagements(id) ON DELETE CASCADE,
    procedure_id INT REFERENCES core.test_procedures(id),
    sample_id INT REFERENCES core.samples(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'open',
    owner_id INT REFERENCES core.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (severity IN ('low','medium','high','critical')),
    CHECK (status IN ('open','in_progress','closed','rejected'))
);

-- التوصيات
CREATE TABLE core.recommendations (
    id SERIAL PRIMARY KEY,
    finding_id INT REFERENCES core.findings(id) ON DELETE CASCADE,
    recommendation TEXT NOT NULL,
    priority VARCHAR(16) NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    due_date DATE,
    CHECK (priority IN ('low','medium','high','urgent')),
    CHECK (status IN ('pending','in_progress','implemented','rejected'))
);

-- الإجراءات التصحيحية
CREATE TABLE core.actions (
    id SERIAL PRIMARY KEY,
    recommendation_id INT REFERENCES core.recommendations(id) ON DELETE CASCADE,
    action_desc TEXT NOT NULL,
    owner_id INT REFERENCES core.users(id),
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    due_date DATE,
    completed_at TIMESTAMP,
    CHECK (status IN ('pending','in_progress','done','cancelled'))
);

-- سجل الحالات
CREATE TABLE core.status_history (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(32) NOT NULL,
    entity_id INT NOT NULL,
    old_status VARCHAR(32),
    new_status VARCHAR(32),
    changed_by INT REFERENCES core.users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- فهارس عملية
CREATE INDEX idx_findings_engagement ON core.findings(engagement_id);
CREATE INDEX idx_findings_owner ON core.findings(owner_id);
CREATE INDEX idx_recommendations_finding ON core.recommendations(finding_id);
CREATE INDEX idx_actions_owner ON core.actions(owner_id);
CREATE INDEX idx_attachments_procedure ON core.attachments(procedure_id);
CREATE INDEX idx_attachments_sample ON core.attachments(sample_id);

-- تفعيل RLS على الجداول الحساسة
ALTER TABLE core.engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.attachments ENABLE ROW LEVEL SECURITY;

-- دالة للتحقق من صلاحية المستخدم في النطاق
CREATE OR REPLACE FUNCTION core.fn_user_in_scope(_user_id INT, _dept_id INT, _team_id INT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM core.user_depts WHERE user_id=_user_id AND dept_id=_dept_id)
      OR EXISTS (SELECT 1 FROM core.user_teams WHERE user_id=_user_id AND team_id=_team_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- سياسات RLS (مثال: findings)
DROP POLICY IF EXISTS findings_select ON core.findings;
CREATE POLICY findings_select ON core.findings
  FOR SELECT USING (
    core.fn_user_in_scope(current_setting('app.user_id')::int, (SELECT dept_id FROM core.engagements WHERE id = core.findings.engagement_id), NULL)
  );

-- سياسات مماثلة يمكن تكرارها لباقي الجداول حسب الحاجة.
