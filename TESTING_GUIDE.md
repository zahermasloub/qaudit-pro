# 🧪 دليل الاختبارات الشامل | Complete Testing Guide

## 📋 نظرة عامة | Overview

تم إعداد بيئة اختبارات متكاملة لتطبيق QAudit Pro تجمع بين:

- ✅ **Playwright** - اختبارات وظيفية وبصرية (E2E + Visual)
- ✅ **BackstopJS** - اختبارات الانحراف البصري (Visual Regression)
- ✅ **Axe-core** - فحص الوصولية (Accessibility)
- ✅ **Lighthouse** - تدقيق الأداء وتجربة المستخدم (Performance & UX)
- ✅ **GitHub Actions** - تكامل CI/CD تلقائي

---

## 🚀 التثبيت | Installation

### الخطوة 1: تثبيت الحزم

```bash
# تم التثبيت بالفعل! ✅
# إذا كنت بحاجة لإعادة التثبيت:
npm install --save-dev @playwright/test backstopjs axe-core @axe-core/playwright lighthouse serve --legacy-peer-deps
```

### الخطوة 2: تثبيت متصفحات Playwright

```bash
npx playwright install
```

### الخطوة 3: إعداد BackstopJS (اختياري)

```bash
npx backstop init
```

---

## 📁 البنية | Structure

```
qaudit-pro/
├── tests/
│   ├── e2e/                    # اختبارات E2E الوظيفية
│   │   └── main.spec.ts
│   ├── accessibility/          # اختبارات الوصولية
│   │   └── accessibility.spec.ts
│   ├── visual/                 # اختبارات BackstopJS
│   │   └── backstop_data/
│   ├── performance/            # اختبارات Lighthouse
│   │   └── lighthouse.test.ts
│   └── reports/                # التقارير المولدة
│       ├── playwright/
│       ├── backstop/
│       └── lighthouse/
├── playwright.config.ts        # تكوين Playwright
├── backstop.config.js         # تكوين BackstopJS
└── .github/
    └── workflows/
        └── ui-tests.yml       # CI/CD Pipeline
```

---

## 🎯 الأوامر | Commands

### اختبارات Playwright E2E

```bash
# تشغيل جميع الاختبارات
npm run test:e2e

# تشغيل مع واجهة UI
npm run test:e2e:ui

# تشغيل مع المتصفح مرئي
npm run test:e2e:headed

# تشغيل في وضع التصحيح
npm run test:e2e:debug

# تشغيل اختبار محدد
npx playwright test tests/e2e/main.spec.ts

# تشغيل على متصفح محدد
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### اختبارات الوصولية (Accessibility)

```bash
# تشغيل اختبارات axe-core
npm run test:accessibility

# أو
npx playwright test tests/accessibility
```

### اختبارات الانحراف البصري (Visual Regression)

```bash
# إنشاء صور مرجعية (أول مرة)
npm run test:visual:reference

# تشغيل الاختبارات البصرية
npm run test:visual

# الموافقة على التغييرات
npm run test:visual:approve
```

### اختبارات الأداء (Lighthouse)

```bash
# تشغيل تدقيق Lighthouse
npm run test:lighthouse
```

### تشغيل جميع الاختبارات

```bash
# تشغيل جميع الاختبارات مرة واحدة
npm run test:all
```

### عرض التقارير

```bash
# عرض تقرير Playwright HTML
npm run test:report

# أو
npx playwright show-report tests/reports/playwright
```

---

## 📊 التقارير | Reports

### Playwright Reports

- **HTML**: `tests/reports/playwright/index.html`
- **JSON**: `tests/reports/playwright/results.json`

### BackstopJS Reports

- **HTML**: `tests/reports/backstop/html_report/index.html`
- **JSON**: `tests/reports/backstop/json_report/jsonReport.json`

### Lighthouse Reports

- **HTML**: `tests/reports/lighthouse/[page-name].html`
- **Summary JSON**: `tests/reports/lighthouse/summary.json`

---

## ⚙️ التكوين | Configuration

### Playwright Configuration (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3001',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
  },
  projects: [
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
    { name: 'mobile-chrome' },
    { name: 'mobile-safari' },
  ],
});
```

