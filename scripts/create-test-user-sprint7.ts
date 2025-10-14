#!/usr/bin/env node
/**
 * Create test user for Sprint 7 testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔄 Creating test user...');

    const email = 'crc.qa2222@gmail.com';
    const password = 'password123';
    // Use proper bcrypt hashing for NextAuth compatibility
    const hashedPassword = await bcrypt.hash(password, 12);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('✅ User already exists:', email);
      return existingUser;
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: 'Test Auditor',
        email: email,
        password: hashedPassword,
        role: 'IA_Lead',
        locale: 'ar',
      },
    });

    console.log('✅ Test user created successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password: ${password}`);

    return user;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  createTestUser().catch(console.error);
}

export { createTestUser };
