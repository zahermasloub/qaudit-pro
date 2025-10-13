import prisma from '@/lib/prisma';

async function checkUserExists() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@test.com' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        locale: true,
        createdAt: true,
      },
    });

    if (user) {
      console.log('USER EXISTS?', true, user.email);
      console.log('HASH LOOKS BCRYPT?', user.password.startsWith('$2b$'));
      console.log('User details:', {
        id: user.id,
        name: user.name,
        role: user.role,
        locale: user.locale,
        createdAt: user.createdAt,
        passwordLength: user.password.length,
      });
    } else {
      console.log('USER EXISTS?', false, 'test@test.com');
    }

    // Also show total user count
    const totalUsers = await prisma.user.count();
    console.log('Total users in database:', totalUsers);
  } catch (error) {
    console.error('Error checking user:', error);
  }
}

checkUserExists().finally(() => process.exit(0));
