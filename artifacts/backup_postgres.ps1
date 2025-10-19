# backup_postgres.ps1
# سكربت نسخ احتياطي يومي لقاعدة بيانات PostgreSQL
$PG_PATH = "C:\Program Files\PostgreSQL\16\bin"
$BACKUP_DIR = "D:\DBBackups"
$DATE = Get-Date -Format "yyyyMMdd_HHmm"
& "$PG_PATH\pg_basebackup.exe" -D "$BACKUP_DIR\$DATE" -Ft -z -U postgres -P
