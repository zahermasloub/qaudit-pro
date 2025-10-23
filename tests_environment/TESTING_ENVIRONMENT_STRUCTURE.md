# 🗂️ Testing Environment Structure

## Current Testing Environment Layout

```
tests_environment/
├── .github/
│   └── workflows/
│       └── ui-tests.yml          # GitHub Actions CI/CD
│
├── backstop_data/
│   ├── engine_scripts/            # BackstopJS scripts
│   ├── bitmaps_reference/         # Reference images (created on first run)
│   ├── bitmaps_test/             # Test images (gitignored)
│   └── html_report/              # Visual diff reports (gitignored)
│
├── tests/
│   ├── e2e/
│   │   ├── main.spec.ts          # Main E2E tests (auth, navigation, screenshots)
│   │   ├── examples.spec.ts      # Example UI tests
│   │   └── advanced-examples.spec.ts
│   │
│   ├── accessibility/
│   │   └── accessibility.spec.ts  # axe-core accessibility tests
│   │
│   ├── performance/
│   │   └── lighthouse.test.ts     # Lighthouse performance tests
│   │
│   ├── helpers/
│   │   └── test-helpers.ts        # Shared test utilities
│   │
│   ├── reports/
│   │   ├── playwright/           # Playwright HTML/JSON reports
│   │   ├── backstop/             # BackstopJS reports
│   │   ├── lighthouse/           # Lighthouse HTML/JSON reports
│   │   └── README.md
│   │
│   └── README.md
│
├── playwright.config.ts           # Playwright configuration
├── backstop.config.js            # BackstopJS configuration (active)
└── backstop.json                 # BackstopJS JSON config (updated)
```

## Configuration Files Status

### ✅ playwright.config.ts
- **testDir**: `./tests`
- **retries**: 1
- **projects**: Desktop Chrome (1280x800), iPhone 12
- **reporters**: HTML, JSON, List
- **baseURL**: http://localhost:3001
- **snapshotPathTemplate**: Configured

### ✅ backstop.config.js
- **viewports**: phone (375x667), tablet (768x1024), desktop (1920x1080)
- **scenarios**: Homepage, Login, Dashboard, Annual Plan
- **engine**: playwright
- **reports path**: tests/reports/backstop

### ✅ backstop.json
- **viewports**: desktop (1280x800), mobile (375x812)
- **scenarios**: Home, Login, Dashboard
- **engine**: playwright
- **paths**: Configured for bitmaps_reference, bitmaps_test, html_report

## Test Files Summary

| File | Tests | Purpose |
|------|-------|---------|
| `main.spec.ts` | 11 | Auth flow, dashboard navigation, visual regression |
| `accessibility.spec.ts` | 6 | WCAG 2.1 AA compliance, keyboard navigation |
| `lighthouse.test.ts` | 4 URLs | Performance, accessibility, SEO, best practices |

## Scripts Available

```json
{
  "test:e2e": "playwright test -c tests_environment/playwright.config.ts",
  "test:e2e:ui": "playwright test -c tests_environment/playwright.config.ts --ui",
  "test:e2e:headed": "playwright test -c tests_environment/playwright.config.ts --headed",
  "test:e2e:debug": "playwright test -c tests_environment/playwright.config.ts --debug",
  "test:accessibility": "playwright test -c tests_environment/playwright.config.ts tests_environment/tests/accessibility",
  "test:visual": "backstop test --config=tests_environment/backstop.config.js",
  "test:visual:approve": "backstop approve --config=tests_environment/backstop.config.js",
  "test:visual:reference": "backstop reference --config=tests_environment/backstop.config.js",
  "test:lighthouse": "tsx tests_environment/tests/performance/lighthouse.test.ts",
  "test:all": "npm run test:e2e && npm run test:accessibility && npm run test:visual && npm run test:lighthouse",
  "test:report": "playwright show-report tests_environment/tests/reports/playwright"
}
```

## Next Steps

1. **Start the app**: `npm run dev`
2. **Create reference images**: `npm run test:visual:reference`
3. **Run E2E tests**: `npm run test:e2e`
4. **Run visual tests**: `npm run test:visual`
5. **Run accessibility tests**: `npm run test:accessibility`
6. **View reports**: `npm run test:report`
