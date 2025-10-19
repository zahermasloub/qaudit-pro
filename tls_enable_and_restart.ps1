# tls_enable_and_restart.ps1
# يفعّل ssl في postgresql.conf وpg_hba.conf، ثم يحاول إعادة تشغيل خدمة PostgreSQL بصلاحيات مسؤول.
# إذا فشل إعادة التشغيل، يعطي رسالة واضحة لتدخل يدوي.
# مثال تشغيل:
# .\tls_enable_and_restart.ps1 -DataDir "C:\Program Files\PostgreSQL\18\data" -ServiceName "postgresql-x64-18"

param(
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$ServiceName = "postgresql-x64-18"
)

$conf = Join-Path $DataDir "postgresql.conf"
$hba = Join-Path $DataDir "pg_hba.conf"

if (Test-Path $conf) {
    (Get-Content $conf) `
        -replace "^(#?ssl\\s*=\\s*).*$", "ssl = on" `
        -replace "^(#?ssl_min_protocol_version\\s*=\\s*).*$", "ssl_min_protocol_version = 'TLSv1.2'" `
    | Set-Content $conf
    if (-not (Select-String -Path $conf -Pattern '^ssl\s*=')) { Add-Content $conf "`nssl = on" }
    if (-not (Select-String -Path $conf -Pattern '^ssl_min_protocol_version\s*=')) { Add-Content $conf "ssl_min_protocol_version = 'TLSv1.2'" }
    Write-Host "تم تحديث postgresql.conf"
}
else {
    Write-Error "لم يتم العثور على postgresql.conf"
}

if (Test-Path $hba) {
    if (-not (Select-String -Path $hba -Pattern '^hostssl')) {
        Add-Content $hba "hostssl    all    all    0.0.0.0/0    scram-sha-256"
        Add-Content $hba "hostssl    all    all    ::0/0       scram-sha-256"
    }
    Write-Host "تم تحديث pg_hba.conf"
}
else {
    Write-Error "لم يتم العثور على pg_hba.conf"
}

try {
    Start-Process powershell -Verb RunAs -ArgumentList "Restart-Service -Name '$ServiceName'" -Wait
    Write-Host "تمت محاولة إعادة تشغيل الخدمة بصلاحيات مسؤول."
}
catch {
    Write-Warning "تعذر إعادة تشغيل الخدمة تلقائيًا. أعد تشغيل خدمة $ServiceName يدويًا من Services أو PowerShell كمسؤول."
}
