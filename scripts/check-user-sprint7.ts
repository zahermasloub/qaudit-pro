#!/usr/bin/env node
/**
 * Check user in database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'crc.qa2222@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (user) {
      console.log('✅ User found:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser().catch(console.error);
