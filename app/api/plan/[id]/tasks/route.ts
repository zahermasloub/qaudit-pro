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
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if plan exists
    const plan = await prisma.annualPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
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
      { status: 200 },
    );
  } catch (error: any) {
    console.error('❌ Error fetching tasks:', error);
    return NextResponse.json({ error: 'فشل جلب المهام', details: error.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/plan/{id}/tasks:
 *   post:
 *     summary: إضافة مهام للخطة السنوية
 *     description: Creates audit tasks for an annual plan with RBIA fields
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
 *                   required:
 *                     - seqNo
 *                     - taskRef
 *                     - title
 *                   properties:
 *                     seqNo:
 *                       type: integer
 *                       description: الرقم التسلسلي
 *                     taskRef:
 *                       type: string
 *                       description: الرقم المرجعي للمهمة
 *                     deptId:
 *                       type: string
 *                       description: الإدارة / القسم
 *                     title:
 *                       type: string
 *                       description: اسم المهمة
 *                     taskType:
 *                       type: string
 *                       description: نوع المهمة
 *                     riskLevel:
 *                       type: string
 *                       enum: [critical, high, medium, low]
 *                       description: درجة الخطورة
 *                     impactLevel:
 *                       type: string
 *                       enum: [critical, high, medium, low]
 *                       description: تقييم الأثر
 *                     priority:
 *                       type: string
 *                       enum: [urgent, high, medium, low]
 *                       description: أولوية التنفيذ
 *                     scheduledQuarter:
 *                       type: string
 *                       enum: [Q1, Q2, Q3, Q4]
 *                       description: توقيت التنفيذ
 *                     durationDays:
 *                       type: integer
 *                       description: المدة بالأيام
 *                     assignee:
 *                       type: string
 *                       description: المدقق المسؤول
 *                     notes:
 *                       type: string
 *                       description: تعليقات إضافية
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
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { tasks = [] } = body;

    // Check if plan exists
    const plan = await prisma.annualPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return NextResponse.json({ error: 'يجب تقديم قائمة مهام' }, { status: 400 });
    }

    // Create tasks with new RBIA fields
    const createdTasks = await Promise.all(
      tasks.map((task, index) => {
        // Map old fields to maintain backward compatibility
        const code = task.code || task.taskRef || `TASK-${Date.now()}-${index}`;
        const department = task.department || task.deptId || 'عام';
        const auditType = task.auditType || task.taskType || 'compliance';
        const plannedQuarter = task.plannedQuarter || task.scheduledQuarter || 'Q1';
        const estimatedHours =
          task.estimatedHours || (task.durationDays ? task.durationDays * 8 : 40);
        const leadAuditor = task.leadAuditor || task.assignee || null;
        const objectiveAndScope = task.objectiveAndScope || task.notes || null;

        // Map risk level
        let riskLevel = task.riskLevel || 'medium';
        if (riskLevel === 'critical') riskLevel = 'very_high';
        if (!['very_high', 'high', 'medium', 'low', 'very_low'].includes(riskLevel)) {
          riskLevel = 'medium';
        }

        // Validate auditType
        let validAuditType = auditType;
        if (
          !['financial', 'operational', 'compliance', 'it', 'investigative'].includes(auditType)
        ) {
          validAuditType = 'compliance';
        }

        return prisma.auditTask.create({
          data: {
            annualPlanId: id,
            // Old fields (maintained for compatibility)
            code,
            title: task.title || `مهمة ${index + 1}`,
            department,
            riskLevel: riskLevel as any,
            auditType: validAuditType as any,
            objectiveAndScope,
            plannedQuarter: plannedQuarter as any,
            estimatedHours,
            leadAuditor,
            attachmentsJson: {},
            status: 'not_started',
            // New RBIA fields
            seqNo: task.seqNo || index + 1,
            taskRef: task.taskRef || code,
            deptId: task.deptId || department,
            taskType: task.taskType || validAuditType,
            impactLevel: task.impactLevel || 'medium',
            priority: task.priority || 'medium',
            scheduledQuarter: task.scheduledQuarter || plannedQuarter,
            durationDays: task.durationDays || 20,
            assignee: task.assignee || leadAuditor || '',
            notes: task.notes || objectiveAndScope || '',
          },
        });
      }),
    );

    return NextResponse.json(
      {
        message: `تم إنشاء ${createdTasks.length} مهمة بنجاح`,
        tasks: createdTasks,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ Error creating tasks:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء المهام', details: error.message },
      { status: 500 },
    );
  }
}
