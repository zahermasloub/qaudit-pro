-- queries_phase3.sql
-- الغرض: أمثلة استعلامات تقارير حرجة لمرحلة Phase 3 على PostgreSQL 18.
-- التشغيل: psql -U postgres -d auditdb -f queries_phase3.sql أو نسخ الاستعلامات مباشرة.

-- استعلام: ملخص الارتباطات
SELECT * FROM vw_engagement_summary ORDER BY engagement_id;

-- استعلام: تتبع التوصيات المتأخرة
SELECT * FROM vw_recommendations_tracker WHERE is_overdue = TRUE ORDER BY due_date;

-- استعلام: مؤشرات الجهة
SELECT * FROM mv_org_kpis ORDER BY org_id;

-- استعلام: أعلى 10 أقسام بعدد التوصيات المفتوحة
SELECT d.name, COUNT(r.id) AS open_recs
FROM depts d
JOIN recommendations r ON r.owner_dept_id = d.id
WHERE r.status = 'open'
GROUP BY d.name
ORDER BY open_recs DESC
LIMIT 10;

-- استعلام: الإجراءات المتأخرة
SELECT a.*, r.due_date
FROM actions a
JOIN recommendations r ON a.rec_id = r.id
WHERE a.status <> 'done' AND r.due_date < CURRENT_DATE;
