# test_tls_connection.ps1
# سكربت لاختبار الاتصال بقاعدة PostgreSQL عبر SSL باستخدام psql.
# يطبع version() و current_setting('ssl').
# مثال تشغيل:
# .\test_tls_connection.ps1 -PsqlPath "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe" -DbName "auditdb" -User "app_user" -Pass "كلمة_مرور_التطبيق"

param(
    [string]$PsqlPath = "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe",
    [string]$DbName = "auditdb",
    [string]$User = "app_user",
    [string]$Pass = ""
)

if (-not $Pass) {
    Write-Error "يرجى تمرير كلمة مرور المستخدم."
    exit 1
}

$env:PGPASSWORD = $Pass
& $PsqlPath -U $User -d $DbName "sslmode=require" -c "SELECT version(), current_setting('ssl');"
