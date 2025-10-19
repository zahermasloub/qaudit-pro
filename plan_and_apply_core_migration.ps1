# plan_and_apply_core_migration.ps1
# الغرض: بناء خطة ترحيل ديناميكية من db_compare_report.json، مع دعم Dry-Run وتنفيذ فعلي مع أخذ نسخة احتياطية.
# التشغيل:
# Dry-Run: pwsh -NoProfile -ExecutionPolicy Bypass -File .\plan_and_apply_core_migration.ps1
# تنفيذ: pwsh -NoProfile -ExecutionPolicy Bypass -File .\plan_and_apply_core_migration.ps1 -Execute

param(
    [switch]$Execute = $false,
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "auditdb",
    [string]$User = "postgres",
    [string]$Pwd = "postgres",
    [int]$Port = 5432,
    [string]$BackupDir = "C:\PgBackups\auditdb",
    [string]$OutDir = "C:\Temp\CoreAlignment"
)

$ErrorActionPreference = 'Stop'
$Psql = "$PgBin\psql.exe"
$PgDump = "$PgBin\pg_dump.exe"
$env:PGPASSWORD = $Pwd
$PlanFile = "$OutDir\migration_plan.sql"
$ReportFile = "$OutDir\db_compare_report.json"

if (!(Test-Path $ReportFile)) { Write-Host "[ERROR] db_compare_report.json not found."; exit 1 }

# بناء خطة الترحيل (مبسط)
$map = Get-Content $ReportFile | ConvertFrom-Json
$sql = "-- Migration Plan\n"
foreach ($k in $map.PSObject.Properties.Name) {
    if ($map.$k -eq 'NEW') {
        $sql += "-- Table $k is missing, will be created in baseline_core_schema.sql\n"
    }
    elseif ($map.$k -ne $k) {
        $sql += "ALTER TABLE IF EXISTS public.$($map.$k) RENAME TO $k;\n"
        $sql += "ALTER TABLE IF EXISTS public.$k SET SCHEMA core;\n"
    }
    else {
        $sql += "ALTER TABLE IF EXISTS public.$k SET SCHEMA core;\n"
    }
}
$sql | Set-Content $PlanFile -Encoding UTF8
Write-Host "[INFO] Migration plan written to $PlanFile."

if ($Execute) {
    if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
    $backupFile = "$BackupDir\auditdb_$(Get-Date -Format 'yyyyMMdd_HHmmss').dump"
    Write-Host "[INFO] Taking backup to $backupFile ..."
    & $PgDump -U $User -d $DbName -p $Port -Fc -f $backupFile
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Backup failed."; exit 1 }
    Write-Host "[INFO] Applying migration plan..."
    & $Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f $PlanFile
    if ($LASTEXITCODE -ne 0) { Write-Host "[ERROR] Migration failed."; exit 1 }
    Write-Host "[SUCCESS] Migration applied."
}
else {
    Write-Host "[DRY-RUN] Review $PlanFile then rerun with -Execute to apply."
}
