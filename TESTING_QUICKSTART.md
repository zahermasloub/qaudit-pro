# 🚀 Quick Start - Testing Environment

## ⚡ تشغيل سريع | Quick Run

```bash
# 1. تأكد من تشغيل التطبيق
npm run dev

# 2. في terminal آخر، شغّل الاختبارات
npm run test:e2e
```

## 📚 الأوامر الأساسية | Basic Commands

### اختبارات E2E
```bash
npm run test:e2e              # تشغيل جميع اختبارات E2E
npm run test:e2e:ui           # مع واجهة مرئية
npm run test:e2e:headed       # مع المتصفح مرئي
npm run test:e2e:debug        # وضع التصحيح
```

### اختبارات الوصولية
```bash
npm run test:accessibility    # فحص الوصولية
```

### اختبارات البصرية
```bash
npm run test:visual:reference # إنشاء صور مرجعية (أول مرة)
npm run test:visual          # تشغيل اختبارات BackstopJS
npm run test:visual:approve  # الموافقة على التغييرات
```

### اختبارات الأداء
```bash
npm run test:lighthouse      # تدقيق Lighthouse
```

### جميع الاختبارات
```bash
npm run test:all            # تشغيل كل شيء
```

## 📊 عرض التقارير

```bash
npm run test:report         # عرض تقرير Playwright
```

أو افتح مباشرة:
- Playwright: `tests/reports/playwright/index.html`
- BackstopJS: `tests/reports/backstop/html_report/index.html`
- Lighthouse: `tests/reports/lighthouse/[page-name].html`

## 🎯 أمثلة سريعة

### اختبار صفحة معينة
```bash
npx playwright test --grep "homepage"
```

### اختبار على متصفح محدد
```bash
npx playwright test --project=chromium
```

### اختبار مع فيديو
```bash
npx playwright test --video=on
```

## 📖 المزيد من التفاصيل

راجع `TESTING_GUIDE.md` للدليل الشامل.

## 🆘 حل المشاكل

### المتصفحات غير مثبتة؟
```bash
npx playwright install
```

### التطبيق لا يعمل على localhost:3001؟
```bash
# تأكد من تشغيل التطبيق أولاً
npm run dev
```

### اختبارات BackstopJS تفشل دائماً؟
```bash
# أنشئ صور مرجعية جديدة
npm run test:visual:reference
```

---

✨ **جاهز للاختبار!**
