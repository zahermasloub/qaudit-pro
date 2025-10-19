# backup_pg.ps1
# سكربت نسخ احتياطي يومي لقاعدة PostgreSQL بصيغة pg_dump -Fc مع تدوير 7 أيام.
# يخرج ملفًا باسم auditdb_YYYYMMDD_HHMM.dump في $BackupDir.
# مثال أمر استعادة: pg_restore -U postgres -d auditdb -Fc <backup_file>
param(
    [string]$PgBin = "C:\PostgreSQL\18\bin",
    [string]$BackupDir = "E:\PgBackups",
    [string]$DbName = "auditdb",
    [string]$DbUser = "postgres",
    [string]$DbPass = "ChangeMe123!",
    [int]$RetentionDays = 7
)

if (!(Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir | Out-Null }
$env:PGPASSWORD = $DbPass
$now = Get-Date -Format "yyyyMMdd_HHmm"
$backupFile = Join-Path $BackupDir ("${DbName}_$now.dump")

& "$PgBin\pg_dump.exe" -U $DbUser -F c -b -v -f $backupFile $DbName

# تدوير النسخ القديمة
Get-ChildItem $BackupDir -Filter "$DbName*.dump" | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetentionDays) } | Remove-Item -Force

Write-Host "Backup complete: $backupFile"
Write-Host "Restore example:"
Write-Host "`$env:PGPASSWORD='$DbPass'; $PgBin\pg_restore.exe -U $DbUser -d $DbName -Fc $backupFile"
