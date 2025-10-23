# ⚡ Quick Start - UI Testing

## Prerequisites
- ✅ Node.js v22.20.0 installed
- ✅ All dependencies installed
- ✅ Playwright browsers installed

## First Time Setup (Already Done ✓)

```bash
# Install dependencies
npm install --legacy-peer-deps

# Install Playwright browsers
npx playwright install chromium webkit --with-deps

# Create lighthouse reports directory
mkdir -p tests_environment/tests/reports/lighthouse
```

## Running Tests

### 1. Start the Application
```bash
npm run dev
# Wait for: ✓ Ready on http://localhost:3001
```

### 2. Create Visual Reference (First Time Only)
```bash
npm run test:visual:reference
# Creates baseline screenshots in backstop_data/bitmaps_reference/
```

### 3. Run E2E Tests
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # Run in UI mode
npm run test:e2e:headed       # Run with browser visible
npm run test:e2e:debug        # Run in debug mode
```

### 4. Run Visual Regression Tests
```bash
npm run test:visual           # Compare against reference
npm run test:visual:approve   # Approve current as new reference
```

### 5. Run Accessibility Tests
```bash
npm run test:accessibility    # WCAG 2.1 AA compliance
```

### 6. Run Performance Tests
```bash
# For production build:
npm run build
npm run serve:prod            # In separate terminal
npm run test:lighthouse

# For dev mode:
npm run test:lighthouse       # With dev server running
```

### 7. View Reports
```bash
npm run test:report           # Open Playwright HTML report
# BackstopJS opens automatically in browser
# Lighthouse reports in: tests_environment/tests/reports/lighthouse/
```

## All Tests at Once
```bash
npm run test:all
# Runs: E2E → Accessibility → Visual → Lighthouse
```

## File Structure
```
tests_environment/
├── tests/
│   ├── e2e/                  # E2E test files
│   ├── accessibility/        # A11y test files
│   ├── performance/          # Lighthouse tests
│   └── reports/              # All test reports
├── backstop_data/
│   ├── bitmaps_reference/    # Visual reference images
│   └── html_report/          # Visual diff reports
├── playwright.config.ts      # Playwright config
└── backstop.config.js        # BackstopJS config
```

## CI/CD
GitHub Actions automatically runs all tests on:
- Push to `main`, `master`, `develop`
- Pull requests
- Daily at 2 AM (scheduled)

Workflow file: `.github/workflows/ui-tests.yml`

## Troubleshooting

### App not starting?
```bash
# Check if port 3001 is free
netstat -ano | findstr :3001

# Reset database
npm run db:push
```

### Tests failing?
```bash
# Clear Playwright cache
npx playwright install --force

# Clear BackstopJS cache
rm -rf tests_environment/backstop_data/bitmaps_test
```

### Need to update reference images?
```bash
npm run test:visual:reference  # Recreate all references
npm run test:visual:approve    # Approve current test results
```

## Test Coverage

| Test Type | Files | Coverage |
|-----------|-------|----------|
| E2E | 3 files | Auth, Navigation, Screenshots |
| Accessibility | 1 file | WCAG 2.1 AA, Keyboard Nav |
| Visual | 4 scenarios | Home, Login, Dashboard, Annual Plan |
| Performance | 4 URLs | Performance, A11y, SEO, Best Practices |

## Environment Variables (Optional)

Create `.env.test` for test-specific settings:
```env
BASE_URL=http://localhost:3001
TEST_EMAIL=admin@qaudit.com
TEST_PASSWORD=admin123
```

---

**Status**: 🟢 Ready to run  
**Last Updated**: 23 October 2025
