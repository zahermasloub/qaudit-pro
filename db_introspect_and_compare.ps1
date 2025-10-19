# db_introspect_and_compare.ps1
# الغرض: فحص كود المشروع لاستخراج أسماء الجداول، واستعلام كتالوج القاعدة، ومقارنة المخطط الحالي بالمخطط القياسي، مع إخراج تقريرين (json/md).
# التشغيل:
# pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1 -AppRoot "C:\Src\InternalAuditApp" -PgBin "C:\Program Files\PostgreSQL\18\bin" -DbName auditdb -User postgres -Pwd postgres -Port 5432 -OutDir "C:\Temp\CoreAlignment"
# يعتمد على متغيرات البيئة الثابتة أو باراميترات.

param(
    [string]$AppRoot = "C:\Src\InternalAuditApp",
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "auditdb",
    [string]$User = "postgres",
    [string]$Pwd = "postgres",
    [int]$Port = 5432,
    [string]$OutDir = "C:\Temp\CoreAlignment"
)

$ErrorActionPreference = 'Stop'
$Psql = "$PgBin\psql.exe"
$env:PGPASSWORD = $Pwd

# 1. استخراج أسماء الجداول من كود المشروع (EF/SQL)
Write-Host "[INFO] Scanning project code for table names..."
$tableNames = @()
Get-ChildItem -Path $AppRoot -Recurse -Include *.cs, *.sql | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $matches = Select-String -InputObject $content -Pattern '(?i)from\s+([\w_]+)' -AllMatches
    foreach ($m in $matches) {
        $tableNames += $m.Matches.Groups[1].Value
    }
}
$tableNames = $tableNames | Sort-Object -Unique

# 2. استعلام كتالوج القاعدة
Write-Host "[INFO] Querying database catalog..."
$catalogQuery = @"
SELECT table_schema, table_name, column_name
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;
"@
$catalog = & $Psql -U $User -d $DbName -p $Port -t -A -F "," -c "$catalogQuery"

# 3. مقارنة مع المخطط القياسي
$coreTables = @(
    'roles', 'users', 'user_roles', 'orgs', 'depts', 'audits', 'engagements', 'attachments', 'audit_logs',
    'teams', 'user_depts', 'user_teams', 'scopes', 'test_procedures', 'samples',
    'risks', 'controls', 'procedure_risks', 'procedure_controls', 'findings', 'recommendations', 'actions', 'status_history'
)
$altNames = @{ 'departments' = 'depts'; 'organizations' = 'orgs'; 'attachments_meta' = 'attachments'; 'recs' = 'recommendations'; 'audittrail' = 'audit_logs' }

$tableMap = @{}
foreach ($t in $coreTables) {
    $found = $null
    if ($catalog -match ",${t},") { $found = $t }
    else {
        foreach ($alt in $altNames.Keys) {
            if ($catalog -match ",${alt},") { $found = $alt; break }
        }
    }
    $tableMap[$t] = $found ? $found : 'NEW'
}

# 4. إخراج التقارير
if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$reportJson = $OutDir + "\db_compare_report.json"
$reportMd = $OutDir + "\db_compare_report.md"
$tableMap | ConvertTo-Json | Set-Content $reportJson -Encoding UTF8

$md = "# Database Compare Report`n| Expected | Found |`n|----------|-------|`n"
foreach ($k in $tableMap.Keys) { $md += "| $k | $($tableMap[$k]) |`n" }
$md | Set-Content $reportMd -Encoding UTF8

Write-Host "[SUCCESS] Reports written to $reportJson and $reportMd."
