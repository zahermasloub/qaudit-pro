import { Page, expect } from '@playwright/test';

/**
 * 🛠️ Test Helpers and Utilities
 * دوال مساعدة لتبسيط كتابة الاختبارات
 */

// 🔐 Authentication Helpers
export class AuthHelper {
  constructor(private page: Page) {}

  async login(email: string = 'admin@qaudit.com', password: string = 'admin123') {
    await this.page.goto('/auth/login');
    await this.page.fill('input[name="email"]', email);
    await this.page.fill('input[name="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('text=Logout');
    await this.page.waitForURL(/login/);
  }

  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return !url.includes('/auth/login');
  }
}

// 🧭 Navigation Helpers
export class NavigationHelper {
  constructor(private page: Page) {}

  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  async goToAnnualPlan() {
    await this.page.goto('/annual-plan');
    await this.page.waitForLoadState('networkidle');
  }

  async goToRBIA() {
    await this.page.goto('/rbia');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('domcontentloaded');
  }
}

// ⏱️ Wait Helpers
export class WaitHelper {
  constructor(private page: Page) {}

  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  async waitForText(text: string, timeout: number = 5000) {
    await this.page.waitForSelector(`text=${text}`, { timeout });
  }

  async waitForAPI(urlPattern: string | RegExp, timeout: number = 10000) {
    return await this.page.waitForResponse(
      (response) => {
        const url = response.url();
        const matches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url);
        return matches && response.status() === 200;
      },
      { timeout }
    );
  }

  async waitForNoLoader(timeout: number = 10000) {
    const loader = this.page.locator('[data-testid="loader"]');
    try {
      await loader.waitFor({ state: 'hidden', timeout });
    } catch {
      // Loader might not exist, which is fine
    }
  }
}

// 📸 Screenshot Helpers
export class ScreenshotHelper {
  constructor(private page: Page) {}

