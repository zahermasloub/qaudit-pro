# schedule_backup_system_v2.ps1
# الهدف: إنشاء/تحديث مهمة النسخ الاحتياطي لتعمل بحساب SYSTEM يوميًا عند الساعة المحددة، مع سجل تشغيل بسيط.
# مثال تشغيل:
# .\schedule_backup_system_v2.ps1 -BackupScript "C:\Ops\backup_pg.ps1" -TaskName "AuditDB-DailyBackup" -RunAt "02:00" -LogFile "C:\PgBackups\auditdb\backup_task.log"

param(
    [string]$BackupScript = "C:\Ops\backup_pg.ps1",
    [string]$TaskName = "AuditDB-DailyBackup",
    [string]$RunAt = "02:00",
    [string]$LogFile = "C:\PgBackups\auditdb\backup_task.log"
)

# تحقق من وجود سكربت النسخ الاحتياطي
if (!(Test-Path $BackupScript)) { throw "Backup script not found: $BackupScript" }

# تأكد من وجود مجلد السجلات
$logDir = Split-Path $LogFile -Parent
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }

# سطر أوامر التشغيل: نضيف إخراج إلى لوج
$psArgs = "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$BackupScript`" 2>&1 | Tee-Object -FilePath `"$LogFile`" -Append"

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $psArgs
$trigger = New-ScheduledTaskTrigger -Daily -At (Get-Date $RunAt)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -RunOnlyIfNetworkAvailable -AllowStartIfOnBatteries `
    -StartWhenAvailable -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 5)

# أنشئ أو حدّث
if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Set-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings
    Write-Host "Updated existing task: $TaskName"
}
else {
    Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
    Write-Host "Created new task: $TaskName"
}

# تجربة تشغيل الآن (اختياري)
try {
    Start-ScheduledTask -TaskName $TaskName
    Start-Sleep -Seconds 5
    Write-Host "Triggered task once. Tail log (last 50 lines):"
    Get-Content $LogFile -Tail 50
}
catch {
    Write-Warning "Task created/updated but failed to start automatically. Run Task Scheduler as Admin to check history."
}
