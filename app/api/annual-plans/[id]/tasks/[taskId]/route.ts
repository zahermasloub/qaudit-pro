/**
 * API Route: Delete or Update audit task
 * DELETE /api/annual-plans/[id]/tasks/[taskId]
 * PATCH /api/annual-plans/[id]/tasks/[taskId]
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/options';
import prisma from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;

    await prisma.auditTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to delete task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = params;
    const body = await req.json();

    const task = await prisma.auditTask.update({
      where: { id: taskId },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, task });
  } catch (error: any) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}
