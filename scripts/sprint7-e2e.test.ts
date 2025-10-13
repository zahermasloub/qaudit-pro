#!/usr/bin/env node
/**
 * Sprint 7 E2E Test Suite
 * Tests fieldwork runs and evidence upload/download functionality
 */

import { PrismaClient } from '@prisma/client';
import { promises as fs } from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const prisma = new PrismaClient();

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message?: string;
  data?: any;
}

const results: TestResult[] = [];

async function log(message: string) {
  console.log(`[E2E] ${message}`);
}

async function test(name: string, testFn: () => Promise<void>): Promise<void> {
  try {
    await testFn();
    results.push({ name, status: 'PASS' });
    await log(`✅ ${name}`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, status: 'FAIL', message: errorMsg });
    await log(`❌ ${name}: ${errorMsg}`);
  }
}

async function createTestFile(filename: string, content: string): Promise<Buffer> {
  const buffer = Buffer.from(content, 'utf8');
  return buffer;
}

async function testFieldworkRuns() {
  await test('POST /api/fieldwork/runs - Valid payload', async () => {
    const payload = {
      engagementId: 'TEST-ENG-001',
      auditTestId: 'TEST-001',
      stepIndex: 1,
      actionTaken: 'تم فحص العينة وتحليل البيانات المالية',
      result: 'pass',
      notes: 'تمت العملية بنجاح وفقاً للمعايير المطلوبة',
      sampleRef: 'SAMPLE-001',
      evidenceIds: [],
      executedBy: 'auditor@gov.sa',
    };

    const response = await fetch(`${BASE_URL}/api/fieldwork/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`);
    }

    if (!result.ok || !result.id) {
      throw new Error('Expected {ok: true, id: string}');
    }

    results[results.length - 1].data = { runId: result.id };
  });

  await test('POST /api/fieldwork/runs - Invalid payload', async () => {
    const invalidPayload = {
      engagementId: '', // Invalid: empty string
      auditTestId: 'TEST-001',
      stepIndex: -1, // Invalid: negative number
      actionTaken: 'ab', // Invalid: too short
      result: 'invalid', // Invalid: not in enum
      executedBy: 'not-an-email', // Invalid: not an email
    };

    const response = await fetch(`${BASE_URL}/api/fieldwork/runs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    if (response.ok) {
      throw new Error('Expected validation error, but request succeeded');
    }

    const result = await response.json();
    if (!result.error) {
      throw new Error('Expected error message in response');
    }
  });
}

async function testEvidenceUpload() {
  const testFiles = [
    { name: 'test-document.pdf', content: '%PDF-1.4 Test PDF content', type: 'application/pdf' },
    { name: 'test-image.png', content: 'PNG fake image data', type: 'image/png' },
    {
      name: 'test-spreadsheet.xlsx',
      content: 'Excel fake data content',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  ];

  for (const fileSpec of testFiles) {
    await test(`POST /api/evidence/upload - ${fileSpec.name}`, async () => {
      const formData = new FormData();
      const fileBuffer = await createTestFile(fileSpec.name, fileSpec.content);
      const file = new File([new Uint8Array(fileBuffer)], fileSpec.name, { type: fileSpec.type });

      const meta = {
        engagementId: 'TEST-ENG-001',
        category: 'audit-evidence',
        linkedTestId: 'TEST-001',
        linkedSampleRef: 'SAMPLE-001',
        uploadedBy: 'auditor@gov.sa',
      };

      formData.append('file', file);
      formData.append('meta', JSON.stringify(meta));

      const response = await fetch(`${BASE_URL}/api/evidence/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${result.error || 'Unknown error'}`);
      }

      if (!result.ok || !result.id) {
        throw new Error('Expected {ok: true, id: string}');
      }

      results[results.length - 1].data = { evidenceId: result.id, fileName: fileSpec.name };
    });
  }
}

async function testEvidenceDownload() {
  // Get uploaded evidence IDs from previous tests
  const evidenceIds = results.filter(r => r.data?.evidenceId).map(r => r.data.evidenceId);

  if (evidenceIds.length === 0) {
    await test('GET /api/evidence/[id]/download - No evidence to test', async () => {
      throw new Error('No evidence IDs found from upload tests');
    });
    return;
  }

  for (const evidenceId of evidenceIds) {
    await test(`GET /api/evidence/${evidenceId}/download`, async () => {
      const response = await fetch(`${BASE_URL}/api/evidence/${evidenceId}/download`);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(`HTTP ${response.status}: ${result.error || 'Download failed'}`);
      }

      const contentType = response.headers.get('content-type');
      const contentDisposition = response.headers.get('content-disposition');

      if (!contentType) {
        throw new Error('Missing Content-Type header');
      }

      if (!contentDisposition || !contentDisposition.includes('attachment')) {
        throw new Error('Missing or invalid Content-Disposition header');
      }

      const buffer = await response.arrayBuffer();
      if (buffer.byteLength === 0) {
        throw new Error('Downloaded file is empty');
      }

      results[results.length - 1].data = {
        size: buffer.byteLength,
        contentType,
        disposition: contentDisposition,
      };
    });
  }
}

async function testDatabaseRecords() {
  await test('Verify TestRun records in database', async () => {
    const testRuns = await prisma.testRun.findMany({
      where: { engagementId: 'TEST-ENG-001' },
    });

    if (testRuns.length === 0) {
      throw new Error('No test runs found in database');
    }

    const validRun = testRuns.find(run => run.actionTaken && run.result && run.executedBy);

    if (!validRun) {
      throw new Error('No valid test runs found with required fields');
    }

    results[results.length - 1].data = {
      count: testRuns.length,
      sample: {
        id: validRun.id,
        result: validRun.result,
        actionTaken: validRun.actionTaken.substring(0, 50),
      },
    };
  });

  await test('Verify Evidence records in database', async () => {
    const evidence = await prisma.evidence.findMany({
      where: { engagementId: 'TEST-ENG-001' },
    });

    if (evidence.length < 3) {
      throw new Error(`Expected at least 3 evidence records, found ${evidence.length}`);
    }

    const validEvidence = evidence.filter(
      ev => ev.fileName && ev.fileSize > 0 && ev.storage && ev.storageKey,
    );

    if (validEvidence.length !== evidence.length) {
      throw new Error('Some evidence records missing required fields');
    }

    results[results.length - 1].data = {
      count: evidence.length,
      totalSize: evidence.reduce((sum, ev) => sum + ev.fileSize, 0),
      storage: evidence.map(ev => ev.storage),
      files: evidence.map(ev => ev.fileName),
    };
  });
}

async function generateReport() {
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const skipCount = results.filter(r => r.status === 'SKIP').length;
  const totalCount = results.length;

  const reportContent = `# Sprint 7 E2E Test Report

Generated: ${new Date().toISOString()}

## Summary
- **Total Tests**: ${totalCount}
- **Passed**: ${passCount} ✅
- **Failed**: ${failCount} ❌
- **Skipped**: ${skipCount} ⚠️
- **Success Rate**: ${totalCount > 0 ? Math.round((passCount / totalCount) * 100) : 0}%

## Test Results

${results
  .map(
    result => `
### ${result.name}
- **Status**: ${result.status === 'PASS' ? '✅ PASS' : result.status === 'FAIL' ? '❌ FAIL' : '⚠️ SKIP'}
${result.message ? `- **Message**: ${result.message}` : ''}
${result.data ? `- **Data**: \`${JSON.stringify(result.data, null, 2)}\`` : ''}
`,
  )
  .join('\n')}

## Acceptance Criteria Check

${passCount >= 7 ? '✅' : '❌'} **All core APIs working** (${passCount}/7+ tests passed)
${results.some(r => r.data?.evidenceId) ? '✅' : '❌'} **Evidence upload successful**
${results.some(r => r.data?.runId) ? '✅' : '❌'} **Test run creation successful**
${results.some(r => r.data?.size > 0) ? '✅' : '❌'} **Evidence download working**
${results.some(r => r.data?.count >= 3) ? '✅' : '❌'} **≥3 evidence records in DB**

## Final Status: ${failCount === 0 && passCount >= 6 ? '🎉 SPRINT 7 COMPLETE' : '⚠️ NEEDS ATTENTION'}

---
*Generated by Sprint 7 E2E Test Suite*
`;

  const reportsDir = path.join(process.cwd(), 'reports');
  await fs.mkdir(reportsDir, { recursive: true });

  const reportPath = path.join(reportsDir, 'sprint7_e2e_report.md');
  await fs.writeFile(reportPath, reportContent, 'utf8');

  console.log(`\n📋 Report generated: ${reportPath}`);
  console.log(`\n🏆 Final Summary: ${passCount}/${totalCount} tests passed`);

  if (failCount > 0) {
    console.log(`\n❌ ${failCount} tests failed. Check report for details.`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tests passed! Sprint 7 ready for deployment.`);
  }
}

async function main() {
  console.log('🚀 Starting Sprint 7 E2E Test Suite...\n');

  try {
    await testFieldworkRuns();
    await testEvidenceUpload();
    await testEvidenceDownload();
    await testDatabaseRecords();
  } catch (error) {
    await log(`Fatal error: ${error}`);
  } finally {
    await prisma.$disconnect();
    await generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runE2ETests };
