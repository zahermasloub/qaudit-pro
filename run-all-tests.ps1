#!/usr/bin/env pwsh
# 🧪 Run All Tests Script
# This script runs all test suites in sequence

$ErrorActionPreference = "Continue"

Write-Host "🚀 Starting QAudit Pro Test Suite..." -ForegroundColor Cyan
Write-Host ""

# Check if application is running
Write-Host "🔍 Checking if application is running on localhost:3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Application is running!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Application is not running!" -ForegroundColor Red
    Write-Host "💡 Please start the application first: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  1️⃣  Running E2E Tests (Playwright)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm run test:e2e

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  2️⃣  Running Accessibility Tests" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm run test:accessibility

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  3️⃣  Running Visual Regression Tests" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if reference images exist
if (-not (Test-Path "tests/visual/backstop_data/bitmaps_reference")) {
    Write-Host "📸 Creating reference images first..." -ForegroundColor Yellow
    npm run test:visual:reference
}

npm run test:visual

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  4️⃣  Running Performance Tests (Lighthouse)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

npm run test:lighthouse

Write-Host ""
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✨ All tests completed!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View Reports:" -ForegroundColor Cyan
Write-Host "   - Playwright: tests/reports/playwright/index.html" -ForegroundColor White
Write-Host "   - BackstopJS: tests/reports/backstop/html_report/index.html" -ForegroundColor White
Write-Host "   - Lighthouse: tests/reports/lighthouse/" -ForegroundColor White
Write-Host ""
Write-Host "🎯 To open Playwright report: npm run test:report" -ForegroundColor Yellow
Write-Host ""
