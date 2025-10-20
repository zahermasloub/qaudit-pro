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
    const planExists = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM audit.annualplans WHERE id = $1`,
      id
    );

    if (planExists.length === 0) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    // Try to get capacity from ResourceCapacity table
    const capacity = await prisma.$queryRawUnsafe<any[]>(
      `SELECT plan_id, total_hours, audit_hours, advisory_hours,
              training_hours, admin_hours
       FROM audit.resourcecapacity
       WHERE plan_id = $1
       LIMIT 1`,
      id
    );

    if (capacity.length > 0) {
      return NextResponse.json(capacity[0]);
    }

    // Return default values if no capacity defined
    const defaultCapacity = {
      plan_id: id,
      total_hours: 2080, // ~40 hours/week * 52 weeks
      audit_hours: 1500,
      advisory_hours: 300,
      training_hours: 180,
      admin_hours: 100,
    };

    return NextResponse.json(defaultCapacity);
  } catch (error: any) {
    console.error('❌ Error fetching capacity:', error);
    return NextResponse.json(
      { error: 'فشل جلب بيانات السعة', details: error.message },
      { status: 500 }
    );
  }
}
