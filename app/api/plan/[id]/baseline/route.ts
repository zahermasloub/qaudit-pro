/**
 * API Endpoint: Baseline Plan
 * Creates immutable snapshot of approved plan and freezes it
 *
 * @swagger
 * /api/plan/{id}/baseline:
 *   post:
 *     summary: Create baseline snapshot of plan
 *     description: Collects all plan items into JSONB snapshot, generates SHA256 hash, and freezes the plan
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
 *               created_by:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Baseline created successfully
 *       403:
 *         description: Plan not approved or already baselined
 *       404:
 *         description: Plan not found
 */

import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { created_by } = body;

    // Check if plan exists and is approved
    const planCheck: any = await prisma.$queryRawUnsafe(
      'SELECT id, year, status FROM audit."AnnualPlans" WHERE id = $1',
      id,
    );

    if (!planCheck || planCheck.length === 0) {
      return NextResponse.json({ ok: false, error: 'الخطة غير موجودة' }, { status: 404 });
    }

    const plan = planCheck[0];
    const currentStatus = plan.status;

    if (currentStatus === 'baselined') {
      return NextResponse.json({ ok: false, error: 'الخطة مجمّدة مسبقاً' }, { status: 403 });
    }

    if (currentStatus !== 'approved') {
      return NextResponse.json(
        { ok: false, error: 'يجب اعتماد الخطة أولاً قبل التجميد' },
        { status: 403 },
      );
    }

    // Check if another baselined plan exists for the same year
    const existingBaseline: any = await prisma.$queryRawUnsafe(
      `SELECT id FROM audit."AnnualPlans"
       WHERE year = $1 AND status = 'baselined' AND id != $2`,
      plan.year,
      id,
    );

    if (existingBaseline && existingBaseline.length > 0) {
      return NextResponse.json(
        { ok: false, error: `يوجد خطة مجمّدة أخرى لنفس السنة (${plan.year})` },
        { status: 409 },
      );
    }

    // Collect all plan items with AU details
    const items: any = await prisma.$queryRawUnsafe(
      `SELECT
        api.id, api.plan_id, api.au_id, api.type, api.priority,
        api.scope_brief, api.effort_days, api.team_json,
        api.period_start, api.period_end, api.deliverable_type,
        api.risk_score,
        au.name as au_name, au.category as au_category
       FROM audit."AnnualPlanItems" api
       LEFT JOIN audit."AuditUniverse" au ON api.au_id = au.id
       WHERE api.plan_id = $1
       ORDER BY api.risk_score DESC NULLS LAST`,
      id,
    );

    // Create snapshot
    const snapshot = {
      plan_id: id,
      year: plan.year,
      items: items || [],
      created_at: new Date().toISOString(),
      item_count: Array.isArray(items) ? items.length : 0,
    };

    // Generate SHA256 hash
    const snapshotString = JSON.stringify(snapshot, null, 0);
    const hash = createHash('sha256').update(snapshotString).digest('hex');

    // Insert baseline
    await prisma.$queryRawUnsafe(
      `INSERT INTO audit."PlanBaselines"
        (plan_id, snapshot, hash, created_by)
       VALUES ($1, $2::jsonb, $3, $4)`,
      id,
      snapshotString,
      hash,
      created_by || null,
    );

    // Update plan status to baselined
    await prisma.$queryRawUnsafe(
      `UPDATE audit."AnnualPlans"
       SET
         status = 'baselined',
         baseline_hash = $2,
         baseline_date = now(),
         baseline_by = $3,
         updated_at = now()
       WHERE id = $1`,
      id,
      hash,
      created_by || null,
    );

    // Log baseline action
    await prisma.$queryRawUnsafe(
      `INSERT INTO audit."PlanApprovals"
        (plan_id, actor, role, action, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      id,
      created_by || null,
      'admin',
      'baseline',
      `تم تجميد الخطة - Hash: ${hash.substring(0, 8)}...`,
    );

    return NextResponse.json({
      ok: true,
      message: 'تم تجميد الخطة بنجاح',
      status: 'baselined',
      hash,
      item_count: snapshot.item_count,
      baseline_date: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('POST /api/plan/[id]/baseline error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في تجميد الخطة' },
      { status: 500 },
    );
  }
}
