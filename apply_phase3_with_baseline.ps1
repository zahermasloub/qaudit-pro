# apply_phase3_with_baseline.ps1
# الغرض: تطبيق baseline_core_schema.sql ثم نقل/جسر الجداول ثم التحقق وأخيرًا تطبيق phase3_schema.sql وphase3_views.sql.
# التشغيل: شغّل السكريبت مباشرة أو عدّل الباراميترات حسب الحاجة.

param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "auditdb",
    [string]$User = "postgres",
    [string]$PgPwd = "postgres",
    [int]$Port = 5432,
    [string]$Baseline = ".\baseline_core_schema.sql",
    [string]$Migrate = ".\migrate_or_bridge_core.sql",
    [string]$Verify = ".\verify_core_baseline.sql",
    [string]$Phase3Sch = ".\phase3_schema.sql",
    [string]$Phase3Vws = ".\phase3_views.sql"
)


$psql = Join-Path $PgBin "psql.exe"
function Run-Sql([string]$file) {
    $connStr = "postgresql://${User}:${PgPwd}@127.0.0.1:${Port}/${DbName}"
    & $psql $connStr -v ON_ERROR_STOP=1 -f $file
    if ($LASTEXITCODE -ne 0) { throw "Failed: $file" }
}

# 1) Baseline
if (!(Test-Path $Baseline)) { throw "Missing $Baseline" }
Run-Sql $Baseline

# 2) Migrate/Bridge
if (Test-Path $Migrate) { Run-Sql $Migrate }

# 3) Verify
if (Test-Path $Verify) {
    $connStr = "postgresql://${User}:${PgPwd}@127.0.0.1:${Port}/${DbName}"
    & $psql $connStr -v ON_ERROR_STOP=0 -f $Verify
}

# 4) Phase 3 files
if (!(Test-Path $Phase3Sch)) { throw "Missing $Phase3Sch" }
if (!(Test-Path $Phase3Vws)) { throw "Missing $Phase3Vws" }
Run-Sql $Phase3Sch
Run-Sql $Phase3Vws

Write-Host "Baseline + Phase 3 applied successfully on $DbName."
