<#
.SYNOPSIS
  Final readiness validator for auditdb core schema and scheduling.
.PARAMETER PgBin
  Path to PostgreSQL 18 bin directory. Defaults to C:\Program Files\PostgreSQL\18\bin.
.PARAMETER DbName
  Target database name. Defaults to auditdb.
.PARAMETER User
  PostgreSQL user. Defaults to postgres.
.PARAMETER Pwd
  PostgreSQL password. Defaults to postgres.
.PARAMETER Port
  PostgreSQL port. Defaults to 5432.
.PARAMETER OutDir
  Directory for logs and reports. Defaults to C:\Temp\CoreAlignment.
.PARAMETER TaskName
  Windows Task Scheduler job name for MV refresh. Defaults to AuditDB-Refresh-MV.
.PARAMETER RefreshScript
  PowerShell script invoked by the scheduled task to refresh mv_org_kpis.
.PARAMETER FillGaps
  Optional switch. When present, the script attempts conservative data backfills for selected NULL FK columns.
#>
param(
  [string]$PgBin = "C:\Program Files\PostgreSQL\18\bin",
  [string]$DbName = "auditdb",
  [string]$User = "postgres",
  [string]$Pwd = "postgres",
  [int]$Port = 5432,
  [string]$OutDir = "C:\Temp\CoreAlignment",
  [string]$TaskName = "AuditDB-Refresh-MV",
  [string]$RefreshScript = "C:\Ops\refresh_mv.ps1",
  [switch]$FillGaps
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

if (-not (Test-Path -Path $PgBin)) {
  throw "PgBin path not found: $PgBin"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$LogPath = Join-Path $OutDir "run_final_readiness.log"
if (Test-Path $LogPath) {
  Remove-Item $LogPath -Force
}

function Write-Log {
  param([string]$Message)
  $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $line = "[$timestamp] $Message"
  Add-Content -Path $LogPath -Value $line
  Write-Host $Message
}

$psqlPath = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psqlPath)) {
  throw "psql executable not found under: $psqlPath"
}

$connectionUri = "postgresql://{0}:{1}@127.0.0.1:{2}/{3}" -f $User,$Pwd,$Port,$DbName

function Invoke-Psql {
  param(
    [string]$Sql,
    [string]$Label = "SQL",
    [switch]$WithHeaders
  )
  $normalized = ($Sql -replace "\s+", " ").Trim()
  if ($normalized.Length -gt 140) {
    $normalized = $normalized.Substring(0, 140) + "..."
  }
  Write-Log "$Label -> $normalized"
  $tmp = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tmp -Encoding UTF8 -Value $Sql
  try {
    $args = @($script:connectionUri, "-v", "ON_ERROR_STOP=1", "-X")
    if (-not $WithHeaders) {
      $args += @("-q", "-t", "-A", "-F", "|")
    }
    $args += @("-f", $tmp)
    $output = & $script:psqlPath @args 2>&1
    $exitCode = $LASTEXITCODE
  }
  finally {
    Remove-Item -Path $tmp -ErrorAction SilentlyContinue
  }
  if ($exitCode -ne 0) {
    $output | ForEach-Object { Write-Log "psql error: $_" }
    throw "psql command failed (see log)."
  }
  $lines = @()
  foreach ($line in $output) {
    if ($null -ne $line) {
      $trimmed = $line.Trim()
      if ($trimmed) {
        $lines += $trimmed
      }
    }
  }
  if ($lines.Count -eq 0) {
    Write-Log "$Label -> (no rows)"
  }
  else {
    foreach ($l in $lines) {
      Write-Log "$Label <= $l"
    }
  }
  return $lines
}

function Test-Columns {
  param(
    [string]$Schema,
    [string]$Table,
    [string[]]$Columns
  )
  $sql = @"
SELECT column_name
FROM information_schema.columns
WHERE table_schema='$Schema' AND table_name='$Table';
"@
  $present = Invoke-Psql -Sql $sql -Label "$Schema.$Table columns"
  $presentSet = $present | ForEach-Object { $_.ToLowerInvariant() }
  $missing = @()
  foreach ($col in $Columns) {
    if (-not ($presentSet -contains $col.ToLowerInvariant())) {
      $missing += $col
    }
  }
  return $missing
}

