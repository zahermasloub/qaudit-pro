param([string]$PgBin="C:\Program Files\PostgreSQL\18\bin",[string]$DbName="auditdb",[string]$User="postgres",[string]$Pwd="postgres",[int]$Port=5432)
$psql = Join-Path $PgBin "psql.exe"
& $psql "postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}" -v ON_ERROR_STOP=1 -c "REFRESH MATERIALIZED VIEW CONCURRENTLY core.mv_org_kpis;"
