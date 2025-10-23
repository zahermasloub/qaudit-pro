# Move Testing Environment Files
Write-Host "Moving testing files to tests_environment/..." -ForegroundColor Cyan

# Move config files
if (Test-Path "playwright.config.ts") {
    Move-Item -Path "playwright.config.ts" -Destination "tests_environment/playwright.config.ts" -Force
    Write-Host "✅ Moved playwright.config.ts" -ForegroundColor Green
}

if (Test-Path "backstop.config.js") {
    Move-Item -Path "backstop.config.js" -Destination "tests_environment/backstop.config.js" -Force
    Write-Host "✅ Moved backstop.config.js" -ForegroundColor Green
}

if (Test-Path "backstop.json") {
    Move-Item -Path "backstop.json" -Destination "tests_environment/backstop.json" -Force
    Write-Host "✅ Moved backstop.json" -ForegroundColor Green
}

# Move tests folder
if (Test-Path "tests") {
    Move-Item -Path "tests" -Destination "tests_environment/tests" -Force
    Write-Host "✅ Moved tests/" -ForegroundColor Green
}

# Move backstop_data folder
if (Test-Path "backstop_data") {
    Move-Item -Path "backstop_data" -Destination "tests_environment/backstop_data" -Force
    Write-Host "✅ Moved backstop_data/" -ForegroundColor Green
}

# Move GitHub workflow
if (Test-Path ".github/workflows/ui-tests.yml") {
    Copy-Item -Path ".github/workflows/ui-tests.yml" -Destination "tests_environment/.github/workflows/ui-tests.yml" -Force
    Write-Host "✅ Copied ui-tests.yml" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ All files moved successfully!" -ForegroundColor Green
