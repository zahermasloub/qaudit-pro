# install_pg18.ps1
# سكربت تثبيت PostgreSQL 18 صامتًا مع تهيئة الإعدادات وقاعدة البيانات والمستخدم.
# يدعم تخصيص المسارات والمنافذ والمعرّفات.
param(
    #[string]$PgInstallerUrl = "https://get.enterprisedb.com/postgresql/postgresql-18.0-1-windows-x64.exe",
    [string]$PgInstallDir = "C:\Program Files\PostgreSQL\18",
    [string]$PsqlPath = "C:\Program Files\PostgreSQL\18\pgAdmin 4\runtime\psql.exe",
    [string]$PgDataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$PgPort = "5432",
    [string]$PgSvcName = "postgresql-x64-18",
    [string]$PgSuperUser = "postgres",
    [string]$PgSuperPass = "postgres",
    [string]$AppDb = "auditdb",
    [string]$AppUser = "app_user",
    [string]$AppPass = "AppUser!Passw0rd",
    [string]$Locale = "ar",
    [string]$OutDir = ".\pg18_install_out"
)


Write-Host "تهيئة إعدادات PostgreSQL 18 بعد التثبيت اليدوي..."


# تهيئة postgresql.conf
$confPath = Join-Path $PgDataDir "postgresql.conf"
if (Test-Path $confPath) {
    (Get-Content $confPath) -replace "^(#?listen_addresses\s*=\s*).*$", "listen_addresses = '*'" `
        -replace "^(#?port\s*=\s*).*$", "port = $PgPort" `
        -replace "^(#?shared_buffers\s*=\s*).*$", "shared_buffers = 512MB" `
        -replace "^(#?work_mem\s*=\s*).*$", "work_mem = 16MB" `
        -replace "^(#?maintenance_work_mem\s*=\s*).*$", "maintenance_work_mem = 128MB" `
        -replace "^(#?effective_cache_size\s*=\s*).*$", "effective_cache_size = 2GB" `
        -replace "^(#?io_method\s*=\s*).*$", "io_method = win32" `
        -replace "^(#?logging_collector\s*=\s*).*$", "logging_collector = on" `
    | Set-Content $confPath
    Write-Host "تم تحديث postgresql.conf بنجاح."
}
else {
    Write-Warning "لم يتم العثور على postgresql.conf في $confPath."
}


# تهيئة pg_hba.conf
$hbaPath = Join-Path $PgDataDir "pg_hba.conf"
if (Test-Path $hbaPath) {
    @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
host    all             all             127.0.0.1/32           scram-sha-256
host    all             all             ::1/128                 scram-sha-256
local   all             all                                     scram-sha-256
"@ | Set-Content $hbaPath
    Write-Host "تم تحديث pg_hba.conf بنجاح."
}
else {
    Write-Warning "لم يتم العثور على pg_hba.conf في $hbaPath. تحقق من المسار أو أنشئ الملف يدوياً إذا لزم الأمر."
}


# إعادة تشغيل الخدمة
Restart-Service -Name $PgSvcName
Write-Host "تم إعادة تشغيل خدمة PostgreSQL."


# إنشاء قاعدة البيانات والمستخدم
$env:PGPASSWORD = $PgSuperPass
if (!(Test-Path $PsqlPath)) {
    Write-Error "لم يتم العثور على psql.exe في المسار المحدد: $PsqlPath"
    exit 1
}
$psql = $PsqlPath
Write-Host "إنشاء قاعدة البيانات والمستخدم والمخطط..."
Write-Host "إنشاء قاعدة البيانات auditdb مع ICU Locale عربي باستخدام template0..."
$createDbCmd = "CREATE DATABASE $AppDb LOCALE_PROVIDER icu LOCALE '$Locale' TEMPLATE template0;"
$result = & $psql -U $PgSuperUser -h localhost -p $PgPort -c $createDbCmd
if ($LASTEXITCODE -ne 0) {
    Write-Error "فشل إنشاء قاعدة البيانات. تحقق من إعدادات الـ Locale أو الصلاحيات أو وجود القاعدة مسبقاً."
    exit 1
}
& $psql -U $PgSuperUser -h localhost -p $PgPort -d $AppDb -c "CREATE SCHEMA core;"
& $psql -U $PgSuperUser -h localhost -p $PgPort -d $AppDb -c "CREATE USER $AppUser WITH PASSWORD '$AppPass';"
& $psql -U $PgSuperUser -h localhost -p $PgPort -d $AppDb -c "GRANT CONNECT ON DATABASE $AppDb TO $AppUser;"
& $psql -U $PgSuperUser -h localhost -p $PgPort -d $AppDb -c "GRANT USAGE ON SCHEMA core TO $AppUser;"
Write-Host "تم إنشاء قاعدة البيانات والمستخدم والمخطط بنجاح."

Write-Host "تهيئة PostgreSQL 18 بعد التثبيت اليدوي اكتملت بنجاح."
