/**
 * API Endpoint: Approve Plan
 * Changes plan status to 'approved' and logs approval action
 *
 * @swagger
 * /api/plan/{id}/approve:
 *   post:
 *     summary: Approve plan
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
 *         description: Plan approved
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
       SET status = 'approved', updated_at = now()
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
      'approver',
      'approve',
      comment || 'تم اعتماد الخطة',
    );

    return NextResponse.json({
      ok: true,
      message: 'تم اعتماد الخطة بنجاح',
      status: 'approved',
    });
  } catch (error: any) {
    console.error('POST /api/plan/[id]/approve error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في اعتماد الخطة' },
      { status: 500 },
    );
  }
}
