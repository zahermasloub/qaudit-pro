import { NextResponse } from 'next/server';

import { annualPlanSchema, sumAlloc } from '@/features/annual-plan/annual-plan.schema';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const v = annualPlanSchema.parse(json);

    // تحقق: مجموع التخصيص لا يتجاوز الإجمالي
    const alloc = sumAlloc(v);
    if (alloc > v.totalAvailableHours) {
      return Response.json(
        {
          ok: false,
          error: 'total_allocation_exceeds_total_hours',
          alloc,
          total: v.totalAvailableHours,
        },
        { status: 400 },
      );
    }

    const created = await prisma.annualPlan.create({
      data: {
        title: v.title,
        fiscalYear: v.fiscalYear,
        version: v.version,
        status: v.status,
        introduction: v.introduction ?? null,
        totalAvailableHours: v.totalAvailableHours ?? null,
        plannedTaskHours: v.plannedTaskHours ?? null,
        advisoryHours: v.advisoryHours ?? null,
        emergencyHours: v.emergencyHours ?? null,
        followUpHours: v.followUpHours ?? null,
        trainingHours: v.trainingHours ?? null,
        administrativeHours: v.administrativeHours ?? null,
        estimatedBudget: v.estimatedBudget ?? null,
        createdBy: v.createdBy,
      },
    });

    return Response.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message || e?.message || 'invalid_payload';
    return Response.json({ ok: false, error: msg }, { status: 400 });
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
