param(
  [string]$AppRoot="C:\Src\InternalAuditApp",[string]$PgBin="C:\Program Files\PostgreSQL\18\bin",[string]$DbName="auditdb",
  [string]$User="postgres",[string]$Pwd="postgres",[int]$Port=5432,[string]$OutDir="C:\Temp\CoreAlignment"
)
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$psql = Join-Path $PgBin "psql.exe"

# 1) Collect approximate table names from code
$codeHits=@(); $globs=@("*.cs","*.sql","*.json","*.config","*.xml")
$files = Get-ChildItem -Path $AppRoot -Recurse -File -Include $globs -ErrorAction SilentlyContinue
foreach($f in $files){
  $t = try{ Get-Content $f.FullName -Raw -ErrorAction Stop }catch{""}
  $m = [regex]::Matches($t,'\bFROM\s+([A-Za-z_][A-Za-z0-9_\.]*)|\bJOIN\s+([A-Za-z_][A-Za-z0-9_\.]*)|\bINSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_\.]*)|\bToTable\(\s*\"([^\"\.]+)\"',
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
  if($m.Count -gt 0){
    $names = $m | % { ($_.Groups[1].Value,$_.Groups[2].Value,$_.Groups[3].Value,$_.Groups[4].Value) } |
             % { $_ } | ? { $_ } | Select-Object -Unique
    if($names){ $codeHits += [pscustomobject]@{ File=$f.FullName; Tables=($names -join ",") } }
  }
}
$codeHits | ConvertTo-Json -Depth 5 | Out-File -Encoding UTF8 (Join-Path $OutDir "code_tables.json")

# 2) Database catalog introspection
$sql = @"
\c $DbName
SET search_path TO public, core;
SELECT n.nspname, c.relname, a.attname, pg_catalog.format_type(a.atttypid,a.atttypmod)
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
WHERE c.relkind='r' ORDER BY n.nspname,c.relname,a.attnum;
"@
$tmp = Join-Path $OutDir "introspect.sql"
$sql | Out-File -Encoding UTF8 $tmp
$rows = & $psql "postgresql://${User}:${Pwd}@127.0.0.1:${Port}/${DbName}" -A -F "|" -f $tmp

# 3) Core schema expectations
$expected = @(
 "roles","users","user_roles","orgs","depts","audits","engagements","attachments","audit_logs",
 "teams","user_depts","user_teams","scopes","test_procedures","samples",
 "risks","controls","procedure_risks","procedure_controls","findings","recommendations","actions","status_history"
)
$aliases = @{
  "depts"=@("departments","department","dept","dept_tbl");
  "orgs"=@("organizations","organization","org","org_tbl");
  "attachments"=@("attachments_meta","files_meta","evidence_meta");
  "recommendations"=@("recs","recommendations_tbl","advice");
  "audit_logs"=@("audittrail","audit_trail","system_logs");
  "engagements"=@("audit_engagements","assignments","engagement");
}

# 4) Table/column analysis
$present = @{}
foreach($ln in $rows){
  if($ln -notmatch '\|'){ continue }
  $p=$ln.Split('|'); $sch=$p[0]; $tbl=$p[1]; $col=$p[2]; $typ=$p[3]
  $k="$sch.$tbl"; if(-not $present.ContainsKey($k)){ $present[$k]=@{} }
  $present[$k][$col]=$typ
}
$allNames = $present.Keys | % { $_.Split('.')[1] } | Select-Object -Unique

# 5) Table name mapping suggestions
$map = @{}
foreach($t in $expected){
  if($allNames -contains $t){ $map[$t]=$t; continue }
  if($aliases.ContainsKey($t)){
    $cand = $aliases[$t] | ? { $allNames -contains $_ }
    if($cand){ $map[$t]=$cand[0]; continue }
  }
  $pref = $allNames | ? { $_ -like "$($t.Substring(0,[math]::Min(4,$t.Length)))*" }
  if($pref){ $map[$t]=$pref[0] } else { $map[$t]=$null }
}

# 6) Report emission
[pscustomobject]@{
  When=Get-Date; Db=$DbName; Expected=$expected;
  Present=$present.Keys; TableMap=$map; CodeRefs=$codeHits
} | ConvertTo-Json -Depth 8 | Out-File -Encoding UTF8 (Join-Path $OutDir "db_compare_report.json")

$md=@("# Core Alignment Report","DB: $DbName | Port: $Port","## Suggested TableMap")
foreach($t in $expected){ $v = if($map[$t]){ $map[$t] } else { "**NEW**" }; $md += "- $t → $v" }
$md += "## Code References"; foreach($h in $codeHits){ $md += "- $($h.File): $($h.Tables)" }
$md -join "`n" | Out-File -Encoding UTF8 (Join-Path $OutDir "db_compare_report.md")
Write-Host "Reports at $OutDir"
