param(
  [string]$PgBin="C:\Program Files\PostgreSQL\18\bin",[string]$DbName="auditdb",[string]$User="postgres",
  [string]$Pwd="postgres",[int]$Port=5432
)
$psql = Join-Path $PgBin "psql.exe"
& $psql "postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}" `
  -v ON_ERROR_STOP=1 -c "SELECT version(), current_database(), current_user; SHOW server_version; SHOW server_version_num;"
