// create-admin-user.js
// سكريبت لإنشاء مستخدم admin في قاعدة البيانات

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'adam@qaudit.com';
  const password = 'zaher123456';
  const name = 'Adam Admin';
  const role = 'ADMIN';

  try {
    // تحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ المستخدم موجود بالفعل:', email);
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        locale: 'ar'
      }
    });

    console.log('✅ تم إنشاء المستخدم بنجاح:');
    console.log('   البريد الإلكتروني:', user.email);
    console.log('   الاسم:', user.name);
    console.log('   الدور:', user.role);
    console.log('\n🔐 بيانات تسجيل الدخول:');
    console.log('   Email:', email);
    console.log('   Password:', password);

  } catch (error) {
    console.error('❌ خطأ في إنشاء المستخدم:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