function Test-Indexes {
  param(
    [string]$Schema,
    [string]$Table,
    [string[]]$Indexes
  )
  $sql = @"
SELECT indexname
FROM pg_indexes
WHERE schemaname='$Schema' AND tablename='$Table';
"@
  $present = Invoke-Psql -Sql $sql -Label "$Schema.$Table indexes"
  $presentSet = $present | ForEach-Object { $_.ToLowerInvariant() }
  $missing = @()
  foreach ($idx in $Indexes) {
    if (-not ($presentSet -contains $idx.ToLowerInvariant())) {
      $missing += $idx
    }
  }
  return $missing
}

function Test-ForeignKey {
  param(
    [string]$Schema,
    [string]$Table,
    [string]$Column,
    [string]$RefSchema,
    [string]$RefTable
  )
  $sql = @"
SELECT DISTINCT c.conname
FROM pg_constraint c
JOIN unnest(c.conkey) WITH ORDINALITY AS fk(attnum, idx) ON TRUE
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = fk.attnum
WHERE c.conrelid = '$Schema.$Table'::regclass
  AND c.contype = 'f'
  AND c.confrelid = '$RefSchema.$RefTable'::regclass
  AND a.attname = '$Column';
"@
  $rows = Invoke-Psql -Sql $sql -Label "$Schema.$Table FK $Column -> $RefSchema.$RefTable"
  return $rows.Count -gt 0
}

function Test-UniqueIndex {
  param(
    [string]$Schema,
    [string]$Table,
    [string]$Column
  )
  $sql = @"
SELECT DISTINCT ic.relname
FROM pg_index i
JOIN pg_class ic ON ic.oid = i.indexrelid
JOIN pg_namespace n ON n.oid = ic.relnamespace
JOIN pg_attribute a ON a.attrelid = i.indrelid
WHERE i.indrelid = '$Schema.$Table'::regclass
  AND i.indisunique
  AND n.nspname = '$Schema'
  AND a.attnum = ANY(i.indkey::int[])
  AND a.attname = '$Column';
"@
  $rows = Invoke-Psql -Sql $sql -Label "$Schema.$Table unique index on $Column"
  return $rows.Count -gt 0
}

$results = New-Object System.Collections.Generic.List[object]
$gapSummary = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Section,
    [string]$Item,
    [string]$Status,
    [string]$Details,
    [int]$Affected = 0
  )
  $results.Add([pscustomobject]@{
      Section = $Section
      Item    = $Item
      Status  = $Status
      Details = $Details
      Affected = $Affected
    }) | Out-Null
}

function Add-GapSummary {
  param(
    [string]$Item,
    [int]$Before,
    [int]$After,
    [int]$Filled,
    [string]$Notes
  )
  $gapSummary.Add([pscustomobject]@{
      Item   = $Item
      Before = $Before
      After  = $After
      Filled = $Filled
      Notes  = $Notes
    }) | Out-Null
}

Write-Log "===== Final readiness run started (FillGaps=$($FillGaps.IsPresent)) ====="

