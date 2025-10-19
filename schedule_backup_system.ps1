# schedule_backup_system.ps1
# ينشئ مهمة مجدولة يومية لتشغيل backup_pg.ps1 بحساب SYSTEM وبصلاحيات Highest.
# مثال تشغيل:
# .\schedule_backup_system.ps1 -ScriptPath "d:\qaudit-pro\backup_pg.ps1"

param(
    [string]$ScriptPath = "d:\qaudit-pro\backup_pg.ps1"
)

$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -WindowStyle Hidden -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -Daily -At 2:00am
$Principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName "PostgresDailyBackup" -Action $Action -Trigger $Trigger -Principal $Principal -Force

Write-Host "تم إنشاء مهمة نسخ احتياطي يومية باسم PostgresDailyBackup."
