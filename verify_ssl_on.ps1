# verify_ssl_on.ps1
# يتحقق من تفعيل SSL فعليًا عبر psql ويطبع SHOW ssl.
# مثال تشغيل:
# .\verify_ssl_on.ps1 -PsqlPath "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe" -DbName "auditdb" -User "app_user" -Pass "AppUser!Passw0rd"

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
& $PsqlPath -U $User -d $DbName --set=sslmode=require -c "SHOW ssl;"
