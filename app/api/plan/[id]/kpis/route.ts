import { NextRequest, NextResponse } from 'next/server';
import { getPlanKpis } from '@/lib/plan-metrics';

/**
 * @swagger
 * /api/plan/{id}/kpis:
 *   get:
 *     summary: الحصول على مؤشرات الأداء للخطة
 *     description: Returns KPI metrics (completion %, total hours, task count, status) for an annual plan
 *     tags:
 *       - Annual Plans
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Plan ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPI metrics returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 completionPct:
 *                   type: number
 *                   description: Completion percentage (0-100)
 *                 totalHours:
 *                   type: number
 *                   description: Total estimated hours
 *                 itemsCount:
 *                   type: number
 *                   description: Number of tasks
 *                 status:
 *                   type: string
 *                   description: Overall plan status
 *       404:
 *         description: Plan not found
 *       500:
 *         description: خطأ في الخادم
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'معرّف الخطة مطلوب' }, { status: 400 });
    }

    const kpis = await getPlanKpis(id);

    return NextResponse.json(kpis, { status: 200 });
  } catch (error) {
    console.error('خطأ في GET /api/plan/[id]/kpis:', error);
    return NextResponse.json({ error: 'خطأ في جلب مؤشرات الأداء' }, { status: 500 });
  }
}
