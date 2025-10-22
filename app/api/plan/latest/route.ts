import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan/latest:
 *   get:
 *     summary: الحصول على أحدث خطة سنوية
 *     description: Returns the most recent annual plan ordered by fiscal year
 *     tags:
 *       - Annual Plans
 *     responses:
 *       200:
 *         description: Latest plan returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 fiscalYear:
 *                   type: number
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *       404:
 *         description: No plans found
 *       500:
 *         description: خطأ في الخادم
 */
export async function GET() {
  try {
    const latestPlan = await prisma.annualPlan.findFirst({
      orderBy: [{ fiscalYear: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        title: true,
        fiscalYear: true,
        version: true,
        status: true,
        createdAt: true,
      },
    });

    if (!latestPlan) {
      return NextResponse.json({ error: 'لا توجد خطط سنوية' }, { status: 404 });
    }

    return NextResponse.json(latestPlan, { status: 200 });
  } catch (error) {
    console.error('خطأ في GET /api/plan/latest:', error);
    return NextResponse.json({ error: 'خطأ في جلب أحدث خطة' }, { status: 500 });
  }
}
