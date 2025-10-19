# ensure_psql_target.ps1
# الهدف: التأكد من أنك تنفّذ على PostgreSQL 18 عبر psql
param(
    [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
    [string]$DbName = "auditdb",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$PgPwd = "postgres"
)
$psql = Join-Path $PgBin "psql.exe"
${connStr} = "postgresql://${User}:${PgPwd}@127.0.0.1:${Port}/${DbName}"
& $psql $connStr -v ON_ERROR_STOP=1 -c "SELECT version(), current_database(), current_user; SHOW server_version; SHOW server_version_num;"
