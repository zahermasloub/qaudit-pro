/**
 * API Endpoint: Submit Plan for Review
 * Changes plan status to 'under_review' and logs approval action
 *
 * @swagger
 * /api/plan/{id}/submit-review:
 *   post:
 *     summary: Submit plan for review
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actor:
 *                 type: string
 *                 format: uuid
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plan submitted for review
 *       404:
 *         description: Plan not found
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { actor, comment } = body;

    // Check if plan exists
    const planCheck: any = await prisma.$queryRawUnsafe(
      'SELECT id, status FROM audit."AnnualPlans" WHERE id = $1',
      id,
    );

    if (!planCheck || planCheck.length === 0) {
      return NextResponse.json({ ok: false, error: 'الخطة غير موجودة' }, { status: 404 });
    }

    const currentStatus = planCheck[0].status;

    if (currentStatus === 'baselined') {
      return NextResponse.json({ ok: false, error: 'لا يمكن تعديل خطة مجمّدة' }, { status: 403 });
    }

    // Update plan status
    await prisma.$queryRawUnsafe(
      `UPDATE audit."AnnualPlans"
       SET status = 'under_review', updated_at = now()
       WHERE id = $1`,
      id,
    );

    // Log approval action
    await prisma.$queryRawUnsafe(
      `INSERT INTO audit."PlanApprovals"
        (plan_id, actor, role, action, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      id,
      actor || null,
      'submitter',
      'submit',
      comment || 'تم إرسال الخطة للمراجعة',
    );

    return NextResponse.json({
      ok: true,
      message: 'تم إرسال الخطة للمراجعة بنجاح',
      status: 'under_review',
    });
  } catch (error: any) {
    console.error('POST /api/plan/[id]/submit-review error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في إرسال الخطة للمراجعة' },
      { status: 500 },
    );
  }
}
