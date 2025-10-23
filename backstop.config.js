/**
 * 🎨 BackstopJS Configuration
 * تكوين للاختبارات البصرية (Visual Regression Testing)
 */

module.exports = {
  id: 'qaudit-pro-visual-tests',
  viewports: [
    {
      label: 'phone',
      width: 375,
      height: 667,
    },
    {
      label: 'tablet',
      width: 768,
      height: 1024,
    },
    {
      label: 'desktop',
      width: 1920,
      height: 1080,
    },
  ],

  scenarios: [
    {
      label: 'Homepage',
      url: 'http://localhost:3001',
      referenceUrl: '',
      readyEvent: '',
      readySelector: '',
      delay: 1000,
      hideSelectors: [],
      removeSelectors: [],
      hoverSelector: '',
      clickSelector: '',
      postInteractionWait: 0,
      selectors: ['document'],
      selectorExpansion: true,
      expect: 0,
      misMatchThreshold: 0.1,
      requireSameDimensions: true,
    },
    {
      label: 'Login Page',
      url: 'http://localhost:3001/auth/login',
      delay: 1000,
      selectors: ['document'],
      misMatchThreshold: 0.1,
    },
    {
      label: 'Dashboard',
      url: 'http://localhost:3001/dashboard',
      delay: 2000,
      selectors: ['document'],
      misMatchThreshold: 0.1,
    },
    {
      label: 'Annual Plan',
      url: 'http://localhost:3001/annual-plan',
      delay: 2000,
      selectors: ['document'],
      misMatchThreshold: 0.1,
    },
  ],

  paths: {
    bitmaps_reference: 'tests/visual/backstop_data/bitmaps_reference',
    bitmaps_test: 'tests/visual/backstop_data/bitmaps_test',
    engine_scripts: 'tests/visual/backstop_data/engine_scripts',
    html_report: 'tests/reports/backstop',
    ci_report: 'tests/reports/backstop',
  },

  report: ['browser', 'json'],
  engine: 'playwright',
  engineOptions: {
    args: ['--no-sandbox'],
  },

  asyncCaptureLimit: 5,
  asyncCompareLimit: 50,
  debug: false,
  debugWindow: false,
};
