#!/usr/bin/env node
/**
 * Check engagements in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEngagements() {
  try {
    console.log('🔍 Checking engagements in database...');

    const engagements = await prisma.engagement.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        status: true,
        createdAt: true
      }
    });

    if (engagements.length > 0) {
      console.log('✅ Found engagements:');
      engagements.forEach((eng, index) => {
        console.log(`${index + 1}. ID: ${eng.id}`);
        console.log(`   Code: ${eng.code}`);
        console.log(`   Title: ${eng.title}`);
        console.log(`   Status: ${eng.status}`);
        console.log(`   Created: ${eng.createdAt.toISOString()}`);
        console.log('');
      });
    } else {
      console.log('❌ No engagements found in database');
      console.log('💡 Run: npx tsx scripts/create-sprint7-test-data.ts');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEngagements().catch(console.error);
