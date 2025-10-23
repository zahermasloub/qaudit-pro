import { defineConfig, devices } from '@playwright/test';

/**
 * ⚙️ Playwright Configuration
 * تكوين شامل لاختبارات Playwright البصرية والوظيفية
 */
export default defineConfig({
  testDir: './tests',

  // ⏱️ إعدادات المهلة الزمنية
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  // 🔄 إعدادات إعادة المحاولة
  retries: 1,
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
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'iPhone 12',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // مسار اللقطات
  snapshotPathTemplate: '{testDir}/__snapshots__/{projectName}/{testFilePath}/{arg}{ext}',

  // 🚀 تشغيل خادم التطوير قبل الاختبارات
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
