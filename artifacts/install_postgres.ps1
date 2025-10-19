# install_postgres.ps1
# سكربت تثبيت PostgreSQL 16 وإعداد الأداء على Windows
$installer = "postgresql-16.0-windows-x64.exe"
$datadir = "D:\PostgresData"
$superpass = "StrongPass123"
Start-Process -FilePath $installer -ArgumentList "--mode unattended --superpassword '$superpass' --datadir '$datadir'" -Wait

# إعداد TCP/IP
Set-Content -Path "$datadir\postgresql.conf" -Value "listen_addresses = '*'"
Restart-Service postgresql-x64-16

# ضبط الأداء
Add-Content -Path "$datadir\postgresql.conf" -Value "shared_buffers = 4GB`nwork_mem = 64MB`nmaintenance_work_mem = 256MB"
Restart-Service postgresql-x64-16
