# Install Testing Tools - Step by Step
# This script installs testing dependencies one by one

Write-Host "Installing Playwright..." -ForegroundColor Green
npm install --save-dev @playwright/test --legacy-peer-deps

Write-Host "Installing Axe-core..." -ForegroundColor Green
npm install --save-dev axe-core @axe-core/playwright --legacy-peer-deps

Write-Host "Installing Lighthouse and serve..." -ForegroundColor Green
npm install --save-dev lighthouse serve --legacy-peer-deps

Write-Host "Installing BackstopJS (without puppeteer)..." -ForegroundColor Green
npm install --save-dev backstopjs --legacy-peer-deps --ignore-scripts

Write-Host "Installing Playwright browsers..." -ForegroundColor Green
npx playwright install

Write-Host "Setup complete!" -ForegroundColor Green
