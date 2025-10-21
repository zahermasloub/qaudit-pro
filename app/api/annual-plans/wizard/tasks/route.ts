/**
 * API Route: Save task for annual plan
 * POST /api/annual-plans/wizard/tasks
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
    const { planId, task, taskId } = body;

    if (!planId) {
      return NextResponse.json({ ok: false, error: 'Plan ID required' }, { status: 400 });
    }

    // Verify plan exists and belongs to user
    const plan = await prisma.annualPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ ok: false, error: 'Plan not found' }, { status: 404 });
    }

    // If taskId exists, update existing task
    if (taskId) {
      const updated = await prisma.auditTask.updateMany({
        where: {
          id: taskId,
          annualPlanId: planId,
        },
        data: {
          seqNo: task.seqNo,
          taskRef: task.taskRef,
          deptId: task.deptId || null,
          title: task.title,
          taskType: task.taskType,
          riskLevel: task.riskLevel,
          impactLevel: task.impactLevel,
          priority: task.priority,
          scheduledQuarter: task.scheduledQuarter,
          durationDays: task.durationDays,
          assignee: task.assignee || null,
          notes: task.notes || null,
          // Map to old fields for compatibility
          code: task.taskRef,
          department: task.deptId || 'N/A',
          auditType: task.taskType === 'compliance' ? 'compliance' : 'operational',
          plannedQuarter: task.scheduledQuarter === 'Q1' ? 'Q1' : task.scheduledQuarter === 'Q2' ? 'Q2' : task.scheduledQuarter === 'Q3' ? 'Q3' : 'Q4',
          estimatedHours: task.durationDays * 8, // Convert days to hours
        },
      });

      // Log audit
      await prisma.auditLog.create({
        data: {
          actorId: session.user.email,
          actorEmail: session.user.email,
          action: 'annual_plan_task_updated',
          target: `task:${taskId}`,
          payload: { planId, taskRef: task.taskRef },
        },
      });

      return NextResponse.json({ ok: true, taskId });
    }

    // Create new task
    const newTask = await prisma.auditTask.create({
      data: {
        annualPlanId: planId,
        seqNo: task.seqNo,
        taskRef: task.taskRef,
        deptId: task.deptId || null,
        title: task.title,
        taskType: task.taskType,
        riskLevel: task.riskLevel,
        impactLevel: task.impactLevel,
        priority: task.priority,
        scheduledQuarter: task.scheduledQuarter,
        durationDays: task.durationDays,
        assignee: task.assignee || null,
        notes: task.notes || null,
        // Map to old fields for compatibility
        code: task.taskRef,
        department: task.deptId || 'N/A',
        auditType: task.taskType === 'compliance' ? 'compliance' : 'operational',
        plannedQuarter: task.scheduledQuarter === 'Q1' ? 'Q1' : task.scheduledQuarter === 'Q2' ? 'Q2' : task.scheduledQuarter === 'Q3' ? 'Q3' : 'Q4',
        estimatedHours: task.durationDays * 8, // Convert days to hours
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        actorId: session.user.email,
        actorEmail: session.user.email,
        action: 'annual_plan_task_created',
        target: `task:${newTask.id}`,
        payload: { planId, taskRef: task.taskRef },
      },
    });

    return NextResponse.json({ ok: true, taskId: newTask.id });
  } catch (error: any) {
    console.error('Error saving task:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Failed to save task' },
      { status: 500 }
    );
  }
}
