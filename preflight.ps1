# preflight.ps1
# سكربت فحص أولي لمجلد التطبيق وخدمات PostgreSQL والمنافذ.
# يشخّص وجود Connection Strings، مزوّدات EF Core، ملفات إعداد، سكربتات نشر، خدمات PostgreSQL القديمة، والمنافذ المشغولة.
# يخرج تقريرين: preflight_report.json و preflight_report.md في مجلد $OutDir.
param(
    [string]$AppRoot = ".",
    [string]$OutDir = ".\preflight_out"
)

if (!(Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

$report = @{
    Timestamp = (Get-Date).ToString("s")
    AppRoot   = (Resolve-Path $AppRoot).Path
    Findings  = @{}
}

# 1. فحص ملفات الإعداد والسكربتات
$patterns = @("appsettings*.json", "web.config", "*.config", ".env", "*.ps1", "*.bat", "*.cmd", "*.sql")
$files = @()
foreach ($pat in $patterns) {
    $files += Get-ChildItem -Path $AppRoot -Recurse -Filter $pat -ErrorAction SilentlyContinue
}
$report.Findings.ConfigAndScripts = $files | Select-Object FullName, Name

# 2. فحص Connection Strings ومزوّدات EF Core
$csMatches = @()
$efMatches = @()
Get-ChildItem -Path $AppRoot -Recurse -Include *.json, *.config, *.cs, *.ts, *.js, *.env -ErrorAction SilentlyContinue | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "ConnectionString|Data Source|Server=.*;Database=.*;") {
        $csMatches += $_.FullName
    }
    if ($content -match "UseSqlServer|UseNpgsql|UseSqlite") {
        $efMatches += $_.FullName
    }
}
$report.Findings.ConnectionStrings = $csMatches | Select-Object -Unique
$report.Findings.EFProviders = $efMatches | Select-Object -Unique

# 3. فحص خدمات PostgreSQL القديمة
$pgServices = Get-Service | Where-Object { $_.Name -match "postgresql" }
$oldPg = $pgServices | Where-Object { $_.DisplayName -match "PostgreSQL\s(9|1[0-7])" }
$report.Findings.PgServices = $pgServices | Select-Object Name, DisplayName, Status
$report.Findings.OldPgServices = $oldPg | Select-Object Name, DisplayName, Status

# 4. فحص المنافذ المشغولة
$ports = 5432..5434
$usedPorts = @()
foreach ($p in $ports) {
    if (Get-NetTCPConnection -State Listen -LocalPort $p -ErrorAction SilentlyContinue) {
        $usedPorts += $p
    }
}
$report.Findings.UsedPorts = $usedPorts

# إخراج التقارير
$report | ConvertTo-Json -Depth 6 | Out-File -Encoding UTF8 "$OutDir\preflight_report.json"
$md = @"
# Preflight Report
- Timestamp: $($report.Timestamp)
- AppRoot: $($report.AppRoot)

## Config & Script Files
$($files | ForEach-Object { "* $($_.FullName)" } | Out-String)

## Connection String Matches
$($csMatches | ForEach-Object { "* $_" } | Out-String)

## EF Core Providers
$($efMatches | ForEach-Object { "* $_" } | Out-String)

## PostgreSQL Services
$($pgServices | ForEach-Object { "* $($_.DisplayName) [$($_.Status)]" } | Out-String)

## Old PostgreSQL Services (9.x–17.x)
$($oldPg | ForEach-Object { "* $($_.DisplayName) [$($_.Status)]" } | Out-String)

## Used Ports (5432–5434)
$($usedPorts | ForEach-Object { "* $_" } | Out-String)
"@
$md | Out-File -Encoding UTF8 "$OutDir\preflight_report.md"

Write-Host "Preflight check complete. See $OutDir\preflight_report.*"
