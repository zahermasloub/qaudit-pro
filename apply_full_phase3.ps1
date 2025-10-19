param(
  [string]$PgBin="C:\Program Files\PostgreSQL\18\bin",[string]$DbName="auditdb",[string]$User="postgres",[string]$Pwd="postgres",
  [int]$Port=5432,[string]$OutDir="C:\Temp\CoreAlignment"
)
$ErrorActionPreference="Stop"
$psql = Join-Path $PgBin "psql.exe"
$log  = Join-Path $OutDir "apply_full_phase3.log"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
function Run([string]$cmd){ $ts=(Get-Date).ToString('yyyy-MM-dd HH:mm:ss'); Add-Content -Path $log -Value "[$ts] $cmd"; Invoke-Expression $cmd }
try{
  Run 'pwsh -NoProfile -ExecutionPolicy Bypass -File .\ensure_psql_target.ps1'
  Run 'pwsh -NoProfile -ExecutionPolicy Bypass -File .\db_introspect_and_compare.ps1'
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\baseline_core_schema.sql")
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\migrate_or_bridge_core.sql")
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\hotfix_reconcile_phase3.sql")
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\phase3_schema.sql")
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\phase3_views.sql")
  Run ("& `"$psql`" `"postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}`" -v ON_ERROR_STOP=1 -f .\verify_phase3.sql")
  Write-Host "Phase 3 pipeline DONE. See log: $log"
}catch{
  Write-Host "FAILED. See log: $log"
  throw
}
