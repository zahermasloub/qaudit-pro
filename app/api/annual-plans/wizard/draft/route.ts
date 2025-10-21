/**
 * API Route: Save annual plan as draft
 * POST /api/annual-plans/wizard/draft
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
    const { planId, planRef, fiscalYear, preparedDate, approvedBy, preparedByName, standards, methodology, objectives, riskSources, tasks } = body;

    // If planId exists, update existing draft
    if (planId) {
      const updated = await prisma.annualPlan.update({
        where: { id: planId },
        data: {
          planRef,
          fiscalYear,
          preparedDate: preparedDate ? new Date(preparedDate) : null,
          approvedBy: approvedBy || null,
          preparedByName: preparedByName || null,
          standards: standards || null,
          methodology: methodology || null,
          objectives: objectives || null,
          riskSources: riskSources || [],
          updatedAt: new Date(),
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: session.user.email,
          actorEmail: session.user.email,
          action: 'annual_plan_draft_updated',
          target: `plan:${planId}`,
          payload: { planRef, fiscalYear },
        },
      });

      return NextResponse.json({ ok: true, planId: updated.id });
    }

    // Create new draft
    const plan = await prisma.annualPlan.create({
      data: {
        planRef,
        fiscalYear,
        preparedDate: preparedDate ? new Date(preparedDate) : null,
        approvedBy: approvedBy || null,
        preparedByName: preparedByName || null,
        standards: standards || null,
        methodology: methodology || null,
        objectives: objectives || null,
        riskSources: riskSources || [],
        status: 'draft',
        title: `خطة ${fiscalYear} - ${planRef}`,
        version: '1.0',
        createdBy: session.user.email || 'unknown',
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: session.user.email,
        actorEmail: session.user.email,
        action: 'annual_plan_draft_created',
        target: `plan:${plan.id}`,
        payload: { planRef, fiscalYear },
      },
    });

    return NextResponse.json({ ok: true, planId: plan.id });
  } catch (error: any) {
    console.error('Error saving draft:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save draft' },
      { status: 500 }
    );
  }
}
