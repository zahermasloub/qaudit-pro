-- verify_phase3.sql
-- الغرض: فحص تفعيل RLS، الأعمدة الأساسية، العروض والفهارس، وتنفيذ SELECTات بسيطة.
-- التشغيل: psql -U postgres -d auditdb -f verify_phase3.sql

\c auditdb
SET search_path TO core, public;

-- فحص تفعيل RLS
SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('engagements','findings','recommendations','actions','attachments');

-- فحص السياسات
SELECT * FROM pg_policy WHERE polrelid IN (SELECT oid FROM pg_class WHERE relname IN ('engagements','findings','recommendations','actions','attachments'));

-- فحص الأعمدة الأساسية في attachments
SELECT column_name FROM information_schema.columns WHERE table_schema = 'core' AND table_name = 'attachments' AND column_name IN ('engagement_id','sha256','storage_path');

-- فحص وجود العروض والماتيريالايزد فيوز
SELECT table_name FROM information_schema.views WHERE table_schema = 'core';
SELECT matviewname FROM pg_matviews WHERE schemaname = 'core';

-- فحص الفهارس
SELECT indexname FROM pg_indexes WHERE schemaname = 'core' AND tablename = 'mv_org_kpis';

-- تنفيذ SELECT بسيط
SET app.user_id = '1';
SELECT * FROM core.engagements LIMIT 1;
