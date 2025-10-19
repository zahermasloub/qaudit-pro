-- phase3_views.sql
-- إنشاء عروض وتقارير ومؤشرات مجمعة مع دعم MV وفهرس فريد لـ REFRESH CONCURRENTLY

\c auditdb
SET search_path TO core, public;

-- View: ملخص الارتباط
CREATE OR REPLACE VIEW vw_engagement_summary AS
SELECT
  e.engagement_id,
  e.audit_id,
  e.dept_id,
  e.team_id,
  e.status,
  COUNT(DISTINCT p.procedure_id) AS procedures_count,
  COUNT(DISTINCT s.sample_id)    AS samples_count,
  COUNT(DISTINCT f.finding_id) FILTER (WHERE f.status='open')        AS open_findings,
  COUNT(DISTINCT f.finding_id) FILTER (WHERE f.status='in_progress') AS wip_findings,
  COUNT(DISTINCT f.finding_id) FILTER (WHERE f.status='closed')      AS closed_findings
FROM engagements e
LEFT JOIN test_procedures p ON p.engagement_id=e.engagement_id
LEFT JOIN samples s         ON s.procedure_id=p.procedure_id
LEFT JOIN findings f        ON f.engagement_id=e.engagement_id
GROUP BY e.engagement_id;

-- View: تتبع التوصيات
CREATE OR REPLACE VIEW vw_recommendations_tracker AS
SELECT
  r.rec_id,
  f.finding_id,
  e.engagement_id,
  r.owner_dept_id,
  r.priority,
  r.status,
  r.due_date,
  (CASE WHEN r.due_date IS NOT NULL AND r.status <> 'closed' AND r.due_date < CURRENT_DATE THEN TRUE ELSE FALSE END) AS is_overdue,
  COUNT(a.action_id) AS actions_count,
  CASE WHEN COUNT(a.action_id)=0 THEN NULL
       ELSE ROUND( SUM(COALESCE(a.progress_pct,0))::numeric / COUNT(a.action_id), 1) END AS avg_progress
FROM recommendations r
JOIN findings f    ON f.finding_id=r.finding_id
JOIN engagements e ON e.engagement_id=f.engagement_id
LEFT JOIN actions a ON a.rec_id=r.rec_id
GROUP BY r.rec_id, f.finding_id, e.engagement_id;

-- Materialized View: مؤشرات على مستوى الجهة
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_org_kpis AS
SELECT
  o.org_id,
  COUNT(DISTINCT e.engagement_id) AS engagements_total,
  COUNT(DISTINCT f.finding_id)    AS findings_total,
  COUNT(DISTINCT r.rec_id)        AS recs_total,
  COUNT(DISTINCT a.action_id)     AS actions_total,
  COUNT(*) FILTER (WHERE r.status='open')        AS recs_open,
  COUNT(*) FILTER (WHERE r.status='in_progress') AS recs_wip,
  COUNT(*) FILTER (WHERE r.status='closed')      AS recs_closed
FROM orgs o
LEFT JOIN depts d ON d.org_id=o.org_id
LEFT JOIN engagements e ON e.dept_id=d.dept_id
LEFT JOIN findings f ON f.engagement_id=e.engagement_id
LEFT JOIN recommendations r ON r.finding_id=f.finding_id
LEFT JOIN actions a ON a.rec_id=r.rec_id
GROUP BY o.org_id;

-- فهرس فريد (مطلوب لـ REFRESH CONCURRENTLY)
CREATE UNIQUE INDEX IF NOT EXISTS ux_mv_org_kpis_org ON mv_org_kpis(org_id);
