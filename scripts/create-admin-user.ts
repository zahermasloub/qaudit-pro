import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@qaudit.com';
const ADMIN_PASSWORD = 'zaher123456';

async function ensureAdminRole() {
  const existingRole = await prisma.role.findUnique({ where: { name: 'Admin' } });
  if (existingRole) {
    return existingRole;
  }

  return prisma.role.create({
    data: {
      name: 'Admin',
      description: 'دور الإداري الكامل للوصول إلى لوحة التحكم',
    },
  });
}

async function createAdminUser() {
  try {
    const adminRole = await ensureAdminRole();

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    const user = await prisma.user.upsert({
      where: { email: ADMIN_EMAIL },
      update: {
        name: 'Admin Console Owner',
        password: hashedPassword,
        role: 'Admin',
        locale: 'ar',
      },
      create: {
        email: ADMIN_EMAIL,
        name: 'Admin Console Owner',
        password: hashedPassword,
        role: 'Admin',
        locale: 'ar',
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });

    console.log('✅ حساب الأدمن جاهز');
    console.log('   البريد الإلكتروني :', ADMIN_EMAIL);
    console.log('   كلمة المرور        :', ADMIN_PASSWORD);
  } catch (error) {
    console.error('❌ تعذّر إنشاء حساب الأدمن:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