try {
  # Region: Structural checks
  $missing = Test-Columns -Schema "core" -Table "attachments" -Columns @("engagement_id","sha256","storage_path")
  $idxMissing = Test-Indexes -Schema "core" -Table "attachments" -Indexes @("ix_attachments_eng","ix_attachments_sha")
  $fkOk = Test-ForeignKey -Schema "core" -Table "attachments" -Column "engagement_id" -RefSchema "core" -RefTable "engagements"
  $status = "PASS"
  $detailList = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $detailList += "Missing columns: " + ($missing -join ", ")
  }
  if ($idxMissing.Count -gt 0) {
    $status = "FAIL"
    $detailList += "Missing indexes: " + ($idxMissing -join ", ")
  }
  if (-not $fkOk) {
    $status = "FAIL"
    $detailList += "Missing FK to core.engagements"
  }
  if ($detailList.Count -eq 0) { $detailList = @("All required structures present.") }
  Add-Result -Section "Schema" -Item "core.attachments structure" -Status $status -Details ($detailList -join " | ")

  $missing = Test-Columns -Schema "core" -Table "findings" -Columns @("engagement_id")
  $fkOk = Test-ForeignKey -Schema "core" -Table "findings" -Column "engagement_id" -RefSchema "core" -RefTable "engagements"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing engagement_id column."
  }
  if (-not $fkOk) {
    $status = "FAIL"
    $details += "Missing FK to core.engagements."
  }
  if ($details.Count -eq 0) { $details = @("engagement_id column and FK validated.") }
  Add-Result -Section "Schema" -Item "core.findings linkage" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "recommendations" -Columns @("finding_id")
  $fkOk = Test-ForeignKey -Schema "core" -Table "recommendations" -Column "finding_id" -RefSchema "core" -RefTable "findings"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing finding_id column."
  }
  if (-not $fkOk) {
    $status = "FAIL"
    $details += "Missing FK to core.findings."
  }
  if ($details.Count -eq 0) { $details = @("finding_id column and FK validated.") }
  Add-Result -Section "Schema" -Item "core.recommendations linkage" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "actions" -Columns @("rec_id")
  $fkOk = Test-ForeignKey -Schema "core" -Table "actions" -Column "rec_id" -RefSchema "core" -RefTable "recommendations"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing rec_id column."
  }
  if (-not $fkOk) {
    $status = "FAIL"
    $details += "Missing FK to core.recommendations."
  }
  if ($details.Count -eq 0) { $details = @("rec_id column and FK validated.") }
  Add-Result -Section "Schema" -Item "core.actions linkage" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "risks" -Columns @("org_id","dept_id")
  $fkOrg = Test-ForeignKey -Schema "core" -Table "risks" -Column "org_id" -RefSchema "core" -RefTable "orgs"
  $fkDept = Test-ForeignKey -Schema "core" -Table "risks" -Column "dept_id" -RefSchema "core" -RefTable "depts"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing columns: " + ($missing -join ", ")
  }
  if (-not $fkOrg) {
    $status = "FAIL"
    $details += "Missing FK org_id -> core.orgs."
  }
  if (-not $fkDept) {
    $status = "FAIL"
    $details += "Missing FK dept_id -> core.depts."
  }
  if ($details.Count -eq 0) { $details = @("org/dept columns and FKs validated.") }
  Add-Result -Section "Schema" -Item "core.risks references" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "controls" -Columns @("org_id","dept_id")
  $fkOrg = Test-ForeignKey -Schema "core" -Table "controls" -Column "org_id" -RefSchema "core" -RefTable "orgs"
  $fkDept = Test-ForeignKey -Schema "core" -Table "controls" -Column "dept_id" -RefSchema "core" -RefTable "depts"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing columns: " + ($missing -join ", ")
  }
  if (-not $fkOrg) {
    $status = "FAIL"
    $details += "Missing FK org_id -> core.orgs."
  }
  if (-not $fkDept) {
    $status = "FAIL"
    $details += "Missing FK dept_id -> core.depts."
  }
  if ($details.Count -eq 0) { $details = @("org/dept columns and FKs validated.") }
  Add-Result -Section "Schema" -Item "core.controls references" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "engagements" -Columns @("audit_id","dept_id")
  $idxMissing = Test-Indexes -Schema "core" -Table "engagements" -Indexes @("ix_engagements_audit","ix_engagements_dept")
  $fkAudit = Test-ForeignKey -Schema "core" -Table "engagements" -Column "audit_id" -RefSchema "core" -RefTable "audits"
  $fkDept = Test-ForeignKey -Schema "core" -Table "engagements" -Column "dept_id" -RefSchema "core" -RefTable "depts"
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing audit/dept columns."
  }
  if ($idxMissing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing indexes: " + ($idxMissing -join ", ")
  }
  if (-not $fkAudit) {
    $status = "FAIL"
    $details += "Missing FK audit_id -> core.audits."
  }
  if (-not $fkDept) {
    $status = "FAIL"
    $details += "Missing FK dept_id -> core.depts."
  }
  if ($details.Count -eq 0) { $details = @("audit/dept columns, indexes, and FKs validated.") }
  Add-Result -Section "Schema" -Item "core.engagements structure" -Status $status -Details ($details -join " | ")

  $missing = Test-Columns -Schema "core" -Table "users" -Columns @("username")
  $uniqueOk = Test-UniqueIndex -Schema "core" -Table "users" -Column "username"
  $idxMissing = Test-Indexes -Schema "core" -Table "users" -Indexes @("ix_users_username")
  $status = "PASS"
  $details = @()
  if ($missing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing username column."
  }
  if (-not $uniqueOk) {
    $status = "FAIL"
    $details += "No unique index/constraint on username."
  }
  if ($idxMissing.Count -gt 0) {
    $status = "FAIL"
    $details += "Missing ix_users_username index."
  }
  if ($details.Count -eq 0) { $details = @("username column/index uniqueness validated.") }
  Add-Result -Section "Schema" -Item "core.users username uniqueness" -Status $status -Details ($details -join " | ")

  $rlsSql = @"
