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
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const plan = await prisma.annualPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
    }

    // Return with API-friendly field names
    return NextResponse.json({
      id: plan.id,
      year: plan.fiscalYear,
      version: plan.version,
      status: plan.status,
      title: plan.title,
      owner_id: plan.createdBy,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    });
  } catch (error: any) {
    console.error('❌ Error fetching plan:', error);
    return NextResponse.json({ error: 'فشل جلب الخطة', details: error.message }, { status: 500 });
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
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { owner_id, version } = body;

    // Check if plan exists and get status
    const existing = await prisma.annualPlan.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'الخطة غير موجودة' }, { status: 404 });
    }

    // Check if baselined (status is approved or completed)
    if (existing.status === 'approved' || existing.status === 'completed') {
      return NextResponse.json({ error: 'لا يمكن تعديل خطة معتمدة أو مكتملة' }, { status: 403 });
    }

    // Build update data
    const updateData: any = {};

    if (owner_id !== undefined) {
      updateData.createdBy = owner_id;
    }

    if (version !== undefined) {
      updateData.version = version;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'لا توجد بيانات للتحديث' }, { status: 400 });
    }

    // Update plan
    const plan = await prisma.annualPlan.update({
      where: { id },
      data: updateData,
    });

    // Return with API-friendly field names
    return NextResponse.json({
      id: plan.id,
      year: plan.fiscalYear,
      version: plan.version,
      status: plan.status,
      title: plan.title,
      owner_id: plan.createdBy,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt,
    });
  } catch (error: any) {
    console.error('❌ Error updating plan:', error);
    return NextResponse.json({ error: 'فشل تحديث الخطة', details: error.message }, { status: 500 });
  }
}
