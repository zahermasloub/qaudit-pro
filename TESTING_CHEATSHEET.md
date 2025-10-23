# 🧪 QAudit Pro - Testing Cheat Sheet

## ⚡ Quick Commands

### E2E Tests
```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e:ui           # With UI mode
npm run test:e2e:headed       # With browser visible
npm run test:e2e:debug        # Debug mode
```

### Accessibility
```bash
npm run test:accessibility    # Run a11y tests
```

### Visual Regression
```bash
npm run test:visual:reference # Create reference (first time)
npm run test:visual          # Run visual tests
npm run test:visual:approve  # Approve changes
```

### Performance
```bash
npm run test:lighthouse      # Run Lighthouse audit
```

### All Tests
```bash
npm run test:all            # Run everything
./run-all-tests.ps1         # PowerShell script
```

### Reports
```bash
npm run test:report         # Open Playwright report
```

---

## 📂 Important Files

- `playwright.config.ts` - Playwright configuration
- `backstop.config.js` - BackstopJS configuration
- `tests/helpers/test-helpers.ts` - Test utilities
- `.github/workflows/ui-tests.yml` - CI/CD pipeline

---

## 📖 Documentation

- **Full Guide:** `TESTING_GUIDE.md`
- **Quick Start:** `TESTING_QUICKSTART.md`
- **Setup Complete:** `TESTING_SETUP_COMPLETE.md`
- **Summary:** `TESTING_SUMMARY.md`

---

## 🎯 Before Running Tests

1. Start application: `npm run dev`
2. Ensure localhost:3001 is accessible
3. For BackstopJS first time: `npm run test:visual:reference`

---

## 🔥 Most Used Examples

### Login Test
```typescript
const ctx = createTestContext(page);
await ctx.auth.login();
```

### Fill Form
```typescript
await ctx.form.fillForm({
  name: 'Test',
  year: '2025'
});
await ctx.form.submitForm();
```

### Wait for API
```typescript
await ctx.wait.waitForAPI('/api/plans');
```

### Take Screenshot
```typescript
await ctx.screenshot.takeFullPageScreenshot('name');
```

### Check Accessibility
```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa'])
  .analyze();
expect(results.violations).toEqual([]);
```

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Browsers not installed | `npx playwright install` |
| App not on localhost:3001 | `npm run dev` |
| BackstopJS always fails | `npm run test:visual:reference` |
| Tests are slow | Use `--project=chromium` |
| Timeout errors | Increase timeout in config |

---

**Happy Testing! 🚀**
