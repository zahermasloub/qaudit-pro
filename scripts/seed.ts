import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
      createdBy: 'admin',
    },
  });

  // Create PBC
  await prisma.pBCRequest.create({
    data: {
      code: 'PBC-001',
      description: 'First PBC',
      ownerId: 'admin',
      dueDate: new Date('2025-02-01'),
      status: 'OPEN',
      attachmentsJson: {},
      engagementId: engagement.id,
    },
  });

  console.log('Seeded Engagement and PBC');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
