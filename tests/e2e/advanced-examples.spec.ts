import { test, expect } from '@playwright/test';
import { createTestContext, DataHelper } from '../helpers/test-helpers';

/**
 * 🧪 Advanced Test Examples using Helpers
 * أمثلة متقدمة باستخدام دوال المساعدة
 */

test.describe('Using Test Helpers', () => {

  // ✅ مثال 1: استخدام Auth Helper
  test('login using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();

    // التحقق من تسجيل الدخول
    const isLoggedIn = await ctx.auth.isLoggedIn();
    expect(isLoggedIn).toBeTruthy();
  });

  // ✅ مثال 2: استخدام Navigation Helper
  test('navigate using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToAnnualPlan();

    await expect(page).toHaveURL(/annual-plan/);
  });

  // ✅ مثال 3: استخدام Form Helper
  test('fill form using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToAnnualPlan();

    // ملء نموذج بيانات متعددة
    await ctx.form.fillForm({
      name: 'Test Plan 2025',
      year: '2025',
      description: 'This is a test plan',
    });

    await ctx.form.submitForm();
    await ctx.form.waitForFormSuccess();
  });

  // ✅ مثال 4: استخدام Theme Helper
  test('toggle theme using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await page.goto('/');

    const initialTheme = await ctx.theme.getCurrentTheme();
    await ctx.theme.toggleTheme();

    const newTheme = await ctx.theme.getCurrentTheme();
    expect(newTheme).not.toBe(initialTheme);
  });

  // ✅ مثال 5: استخدام Table Helper
  test('interact with table using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToAnnualPlan();

    const rowCount = await ctx.table.getRowCount();
    expect(rowCount).toBeGreaterThan(0);

    // الحصول على قيمة خلية
    const cellValue = await ctx.table.getCellValue(1, 1);
    expect(cellValue).toBeTruthy();

    // ترتيب حسب العمود
    await ctx.table.sortByColumn(1);
  });

  // ✅ مثال 6: استخدام Search Helper
  test('search using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToAnnualPlan();

    await ctx.search.search('2024');
    await ctx.wait.waitForNoLoader();

    const resultsCount = await ctx.search.getSearchResults();
    expect(resultsCount).toBeGreaterThanOrEqual(0);
  });

  // ✅ مثال 7: استخدام Responsive Helper
  test('test responsive design using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    // Mobile view
    await ctx.responsive.setMobileViewport();
    await page.goto('/');

    const mobileSize = await ctx.responsive.getCurrentViewportSize();
    expect(mobileSize?.width).toBe(375);

    // Desktop view
    await ctx.responsive.setDesktopViewport();
    const desktopSize = await ctx.responsive.getCurrentViewportSize();
    expect(desktopSize?.width).toBe(1920);
  });

  // ✅ مثال 8: استخدام Modal Helper
  test('interact with modal using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await page.goto('/annual-plan');

    // فتح modal
    await page.click('button:has-text("Create")');
    await ctx.modal.waitForModal();

    const isVisible = await ctx.modal.isModalVisible();
    expect(isVisible).toBeTruthy();

    // إغلاق modal
    await ctx.modal.closeModal();
  });

  // ✅ مثال 9: استخدام Notification Helper
  test('check notifications using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToAnnualPlan();

    // تنفيذ إجراء يؤدي لإظهار notification
    await page.click('button[data-action="save"]');

    await ctx.notification.waitForNotification();
    const message = await ctx.notification.getNotificationText();

    expect(message).toContain('success');
  });

  // ✅ مثال 10: استخدام Wait Helper
  test('wait for API using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();

    // الانتظار حتى اكتمال API request
    const response = await ctx.wait.waitForAPI('/api/plans');
    expect(response.ok()).toBeTruthy();

    await ctx.wait.waitForNoLoader();
  });

  // ✅ مثال 11: استخدام Screenshot Helper
  test('take screenshots using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();
    await ctx.navigation.goToDashboard();

    // أخذ screenshot للصفحة كاملة
    await ctx.screenshot.takeFullPageScreenshot('dashboard-full');

    // أخذ screenshot لعنصر محدد
    await ctx.screenshot.takeElementScreenshot(
      '[data-testid="dashboard-card"]',
      'dashboard-card'
    );
  });

  // ✅ مثال 12: استخدام Data Helper
  test('generate test data using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    // توليد بيانات عشوائية
    const email = DataHelper.generateRandomEmail();
    const password = DataHelper.generateRandomString(12);
    const year = DataHelper.generateRandomNumber(2020, 2030);

    expect(email).toContain('@example.com');
    expect(password.length).toBe(12);
    expect(year).toBeGreaterThanOrEqual(2020);
    expect(year).toBeLessThanOrEqual(2030);
  });

  // ✅ مثال 13: سيناريو كامل باستخدام Helpers
  test('complete workflow using all helpers', async ({ page }) => {
    const ctx = createTestContext(page);

    // 1. تسجيل الدخول
    await ctx.auth.login();

    // 2. الانتقال إلى Annual Plan
    await ctx.navigation.goToAnnualPlan();
    await ctx.wait.waitForNoLoader();

    // 3. فتح نموذج إنشاء خطة جديدة
    await page.click('button:has-text("Create")');
    await ctx.modal.waitForModal();

    // 4. ملء النموذج
    await ctx.form.fillForm({
      name: `Plan ${DataHelper.generateRandomString(5)}`,
      year: '2025',
      description: 'Test plan created by automated test',
    });

    // 5. إرسال النموذج
    await ctx.form.submitForm();
    await ctx.wait.waitForAPI('/api/plans');

    // 6. التحقق من النجاح
    await ctx.notification.waitForNotification();
    const message = await ctx.notification.getNotificationText();
    expect(message).toContain('success');

    // 7. أخذ screenshot
    await ctx.screenshot.takeFullPageScreenshot('plan-created');

    // 8. البحث عن الخطة
    await ctx.search.search('Test plan');
    const results = await ctx.search.getSearchResults();
    expect(results).toBeGreaterThan(0);

    // 9. تسجيل الخروج
    await ctx.auth.logout();
  });

  // ✅ مثال 14: اختبار RTL باستخدام Helpers
  test('test RTL support using helper', async ({ page }) => {
    const ctx = createTestContext(page);

    await page.goto('/');

    const isRTL = await ctx.localization.isRTL();
    expect(isRTL).toBeTruthy();

    const currentLang = await ctx.localization.getCurrentLanguage();
    expect(currentLang).toBe('ar');
  });

  // ✅ مثال 15: اختبار عبر أحجام شاشات مختلفة
  test('test across different viewports', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();

    // Mobile
    await ctx.responsive.setMobileViewport();
    await ctx.navigation.goToDashboard();
    await ctx.screenshot.takeFullPageScreenshot('dashboard-mobile');

    // Tablet
    await ctx.responsive.setTabletViewport();
    await ctx.navigation.goToDashboard();
    await ctx.screenshot.takeFullPageScreenshot('dashboard-tablet');

    // Desktop
    await ctx.responsive.setDesktopViewport();
    await ctx.navigation.goToDashboard();
    await ctx.screenshot.takeFullPageScreenshot('dashboard-desktop');
  });
});

// 🎯 Performance Tests with Helpers
test.describe('Performance Tests with Helpers', () => {

  test('measure page load time', async ({ page }) => {
    const ctx = createTestContext(page);

    const startTime = Date.now();
    await ctx.auth.login();
    await ctx.navigation.goToDashboard();
    await ctx.wait.waitForNoLoader();
    const endTime = Date.now();

    const loadTime = endTime - startTime;
    console.log(`Dashboard load time: ${loadTime}ms`);

    // التحقق من أن وقت التحميل معقول
    expect(loadTime).toBeLessThan(5000); // أقل من 5 ثواني
  });

  test('measure API response time', async ({ page }) => {
    const ctx = createTestContext(page);

    await ctx.auth.login();

    const startTime = Date.now();
    const response = await ctx.wait.waitForAPI('/api/plans');
    const endTime = Date.now();

    const responseTime = endTime - startTime;
    console.log(`API response time: ${responseTime}ms`);

    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(2000); // أقل من 2 ثانية
  });
});
