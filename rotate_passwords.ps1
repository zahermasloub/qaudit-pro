# rotate_passwords.ps1
# سكربت لتدوير (تغيير) كلمات مرور postgres وapp_user في PostgreSQL 18.
# يقبل كلمات المرور الجديدة كبراميترات، وينفذ ALTER ROLE.
# مثال تشغيل:
# .\rotate_passwords.ps1 -PsqlPath "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe" -DbName "auditdb" -SuperUser "postgres" -SuperPass "كلمة_مرور_الجديدة" -AppUser "app_user" -AppPass "كلمة_مرور_جديدة_للتطبيق"

param(
    [string]$PsqlPath = "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe",
    [string]$DbName = "auditdb",
    [string]$SuperUser = "postgres",
    [string]$SuperPass = "",
    [string]$AppUser = "app_user",
    [string]$AppPass = ""
)

if (-not $SuperPass -or -not $AppPass) {
    Write-Error "يرجى تمرير كلمات المرور الجديدة لكل من postgres وapp_user."
    exit 1
}

$env:PGPASSWORD = $SuperPass
& $PsqlPath -U $SuperUser -d $DbName -c "ALTER ROLE $SuperUser WITH PASSWORD '$SuperPass';"
& $PsqlPath -U $SuperUser -d $DbName -c "ALTER ROLE $AppUser WITH PASSWORD '$AppPass';"
Write-Host "تم تدوير كلمات المرور بنجاح."
