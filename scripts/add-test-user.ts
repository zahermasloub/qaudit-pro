import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addTestUser() {
  try {
    // Hash the password
    const hash = await bcrypt.hash('123456', 10); // Simple password for testing

    // Create the test user
    const user = await prisma.user.upsert({
      where: { email: 'test@gmail.com' },
      update: {
        password: hash, // Update password if user exists
      },
      create: {
        email: 'test@gmail.com',
        name: 'Test User',
        password: hash,
        role: 'IA_Auditor', // Regular auditor role
        locale: 'en', // English locale
      },
    });

    console.log('✅ User added successfully:');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Password: 123456`);
    console.log(`👤 Role: ${user.role}`);
    console.log(`🌍 Locale: ${user.locale}`);
  } catch (error) {
    console.error('❌ Error adding user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestUser();
