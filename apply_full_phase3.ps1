# apply_full_phase3.ps1
# الغرض: تنفيذ تسلسل معالجة Phase 3 بالكامل بشكل آمن ومتسلسل مع لوج مفصل.
# التشغيل: pwsh -NoProfile -ExecutionPolicy Bypass -File .\apply_full_phase3.ps1
# يكتب لوج كامل إلى OutDir (apply_full_phase3.log) ويحفظ أوامر التنفيذ.

$ErrorActionPreference = 'Stop'
$OutDir = "C:\Temp\CoreAlignment"
if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$LogFile = "$OutDir\apply_full_phase3.log"

function Run-Step {
    param($StepName, $Command)
    Write-Host "[STEP] $StepName"
    Add-Content $LogFile "[STEP] $StepName: $Command"
    $result = Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] $StepName failed. See $LogFile."
        Add-Content $LogFile "[ERROR] $StepName failed."
        exit 1
    }
    $result | Add-Content $LogFile
}

$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$Psql = "$PgBin\psql.exe"
$DbName = "auditdb"
$User = "postgres"
$Pwd = "postgres"
$Port = 5432
$env:PGPASSWORD = $Pwd

Run-Step "Ensure PostgreSQL" ".\ensure_psql_target.ps1"
Run-Step "DB Introspect & Compare" ".\db_introspect_and_compare.ps1 -AppRoot 'C:\Src\InternalAuditApp' -PgBin '$PgBin' -DbName '$DbName' -User '$User' -Pwd '$Pwd' -Port $Port -OutDir '$OutDir'"
Run-Step "Baseline Core Schema" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\baseline_core_schema.sql"
Run-Step "Migrate/Bridge Core" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\migrate_or_bridge_core.sql"
Run-Step "Hotfix Reconcile Phase3" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\hotfix_reconcile_phase3.sql"
Run-Step "Phase3 Schema" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\phase3_schema.sql"
Run-Step "Phase3 Views" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\phase3_views.sql"
Run-Step "Verify Phase3" "$Psql -U $User -d $DbName -p $Port -v ON_ERROR_STOP=1 -f .\verify_phase3.sql > $OutDir\verify_phase3_report.txt"

Write-Host "[SUCCESS] Phase 3 full sequence completed. See $LogFile."
