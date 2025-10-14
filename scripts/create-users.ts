import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'crc.qa2222@gmail.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'IA_Lead',
        locale: 'ar'
      }
    });

    console.log('✅ User created successfully:', user.email);

    // Create another test user
    const hashedPassword2 = await bcrypt.hash('password123', 10);
    const user2 = await prisma.user.create({
      data: {
        email: 'adam@gmail.com',
        name: 'Adam',
        password: hashedPassword2,
        role: 'Senior_Auditor',
        locale: 'en'
      }
    });

    console.log('✅ User created successfully:', user2.email);

  } catch (error) {
    console.error('❌ Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
