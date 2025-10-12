import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedData() {
  // Create User
  const hash = await bcrypt.hash("Passw0rd!", 10);
  await prisma.user.upsert({
    where: { email: "lead@example.com" },
    update: {},
    create: {
      email: "lead@example.com",
      name: "IA Lead",
      password: hash,
      role: "IA_Lead",
      locale: "ar"
    },
  });
  console.log("Seeded: lead@example.com / Passw0rd!");

  // Create Engagement
  const engagement = await prisma.engagement.upsert({
    where: { code: 'IA-2025-001' },
    update: {},
    create: {
      code: 'IA-2025-001',
      title: 'Internal Audit 2025',
      objective: 'Audit Objective',
      scopeJson: {},
      criteriaJson: {},
      constraintsJson: {},
      auditeeUnitsJson: {},
      stakeholdersJson: {},
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      budgetHours: 100,
      status: 'DRAFT',
      createdBy: 'lead@example.com',
    },
  });

  // Create PBC (try to create, ignore if exists)
  try {
    await prisma.pBCRequest.create({
      data: {
        code: 'PBC-001',
        description: 'First PBC',
        ownerId: 'lead@example.com',
        dueDate: new Date('2025-02-01'),
        status: 'open',
        attachmentsJson: {},
        engagementId: engagement.id,
      },
    });
  } catch (error) {
    // PBC already exists, skip
  }

  console.log('Seeded User, Engagement and PBC');
}

seedData()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
