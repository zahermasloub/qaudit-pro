# schedule_backup.ps1
# سكربت لإنشاء مهمة مجدولة يومية لتشغيل backup_pg.ps1 عند الساعة 02:00 صباحًا بصلاحيات مرتفعة.
# مثال تشغيل:
# .\schedule_backup.ps1 -ScriptPath "C:\qaudit-pro\backup_pg.ps1"

param(
    [string]$ScriptPath = "C:\qaudit-pro\backup_pg.ps1"
)

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 2:00am
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "PostgresDailyBackup" -Action $Action -Trigger $Trigger -Principal $Principal -Force

Write-Host "تم إنشاء مهمة نسخ احتياطي يومية باسم PostgresDailyBackup."
