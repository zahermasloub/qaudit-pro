import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * 🧪 Example Test Suite - QAudit Pro
 * مجموعة اختبارات مثالية لتوضيح الاستخدام
 */

test.describe('Quick Start Examples', () => {

  // ✅ مثال 1: اختبار بسيط للتنقل
  test('should navigate to homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/QAudit Pro/);
  });

  // ✅ مثال 2: اختبار تفاعل المستخدم
  test('should interact with UI elements', async ({ page }) => {
    await page.goto('/');

    // النقر على زر
    const button = page.locator('button:has-text("Get Started")');
    if (await button.isVisible()) {
      await button.click();
    }

    // ملء نموذج
    const input = page.locator('input[type="text"]').first();
    if (await input.isVisible()) {
      await input.fill('Test Data');
      await expect(input).toHaveValue('Test Data');
    }
  });

  // ✅ مثال 3: اختبار حالة Loading
  test('should show loading state', async ({ page }) => {
    await page.goto('/dashboard');

    // البحث عن مؤشر التحميل
    const loader = page.locator('[data-testid="loader"]');
    if (await loader.isVisible({ timeout: 1000 })) {
      await expect(loader).toBeHidden({ timeout: 10000 });
    }
  });

  // ✅ مثال 4: اختبار Responsive Design
  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  // ✅ مثال 5: اختبار RTL Support
  test('should support RTL layout', async ({ page }) => {
    await page.goto('/');

    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    const bodyDirection = await page.locator('body').evaluate(
      (el) => window.getComputedStyle(el).direction
    );
    expect(bodyDirection).toBe('rtl');
  });

  // ✅ مثال 6: اختبار Error Handling
  test('should display error message on failed action', async ({ page }) => {
    await page.goto('/auth/login');

    // محاولة تسجيل الدخول ببيانات خاطئة
    await page.fill('input[name="email"]', 'wrong@email.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // التحقق من رسالة الخطأ
    const errorMessage = page.locator('[role="alert"]');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  // ✅ مثال 7: اختبار API Response
  test('should wait for API response', async ({ page }) => {
    // الاستماع لطلبات API
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/plans') && response.status() === 200
    );

    await page.goto('/annual-plan');

    const response = await responsePromise;
    expect(response.ok()).toBeTruthy();
  });

  // ✅ مثال 8: اختبار Local Storage
  test('should save data to localStorage', async ({ page }) => {
    await page.goto('/');

    // حفظ بيانات
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    // التحقق من البيانات
    const value = await page.evaluate(() => localStorage.getItem('test-key'));
    expect(value).toBe('test-value');
  });

  // ✅ مثال 9: اختبار Screenshot
  test('should take screenshot on failure', async ({ page }, testInfo) => {
    await page.goto('/dashboard');

    try {
      // محاولة عنصر غير موجود
      await expect(page.locator('#non-existent')).toBeVisible({ timeout: 2000 });
    } catch (error) {
      // أخذ screenshot عند الفشل
      const screenshot = await page.screenshot();
      await testInfo.attach('failure-screenshot', {
        body: screenshot,
        contentType: 'image/png',
      });
      throw error;
    }
  });

  // ✅ مثال 10: اختبار Accessibility (بسيط)
  test('should pass basic accessibility checks', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a'])
      .analyze();

    expect(results.violations.length).toBe(0);
  });
});

// 🎯 مثال متقدم: سيناريو كامل
test.describe('Complete User Journey', () => {

  test('should complete full user flow', async ({ page }) => {
    // 1. زيارة الصفحة الرئيسية
    await page.goto('/');
    await expect(page).toHaveURL('/');

    // 2. الانتقال إلى صفحة تسجيل الدخول
    await page.click('text=Login');
    await expect(page).toHaveURL(/login/);

    // 3. تسجيل الدخول
    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // 4. التحقق من الانتقال إلى Dashboard
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // 5. التنقل إلى Annual Plan
    await page.click('text=Annual Plan');
    await page.waitForURL(/annual-plan/);

    // 6. إنشاء خطة جديدة
    const createButton = page.locator('button:has-text("Create")');
    if (await createButton.isVisible()) {
      await createButton.click();

      await page.fill('input[name="name"]', 'Test Plan 2025');
      await page.fill('input[name="year"]', '2025');
      await page.click('button[type="submit"]');

      // 7. التحقق من نجاح الإنشاء
      await expect(page.locator('text=created successfully')).toBeVisible();
    }

    // 8. تسجيل الخروج
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // 9. التحقق من العودة إلى صفحة Login
    await page.waitForURL(/login/);
    await expect(page).toHaveURL(/login/);
  });
});

// 📸 اختبارات Visual Regression
test.describe('Visual Tests', () => {

  test('homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
      mask: [page.locator('.dynamic-content')], // إخفاء المحتوى الديناميكي
    });
  });

  test('dashboard cards visual regression', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const cards = page.locator('[data-testid="dashboard-card"]');
    await expect(cards.first()).toHaveScreenshot('dashboard-card.png');
  });
});

// ♿ اختبارات Accessibility متقدمة
test.describe('Advanced Accessibility Tests', () => {

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');

    // التحقق من وجود ARIA labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const textContent = await button.textContent();

      // يجب أن يكون للزر إما aria-label أو محتوى نصي
      expect(ariaLabel || textContent?.trim()).toBeTruthy();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['cat.semantics'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // التنقل باستخدام Tab
    await page.keyboard.press('Tab');

    let focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        type: el?.getAttribute('type'),
        role: el?.getAttribute('role'),
      };
    });

    expect(focusedElement.tagName).toBeTruthy();

    // التنقل للأمام
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }

    // التنقل للخلف
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
    }

    focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return el?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });
});
