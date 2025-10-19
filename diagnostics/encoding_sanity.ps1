# encoding_sanity.ps1
# Collects OS, browser, and PostgreSQL encoding evidence for Arabic/UTF-8 issues
$ErrorActionPreference = 'Stop'
$diagnostics = "$(Resolve-Path .)\diagnostics"
if (!(Test-Path $diagnostics)) { mkdir $diagnostics | Out-Null }

# OS Locale
Get-WinSystemLocale | Out-File "$diagnostics\os_locale.txt"
Get-Culture | Out-File "$diagnostics\os_culture.txt"

# Browser Info (user must copy-paste from browser console)
"Paste the following in your browser console and save output as browser_env.json in diagnostics folder:" | Out-File "$diagnostics\browser_instructions.txt"
'$out = {
  userAgent: navigator.userAgent,
  language: navigator.language,
  languages: navigator.languages,
  characterSet: document.characterSet,
  dir: document.dir,
  lang: document.documentElement.lang,
  font: getComputedStyle(document.body).fontFamily,
  direction: getComputedStyle(document.body).direction
};
console.log(JSON.stringify($out, null, 2));' | Out-File -Append "$diagnostics\browser_instructions.txt"

# PostgreSQL Encoding
"`n--- PostgreSQL Encoding ---`n" | Out-File -Append "$diagnostics\db_encoding.txt"
try {
    $psql = Get-Command psql -ErrorAction Stop
    $db = "qaudit"  # Change if needed
    psql -d $db -c "SHOW SERVER_ENCODING;" | Out-File -Append "$diagnostics\db_encoding.txt"
    psql -d $db -c "SELECT datname, pg_encoding_to_char(encoding) FROM pg_database;" | Out-File -Append "$diagnostics\db_encoding.txt"
    psql -d $db -c "SELECT datcollate, datctype FROM pg_database WHERE datname = current_database();" | Out-File -Append "$diagnostics\db_encoding.txt"
}
catch {
    "psql not found or failed. Please run manually and save output to diagnostics/db_encoding.txt" | Out-File -Append "$diagnostics\db_encoding.txt"
}

Write-Host "Diagnostics collected in $diagnostics. Upload all files for review."
