import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { engagementSchema } from '@/features/planning/engagement/engagement.schema';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsed = engagementSchema.parse(data);

    const created = await prisma.engagement.create({
      data: {
        code: parsed.code,
        title: parsed.title,
        objective: parsed.objective,
        scopeJson: parsed.scope,
        criteriaJson: parsed.criteria,
        constraintsJson: parsed.constraints ?? [],
        auditeeUnitsJson: parsed.auditeeUnits,
        stakeholdersJson: parsed.stakeholders ?? [],
        startDate: new Date(parsed.startDate),
        endDate: new Date(parsed.endDate),
        budgetHours: parsed.budgetHours,
        independenceDisclosureUrl: parsed.independenceDisclosureUrl,
        createdBy: parsed.createdBy,
      },
    });

    return NextResponse.json({ ok: true, id: created.id }, { status: 200 });
  } catch (e: any) {
    console.error('API Error:', e);

    // Handle Zod validation errors
    if (e?.errors) {
      const msg = e.errors[0]?.message || 'خطأ في التحقق من البيانات';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    // Handle Prisma errors
    if (e?.code === 'P2002') {
      return NextResponse.json({ ok: false, error: 'كود المهمة موجود مسبقاً' }, { status: 400 });
    }

    const msg = e?.message || 'خطأ غير متوقع';
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
