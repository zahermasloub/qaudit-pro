# fix_pg18_startup.ps1
# سكربت إصلاح فوري: يعطل io_method وجميع io_*، يطفئ SSL مؤقتًا، يأخذ نسخة احتياطية من postgresql.conf، ثم يعيد تشغيل الخدمة.
# مثال تشغيل:
# .\fix_pg18_startup.ps1 -DataDir "C:\Program Files\PostgreSQL\18\data" -SvcName "postgresql-x64-18"

param(
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$SvcName = "postgresql-x64-18"
)

$pgConf = Join-Path $DataDir "postgresql.conf"
if (!(Test-Path $pgConf)) { throw "postgresql.conf not found at $pgConf" }

# 1) Backup
$backup = "$pgConf.bak_$(Get-Date -Format yyyyMMdd_HHmmss)"
Copy-Item $pgConf $backup -Force

# 2) Sanitize: comment out io_* lines and force ssl=off for now
(Get-Content $pgConf) |
ForEach-Object {
    $_ -replace '^(\s*)(io_method|io_combine_limit|io_max_combine_limit)\s*=.*', '# $0 (disabled by fix_pg18_startup.ps1)' `
        -replace '^(\s*)ssl\s*=\s*on', 'ssl = off'
} | Set-Content $pgConf

# 3) Restart service (run as Administrator)
try {
    Restart-Service -Name $SvcName -Force -ErrorAction Stop
    Start-Sleep -Seconds 3
    Write-Host "Service restarted successfully."
}
catch {
    Write-Warning "Failed to restart via Restart-Service. Trying elevated prompt..."
    Start-Process -FilePath "powershell.exe" -Verb RunAs -Wait -ArgumentList "-NoProfile", "-Command", "Restart-Service -Name $SvcName -Force; Start-Sleep -s 3"
}