### BackstopJS Configuration (`backstop.config.js`)

```javascript
module.exports = {
  id: 'qaudit-pro-visual-tests',
  viewports: [
    { label: 'phone', width: 375, height: 667 },
    { label: 'tablet', width: 768, height: 1024 },
    { label: 'desktop', width: 1920, height: 1080 },
  ],
  scenarios: [
    { label: 'Homepage', url: 'http://localhost:3001' },
    { label: 'Login', url: 'http://localhost:3001/auth/login' },
    { label: 'Dashboard', url: 'http://localhost:3001/dashboard' },
  ],
};
```

---

## 🔄 GitHub Actions CI/CD

تم إعداد workflow تلقائي يتم تشغيله عند:
- Push على branches: `main`, `master`, `develop`
- Pull Requests
- يومياً في الساعة 2 صباحاً

### ميزات الـ CI/CD:

1. ✅ تشغيل جميع الاختبارات تلقائياً
2. 📊 رفع التقارير كـ artifacts
3. 💬 تعليق تلقائي على PR بنتائج Lighthouse
4. 🌍 اختبار على أنظمة تشغيل متعددة (Ubuntu, Windows, macOS)
5. 🌐 اختبار على متصفحات متعددة (Chrome, Firefox, Safari)

---

## 📝 كتابة اختبارات جديدة | Writing Tests

### مثال: اختبار E2E

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to dashboard', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Dashboard');
  await expect(page).toHaveURL(/dashboard/);
});
```

### مثال: اختبار الوصولية

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage should be accessible', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  
  expect(results.violations).toEqual([]);
});
```

### مثال: اختبار بصري

```typescript
test('dashboard visual comparison', async ({ page }) => {
  await page.goto('/dashboard');
  
  await expect(page).toHaveScreenshot('dashboard.png', {
    fullPage: true,
    animations: 'disabled',
  });
});
```

---

## 🎯 معايير النجاح | Success Criteria

### Lighthouse Thresholds

- **Performance**: ≥ 70%
- **Accessibility**: ≥ 90%
- **Best Practices**: ≥ 80%
- **SEO**: ≥ 80%

### Visual Regression

- **Mismatch Threshold**: < 0.1% (0.001)

### Accessibility

- **Zero Violations**: يجب عدم وجود أي انتهاكات WCAG 2.0/2.1 AA

---

## 🐛 استكشاف الأخطاء | Troubleshooting

### المشكلة: فشل الاختبارات بسبب timeout

```bash
# زيادة المهلة الزمنية
npx playwright test --timeout=60000
```

### المشكلة: فشل اختبارات BackstopJS

```bash
# الموافقة على التغييرات كمرجع جديد
npm run test:visual:approve
```

### المشكلة: اختلافات بصرية طفيفة

قم بتعديل `misMatchThreshold` في `backstop.config.js`:

```javascript
scenarios: [
  {
    label: 'Homepage',
    misMatchThreshold: 0.5, // زيادة التسامح
  }
]
```

### المشكلة: فشل اختبارات الوصولية

```bash
# تشغيل في وضع debug لرؤية التفاصيل
npx playwright test tests/accessibility --debug
```

---

## 📚 مصادر إضافية | Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [BackstopJS Documentation](https://github.com/garris/BackstopJS)
- [Axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Lighthouse Scoring Guide](https://web.dev/performance-scoring/)

---

## 🤝 المساهمة | Contributing

عند إضافة ميزات جديدة:

1. ✍️ اكتب اختبارات E2E للوظائف الجديدة
2. 📸 أضف سيناريوهات BackstopJS للصفحات الجديدة
3. ♿ تأكد من اجتياز اختبارات الوصولية
4. 🚀 تحقق من درجات Lighthouse

---

## 📧 الدعم | Support

للمشاكل التقنية أو الأسئلة:
- فتح Issue في GitHub
- مراجعة التوثيق أعلاه
- التواصل مع فريق QA

---

**✨ تم إعداد البيئة بنجاح! جاهز للاختبار.**
