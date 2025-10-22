/**
 * API Route: Get, Update, Delete annual plan by ID
 * GET /api/annual-plans/[id]
 * PATCH /api/annual-plans/[id]
 * DELETE /api/annual-plans/[id]
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/options';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Plan ID required' }, { status: 400 });
    }

    const plan = await prisma.annualPlan.findUnique({
      where: { id },
      include: {
        auditTasks: {
          orderBy: {
            code: 'asc',
          },
        },
        approvals: {
          orderBy: {
            approvalDate: 'desc',
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, plan });
  } catch (error: any) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const plan = await prisma.annualPlan.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, plan });
  } catch (error: any) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.annualPlan.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
