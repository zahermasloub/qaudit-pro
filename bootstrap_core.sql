-- bootstrap_core.sql
-- إنشاء الجداول الأساسية لمخطط core: roles, users, user_roles, audit_logs, attachments
-- يجب تنفيذ هذا الملف على قاعدة auditdb بعد التثبيت.

CREATE SCHEMA IF NOT EXISTS core;

CREATE TABLE core.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE core.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    password_algo VARCHAR(16) NOT NULL CHECK (password_algo IN ('argon2id', 'bcrypt')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.user_roles (
    user_id INT REFERENCES core.users(id) ON DELETE CASCADE,
    role_id INT REFERENCES core.roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE core.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id INT REFERENCES core.users(id),
    action VARCHAR(128) NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE core.attachments (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by INT REFERENCES core.users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_hash VARCHAR(128),
    mime_type VARCHAR(64)
);

CREATE INDEX idx_users_username ON core.users(username);
CREATE INDEX idx_audit_logs_user_id ON core.audit_logs(user_id);
CREATE INDEX idx_attachments_uploaded_by ON core.attachments(uploaded_by);
