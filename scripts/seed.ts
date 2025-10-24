import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedData() {
  // Create User
  const hash = await bcrypt.hash('Passw0rd!', 10);
  await prisma.user.upsert({
    where: { email: 'lead@example.com' },
    update: {},
    create: {
      email: 'lead@example.com',
      name: 'IA Lead',
      password: hash,
      role: 'IA_Lead',
      locale: 'ar',
    },
  });
  console.log('Seeded: lead@example.com / Passw0rd!');

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

  // Create Annual Plan
  const annualPlan = await prisma.annualPlan.upsert({
    where: {
      id: 'sample-plan-2025',
    },
    update: {},
    create: {
      id: 'sample-plan-2025',
      title: 'خطة التدقيق السنوية 2025',
      fiscalYear: 2025,
      version: '1.0',
      status: 'approved',
      introduction: 'خطة التدقيق الداخلي للسنة المالية 2025',
      totalAvailableHours: 2000,
      plannedTaskHours: 1500,
      advisoryHours: 200,
      emergencyHours: 100,
      followUpHours: 100,
      trainingHours: 50,
      administrativeHours: 50,
      estimatedBudget: 500000,
      createdBy: 'lead@example.com',
      planRef: 'AP-2025-001', // رقم مرجعي للخطة
    },
  });

  // Create Sample Audit Tasks
  const auditTasks = [
    {
      seqNo: 1,
      taskRef: 'AT-2025-001',
      code: 'AT-2025-001',
      title: 'تدقيق العمليات المالية',
      department: 'المالية',
      riskLevel: 'high' as const,
      auditType: 'financial' as const,
      objectiveAndScope: 'تقييم فعالية الضوابط المالية والامتثال للسياسات',
      plannedQuarter: 'Q1' as const,
      estimatedHours: 120,
      status: 'not_started' as const,
    },
    {
      seqNo: 2,
      taskRef: 'AT-2025-002',
      code: 'AT-2025-002',
      title: 'تدقيق أمن المعلومات',
      department: 'تقنية المعلومات',
      riskLevel: 'high' as const,
      auditType: 'it_systems' as const,
      objectiveAndScope: 'مراجعة ضوابط أمن المعلومات وحماية البيانات',
      plannedQuarter: 'Q2' as const,
      estimatedHours: 160,
      status: 'not_started' as const,
    },
    {
      seqNo: 3,
      taskRef: 'AT-2025-003',
      code: 'AT-2025-003',
      title: 'تدقيق الامتثال التنظيمي',
      department: 'الامتثال',
      riskLevel: 'medium' as const,
      auditType: 'compliance' as const,
      objectiveAndScope: 'التحقق من الالتزام باللوائح والأنظمة',
      plannedQuarter: 'Q3' as const,
      estimatedHours: 100,
      status: 'not_started' as const,
    },
    {
      seqNo: 4,
      taskRef: 'AT-2025-004',
      code: 'AT-2025-004',
      title: 'تدقيق العمليات التشغيلية',
      department: 'العمليات',
      riskLevel: 'medium' as const,
      auditType: 'operational' as const,
      objectiveAndScope: 'تقييم كفاءة وفعالية العمليات التشغيلية',
      plannedQuarter: 'Q4' as const,
      estimatedHours: 140,
      status: 'not_started' as const,
    },
  ];

  for (const task of auditTasks) {
    await prisma.auditTask.upsert({
      where: {
        code_annualPlanId: {
          code: task.code,
          annualPlanId: annualPlan.id,
        },
      },
      update: {},
      create: {
        ...task,
        annualPlanId: annualPlan.id,
      },
    });
  }

  console.log('Seeded User, Engagement, PBC, Annual Plan and Audit Tasks');
}

seedData()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
