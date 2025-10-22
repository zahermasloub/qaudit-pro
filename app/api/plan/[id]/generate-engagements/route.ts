/**
 * API Endpoint: Generate Engagements from Baselined Plan
 * Creates Engagement records and default PBC requests from plan items
 *
 * @swagger
 * /api/plan/{id}/generate-engagements:
 *   post:
 *     summary: Generate engagements and PBC requests from baselined plan
 *     description: Creates an engagement for each plan item with default PBC requests based on audit type
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Engagements generated successfully
 *       403:
 *         description: Plan not baselined
 *       404:
 *         description: Plan not found
 *       409:
 *         description: Engagements already generated
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Default PBC templates by audit type
const DEFAULT_PBC_TEMPLATES: Record<string, string[]> = {
  Procurement: [
    'قائمة بجميع عمليات الشراء خلال الفترة',
    'نسخ من عقود الموردين الرئيسيين',
    'سجلات الموافقات على طلبات الشراء',
    'تقارير تقييم الموردين',
    'مستندات المناقصات والعروض',
  ],
  Payroll: [
    'كشوفات الرواتب للفترة المحددة',
    'سجلات الحضور والانصراف',
    'عقود الموظفين والملحقات',
    'مستندات الخصومات والبدلات',
    'تقارير نهاية الخدمة',
  ],
  Privacy: [
    'سياسات حماية البيانات الشخصية',
    'سجل معالجة البيانات الشخصية',
    'اتفاقيات السرية مع الأطراف الثالثة',
    'سجل طلبات الوصول إلى البيانات',
    'تقارير الحوادث الأمنية',
  ],
  Financial: [
    'القوائم المالية للفترة',
    'دفاتر الأستاذ العام',
    'مطابقات البنك',
    'سجلات الأصول الثابتة',
    'تقارير المراجعة الداخلية السابقة',
  ],
  IT: [
    'سياسات أمن المعلومات',
    'سجلات الوصول إلى الأنظمة',
    'خطط النسخ الاحتياطي والاستعادة',
    'تقارير الحوادث الأمنية',
    'مستندات إدارة التغيير',
  ],
  default: [
    'المستندات الأساسية المتعلقة بالمهمة',
    'السياسات والإجراءات المعتمدة',
    'التقارير الدورية للفترة المحددة',
  ],
};

function getPBCTemplate(auditType: string): string[] {
  const normalizedType = auditType || 'default';
  return DEFAULT_PBC_TEMPLATES[normalizedType] || DEFAULT_PBC_TEMPLATES.default;
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if plan exists and is baselined
    const planCheck: any = await prisma.$queryRawUnsafe(
      'SELECT id, year, status FROM audit."AnnualPlans" WHERE id = $1',
      id,
    );

    if (!planCheck || planCheck.length === 0) {
      return NextResponse.json({ ok: false, error: 'الخطة غير موجودة' }, { status: 404 });
    }

    const plan = planCheck[0];

    if (plan.status !== 'baselined') {
      return NextResponse.json(
        { ok: false, error: 'يجب تجميد الخطة أولاً قبل توليد المهام' },
        { status: 403 },
      );
    }

    // Get all plan items
    const items: any = await prisma.$queryRawUnsafe(
      `SELECT
        api.id, api.au_id, api.type, api.priority, api.effort_days,
        api.period_start, api.period_end, api.risk_score,
        au.name as au_name, au.category as au_category
       FROM audit."AnnualPlanItems" api
       LEFT JOIN audit."AuditUniverse" au ON api.au_id = au.id
       WHERE api.plan_id = $1
       ORDER BY api.risk_score DESC NULLS LAST`,
      id,
    );

    if (!items || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'لا توجد بنود في الخطة' }, { status: 400 });
    }

    // Check if engagements already exist for this plan
    // We'll use a custom field or check by title pattern
    const existingCount = await prisma.engagement.count({
      where: {
        title: {
          contains: `السنة ${plan.year}`,
        },
      },
    });

    if (existingCount > 0) {
      return NextResponse.json(
        { ok: false, error: 'تم توليد المهام مسبقاً لهذه الخطة' },
        { status: 409 },
      );
    }

    const createdEngagements: string[] = [];
    let totalPBCCreated = 0;

    // Create engagements for each plan item
    for (const item of items) {
      const engagementTitle = `${item.au_name} - السنة ${plan.year} - ${item.type || 'مراجعة'}`;
      const engagementCode = `ENG-${plan.year}-${item.au_name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

      // Create engagement
      const engagement = await prisma.engagement.create({
        data: {
          code: engagementCode,
          title: engagementTitle,
          objective: `مراجعة ${item.au_name} وفقاً للخطة السنوية ${plan.year}`,
          scopeJson: {
            category: item.au_category || 'عام',
            auditType: item.type || 'compliance',
            riskScore: item.risk_score || 0,
          },
          criteriaJson: {
            standards: ['ISO 9001', 'معايير المراجعة الداخلية'],
            regulations: [],
          },
          constraintsJson: {
            budgetHours: item.effort_days ? item.effort_days * 8 : 40,
            priority: item.priority || 'medium',
          },
          auditeeUnitsJson: {
            units: [item.au_name],
          },
          stakeholdersJson: {
            stakeholders: [],
          },
          startDate: item.period_start ? new Date(item.period_start) : new Date(),
          endDate: item.period_end
            ? new Date(item.period_end)
            : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          budgetHours: item.effort_days ? Math.round(item.effort_days * 8) : 40,
          status: 'DRAFT',
          createdBy: 'system',
        },
      });

      createdEngagements.push(engagement.id);

      // Create default PBC requests
      const pbcTemplate = getPBCTemplate(item.type || 'default');

      for (let i = 0; i < pbcTemplate.length; i++) {
        const pbcDescription = pbcTemplate[i];
        const pbcCode = `PBC-${engagementCode}-${String(i + 1).padStart(3, '0')}`;

        await prisma.pBCRequest.create({
          data: {
            engagementId: engagement.id,
            code: pbcCode,
            description: pbcDescription,
            ownerId: 'system',
            dueDate: item.period_end
              ? new Date(item.period_end)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'open',
            attachmentsJson: {},
            notes: `تم التوليد تلقائياً من الخطة السنوية ${plan.year}`,
          },
        });

        totalPBCCreated++;
      }
    }

    return NextResponse.json({
      ok: true,
      message: `تم توليد ${createdEngagements.length} مهمة مع ${totalPBCCreated} طلب PBC بنجاح`,
      created_count: createdEngagements.length,
      pbc_count: totalPBCCreated,
      engagement_ids: createdEngagements,
    });
  } catch (error: any) {
    console.error('POST /api/plan/[id]/generate-engagements error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في توليد المهام' },
      { status: 500 },
    );
  }
}
