# 🧪 QAudit Pro - UI Testing Environment

**Comprehensive testing suite for E2E, Visual Regression, Accessibility, and Performance testing.**

---

## 📋 Overview

This testing environment provides a complete, production-ready testing infrastructure for QAudit Pro. It includes:

- **E2E Testing** (Playwright) - User flows, navigation, authentication
- **Visual Regression** (BackstopJS) - Screenshot comparison across viewports
- **Accessibility** (axe-core) - WCAG 2.1 AA compliance
- **Performance** (Lighthouse) - Core Web Vitals, SEO, Best Practices

---

## 🚀 Quick Start

See [`QUICK_START.md`](./QUICK_START.md) for detailed instructions.

```bash
# 1. Start app
npm run dev

# 2. Create visual reference (first time)
npm run test:visual:reference

# 3. Run all tests
npm run test:all

# 4. View reports
npm run test:report
```

---

## 📁 Directory Structure

```
tests_environment/
├── tests/
│   ├── e2e/                    # Playwright E2E tests
│   ├── accessibility/          # axe-core accessibility tests
│   ├── performance/            # Lighthouse performance tests
│   ├── helpers/                # Shared utilities
│   └── reports/                # Test reports (gitignored)
├── backstop_data/
│   ├── bitmaps_reference/      # Visual reference images
│   ├── bitmaps_test/           # Test comparison images
│   └── html_report/            # Visual diff reports
├── playwright.config.ts        # Playwright configuration
├── backstop.config.js          # BackstopJS configuration
├── backstop.json               # BackstopJS JSON config
├── QUICK_START.md              # Quick start guide
└── TESTING_ENVIRONMENT_STRUCTURE.md  # Detailed structure
```

---

## 🔧 Configuration Files

### Playwright (`playwright.config.ts`)
- Test directory: `./tests`
- Retries: 1
- Projects: Desktop Chrome (1280×800), iPhone 12
- Base URL: http://localhost:3001
- Reports: HTML, JSON, List

### BackstopJS (`backstop.config.js`)
- Engine: Playwright
- Viewports: Phone (375×667), Tablet (768×1024), Desktop (1920×1080)
- Scenarios: Homepage, Login, Dashboard, Annual Plan
- Reports: Browser, JSON

### BackstopJS (`backstop.json`)
- Simplified config with desktop (1280×800) and mobile (375×812)
- Scenarios: Home, Login, Dashboard
- Engine: Playwright

---

## 📊 Test Scripts

| Script | Description |
|--------|-------------|
| `test:e2e` | Run E2E tests |
| `test:e2e:ui` | Run E2E tests in UI mode |
| `test:e2e:headed` | Run E2E tests with visible browser |
| `test:e2e:debug` | Run E2E tests in debug mode |
| `test:accessibility` | Run accessibility tests |
| `test:visual` | Run visual regression tests |
| `test:visual:reference` | Create new reference images |
| `test:visual:approve` | Approve current test results as reference |
| `test:lighthouse` | Run Lighthouse performance tests |
| `test:all` | Run all test suites |
| `test:report` | Open Playwright HTML report |

---

## 🧪 Test Suites

### E2E Tests (Playwright)

**Files**: `tests/e2e/*.spec.ts`

**Coverage**:
- Authentication flow (login, logout, validation)
- Dashboard navigation
- Annual plan module (list, create, filter)
- Visual regression (screenshots)
- RTL support

**Example**:
```typescript
test('should login successfully', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'admin@qaudit.com');
  await page.fill('input[name="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Visual Regression (BackstopJS)

**Files**: `backstop.config.js`, `backstop.json`

**Scenarios**:
- Homepage
- Login page
- Dashboard
- Annual Plan

**Viewports**:
- Desktop: 1280×800 / 1920×1080
- Mobile: 375×812 / 375×667

**Workflow**:
1. Create reference: `npm run test:visual:reference`
2. Run comparison: `npm run test:visual`
3. Review diff report (auto-opens in browser)
4. Approve if OK: `npm run test:visual:approve`

### Accessibility Tests (axe-core)

**Files**: `tests/accessibility/accessibility.spec.ts`

**Standards**: WCAG 2.1 Level AA

**Coverage**:
- Homepage
- Login page
- Dashboard
- Annual Plan
- Color contrast
- Keyboard navigation

**Example**:
```typescript
test('Dashboard should be accessible', async ({ page }) => {
  await page.goto('/dashboard');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Performance Tests (Lighthouse)

**Files**: `tests/performance/lighthouse.test.ts`

**URLs Tested**:
- Homepage
- Login
- Dashboard
- Annual Plan

**Metrics**:
- Performance
- Accessibility
- Best Practices
- SEO

**Thresholds**:
- Performance: ≥70%
- Accessibility: ≥90%
- Best Practices: ≥80%
- SEO: ≥80%

---

## 📊 Reports

### Playwright Reports
- Location: `tests/reports/playwright/`
- Format: HTML + JSON
- View: `npm run test:report`

### BackstopJS Reports
- Location: `tests/reports/backstop/`
- Format: HTML (opens automatically)
- Shows: Side-by-side comparison, diff overlay

### Lighthouse Reports
- Location: `tests/reports/lighthouse/`
- Format: HTML + JSON
- Files: `{page-name}.html`, `summary.json`

---

## 🔄 CI/CD Integration

**GitHub Actions**: `.github/workflows/ui-tests.yml`

**Triggers**:
- Push to `main`, `master`, `develop`
- Pull requests
- Scheduled (daily at 2 AM)

**Jobs**:
1. **test**: Runs all test suites on Node 18.x, 20.x
2. **cross-browser**: Tests on Chromium, Firefox, WebKit across Ubuntu, Windows, macOS

**Artifacts**:
- Playwright reports (30-day retention)
- BackstopJS reports (30-day retention)
- Lighthouse reports (30-day retention)

---

## 🛠️ Troubleshooting

### Tests failing after code changes?
```bash
# Update visual references
npm run test:visual:reference
npm run test:visual:approve
```

### Playwright errors?
```bash
# Reinstall browsers
npx playwright install --force

# Check browser versions
npx playwright --version
```

### BackstopJS not creating references?
```bash
# Ensure app is running
npm run dev

# Check backstop_data directory exists
mkdir -p backstop_data/bitmaps_reference

# Reinitialize if needed
npx backstop init
```

### Port 3001 already in use?
```bash
# Windows
netstat -ano | findstr :3001

# Linux/Mac
lsof -i :3001
```

---

## 📚 Additional Documentation

- [`TESTING_GUIDE.md`](../TESTING_GUIDE.md) - Comprehensive testing guide
- [`TESTING_QUICKSTART.md`](../TESTING_QUICKSTART.md) - Quick reference
- [`TESTING_SUMMARY.md`](../TESTING_SUMMARY.md) - Testing overview
- [`UI_TESTING_BOOTSTRAP_REPORT.md`](../UI_TESTING_BOOTSTRAP_REPORT.md) - Setup report

---

## 🔧 Package Versions

- @playwright/test: 1.56.1
- backstopjs: 6.3.25
- axe-core: 4.11.0
- @axe-core/playwright: 4.11.0
- lighthouse: 13.0.1
- serve: 14.2.5

---

## 📝 Notes

- All tests run against `http://localhost:3001`
- Visual tests require reference images (created on first run)
- Accessibility tests enforce WCAG 2.1 AA standards
- Performance tests require app to be built and running

---

**Last Updated**: October 23, 2025  
**Status**: ✅ Production Ready
