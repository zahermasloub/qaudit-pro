import { NextResponse } from 'next/server';

import { auditTaskSchema } from '@/features/annual-plan/annual-plan.schema';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = auditTaskSchema.parse(json);

    const task = await prisma.auditTask.create({
      data: {
        annualPlanId: parsed.annualPlanId,
        code: parsed.code,
        title: parsed.title,
        department: parsed.department,
        riskLevel: parsed.riskLevel,
        auditType: parsed.auditType,
        objectiveAndScope: parsed.objectiveAndScope,
        plannedQuarter: parsed.plannedQuarter,
        estimatedHours: parsed.estimatedHours,
        leadAuditor: parsed.leadAuditor,
        attachmentsJson: parsed.attachmentsJson || [],
        status: parsed.status || 'not_started',
      },
    });

    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const annualPlanId = searchParams.get('annualPlanId');
    const riskLevel = searchParams.get('riskLevel');
    const status = searchParams.get('status');

    const where: any = {};
    if (annualPlanId) where.annualPlanId = annualPlanId;
    if (riskLevel) where.riskLevel = riskLevel;
    if (status) where.status = status;

    const tasks = await prisma.auditTask.findMany({
      where,
      include: {
        annualPlan: {
          select: {
            title: true,
            fiscalYear: true,
          },
        },
      },
      orderBy: {
        code: 'asc',
      },
    });

    return NextResponse.json(tasks);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
