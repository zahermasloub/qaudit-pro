# tls_make_selfsigned.ps1
# سكربت لإنشاء شهادة server.crt/server.key ذاتية التوقيع باستخدام OpenSSL.
# يضبط أذونات NTFS على server.key لحساب خدمة PostgreSQL فقط.
# مثال تشغيل:
# .\tls_make_selfsigned.ps1 -CN "db.example.local" -DataDir "C:\Program Files\PostgreSQL\18\data" -ServiceUser "NetworkService"

param(
    [string]$CN = "localhost",
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$OpenSSL = "openssl",
    [string]$ServiceUser = "NetworkService"
)

$crt = Join-Path $DataDir "server.crt"
$key = Join-Path $DataDir "server.key"

& $OpenSSL req -new -x509 -days 730 -nodes -text -subj "/CN=$CN" -keyout $key -out $crt

# ضبط أذونات NTFS: فقط حساب الخدمة يقرأ/يكتب
icacls $key /inheritance:r /grant:r "$ServiceUser:R" /remove:g "Users" /remove:g "Everyone"
Write-Host "تم إنشاء الشهادة وضبط الأذونات: $crt و $key"
