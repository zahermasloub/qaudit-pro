-- verify_core_baseline.sql
-- الغرض: التحقق من وجود جميع الجداول الأساسية داخل مخطط core.
-- التشغيل: psql -U postgres -d auditdb -f verify_core_baseline.sql

\c auditdb
WITH required AS (
  SELECT unnest(ARRAY[
    'roles','users','user_roles','orgs','depts',
    'audits','engagements','attachments','audit_logs'
  ]) AS relname
),
present AS (
  SELECT relname FROM pg_class c
  JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='core' AND c.relkind='r'
)
SELECT r.relname AS required_table,
       CASE WHEN p.relname IS NULL THEN 'MISSING' ELSE 'OK' END AS status
FROM required r
LEFT JOIN present p ON p.relname=r.relname
ORDER BY 1;