  async takeFullPageScreenshot(name: string) {
    await this.page.screenshot({
      path: `tests/reports/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async takeElementScreenshot(selector: string, name: string) {
    const element = this.page.locator(selector);
    await element.screenshot({
      path: `tests/reports/screenshots/${name}.png`,
    });
  }

  async compareScreenshot(name: string, options?: { threshold?: number }) {
    await expect(this.page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      animations: 'disabled',
      threshold: options?.threshold || 0.1,
    });
  }
}

// 🎨 Theme Helpers
export class ThemeHelper {
  constructor(private page: Page) {}

  async toggleTheme() {
    const themeToggle = this.page.locator('[data-testid="theme-toggle"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
    }
  }

  async setTheme(theme: 'light' | 'dark') {
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme !== theme) {
      await this.toggleTheme();
    }
  }

  async getCurrentTheme(): Promise<'light' | 'dark'> {
    const htmlClass = await this.page.locator('html').getAttribute('class');
    return htmlClass?.includes('dark') ? 'dark' : 'light';
  }
}

// 📝 Form Helpers
export class FormHelper {
  constructor(private page: Page) {}

  async fillForm(fields: Record<string, string>) {
    for (const [name, value] of Object.entries(fields)) {
      await this.page.fill(`[name="${name}"]`, value);
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"]');
  }

  async waitForFormSuccess(timeout: number = 5000) {
    await this.page.waitForSelector('[role="alert"]:has-text("success")', {
      timeout,
      state: 'visible'
    });
  }

  async waitForFormError(timeout: number = 5000) {
    await this.page.waitForSelector('[role="alert"]', {
      timeout,
      state: 'visible'
    });
  }

  async getFormErrors(): Promise<string[]> {
    const errors = await this.page.locator('[role="alert"], .error-message').allTextContents();
    return errors.filter(e => e.trim().length > 0);
  }
}

// 🗂️ Table Helpers
export class TableHelper {
  constructor(private page: Page) {}

  async getRowCount(tableSelector: string = 'table'): Promise<number> {
    const rows = this.page.locator(`${tableSelector} tbody tr`);
    return await rows.count();
  }

  async getCellValue(row: number, column: number, tableSelector: string = 'table'): Promise<string> {
    const cell = this.page.locator(`${tableSelector} tbody tr:nth-child(${row}) td:nth-child(${column})`);
    return await cell.textContent() || '';
  }

  async clickRow(row: number, tableSelector: string = 'table') {
    const rowElement = this.page.locator(`${tableSelector} tbody tr:nth-child(${row})`);
    await rowElement.click();
  }

  async sortByColumn(columnIndex: number, tableSelector: string = 'table') {
    const header = this.page.locator(`${tableSelector} thead th:nth-child(${columnIndex})`);
    await header.click();
  }
}

// 🔍 Search Helpers
export class SearchHelper {
  constructor(private page: Page) {}

  async search(query: string, searchSelector: string = 'input[type="search"]') {
    await this.page.fill(searchSelector, query);
    await this.page.keyboard.press('Enter');
  }

  async clearSearch(searchSelector: string = 'input[type="search"]') {
    await this.page.fill(searchSelector, '');
  }

  async getSearchResults(): Promise<number> {
    const results = this.page.locator('[data-testid="search-result"]');
    return await results.count();
  }
}

// 🌐 Localization Helpers
export class LocalizationHelper {
  constructor(private page: Page) {}

  async switchLanguage(lang: 'ar' | 'en') {
    const langSelector = this.page.locator('[data-testid="language-selector"]');
    if (await langSelector.isVisible()) {
      await langSelector.click();
      await this.page.click(`[data-lang="${lang}"]`);
    }
  }

  async getCurrentLanguage(): Promise<string> {
    return await this.page.locator('html').getAttribute('lang') || 'ar';
  }

  async isRTL(): Promise<boolean> {
    const dir = await this.page.locator('html').getAttribute('dir');
    return dir === 'rtl';
  }
}

// 📱 Responsive Helpers
export class ResponsiveHelper {
  constructor(private page: Page) {}

  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 });
  }

  async setTabletViewport() {
    await this.page.setViewportSize({ width: 768, height: 1024 });
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  async getCurrentViewportSize() {
    return await this.page.viewportSize();
  }
}

// 🎯 Modal Helpers
export class ModalHelper {
  constructor(private page: Page) {}

  async waitForModal(timeout: number = 5000) {
    await this.page.waitForSelector('[role="dialog"]', { timeout });
  }

  async closeModal() {
    const closeButton = this.page.locator('[role="dialog"] button[aria-label="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }

  async isModalVisible(): Promise<boolean> {
    const modal = this.page.locator('[role="dialog"]');
    return await modal.isVisible();
  }
}

// 🔔 Notification Helpers
export class NotificationHelper {
  constructor(private page: Page) {}

  async waitForNotification(timeout: number = 5000) {
    await this.page.waitForSelector('[role="alert"], .toast, .notification', { timeout });
  }

  async getNotificationText(): Promise<string> {
    const notification = this.page.locator('[role="alert"], .toast, .notification').first();
    return await notification.textContent() || '';
  }

  async closeNotification() {
    const closeButton = this.page.locator('[role="alert"] button, .toast button').first();
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}

// 📊 Data Helpers
export class DataHelper {
  static generateRandomEmail(): string {
    return `test${Date.now()}@example.com`;
  }

  static generateRandomString(length: number = 10): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static formatDate(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }
}

// 🎭 Test Context Helper
export class TestContextHelper {
  auth: AuthHelper;
  navigation: NavigationHelper;
  wait: WaitHelper;
  screenshot: ScreenshotHelper;
  theme: ThemeHelper;
  form: FormHelper;
  table: TableHelper;
  search: SearchHelper;
  localization: LocalizationHelper;
  responsive: ResponsiveHelper;
  modal: ModalHelper;
  notification: NotificationHelper;

  constructor(page: Page) {
    this.auth = new AuthHelper(page);
    this.navigation = new NavigationHelper(page);
    this.wait = new WaitHelper(page);
    this.screenshot = new ScreenshotHelper(page);
    this.theme = new ThemeHelper(page);
    this.form = new FormHelper(page);
    this.table = new TableHelper(page);
    this.search = new SearchHelper(page);
    this.localization = new LocalizationHelper(page);
    this.responsive = new ResponsiveHelper(page);
    this.modal = new ModalHelper(page);
    this.notification = new NotificationHelper(page);
  }
}

// Export everything
export const createTestContext = (page: Page) => new TestContextHelper(page);
