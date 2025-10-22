/**
 * API Endpoint: Annual Plan Items Management
 * Manages individual audit items within annual plans
 *
 * @swagger
 * /api/plan/items:
 *   get:
 *     summary: Get plan items for a specific plan
 *     parameters:
 *       - in: query
 *         name: plan_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of plan items
 *   post:
 *     summary: Create or update plan items (bulk operation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 plan_id:
 *                   type: string
 *                   format: uuid
 *                 au_id:
 *                   type: string
 *                   format: uuid
 *                 type:
 *                   type: string
 *                 priority:
 *                   type: string
 *                 scope_brief:
 *                   type: string
 *                 effort_days:
 *                   type: number
 *                 team_json:
 *                   type: object
 *                 period_start:
 *                   type: string
 *                   format: date
 *                 period_end:
 *                   type: string
 *                   format: date
 *                 deliverable_type:
 *                   type: string
 *                 risk_score:
 *                   type: number
 *     responses:
 *       201:
 *         description: Plan items created
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface PlanItem {
  id?: string;
  plan_id: string;
  au_id: string;
  type?: string;
  priority?: string;
  scope_brief?: string;
  effort_days?: number;
  team_json?: any;
  period_start?: string;
  period_end?: string;
  deliverable_type?: string;
  risk_score?: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const plan_id = searchParams.get('plan_id');

    if (!plan_id) {
      return NextResponse.json({ ok: false, error: 'معرّف الخطة مطلوب' }, { status: 400 });
    }

    const query = `
      SELECT
        api.id, api.plan_id, api.au_id, api.type, api.priority,
        api.scope_brief, api.effort_days, api.team_json,
        api.period_start, api.period_end, api.deliverable_type,
        api.risk_score, api.created_at, api.updated_at,
        au.name as au_name, au.category as au_category
      FROM audit."AnnualPlanItems" api
      LEFT JOIN audit."AuditUniverse" au ON api.au_id = au.id
      WHERE api.plan_id = $1
      ORDER BY api.risk_score DESC NULLS LAST, api.priority ASC
    `;

    const items = await prisma.$queryRawUnsafe(query, plan_id);

    return NextResponse.json({
      ok: true,
      data: items,
      count: Array.isArray(items) ? items.length : 0,
    });
  } catch (error: any) {
    console.error('GET /api/plan/items error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في جلب بنود الخطة' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: PlanItem[] = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ ok: false, error: 'يجب إرسال مصفوفة من البنود' }, { status: 400 });
    }

    // Check if plan is baselined (frozen)
    const firstItem = body[0];
    const planCheck: any = await prisma.$queryRawUnsafe(
      'SELECT status FROM audit."AnnualPlans" WHERE id = $1',
      firstItem.plan_id,
    );

    if (planCheck && planCheck.length > 0) {
      const status = planCheck[0].status;
      if (status === 'baselined') {
        return NextResponse.json({ ok: false, error: 'لا يمكن تعديل خطة مجمّدة' }, { status: 403 });
      }
    }

    const created: any[] = [];

    for (const item of body) {
      // Validation
      if (!item.plan_id || !item.au_id) {
        continue; // Skip invalid items
      }

      const query = `
        INSERT INTO audit."AnnualPlanItems"
          (plan_id, au_id, type, priority, scope_brief, effort_days,
           team_json, period_start, period_end, deliverable_type, risk_score)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)
        ON CONFLICT (id) DO UPDATE SET
          type = EXCLUDED.type,
          priority = EXCLUDED.priority,
          scope_brief = EXCLUDED.scope_brief,
          effort_days = EXCLUDED.effort_days,
          team_json = EXCLUDED.team_json,
          period_start = EXCLUDED.period_start,
          period_end = EXCLUDED.period_end,
          deliverable_type = EXCLUDED.deliverable_type,
          risk_score = EXCLUDED.risk_score,
          updated_at = now()
        RETURNING id, plan_id, au_id, type, priority, effort_days, risk_score
      `;

      try {
        const result: any = await prisma.$queryRawUnsafe(
          query,
          item.plan_id,
          item.au_id,
          item.type || null,
          item.priority || null,
          item.scope_brief || null,
          item.effort_days || null,
          item.team_json ? JSON.stringify(item.team_json) : null,
          item.period_start || null,
          item.period_end || null,
          item.deliverable_type || null,
          item.risk_score || null,
        );

        const insertedItem = Array.isArray(result) ? result[0] : result;
        created.push(insertedItem);
      } catch (itemError: any) {
        console.error('Error inserting item:', itemError);
        // Continue with other items
      }
    }

    return NextResponse.json(
      {
        ok: true,
        data: created,
        count: created.length,
        message: `تم حفظ ${created.length} من ${body.length} بند`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('POST /api/plan/items error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في حفظ بنود الخطة' },
      { status: 500 },
    );
  }
}
