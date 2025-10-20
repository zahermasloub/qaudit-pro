import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan/{id}:
 *   get:
 *     summary: الحصول على تفاصيل خطة سنوية
 *     description: Retrieves details of a specific annual plan
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
 *         description: تفاصيل الخطة
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

    const result = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, fiscal_year as year, version, status, owner_id,
              created_at, updated_at
       FROM audit.annualplans
       WHERE id = $1`,
      id
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('❌ Error fetching plan:', error);
    return NextResponse.json(
      { error: 'فشل جلب الخطة', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/plan/{id}:
 *   put:
 *     summary: تحديث خطة سنوية
 *     description: Updates an annual plan (forbidden if status is 'baselined')
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
 *             properties:
 *               owner_id:
 *                 type: string
 *                 description: معرّف المالك
 *               version:
 *                 type: string
 *                 description: رقم النسخة
 *     responses:
 *       200:
 *         description: تم التحديث بنجاح
 *       403:
 *         description: ممنوع - الخطة محفوظة كـ baseline
 *       404:
 *         description: الخطة غير موجودة
 *       500:
 *         description: خطأ في الخادم
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { owner_id, version } = body;

    // Check if plan exists and get status
    const existing = await prisma.$queryRawUnsafe<any[]>(
      `SELECT status FROM audit.annualplans WHERE id = $1`,
      id
    );

    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'الخطة غير موجودة' },
        { status: 404 }
      );
    }

    // Check if baselined
    if (existing[0].status === 'baselined') {
      return NextResponse.json(
        { error: 'لا يمكن تعديل خطة محفوظة كـ baseline' },
        { status: 403 }
      );
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (owner_id !== undefined) {
      updates.push(`owner_id = $${paramIndex++}`);
      values.push(owner_id);
    }

    if (version !== undefined) {
      updates.push(`version = $${paramIndex++}`);
      values.push(version);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'لا توجد بيانات للتحديث' },
        { status: 400 }
      );
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE audit.annualplans
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, fiscal_year as year, version, status, owner_id, created_at, updated_at
    `;

    const result = await prisma.$queryRawUnsafe<any[]>(query, ...values);

    return NextResponse.json(result[0]);
  } catch (error: any) {
    console.error('❌ Error updating plan:', error);
    return NextResponse.json(
      { error: 'فشل تحديث الخطة', details: error.message },
      { status: 500 }
    );
  }
}
