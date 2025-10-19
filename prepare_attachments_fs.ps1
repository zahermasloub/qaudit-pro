# prepare_attachments_fs.ps1
# سكربت إعداد مجلد مرفقات آمن مع ضبط الصلاحيات ووضع علامة منع التنفيذ.
param(
    [string]$AttachmentsRoot = "E:\AuditFiles",
    [string]$AppUser = "appsvc",
    [switch]$AllowPublicRead = $false
)

if (!(Test-Path $AttachmentsRoot)) { New-Item -ItemType Directory -Path $AttachmentsRoot | Out-Null }

# ضبط ACLs: منح حساب التطبيق تحكم كامل، منع التنفيذ، منح قراءة عامة إذا لزم
$acl = Get-Acl $AttachmentsRoot
$rule1 = New-Object System.Security.AccessControl.FileSystemAccessRule($AppUser, "Read,Write,Modify", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($rule1)
if ($AllowPublicRead) {
    $rule2 = New-Object System.Security.AccessControl.FileSystemAccessRule("Users", "Read", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.AddAccessRule($rule2)
}
Set-Acl $AttachmentsRoot $acl

# وضع ملف علامة لمنع التنفيذ
$blocked = Join-Path $AttachmentsRoot ".blocked"
Set-Content $blocked "Execution is blocked for security."

Write-Host "Attachment root prepared at $AttachmentsRoot"
