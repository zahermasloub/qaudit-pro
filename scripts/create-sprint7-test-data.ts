#!/usr/bin/env node
/**
 * Create test engagement for Sprint 7 testing
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🔄 Creating test engagement...');

    // Create test engagement
    const engagement = await prisma.engagement.create({
      data: {
        id: 'TEST-ENG-001',
        code: 'IA-2025-S7-TEST',
        title: 'Sprint 7 Test Engagement',
        objective: 'Testing fieldwork and evidence functionality',
        scopeJson: ['Test scope item 1', 'Test scope item 2'],
        criteriaJson: ['Test criteria 1', 'Test criteria 2'],
        constraintsJson: ['Test constraint 1'],
        auditeeUnitsJson: ['Unit A', 'Unit B'],
        stakeholdersJson: ['Stakeholder 1', 'Stakeholder 2'],
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        budgetHours: 200,
        status: 'IN_PROGRESS',
        createdBy: 'test-auditor@gov.sa'
      }
    });

    console.log('✅ Test engagement created:', engagement.id);

    // Create test audit test
    const auditTest = await prisma.auditTest.create({
      data: {
        id: 'TEST-001',
        engagementId: engagement.id,
        code: 'TEST-001',
        title: 'Test Audit Procedure',
        objective: 'Testing evidence collection',
        testStepsJson: ['Step 1: Review documents', 'Step 2: Test samples'],
        expectedResults: 'Financial records and supporting documents should be complete',
        status: 'planned'
      }
    });

    console.log('✅ Test audit test created:', auditTest.id);

    console.log('\n🎯 Ready for Sprint 7 testing!');
    console.log(`Engagement ID: ${engagement.id}`);
    console.log(`Test ID: ${auditTest.id}`);

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestData().catch(console.error);
}

export { createTestData };
