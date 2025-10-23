import { defineConfig, devices } from '@playwright/test';

/**
 * ⚙️ Playwright Configuration
 * تكوين شامل لاختبارات Playwright البصرية والوظيفية
 */
export default defineConfig({
  testDir: './tests/e2e',

  // ⏱️ إعدادات المهلة الزمنية
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // 🔄 إعدادات إعادة المحاولة
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  // 📊 تقارير الاختبارات
  reporter: [
    ['html', { outputFolder: 'tests/reports/playwright' }],
    ['json', { outputFile: 'tests/reports/playwright/results.json' }],
    ['list'],
  ],

  // 🌐 خيارات مشتركة لجميع الاختبارات
  use: {
    // Base URL للتطبيق
    baseURL: 'http://localhost:3001',

    // 📸 Screenshots on failure
    screenshot: 'only-on-failure',

    // 🎥 Video recording
    video: 'retain-on-failure',

    // 📝 Trace files
    trace: 'on-first-retry',

    // 🎯 Locale and timezone
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',

    // 🖱️ Action timeout
    actionTimeout: 10000,

    // 🔐 Ignore HTTPS errors (for development)
    ignoreHTTPSErrors: true,
  },

  // 🌍 المتصفحات المستهدفة
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // 📱 Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // 🌐 RTL Testing
    {
      name: 'chromium-rtl',
      use: {
        ...devices['Desktop Chrome'],
        locale: 'ar-SA',
      },
    },
  ],

  // 🚀 تشغيل خادم التطوير قبل الاختبارات
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
