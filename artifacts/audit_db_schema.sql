-- ملف: audit_db_schema.sql
-- DDL رئيسي لنظام إدارة نشاط التدقيق الداخلي (PostgreSQL)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
) COLLATE "und-x-icu";

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(200) NOT NULL,
    ad_guid UUID,
    role_id INT REFERENCES roles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
) COLLATE "und-x-icu";

CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    year INT NOT NULL,
    status VARCHAR(50),
    created_by INT REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
) COLLATE "und-x-icu";

CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    audit_id INT REFERENCES audits(id),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
) COLLATE "und-x-icu";

CREATE TABLE attachments_meta (
    id SERIAL PRIMARY KEY,
    evidence_id INT REFERENCES evidence(id),
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    sha256 CHAR(64),
    uploaded_by INT REFERENCES users(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
) COLLATE "und-x-icu";

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100),
    operation VARCHAR(10),
    record_id INT,
    changed_by INT,
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    details JSONB
) COLLATE "und-x-icu";

-- إضافة فهارس على الأعمدة المستخدمة في التقارير
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_evidence_audit_id ON evidence(audit_id);
CREATE INDEX idx_attachments_evidence_id ON attachments_meta(evidence_id);

-- دعم العربية عبر ICU Collation
-- باقي الجداول بنفس النمط حسب الحاجة
