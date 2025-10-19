# apply_phase3.ps1
# الغرض: تطبيق ملفات Phase 3 (schema, views, queries) على PostgreSQL 18 على Windows.
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

Write-Host "[1/3] تطبيق phase3_schema.sql ..."
& $psql -U $User -d $DbName -p $Port -f "phase3_schema.sql"

Write-Host "[2/3] تطبيق phase3_views.sql ..."
& $psql -U $User -d $DbName -p $Port -f "phase3_views.sql"

Write-Host "[3/3] تطبيق queries_phase3.sql ..."
& $psql -U $User -d $DbName -p $Port -f "queries_phase3.sql"

Write-Host "تم التنفيذ بنجاح."
