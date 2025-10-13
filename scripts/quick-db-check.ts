import prisma from '@/lib/prisma';

async function quickDbCheck() {
  try {
    const ping = await prisma.$queryRaw`SELECT 1 as ok`;
    console.log('DB PING:', ping);

    const users = await prisma.user.findMany({
      take: 1,
      select: { id: true, email: true },
    });
    console.log('DB SAMPLE USER:', users);

    // Also check table count
    const userCount = await prisma.user.count();
    console.log('Total users in DB:', userCount);
  } catch (error) {
    console.error('DB ERROR:', error);
    process.exit(1);
  }
}

quickDbCheck()
  .catch((e: any) => {
    console.error('DB ERROR:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
