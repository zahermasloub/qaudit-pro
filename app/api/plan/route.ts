import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan:
 *   post:
 *     summary: إنشاء خطة سنوية جديدة
 *     description: Creates a new annual audit plan with draft status
 *     tags:
 *       - Annual Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *                 description: السنة المالية
 *                 example: 2025
 *               version:
 *                 type: string
 *                 description: رقم النسخة (افتراضي v1)
 *                 example: "v1"
 *               owner_id:
 *                 type: string
 *                 description: معرّف المالك
 *                 example: "user-123"
 *     responses:
 *       201:
 *         description: تم إنشاء الخطة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 year:
 *                   type: integer
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       400:
 *         description: بيانات غير صحيحة
 *       500:
 *         description: خطأ في الخادم
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      year,
      version = '1.0',
      owner_id,
      title,
      plan_ref,
      prepared_date,
      approved_by,
      prepared_by,
      standards,
      methodology,
      objectives,
      risk_sources = [],
    } = body;

    // Validation
    if (!year || typeof year !== 'number') {
      return NextResponse.json({ error: 'السنة مطلوبة ويجب أن تكون رقماً' }, { status: 400 });
    }

    // Validate plan_ref if provided
    if (plan_ref) {
      const existingRef = await prisma.annualPlan.findUnique({
        where: { planRef: plan_ref },
      });
      if (existingRef) {
        return NextResponse.json(
          { error: `الرقم المرجعي ${plan_ref} مستخدم بالفعل` },
          { status: 400 },
        );
      }
    }

    // Generate plan_ref if not provided
    const generatedPlanRef = plan_ref || `ADP-${year}-${Date.now().toString(36)}`;

    // Create plan using Prisma
    const plan = await prisma.annualPlan.create({
      data: {
        title: title || `خطة التدقيق السنوية ${year}`,
        fiscalYear: year,
        version: version,
        status: 'draft',
        createdBy: owner_id || 'system',
        planRef: generatedPlanRef,
        preparedDate: prepared_date ? new Date(prepared_date) : new Date(),
        approvedBy: approved_by,
        preparedByName: prepared_by,
        standards,
        methodology,
        objectives,
        riskSources: risk_sources,
      },
    });

    // Return with API-friendly field names
    return NextResponse.json(
      {
        id: plan.id,
        plan_ref: plan.planRef,
        year: plan.fiscalYear,
        version: plan.version,
        status: plan.status,
        title: plan.title,
        owner_id: plan.createdBy,
        prepared_date: plan.preparedDate,
        approved_by: plan.approvedBy,
        prepared_by: plan.preparedByName,
        standards: plan.standards,
        methodology: plan.methodology,
        objectives: plan.objectives,
        risk_sources: plan.riskSources,
        created_at: plan.createdAt,
        updated_at: plan.updatedAt,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('❌ Error creating plan:', error);
    return NextResponse.json({ error: 'فشل إنشاء الخطة', details: error.message }, { status: 500 });
  }
}
