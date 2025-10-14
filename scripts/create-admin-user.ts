import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Hash admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const user = await prisma.user.create({
      data: {
        email: 'admin@qaudit.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'IA_Lead',
        locale: 'ar'
      }
    });

    console.log('✅ Admin user created:', user.email);
    console.log('📧 Email: admin@qaudit.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();