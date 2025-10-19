# disable_ssl.ps1
# سكربت لتعطيل ssl مؤقتًا في postgresql.conf ثم محاولة تشغيل خدمة PostgreSQL
# مثال تشغيل:
# .\disable_ssl.ps1 -DataDir "C:\Program Files\PostgreSQL\18\data" -ServiceName "postgresql-x64-18"

param(
    [string]$DataDir = "C:\Program Files\PostgreSQL\18\data",
    [string]$ServiceName = "postgresql-x64-18"
)
$conf = Join-Path $DataDir "postgresql.conf"
if (Test-Path $conf) {
    (Get-Content $conf) -replace '^(#?ssl\s*=\s*).+$', 'ssl = off' | Set-Content $conf
    Write-Host "تم تعطيل ssl في postgresql.conf"
    try {
        Start-Service -Name $ServiceName
        Write-Host "تم تشغيل خدمة PostgreSQL بنجاح."
    }
    catch {
        Write-Error "تعذّر تشغيل الخدمة. راجع سجل الأخطاء في مجلد البيانات."
    }
}
else {
    Write-Error "لم يتم العثور على postgresql.conf"
}
