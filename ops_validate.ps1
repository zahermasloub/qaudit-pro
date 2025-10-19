<#
  Quick operational validation for auditdb core schema and scheduled refresh job.
#>
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

# Environment configuration (static per request)
$PgBin = "C:\Program Files\PostgreSQL\18\bin"
$Db    = "auditdb"
$User  = "postgres"
$Pwd   = "postgres"
$Port  = 5432
$Out   = "C:\Temp\CoreAlignment\ops_validate_report.md"
$TaskName = "AuditDB-Refresh-MV"

# Ensure prerequisites
$psqlPath = Join-Path $PgBin "psql.exe"
if (-not (Test-Path $psqlPath)) {
  throw "psql not found at $psqlPath"
}

$outDir = Split-Path -Path $Out -Parent
if (-not [string]::IsNullOrWhiteSpace($outDir)) {
  New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$connectionUri = "postgresql://{0}:{1}@127.0.0.1:{2}/{3}" -f $User,$Pwd,$Port,$Db

function Invoke-Psql {
  param(
    [string]$Sql,
    [string]$Label = "SQL",
    [switch]$WithHeaders
  )
  $tmp = [System.IO.Path]::GetTempFileName()
  Set-Content -Path $tmp -Encoding UTF8 -Value $Sql
  try {
    $args = @($script:connectionUri, "-v", "ON_ERROR_STOP=1", "-X")
    if (-not $WithHeaders) {
      $args += @("-q", "-t", "-A", "-F", "|")
    }
    $args += @("-f", $tmp)
    $output = & $script:psqlPath @args 2>&1
    $exit = $LASTEXITCODE
  }
  finally {
    Remove-Item -Path $tmp -ErrorAction SilentlyContinue
  }
  if ($exit -ne 0) {
    throw "psql failed for [$Label]: $($output -join '; ')"
  }
  $lines = @()
  foreach ($line in $output) {
    if ($null -ne $line) {
      $trim = $line.ToString().Trim()
      if ($trim.Length -gt 0) {
        $lines += $trim
      }
    }
  }
  return $lines
}

$results = New-Object System.Collections.Generic.List[object]

function Add-Result {
  param(
    [string]$Section,
    [string]$Item,
    [string]$Status,
    [string]$Details
  )
  $results.Add([pscustomobject]@{
      Section = $Section
      Item    = $Item
      Status  = $Status
      Details = $Details
    }) | Out-Null
}

try {
  # 1) Connectivity information
  $version = Invoke-Psql -Sql "SELECT version();" -Label "version"
  $ssl     = Invoke-Psql -Sql "SHOW ssl;" -Label "ssl"
  $who     = Invoke-Psql -Sql "SELECT current_database() || '|' || current_user;" -Label "db_user"
  Add-Result -Section "Connectivity" -Item "PostgreSQL connection" -Status "PASS" -Details ("version={0}; ssl={1}; db/user={2}" -f ($version -join ","), ($ssl -join ","), ($who -join ",")))

  # 2) RLS checks
  $rlsSql = @"
SELECT c.relname,
       c.relrowsecurity,
       COALESCE(p.policy_count,0) AS policy_count
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN (
  SELECT polrelid, COUNT(*) FILTER (WHERE polcmd='r') AS policy_count
  FROM pg_policy
  GROUP BY polrelid
) p ON p.polrelid = c.oid
WHERE n.nspname='core'
  AND c.relname IN ('engagements','findings','recommendations','actions','attachments')
ORDER BY c.relname;
"@
  $rlsRows = Invoke-Psql -Sql $rlsSql -Label "RLS tables"
  foreach ($row in $rlsRows) {
    $parts = $row.Split('|')
    if ($parts.Length -ge 3) {
      $table = "core." + $parts[0].Trim()
      $enabled = $parts[1].Trim().ToLowerInvariant() -eq "t"
      $policyCount = [int]$parts[2].Trim()
      $status = if ($enabled -and $policyCount -gt 0) { "PASS" } else { "FAIL" }
      $details = "RLS=" + ($enabled ? "ENABLED" : "DISABLED") + "; policies=" + $policyCount
      Add-Result -Section "RLS" -Item $table -Status $status -Details $details
    }
  }

  # Helper lookups for structure checks
  function Has-Columns {
    param([string]$Schema,[string]$Table,[string[]]$Columns)
    $sql = @"
SELECT column_name
FROM information_schema.columns
WHERE table_schema='$Schema' AND table_name='$Table';
"@
    $rows = Invoke-Psql -Sql $sql -Label "$Schema.$Table columns"
    $set = $rows | ForEach-Object { $_.ToLowerInvariant() }
    $missing = @()
    foreach ($c in $Columns) {
      if (-not ($set -contains $c.ToLowerInvariant())) { $missing += $c }
    }
    return $missing
  }

  function Has-Indexes {
    param([string]$Schema,[string]$Table,[string[]]$Indexes)
    $sql = @"
SELECT indexname
FROM pg_indexes
WHERE schemaname='$Schema' AND tablename='$Table';
"@
    $rows = Invoke-Psql -Sql $sql -Label "$Schema.$Table indexes"
    $set = $rows | ForEach-Object { $_.ToLowerInvariant() }
    $missing = @()
    foreach ($i in $Indexes) {
      if (-not ($set -contains $i.ToLowerInvariant())) { $missing += $i }
    }
    return $missing
  }

  function Has-FK {
    param([string]$Schema,[string]$Table,[string]$Column,[string]$RefSchema,[string]$RefTable)
    $sql = @"
SELECT c.conname
FROM pg_constraint c
JOIN unnest(c.conkey) WITH ORDINALITY AS arr(attnum,idx) ON TRUE
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = arr.attnum
WHERE c.conrelid = '$Schema.$Table'::regclass
  AND c.confrelid = '$RefSchema.$RefTable'::regclass
  AND c.contype='f'
  AND a.attname = '$Column';
"@
    $rows = Invoke-Psql -Sql $sql -Label "$Schema.$Table fk $Column"
    return $rows.Count -gt 0
  }

  # 3) Structural validations
  $checks = @(
    @{ Section="Structure"; Item="core.attachments"; Columns=@("engagement_id","sha256","storage_path"); Indexes=@("ix_attachments_eng","ix_attachments_sha"); FK=@{Column="engagement_id";RefSchema="core";RefTable="engagements"} },
    @{ Section="Structure"; Item="core.findings"; Columns=@("engagement_id"); Indexes=@(); FK=@{Column="engagement_id";RefSchema="core";RefTable="engagements"} },
    @{ Section="Structure"; Item="core.recommendations"; Columns=@("finding_id"); Indexes=@(); FK=@{Column="finding_id";RefSchema="core";RefTable="findings"} },
    @{ Section="Structure"; Item="core.actions"; Columns=@("rec_id"); Indexes=@(); FK=@{Column="rec_id";RefSchema="core";RefTable="recommendations"} },
    @{ Section="Structure"; Item="core.engagements"; Columns=@(); Indexes=@("ix_engagements_audit","ix_engagements_dept"); FK=@(
        @{Column="audit_id";RefSchema="core";RefTable="audits"},
        @{Column="dept_id";RefSchema="core";RefTable="depts"}
      )}
  )

  foreach ($cfg in $checks) {
    $item = $cfg.Item
    $section = $cfg.Section
    $parts = $item.Split('.')
    $schema = $parts[0]
    $table  = $parts[1]
    $issues = @()

    if ($cfg.Columns.Count -gt 0) {
      $missingCols = Has-Columns -Schema $schema -Table $table -Columns $cfg.Columns
      if ($missingCols.Count -gt 0) {
        $issues += "Missing columns: " + ($missingCols -join ", ")
      }
    }

    if ($cfg.Indexes.Count -gt 0) {
      $missingIdx = Has-Indexes -Schema $schema -Table $table -Indexes $cfg.Indexes
      if ($missingIdx.Count -gt 0) {
        $issues += "Missing indexes: " + ($missingIdx -join ", ")
      }
    }

    if ($cfg.FK -is [System.Collections.IDictionary]) {
      $fkSpec = $cfg.FK
      if (-not (Has-FK -Schema $schema -Table $table -Column $fkSpec.Column -RefSchema $fkSpec.RefSchema -RefTable $fkSpec.RefTable)) {
        $issues += ("Missing FK {0}->{1}.{2}" -f $fkSpec.Column, $fkSpec.RefSchema, $fkSpec.RefTable)
      }
    }
    elseif ($cfg.FK -is [System.Collections.IEnumerable]) {
      foreach ($fkSpec in $cfg.FK) {
        if (-not (Has-FK -Schema $schema -Table $table -Column $fkSpec.Column -RefSchema $fkSpec.RefSchema -RefTable $fkSpec.RefTable)) {
          $issues += ("Missing FK {0}->{1}.{2}" -f $fkSpec.Column, $fkSpec.RefSchema, $fkSpec.RefTable)
        }
      }
    }

    if ($issues.Count -eq 0) {
      Add-Result -Section $section -Item $item -Status "PASS" -Details "Columns, indexes, and FKs validated."
    }
    else {
      Add-Result -Section $section -Item $item -Status "FAIL" -Details ($issues -join " | ")
    }
  }

  # 4) Smoke queries
  $smokeSql = @"
SET search_path TO core, public;
SET app.user_id = '1';
SELECT * FROM vw_engagement_summary LIMIT 3;
SELECT * FROM vw_recommendations_tracker LIMIT 3;
"@
  Invoke-Psql -Sql $smokeSql -Label "Smoke queries" | Out-Null
  Add-Result -Section "Smoke" -Item "View samples" -Status "PASS" -Details "Successfully queried vw_engagement_summary and vw_recommendations_tracker (LIMIT 3)."

  # 5) Scheduled task validation
  try {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
    $taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
    $state = $task.State.ToString()
    $nextRun = $taskInfo.NextRunTime
    $status = if ($state -eq "Ready" -or $state -eq "Running") { "PASS" } else { "FAIL" }
    $details = "State=$state; NextRunTime=$nextRun"
    Add-Result -Section "Scheduler" -Item "Task existence ($TaskName)" -Status $status -Details $details

    try {
      Start-ScheduledTask -TaskName $TaskName -ErrorAction Stop
      Start-Sleep -Seconds 5
      Add-Result -Section "Scheduler" -Item "Task trial run" -Status "PASS" -Details "Start-ScheduledTask succeeded (5s wait)."
    }
    catch {
      Add-Result -Section "Scheduler" -Item "Task trial run" -Status "FAIL" -Details $_.Exception.Message
    }
  }
  catch {
    Add-Result -Section "Scheduler" -Item "Task existence ($TaskName)" -Status "FAIL" -Details $_.Exception.Message
    Add-Result -Section "Scheduler" -Item "Task trial run" -Status "FAIL" -Details "Skipped because task not found."
  }

  # Compile markdown report
  $overallStatus = if (($results | Where-Object { $_.Status -eq "FAIL" }).Count -gt 0) { "FAIL" } else { "PASS" }
  $lines = @()
  $lines += "# Ops Validation Report"
  $lines += ""
  $lines += "- Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  $lines += "- Database: $Db (port $Port)"
  $lines += "- Overall Status: **$overallStatus**"
  $lines += ""

  foreach ($section in ($results | Select-Object -ExpandProperty Section -Unique)) {
    $lines += "## $section"
    $lines += "| Item | Status | Details |"
    $lines += "| --- | --- | --- |"
    foreach ($entry in $results | Where-Object { $_.Section -eq $section }) {
      $detailEsc = $entry.Details.Replace("|","\|")
      $lines += "| $($entry.Item) | $($entry.Status) | $detailEsc |"
    }
    $lines += ""
  }

  Set-Content -Path $Out -Encoding UTF8 -Value $lines

  # Console summary
  Write-Host "Overall Status: $overallStatus"
  foreach ($entry in $results) {
    Write-Host ("[{0}] {1} - {2}" -f $entry.Status, $entry.Item, $entry.Details)
  }
  Write-Host "Markdown report saved to $Out"
}
catch {
  Write-Host "Validation failed: $($_.Exception.Message)" -ForegroundColor Red
  throw
}
