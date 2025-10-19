-- hotfix_reconcile_phase3.sql
-- الغرض: فحص ذكي للجداول التي سببت أخطاء (مثل attachments)، وإضافة الأعمدة والفهارس والـFKs المفقودة فقط إذا كانت غير موجودة.
-- التشغيل: psql -U postgres -d auditdb -f hotfix_reconcile_phase3.sql
-- idempotent بالكامل ولا يستخدم DROP.

\c auditdb
SET search_path TO core, public;

-- مثال: إضافة أعمدة مفقودة في core.attachments
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'attachments' AND column_name = 'engagement_id') THEN
        ALTER TABLE core.attachments ADD COLUMN engagement_id integer;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'attachments' AND column_name = 'sha256') THEN
        ALTER TABLE core.attachments ADD COLUMN sha256 text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'attachments' AND column_name = 'storage_path') THEN
        ALTER TABLE core.attachments ADD COLUMN storage_path text;
    END IF;
END$$;

-- مثال: إنشاء فهارس مفقودة
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'core' AND tablename = 'attachments' AND indexname = 'ix_attachments_eng') THEN
        CREATE INDEX ix_attachments_eng ON core.attachments(engagement_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'core' AND tablename = 'attachments' AND indexname = 'ix_attachments_sha') THEN
        CREATE INDEX ix_attachments_sha ON core.attachments(sha256);
    END IF;
END$$;

-- مثال: إنشاء FK إذا كان مفقودًا
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'core' AND table_name = 'attachments' AND constraint_type = 'FOREIGN KEY' AND constraint_name = 'fk_attachments_engagement') THEN
        ALTER TABLE core.attachments ADD CONSTRAINT fk_attachments_engagement FOREIGN KEY (engagement_id) REFERENCES core.engagements(id);
    END IF;
END$$;

-- ... كرر لجداول أخرى حسب الحاجة ...
