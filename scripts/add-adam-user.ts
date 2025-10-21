import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function addAdamUser() {
  console.log('🔧 Adding adam@qaudit.com user...');

  try {
    // Hash the password
    const password = 'zaher123456'; // كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { email: 'adam@qaudit.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'adam@qaudit.com',
        name: 'Adam',
        password: hashedPassword,
        role: 'IA_Manager', // دور مدير التدقيق
        locale: 'ar',
      },
    });

    console.log('✅ User created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', user.role);
    console.log('🌐 Locale:', user.locale);
    console.log('\n🎉 You can now login with:');
    console.log('   Email: adam@qaudit.com');
    console.log('   Password:', password);
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addAdamUser()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
