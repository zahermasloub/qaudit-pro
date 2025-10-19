# tls_setup_quick.ps1
# سكربت شامل لإعداد TLS على PostgreSQL 18 على Windows:
# - ينشئ شهادة server.crt/server.key ذاتية التوقيع باستخدام OpenSSL (مسار قابل للتخصيص).
# - يضبط أذونات NTFS على server.key لحساب خدمة PostgreSQL فقط.
# - يفعّل ssl=on و ssl_min_protocol_version=TLSv1.2 في postgresql.conf، ويضيف hostssl في pg_hba.conf.
# - يعيد تشغيل خدمة postgresql-x64-18.
# - يتحقق عبر psql بأن SHOW ssl=on.
# مثال تشغيل:
# .\tls_setup_quick.ps1 -DataDir "C:\Program Files\PostgreSQL\18\data" -SvcName "postgresql-x64-18" -Port 5432 -DbName "auditdb" -User "app_user" -Pwd "Strong#NewAppUser18!" -OpenSSL "C:\Program Files\OpenSSL-Win64\bin\openssl.exe"

param(
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$SvcName = "postgresql-x64-18",
    [int]$Port = 5432,
    [string]$DbName = "auditdb",
    [string]$User = "app_user",
    [string]$Pwd = "Strong#NewAppUser18!",
    [string]$OpenSSL = "C:\Program Files\OpenSSL-Win64\bin\openssl.exe",
    [string]$CN = "localhost"
)

$crt = Join-Path $DataDir "server.crt"
$key = Join-Path $DataDir "server.key"

if (!(Test-Path $OpenSSL)) { Write-Error "OpenSSL not found at $OpenSSL"; exit 1 }
Write-Host "إنشاء شهادة server.crt/server.key..."
& $OpenSSL req -new -x509 -days 730 -nodes -text -subj "/CN=$CN" -keyout $key -out $crt
if (!(Test-Path $key) -or !(Test-Path $crt)) { Write-Error "فشل إنشاء الشهادة."; exit 1 }
icacls $key /inheritance:r /grant:r "NetworkService:R" /remove:g "Users" /remove:g "Everyone" | Out-Null

$conf = Join-Path $DataDir "postgresql.conf"
$hba = Join-Path $DataDir "pg_hba.conf"
if (!(Test-Path $conf)) { Write-Error "postgresql.conf not found"; exit 1 }
if (!(Test-Path $hba)) { Write-Error "pg_hba.conf not found"; exit 1 }

Write-Host "تفعيل ssl في postgresql.conf..."
(gc $conf) `
    -replace '^(#?ssl\s*=).*', 'ssl = on' `
    -replace '^(#?ssl_min_protocol_version\s*=).*', "ssl_min_protocol_version = 'TLSv1.2'" `
| Set-Content $conf
if (-not (Select-String -Path $conf -Pattern '^ssl\s*=')) { Add-Content $conf "`nssl = on" }
if (-not (Select-String -Path $conf -Pattern '^ssl_min_protocol_version\s*=')) { Add-Content $conf "ssl_min_protocol_version = 'TLSv1.2'" }

if (-not (Select-String -Path $hba -Pattern '^hostssl')) {
    Add-Content $hba "hostssl    all    all    0.0.0.0/0    scram-sha-256"
    Add-Content $hba "hostssl    all    all    ::0/0       scram-sha-256"
}

Write-Host "إعادة تشغيل خدمة PostgreSQL..."
try {
    Restart-Service -Name $SvcName -Force -ErrorAction Stop
    Start-Sleep -Seconds 3
}
catch {
    Write-Warning "تعذر إعادة التشغيل تلقائيًا. أعد تشغيل الخدمة يدويًا إذا لزم."
}

# تحقق من ssl عبر psql
$PsqlPath = "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe"
if (!(Test-Path $PsqlPath)) { Write-Warning "psql.exe غير موجود في المسار الافتراضي. تحقق يدويًا من ssl."; exit 0 }
$env:PGPASSWORD = $Pwd
Write-Host "التحقق من ssl عبر psql..."
& $PsqlPath -U $User -d $DbName -h localhost -p $Port --set=sslmode=require -c "SHOW ssl;"
