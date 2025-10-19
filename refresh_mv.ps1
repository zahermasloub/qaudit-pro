# refresh_mv.ps1
# الغرض: تحديث الـ Materialized View (mv_org_kpis) يدويًا في PostgreSQL 18.
# التشغيل: شغّل السكريبت مباشرة أو عدّل الباراميترات حسب الحاجة.

param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "auditdb",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$PgPwd = "postgres"
)
$env:PGPASSWORD = $PgPwd
$psql = Join-Path $PgBin "psql.exe"

Write-Host "تحديث mv_org_kpis ..."
& $psql -U $User -d $DbName -p $Port -c "REFRESH MATERIALIZED VIEW CONCURRENTLY mv_org_kpis;"
Write-Host "تم التحديث."
