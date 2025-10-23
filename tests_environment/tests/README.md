# 🧪 QAudit Pro - Testing Suite

**بيئة اختبارات متكاملة وشاملة | Complete Integrated Testing Environment**

[![Tests](https://github.com/zahermasloub/THE-AUDIT-APP-2/workflows/UI%20Tests/badge.svg)](https://github.com/zahermasloub/THE-AUDIT-APP-2/actions)

---

## 🎯 نظرة عامة | Overview

بيئة اختبارات متكاملة تجمع بين:

- 🎭 **Playwright** - اختبارات E2E ووظيفية
- 🎨 **BackstopJS** - اختبارات الانحراف البصري
- ♿ **Axe-core** - فحص الوصولية (WCAG 2.0/2.1)
- 🚀 **Lighthouse** - تدقيق الأداء وتجربة المستخدم
- 🔄 **GitHub Actions** - تكامل CI/CD تلقائي

---

## ⚡ البداية السريعة | Quick Start

```bash
# 1. تشغيل التطبيق
npm run dev

# 2. في terminal آخر
npm run test:e2e
```

---

## 📚 التوثيق | Documentation

| الملف | الوصف |
|------|------|
| [TESTING_CHEATSHEET.md](./TESTING_CHEATSHEET.md) | 📋 مرجع سريع للأوامر |
| [TESTING_QUICKSTART.md](./TESTING_QUICKSTART.md) | 🚀 دليل البداية السريعة |
| [TESTING_GUIDE.md](./TESTING_GUIDE.md) | 📖 دليل شامل كامل |
| [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) | 📊 ملخص الإعداد |
| [TESTING_SETUP_COMPLETE.md](./TESTING_SETUP_COMPLETE.md) | ✅ تفاصيل الإعداد الكاملة |

---

## 🎯 الأوامر الأساسية | Basic Commands

```bash
# E2E Tests
npm run test:e2e              # تشغيل الاختبارات
npm run test:e2e:ui           # واجهة مرئية
npm run test:e2e:debug        # وضع التصحيح

# Accessibility Tests
npm run test:accessibility    # فحص الوصولية

# Visual Regression Tests
npm run test:visual:reference # إنشاء مرجع (أول مرة)
npm run test:visual          # تشغيل الاختبارات
npm run test:visual:approve  # الموافقة على التغييرات

# Performance Tests
npm run test:lighthouse      # تدقيق Lighthouse

# All Tests
npm run test:all            # تشغيل كل شيء

# Reports
npm run test:report         # عرض التقارير
```

---

## 📁 البنية | Structure

```
tests/
├── e2e/                    # اختبارات E2E
│   ├── main.spec.ts
│   ├── examples.spec.ts
│   └── advanced-examples.spec.ts
├── accessibility/          # اختبارات الوصولية
│   └── accessibility.spec.ts
├── performance/            # اختبارات الأداء
│   └── lighthouse.test.ts
├── visual/                 # اختبارات BackstopJS
├── helpers/                # دوال مساعدة
│   └── test-helpers.ts
└── reports/                # التقارير
```

---

## ✨ المميزات | Features

### 🎭 Playwright
- ✅ اختبار على 3 متصفحات (Chromium, Firefox, WebKit)
- ✅ دعم Mobile viewports
- ✅ دعم RTL
- ✅ Screenshots & Videos تلقائية
- ✅ Trace files للتصحيح

### 🎨 BackstopJS
- ✅ اختبار على 3 أحجام شاشات
- ✅ Visual regression testing
- ✅ تقارير HTML مقارنة
- ✅ Approval workflow

### ♿ Axe-core
- ✅ فحص WCAG 2.0/2.1 AA
- ✅ Color contrast testing
- ✅ Keyboard navigation testing
- ✅ تقارير تفصيلية

### 🚀 Lighthouse
- ✅ Performance audit
- ✅ Accessibility audit
- ✅ Best practices check
- ✅ SEO optimization
- ✅ تقارير HTML & JSON

### 🛠️ Test Helpers
- ✅ 15+ helper functions
- ✅ Authentication helpers
- ✅ Navigation helpers
- ✅ Form helpers
- ✅ Wait helpers
- ✅ Screenshot helpers

---

## 📊 التقارير | Reports

التقارير متاحة في:

- **Playwright:** `tests/reports/playwright/index.html`
- **BackstopJS:** `tests/reports/backstop/html_report/index.html`
- **Lighthouse:** `tests/reports/lighthouse/[page].html`

---

## 🔄 CI/CD

تشغيل تلقائي عبر GitHub Actions:
- ✅ على كل Push/PR
- ✅ على 3 أنظمة تشغيل
- ✅ على 3 متصفحات
- ✅ اختبار يومي تلقائي
- ✅ تعليقات تلقائية على PRs

---

## 🎓 أمثلة | Examples

### اختبار بسيط
```typescript
test('should login', async ({ page }) => {
  await page.goto('/auth/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### استخدام Helpers
```typescript
import { createTestContext } from './helpers/test-helpers';

test('using helpers', async ({ page }) => {
  const ctx = createTestContext(page);
  await ctx.auth.login();
  await ctx.navigation.goToDashboard();
  await ctx.wait.waitForNoLoader();
});
```

### اختبار الوصولية
```typescript
import AxeBuilder from '@axe-core/playwright';

test('accessibility', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

---

## 🆘 حل المشاكل | Troubleshooting

| المشكلة | الحل |
|---------|------|
| المتصفحات غير مثبتة | `npx playwright install` |
| التطبيق لا يعمل | `npm run dev` |
| BackstopJS يفشل | `npm run test:visual:reference` |
| الاختبارات بطيئة | استخدم `--project=chromium` |
| أخطاء timeout | زد timeout في التكوين |

---

## 🤝 المساهمة | Contributing

عند إضافة ميزات جديدة:

1. ✅ اكتب اختبارات E2E
2. ✅ أضف scenarios لـ BackstopJS
3. ✅ تأكد من الوصولية
4. ✅ تحقق من Lighthouse scores

---

## 📈 معايير النجاح | Success Criteria

| المعيار | الحد الأدنى |
|---------|-------------|
| Performance | ≥ 70% |
| Accessibility | ≥ 90% |
| Best Practices | ≥ 80% |
| SEO | ≥ 80% |
| Visual Mismatch | < 0.1% |
| WCAG Violations | 0 |

---

## 📞 الدعم | Support

- 📖 [الدليل الشامل](./TESTING_GUIDE.md)
- 🚀 [البداية السريعة](./TESTING_QUICKSTART.md)
- 📋 [المرجع السريع](./TESTING_CHEATSHEET.md)

---

## 📜 الترخيص | License

هذا المشروع جزء من QAudit Pro

---

**✨ جاهز للاختبار! | Ready to Test!**

```bash
npm run test:e2e
```

---

*Built with ❤️ for QAudit Pro*
