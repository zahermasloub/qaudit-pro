# schedule_refresh_mv.ps1
# الغرض: جدولة تحديث الـ Materialized View (mv_org_kpis) تلقائيًا باستخدام Windows Task Scheduler.
# التشغيل: شغّل السكريبت مرة واحدة لإنشاء مهمة مجدولة (يمكن تعديل الباراميترات).
param(
    [string]$ScriptPath = "refresh_mv.ps1",
    [string]$TaskName = "Refresh_mv_org_kpis",
    [string]$Schedule = "PT1H"  # كل ساعة (ISO8601)
)
$Action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$ScriptPath`""
$Trigger = New-ScheduledTaskTrigger -RepetitionInterval $Schedule -AtStartup
Register-ScheduledTask -Action $Action -Trigger $Trigger -TaskName $TaskName -Description "Refresh mv_org_kpis materialized view" -Force
Write-Host "تمت جدولة تحديث الـ MV بنجاح."
