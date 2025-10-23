import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 🚀 Lighthouse Performance Tests
 * اختبارات الأداء وتجربة المستخدم
 */

interface LighthouseConfig {
  extends: string;
  settings: {
    onlyCategories: string[];
    locale: string;
  };
}

const lighthouseConfig: LighthouseConfig = {
  extends: 'lighthouse:default',
  settings: {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    locale: 'ar',
  },
};

const urls = [
  { name: 'Homepage', url: 'http://localhost:3001' },
  { name: 'Login', url: 'http://localhost:3001/auth/login' },
  { name: 'Dashboard', url: 'http://localhost:3001/dashboard' },
  { name: 'Annual Plan', url: 'http://localhost:3001/annual-plan' },
];

async function runLighthouse(url: string, name: string) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info' as const,
    output: 'html' as const,
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
    locale: 'ar',
  };

  const runnerResult = await lighthouse(url, options);

  // حفظ التقرير HTML
  const reportHtml = runnerResult?.report;
  if (reportHtml) {
    const reportPath = join(process.cwd(), 'tests_environment', 'tests', 'reports', 'lighthouse', `${name}.html`);
    writeFileSync(reportPath, reportHtml as string);
    console.log(`✅ Report saved: ${reportPath}`);
  }

  // حفظ النتائج JSON
  const scores = {
    name,
    url,
    performance: runnerResult?.lhr.categories.performance.score || 0,
    accessibility: runnerResult?.lhr.categories.accessibility.score || 0,
    bestPractices: runnerResult?.lhr.categories['best-practices'].score || 0,
    seo: runnerResult?.lhr.categories.seo.score || 0,
    timestamp: new Date().toISOString(),
  };

  await chrome.kill();
  return scores;
}

async function runAllTests() {
  console.log('🚀 Starting Lighthouse performance tests...\n');

  const results = [];

  for (const { name, url } of urls) {
    console.log(`📊 Testing: ${name} - ${url}`);
    try {
      const scores = await runLighthouse(url, name);
      results.push(scores);

      console.log(`✅ ${name} Scores:`);
      console.log(`   Performance: ${(scores.performance * 100).toFixed(0)}%`);
      console.log(`   Accessibility: ${(scores.accessibility * 100).toFixed(0)}%`);
      console.log(`   Best Practices: ${(scores.bestPractices * 100).toFixed(0)}%`);
      console.log(`   SEO: ${(scores.seo * 100).toFixed(0)}%`);
      console.log('');
    } catch (error) {
      console.error(`❌ Error testing ${name}:`, error);
    }
  }

  // حفظ ملخص النتائج
  const summaryPath = join(process.cwd(), 'tests_environment', 'tests', 'reports', 'lighthouse', 'summary.json');
  writeFileSync(summaryPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Summary saved: ${summaryPath}`);

  // التحقق من العتبات
  console.log('\n🎯 Threshold Checks:');
  for (const result of results) {
    const passed =
      result.performance >= 0.7 &&
      result.accessibility >= 0.9 &&
      result.bestPractices >= 0.8 &&
      result.seo >= 0.8;

    console.log(`${passed ? '✅' : '❌'} ${result.name}: ${passed ? 'PASSED' : 'FAILED'}`);
  }
}

// تشغيل الاختبارات
if (require.main === module) {
  runAllTests().catch(console.error);
}

export { runLighthouse, runAllTests };
