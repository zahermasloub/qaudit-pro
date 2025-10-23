import { test, expect } from '@playwright/test';

/**
 * 🎯 E2E Tests for QAudit Pro
 * اختبارات شاملة للوظائف الأساسية
 */

test.describe('Authentication Flow', () => {

  test('should display login page', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page).toHaveTitle(/QAudit Pro/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should show validation errors on empty form', async ({ page }) => {
    await page.goto('/auth/login');

    await page.click('button[type="submit"]');

    // التحقق من ظهور رسائل الخطأ
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // التحقق من الانتقال إلى لوحة التحكم
    await page.waitForURL('/dashboard');
    await expect(page).toHaveURL('/dashboard');
  });
});

test.describe('Dashboard Navigation', () => {

  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول قبل كل اختبار
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display dashboard cards', async ({ page }) => {
    await expect(page.locator('[data-testid="dashboard-card"]')).toHaveCount(4, { timeout: 5000 });
  });

  test('should navigate to Annual Plan', async ({ page }) => {
    await page.click('text=Annual Plan');
    await page.waitForURL(/annual-plan/);
    await expect(page).toHaveURL(/annual-plan/);
  });

  test('should navigate to RBIA', async ({ page }) => {
    await page.click('text=RBIA');
    await page.waitForURL(/rbia/);
    await expect(page).toHaveURL(/rbia/);
  });

  test('should toggle theme', async ({ page }) => {
    const themeToggle = page.locator('[data-testid="theme-toggle"]');

    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // التحقق من تغيير الثيم
      const htmlElement = page.locator('html');
      const currentTheme = await htmlElement.getAttribute('class');
      expect(currentTheme).toBeTruthy();
    }
  });
});

test.describe('Annual Plan Module', () => {

  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // الانتقال إلى Annual Plan
    await page.goto('/annual-plan');
  });

  test('should display annual plan list', async ({ page }) => {
    await page.waitForSelector('[data-testid="annual-plan-list"]');
    await expect(page.locator('[data-testid="annual-plan-list"]')).toBeVisible();
  });

  test('should create new annual plan', async ({ page }) => {
    await page.click('button:has-text("Create New Plan")');

    await page.fill('input[name="planName"]', 'Test Plan 2025');
    await page.fill('input[name="year"]', '2025');
    await page.click('button[type="submit"]');

    // التحقق من نجاح الإنشاء
    await expect(page.locator('text=Plan created successfully')).toBeVisible();
  });

  test('should filter plans by year', async ({ page }) => {
    await page.click('[data-testid="year-filter"]');
    await page.click('text=2024');

    // التحقق من تطبيق الفلتر
    const plans = page.locator('[data-testid="plan-item"]');
    expect(await plans.count()).toBeGreaterThan(0);
  });
});

test.describe('Visual Regression Tests', () => {

  test('dashboard screenshot comparison', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('annual plan screenshot comparison', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'admin@qaudit.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    await page.goto('/annual-plan');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('annual-plan.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});

test.describe('RTL Support', () => {

  test('should render correctly in RTL', async ({ page }) => {
    await page.goto('/');

    const htmlDir = await page.locator('html').getAttribute('dir');
    expect(htmlDir).toBe('rtl');

    // التحقق من محاذاة العناصر
    const textAlign = await page.locator('body').evaluate((el) =>
      window.getComputedStyle(el).direction
    );
    expect(textAlign).toBe('rtl');
  });
});
