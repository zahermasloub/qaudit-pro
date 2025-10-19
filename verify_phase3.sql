\c auditdb
SET search_path TO core, public;

-- Verify RLS is enabled
SELECT relname, relrowsecurity FROM pg_class
WHERE relname IN ('engagements','findings','recommendations','actions','attachments')
ORDER BY relname;

SELECT polname, polrelid::regclass AS table_name, polcmd FROM pg_policy
WHERE polrelid::regclass::text IN ('engagements','findings','recommendations','actions','attachments')
ORDER BY table_name, polname;

-- Check attachments columns and indexes
SELECT column_name FROM information_schema.columns WHERE table_schema='core' AND table_name='attachments' ORDER BY ordinal_position;
SELECT relname FROM pg_class WHERE relname IN ('ix_attachments_eng','ix_attachments_sha');

-- Confirm views and materialized view
SELECT 'vw_engagement_summary'  AS view_name WHERE EXISTS (SELECT 1 FROM pg_views WHERE viewname='vw_engagement_summary');
SELECT 'vw_recommendations_tracker' AS view_name WHERE EXISTS (SELECT 1 FROM pg_views WHERE viewname='vw_recommendations_tracker');
SELECT 'mv_org_kpis' AS mv_name WHERE EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname='mv_org_kpis');

-- Simulate app session
SET app.user_id = '1';
SELECT * FROM vw_engagement_summary LIMIT 3;
