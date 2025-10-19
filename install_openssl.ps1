# install_openssl.ps1
# سكربت يتحقق من وجود OpenSSL، وإن لم يوجد يثبته تلقائيًا عبر winget أو choco.
# مثال تشغيل:
# .\install_openssl.ps1

$openssl = Get-Command openssl -ErrorAction SilentlyContinue
if ($openssl) {
    Write-Host "OpenSSL مثبت بالفعل: $($openssl.Source)"
    exit 0
}

if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "تثبيت OpenSSL عبر winget..."
    winget install -e --id ShiningLight.OpenSSL
}
elseif (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "تثبيت OpenSSL عبر choco..."
    choco install openssl.light -y
}
else {
    Write-Error "لم يتم العثور على winget أو choco. ثبّت OpenSSL يدويًا."
}
