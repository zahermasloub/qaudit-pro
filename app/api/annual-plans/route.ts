import { NextResponse } from 'next/server';

import { annualPlanSchema } from '@/features/annual-plan/annual-plan.schema';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = annualPlanSchema.parse(json);

    const plan = await prisma.annualPlan.create({
      data: {
        title: parsed.title,
        fiscalYear: parsed.fiscalYear,
        version: parsed.version || '1.0',
        status: parsed.status || 'draft',
        introduction: parsed.introduction,
        totalAvailableHours: parsed.totalAvailableHours,
        plannedTaskHours: parsed.plannedTaskHours,
        advisoryHours: parsed.advisoryHours,
        emergencyHours: parsed.emergencyHours,
        followUpHours: parsed.followUpHours,
        trainingHours: parsed.trainingHours,
        administrativeHours: parsed.administrativeHours,
        estimatedBudget: parsed.estimatedBudget,
        createdBy: parsed.createdBy,
      },
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fiscalYear = searchParams.get('fiscalYear');

    const where = fiscalYear
      ? { fiscalYear: !isNaN(parseInt(fiscalYear)) ? parseInt(fiscalYear) : undefined }
      : {};

    const plans = await prisma.annualPlan.findMany({
      where,
      include: {
        auditTasks: true,
        approvals: true,
      },
      orderBy: {
        fiscalYear: 'desc',
      },
    });

    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