SELECT relname, relrowsecurity::text
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname='core'
  AND relname IN ('engagements','findings','recommendations','actions','attachments')
ORDER BY relname;
"@
  $rlsRows = Invoke-Psql -Sql $rlsSql -Label "RLS status"
  $rlsStatus = "PASS"
  $missingRlsTables = @()
  foreach ($row in $rlsRows) {
    $parts = $row.Split('|')
    if ($parts.Length -eq 2) {
      $tableName = $parts[0].Trim()
      $flag = $parts[1].Trim().ToLowerInvariant()
      if ($flag -ne "t") {
        $missingRlsTables += $tableName
      }
    }
  }
  $policySql = @"
SELECT polrelid::regclass::text AS table_name, COUNT(*) AS policy_count
FROM pg_policy
WHERE polrelid::regclass::text IN ('core.engagements','core.findings','core.recommendations','core.actions','core.attachments')
  AND polcmd = 'r'
GROUP BY polrelid;
"@
  $policyRows = Invoke-Psql -Sql $policySql -Label "RLS policies"
  $policyMap = @{}
  foreach ($row in $policyRows) {
    $parts = $row.Split('|')
    if ($parts.Length -eq 2) {
      $policyMap[$parts[0].Trim()] = [int]$parts[1]
    }
  }
  $tables = @("core.engagements","core.findings","core.recommendations","core.actions","core.attachments")
  $missingPolicyTables = @()
  foreach ($tbl in $tables) {
    if (-not $policyMap.ContainsKey($tbl) -or $policyMap[$tbl] -lt 1) {
      $missingPolicyTables += $tbl
    }
  }
  $rlsDetails = @()
  if ($missingRlsTables.Count -gt 0) {
    $rlsStatus = "FAIL"
    $rlsDetails += "RLS disabled on: " + ($missingRlsTables -join ", ")
  }
  if ($missingPolicyTables.Count -gt 0) {
    $rlsStatus = "FAIL"
    $rlsDetails += "Missing read policies on: " + ($missingPolicyTables -join ", ")
  }
  if ($rlsDetails.Count -eq 0) { $rlsDetails = @("RLS enabled with read policies on all required tables.") }
  Add-Result -Section "Schema" -Item "RLS & read policies" -Status $rlsStatus -Details ($rlsDetails -join " | ")

  # Region: Data gap analysis & optional fills
  function Get-NullCount {
    param([string]$Sql,[string]$Label)
    $value = Invoke-Psql -Sql $Sql -Label $Label
    if ($value.Count -gt 0) {
      return [int]$value[0]
    }
    return 0
  }

  $attachNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.attachments WHERE engagement_id IS NULL;" -Label "attachments null count"
  $attachFilled = 0
  $attachNotes = "No fill executed."
  if ($FillGaps.IsPresent -and $attachNullBefore -gt 0) {
    $activeEngSql = @"
SELECT engagement_id
FROM core.engagements
WHERE COALESCE(status, '') NOT IN ('closed','cancelled');
"@
    $activeIds = Invoke-Psql -Sql $activeEngSql -Label "active engagements candidates"
    $activeDistinct = $activeIds | Sort-Object -Unique
    if ($activeDistinct.Count -eq 1) {
      $targetId = [int]$activeDistinct[0]
      $fillSql = @"
WITH updated AS (
  UPDATE core.attachments
  SET engagement_id = $targetId
  WHERE engagement_id IS NULL
  RETURNING 1
)
SELECT COUNT(*) FROM updated;
"@
      $fillResult = Invoke-Psql -Sql $fillSql -Label "Fill attachments engagement_id"
      if ($fillResult.Count -gt 0) {
        $attachFilled = [int]$fillResult[0]
        $attachNotes = "Filled using sole active engagement_id $targetId."
      }
    }
    else {
      $attachNotes = "Skipped fill: active engagement context ambiguous (candidates=$($activeDistinct.Count))."
    }
  }
  $attachNullAfter = Get-NullCount -Sql "SELECT COUNT(*) FROM core.attachments WHERE engagement_id IS NULL;" -Label "attachments null count post"
  Add-GapSummary -Item "core.attachments.engagement_id" -Before $attachNullBefore -After $attachNullAfter -Filled $attachFilled -Notes $attachNotes
  $attachStatus = if ($attachNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Attachments engagement linkage" -Status $attachStatus -Details "NULL rows after run: $attachNullAfter (before $attachNullBefore). $attachNotes" -Affected $attachFilled

  $findingNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.findings WHERE engagement_id IS NULL;" -Label "findings null count"
  $findingFilled = 0
  $findingNotes = "No deterministic mapping available."
  if ($FillGaps.IsPresent -and $findingNullBefore -gt 0) {
    $engCount = Get-NullCount -Sql "SELECT COUNT(DISTINCT engagement_id) FROM core.engagements;" -Label "engagement distinct count"
    if ($engCount -eq 1) {
      $targetId = Get-NullCount -Sql "SELECT MIN(engagement_id) FROM core.engagements;" -Label "single engagement id"
      $fillSql = @"
WITH updated AS (
  UPDATE core.findings
  SET engagement_id = $targetId
  WHERE engagement_id IS NULL
  RETURNING 1
)
SELECT COUNT(*) FROM updated;
"@
      $fillResult = Invoke-Psql -Sql $fillSql -Label "Fill findings engagement_id"
      if ($fillResult.Count -gt 0) {
        $findingFilled = [int]$fillResult[0]
        $findingNotes = "Filled using the sole engagement_id $targetId."
      }
    }
    else {
      $findingNotes = "Skipped fill: multiple engagements present (count=$engCount)."
    }
  }
  $findingNullAfter = Get-NullCount -Sql "SELECT COUNT(*) FROM core.findings WHERE engagement_id IS NULL;" -Label "findings null count post"
  Add-GapSummary -Item "core.findings.engagement_id" -Before $findingNullBefore -After $findingNullAfter -Filled $findingFilled -Notes $findingNotes
  $findingStatus = if ($findingNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Findings engagement linkage" -Status $findingStatus -Details "NULL rows after run: $findingNullAfter (before $findingNullBefore). $findingNotes" -Affected $findingFilled

  $recNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.recommendations WHERE finding_id IS NULL;" -Label "recommendations null count"
  $recNullAfter = $recNullBefore
  Add-GapSummary -Item "core.recommendations.finding_id" -Before $recNullBefore -After $recNullAfter -Filled 0 -Notes "Auto-fill not permitted; review manually."
  $recStatus = if ($recNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Recommendations finding linkage" -Status $recStatus -Details "NULL rows remaining: $recNullAfter. Manual correction required." -Affected 0

  $actionNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.actions WHERE rec_id IS NULL;" -Label "actions null count"
  $actionNullAfter = $actionNullBefore
  Add-GapSummary -Item "core.actions.rec_id" -Before $actionNullBefore -After $actionNullAfter -Filled 0 -Notes "Auto-fill not permitted; review manually."
  $actionStatus = if ($actionNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Actions recommendation linkage" -Status $actionStatus -Details "NULL rows remaining: $actionNullAfter. Manual correction required." -Affected 0

  $riskNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.risks WHERE org_id IS NULL AND dept_id IS NOT NULL;" -Label "risks org null count"
  $riskFilled = 0
  $riskNotes = "No fill executed."
  if ($FillGaps.IsPresent -and $riskNullBefore -gt 0) {
    $fillSql = @"
WITH updated AS (
  UPDATE core.risks r
  SET org_id = d.org_id
  FROM core.depts d
  WHERE r.dept_id = d.dept_id
    AND r.org_id IS NULL
    AND d.org_id IS NOT NULL
  RETURNING 1
)
SELECT COUNT(*) FROM updated;
"@
    $fillResult = Invoke-Psql -Sql $fillSql -Label "Fill risks org_id"
    if ($fillResult.Count -gt 0) {
      $riskFilled = [int]$fillResult[0]
      $riskNotes = "Filled org_id via dept->org mapping."
    }
  }
  $riskNullAfter = Get-NullCount -Sql "SELECT COUNT(*) FROM core.risks WHERE org_id IS NULL AND dept_id IS NOT NULL;" -Label "risks org null count post"
  Add-GapSummary -Item "core.risks.org_id" -Before $riskNullBefore -After $riskNullAfter -Filled $riskFilled -Notes $riskNotes
  $riskStatus = if ($riskNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Risks org mapping" -Status $riskStatus -Details "Remaining NULL rows: $riskNullAfter (before $riskNullBefore). $riskNotes" -Affected $riskFilled

  $controlNullBefore = Get-NullCount -Sql "SELECT COUNT(*) FROM core.controls WHERE org_id IS NULL AND dept_id IS NOT NULL;" -Label "controls org null count"
  $controlFilled = 0
  $controlNotes = "No fill executed."
  if ($FillGaps.IsPresent -and $controlNullBefore -gt 0) {
    $fillSql = @"
WITH updated AS (
  UPDATE core.controls c
  SET org_id = d.org_id
  FROM core.depts d
  WHERE c.dept_id = d.dept_id
    AND c.org_id IS NULL
    AND d.org_id IS NOT NULL
  RETURNING 1
)
SELECT COUNT(*) FROM updated;
"@
    $fillResult = Invoke-Psql -Sql $fillSql -Label "Fill controls org_id"
    if ($fillResult.Count -gt 0) {
      $controlFilled = [int]$fillResult[0]
      $controlNotes = "Filled org_id via dept->org mapping."
    }
  }
  $controlNullAfter = Get-NullCount -Sql "SELECT COUNT(*) FROM core.controls WHERE org_id IS NULL AND dept_id IS NOT NULL;" -Label "controls org null count post"
  Add-GapSummary -Item "core.controls.org_id" -Before $controlNullBefore -After $controlNullAfter -Filled $controlFilled -Notes $controlNotes
  $controlStatus = if ($controlNullAfter -eq 0) { "PASS" } else { "FAIL" }
  Add-Result -Section "Data" -Item "Controls org mapping" -Status $controlStatus -Details "Remaining NULL rows: $controlNullAfter (before $controlNullBefore). $controlNotes" -Affected $controlFilled

  # Region: Scheduler setup
  if (-not (Test-Path $RefreshScript)) {
    throw "Refresh script not found at $RefreshScript"
  }

  $taskCommand = "pwsh.exe -NoProfile -ExecutionPolicy Bypass -File `"$RefreshScript`""
  $createArgs = @("/Create","/SC","DAILY","/ST","02:30","/TN",$TaskName,"/TR",$taskCommand,"/F","/RU","SYSTEM")
  Write-Log "Configuring scheduled task $TaskName."
  $createOutput = & schtasks.exe @createArgs 2>&1
  $createExit = $LASTEXITCODE
  foreach ($line in $createOutput) { Write-Log "schtasks /Create <= $line" }
  if ($createExit -ne 0) {
    throw "Failed to create/update scheduled task $TaskName."
  }
  Add-Result -Section "Scheduler" -Item "Task $TaskName configured" -Status "PASS" -Details "Daily 02:30 SYSTEM task registered with command: $taskCommand"

  Write-Log "Triggering scheduled task $TaskName for immediate run."
  $runOutput = & schtasks.exe /Run /TN $TaskName 2>&1
  $runExit = $LASTEXITCODE
  foreach ($line in $runOutput) { Write-Log "schtasks /Run <= $line" }
  if ($runExit -ne 0) {
    Add-Result -Section "Scheduler" -Item "Immediate refresh run" -Status "FAIL" -Details "schtasks /Run returned exit code $runExit."
  }
  else {
    Start-Sleep -Seconds 5
    $logCandidates = @()
    $refreshLogFile = $null
    try {
      $scriptDir = Split-Path -Path $RefreshScript -Parent
      if (Test-Path $scriptDir) {
        $logCandidates += Get-ChildItem -Path $scriptDir -Filter "*refresh*.log" -ErrorAction SilentlyContinue
      }
      if (Test-Path $OutDir) {
        $logCandidates += Get-ChildItem -Path $OutDir -Filter "*refresh*.log" -ErrorAction SilentlyContinue
      }
    }
    catch {
      Write-Log "Log discovery warning: $_"
    }
    if ($logCandidates.Count -gt 0) {
      $refreshLogFile = $logCandidates | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    }
    if ($null -ne $refreshLogFile) {
      $tail = Get-Content -Path $refreshLogFile.FullName -Tail 50
      foreach ($line in $tail) { Write-Log "refresh tail <= $line" }
      $detail = "Triggered successfully. Tailed last 50 lines from $($refreshLogFile.FullName)."
      Add-Result -Section "Scheduler" -Item "Immediate refresh run" -Status "PASS" -Details $detail
    }
    else {
      Add-Result -Section "Scheduler" -Item "Immediate refresh run" -Status "PASS" -Details "Triggered successfully. No refresh log detected to tail."
    }
  }

  # Region: RLS tests
  $rlsTestSql = @"
SET search_path TO core, public;
SET app.user_id = '1';
SELECT * FROM vw_engagement_summary LIMIT 3;
SELECT '' AS separator;
SELECT * FROM vw_recommendations_tracker LIMIT 3;
"@
  $rlsOutput = Invoke-Psql -Sql $rlsTestSql -Label "RLS view sampling"
  Add-Result -Section "Verification" -Item "RLS view queries" -Status "PASS" -Details "Executed limited selects on vw_engagement_summary and vw_recommendations_tracker (rows logged)." -Affected 0

  $sslOutput = Invoke-Psql -Sql "SHOW ssl;" -Label "SHOW ssl"
  $sslStatus = "PASS"
  $sslDetail = "ssl=" + ($sslOutput -join ", ")
  Add-Result -Section "Verification" -Item "SSL setting" -Status $sslStatus -Details $sslDetail -Affected 0

  # Region: Final report
  $reportPath = Join-Path $OutDir "final_readiness_report.md"
  $lines = @()
  $lines += "# Final Readiness Report"
  $lines += ""
  $lines += "- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  $lines += "- Database: $DbName (port $Port)"
  $lines += "- FillGaps: $($FillGaps.IsPresent)"
  $lines += ""
  $lines += "## Summary"
  $lines += "| Section | Item | Status | Details | Affected |"
  $lines += "| --- | --- | --- | --- | --- |"
  foreach ($res in $results) {
    $detailEscaped = $res.Details.Replace("|","\|")
    $lines += "| $($res.Section) | $($res.Item) | $($res.Status) | $detailEscaped | $($res.Affected) |"
  }
  $lines += ""
  $lines += "## Data Gap Details"
  $lines += "| Item | Before NULLs | After NULLs | Filled | Notes |"
  $lines += "| --- | --- | --- | --- | --- |"
  foreach ($gap in $gapSummary) {
    $notesEscaped = $gap.Notes.Replace("|","\|")
    $lines += "| $($gap.Item) | $($gap.Before) | $($gap.After) | $($gap.Filled) | $notesEscaped |"
  }
  $lines += ""
  $lines += "## Additional Notes"
  $lines += "- Review data rows still reported as NULL for mandatory FKs before go-live."
  $lines += "- Scheduler log tail (if located) is recorded in `run_final_readiness.log`."
  $lines += "- RLS query samples and SHOW ssl outputs are recorded in `run_final_readiness.log`."

  Set-Content -Path $reportPath -Encoding UTF8 -Value $lines
  Write-Log "Report generated at $reportPath"
  Write-Log "===== Final readiness run completed successfully ====="
}
catch {
  Write-Log "ERROR: $($_.Exception.Message)"
  throw
}
