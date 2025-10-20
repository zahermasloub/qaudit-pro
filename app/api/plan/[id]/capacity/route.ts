import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan/{id}/capacity:
 *   get:
 *     summary: الحصول على السعة المتاحة للخطة
 *     description: Returns resource capacity for the plan or default values
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
 *         description: بيانات السعة
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan_id:
 *                   type: string
 *                 total_hours:
 *                   type: integer
 *                 audit_hours:
 *                   type: integer
 *                 advisory_hours:
 *                   type: integer
 *                 training_hours:
 *                   type: integer
 *                 admin_hours:
 *                   type: integer
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
      select: {
        id: true,
        totalAvailableHours: true,
        plannedTaskHours: true,
        advisoryHours: true,
        trainingHours: true,
        administrativeHours: true,
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    // Return capacity from plan or default values
    const capacity = {
      plan_id: id,
      total_hours: plan.totalAvailableHours || 2080, // ~40 hours/week * 52 weeks
      audit_hours: plan.plannedTaskHours || 1500,
      advisory_hours: plan.advisoryHours || 300,
      training_hours: plan.trainingHours || 180,
      admin_hours: plan.administrativeHours || 100,
    };

    return NextResponse.json(capacity);
  } catch (error: any) {
    console.error('❌ Error fetching capacity:', error);
    return NextResponse.json(
      { error: 'فشل جلب بيانات السعة', details: error.message },
      { status: 500 }
    );
  }
}
