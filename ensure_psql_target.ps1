pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"pwsh -NoProfile -ExecutionPolicy Bypass -File .\apply_full_phase3.ps1# ensure_psql_target.ps1
# الهدف: التأكد من أنك تنفّذ على PostgreSQL 18 عبر psql

$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$Psql = "$PgBin\psql.exe"
$DbName = "auditdb"
$Port = 5432
$User = "postgres"
$PgPassword = "postgres"


Write-Host "[INFO] Checking PostgreSQL connection..."
$env:PGPASSWORD = $PgPassword
$cmd = "\"$Psql\" -U $User -d $DbName -p $Port -c 'SELECT version(), current_setting(''server_version''), current_database();'"

try {
    $output = Invoke-Expression $cmd
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Connected to PostgreSQL 18."
        $output
    }
    else {
        Write-Host "[ERROR] Failed to connect to PostgreSQL. Check service and credentials."
        exit 1
    }
}
catch {
    Write-Host "[ERROR] Exception: $_"
    exit 1
}
