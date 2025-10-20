import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan/{id}/tasks:
 *   get:
 *     summary: الحصول على مهام الخطة
 *     description: Retrieves all audit tasks for an annual plan
 *     tags:
 *       - Annual Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخطة
 *     responses:
 *       200:
 *         description: قائمة المهام
 *       404:
 *         description: الخطة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if plan exists
    const plan = await prisma.annualPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    // Get all tasks for this plan
    const tasks = await prisma.auditTask.findMany({
      where: {
        annualPlanId: id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(
      {
        plan_id: id,
        count: tasks.length,
        tasks: tasks,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'فشل جلب المهام', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/plan/{id}/tasks:
 *   post:
 *     summary: إضافة مهام للخطة السنوية
 *     description: Creates audit tasks for an annual plan
 *     tags:
 *       - Annual Plans
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: معرّف الخطة
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tasks
 *             properties:
 *               tasks:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     title:
 *                       type: string
 *                     department:
 *                       type: string
 *                     riskLevel:
 *                       type: string
 *                       enum: [very_high, high, medium, low, very_low]
 *                     auditType:
 *                       type: string
 *                       enum: [financial, operational, compliance, it, investigative]
 *                     plannedQuarter:
 *                       type: string
 *                       enum: [Q1, Q2, Q3, Q4]
 *                     estimatedHours:
 *                       type: integer
 *     responses:
 *       201:
 *         description: تم إنشاء المهام بنجاح
 *       400:
 *         description: بيانات غير صحيحة
 *       404:
 *         description: الخطة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { tasks = [] } = body;

    // Check if plan exists
    const plan = await prisma.annualPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json(
        { error: 'يجب تقديم قائمة مهام' },
        { status: 400 }
      );
    }

    // Create tasks
    const createdTasks = await Promise.all(
      tasks.map((task, index) =>
        prisma.auditTask.create({
          data: {
            annualPlanId: id,
            code: task.code || `TASK-${Date.now()}-${index}`,
            title: task.title || `مهمة ${index + 1}`,
            department: task.department || 'عام',
            riskLevel: task.riskLevel || 'medium',
            auditType: task.auditType || 'operational',
            objectiveAndScope: task.objectiveAndScope || null,
            plannedQuarter: task.plannedQuarter || 'Q1',
            estimatedHours: task.estimatedHours || 40,
            leadAuditor: task.leadAuditor || null,
            status: 'not_started',
          },
        })
      )
    );

    return NextResponse.json(
      {
        message: `تم إنشاء ${createdTasks.length} مهمة بنجاح`,
        tasks: createdTasks,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Error creating tasks:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء المهام', details: error.message },
      { status: 500 }
    );
  }
}
