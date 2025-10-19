-- migrate_or_bridge_core.sql
-- الغرض: نقل الجداول الأساسية من public إلى core إن وجدت، أو إنشاء Views توافقية عند الحاجة.
-- التشغيل: psql -U postgres -d auditdb -f migrate_or_bridge_core.sql

\c auditdb
DO $$
DECLARE
  t TEXT;
  base_tables TEXT[] := ARRAY[
    'roles','users','user_roles','orgs','depts','audits','engagements','attachments','audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY base_tables LOOP
    IF to_regclass('public.'||t) IS NOT NULL AND to_regclass('core.'||t) IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA core;', t);
    END IF;
  END LOOP;
END$$;

-- (اختياري) إنشاء Views توافقية لو بقيت جداول قديمة بأسماء مختلفة
-- مثال: لو كانت لديكم public.departments بدل depts
-- CREATE OR REPLACE VIEW core.depts AS SELECT * FROM public.departments;
