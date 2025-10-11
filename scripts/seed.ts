import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
  const engagement = await prisma.engagement.create({
    data: {
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

  // Create PBC
  await prisma.pBCRequest.create({
    data: {
      code: 'PBC-001',
      description: 'First PBC',
      ownerId: 'lead@example.com',
      dueDate: new Date('2025-02-01'),
      status: 'OPEN',
      attachmentsJson: {},
      engagementId: engagement.id,
    },
  });

  console.log('Seeded User, Engagement and PBC');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
