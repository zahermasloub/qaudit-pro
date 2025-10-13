/**
 * Test Prisma Models - اختبار الـ models المتوفرة في Prisma
 */

import prisma from '@/lib/prisma';

export async function testPrismaModels() {
  console.log('Available Prisma models:');
  console.log('- User:', !!prisma.user);
  console.log('- Engagement:', !!prisma.engagement);
  console.log('- AuditTest:', !!prisma.auditTest);
  console.log('- TestRun:', !!prisma.testRun);
  console.log('- Evidence:', !!prisma.evidence);

  // التحقق من الـ schema
  const models = Object.keys(prisma).filter(
    key => typeof (prisma as any)[key] === 'object' && (prisma as any)[key].findMany,
  );

  console.log('Detected models:', models);

  return models;
}
