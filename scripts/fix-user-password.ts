#!/usr/bin/env node
/**
 * Update user password with proper bcrypt hash
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function updateUserPassword() {
  try {
    console.log('🔄 Updating user password...');

    const email = 'crc.qa2222@gmail.com';
    const password = 'password123';

    // Use proper bcrypt hashing for NextAuth compatibility
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update existing user
    const user = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log('✅ User password updated successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error('❌ Error updating user password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword().catch(console.error);
