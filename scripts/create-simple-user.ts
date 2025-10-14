import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createSimpleUser() {
  try {
    // Hash simple password
    const hashedPassword = await bcrypt.hash('123456', 10);

    // Create simple test user
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User Simple',
        password: hashedPassword,
        role: 'IA_Lead',
        locale: 'ar',
      },
    });

    console.log('✅ Simple test user created:', user.email);
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: 123456');
  } catch (error) {
    console.error('❌ Error creating simple user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleUser();
