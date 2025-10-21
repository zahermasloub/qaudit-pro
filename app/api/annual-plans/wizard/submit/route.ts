/**
 * API Route: Submit annual plan (change status from draft to submitted)
 * POST /api/annual-plans/wizard/submit
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/options';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json({ ok: false, error: 'Plan ID required' }, { status: 400 });
    }

    // Verify plan exists
    const plan = await prisma.annualPlan.findUnique({
      where: { id: planId },
      include: {
        auditTasks: true,
      },
    });

    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Plan not found' }, { status: 404 });
    }

    // Verify plan has at least one task
    if (plan.auditTasks.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'Plan must have at least one task' },
        { status: 400 }
      );
    }

    // Update plan status to submitted
    const updated = await prisma.annualPlan.update({
      where: { id: planId },
      data: {
        status: 'submitted',
        updatedAt: new Date(),
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: session.user.email,
        actorEmail: session.user.email,
        action: 'annual_plan_submitted',
        target: `plan:${planId}`,
        payload: { planRef: plan.planRef, fiscalYear: plan.fiscalYear },
      },
    });

    return NextResponse.json({ ok: true, planId: updated.id });
  } catch (error: any) {
    console.error('Error submitting plan:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to submit plan' },
      { status: 500 }
    );
  }
}
