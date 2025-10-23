# Install Testing Tools
# This script installs Playwright, BackstopJS, Axe-core, and Lighthouse

Write-Host "Installing testing dependencies..." -ForegroundColor Green

npm install --save-dev @playwright/test backstopjs axe-core @axe-core/playwright lighthouse serve --legacy-peer-deps

if ($LASTEXITCODE -eq 0) {
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green

    Write-Host "Installing Playwright browsers..." -ForegroundColor Green
    npx playwright install

    Write-Host "Initializing BackstopJS..." -ForegroundColor Green
    npx backstop init

    Write-Host "Setup complete!" -ForegroundColor Green
}
else {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}
