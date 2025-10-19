# tls_enable_pg.ps1
# سكربت لتفعيل SSL في postgresql.conf وpg_hba.conf، وإعادة تشغيل خدمة PostgreSQL.
# يضبط ssl=on و ssl_min_protocol_version=TLSv1.2 ويضيف hostssl في pg_hba.conf.
# مثال تشغيل:
# .\tls_enable_pg.ps1 -DataDir "C:\Program Files\PostgreSQL\18\data" -ServiceName "postgresql-x64-18"

param(
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$ServiceName = "postgresql-x64-18"
)

$conf = Join-Path $DataDir "postgresql.conf"
if (Test-Path $conf) {
    (Get-Content $conf) `
        -replace "^(#?ssl\\s*=\\s*).*$", "ssl = on" `
        -replace "^(#?ssl_min_protocol_version\\s*=\\s*).*$", "ssl_min_protocol_version = 'TLSv1.2'" `
    | Set-Content $conf
    Add-Content $conf "`nssl = on"
    Add-Content $conf "ssl_min_protocol_version = 'TLSv1.2'"
    Write-Host "تم تحديث postgresql.conf"
}
else {
    Write-Error "لم يتم العثور على postgresql.conf"
}

$hba = Join-Path $DataDir "pg_hba.conf"
if (Test-Path $hba) {
    Add-Content $hba "hostssl    all    all    0.0.0.0/0    scram-sha-256"
    Add-Content $hba "hostssl    all    all    ::0/0       scram-sha-256"
    Write-Host "تم تحديث pg_hba.conf"
}
else {
    Write-Error "لم يتم العثور على pg_hba.conf"
}

Restart-Service -Name $ServiceName
Write-Host "تم إعادة تشغيل خدمة PostgreSQL."
