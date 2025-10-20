import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

const authOptions = {
  providers: [],
};

/**
 * GET /api/admin/kpis
 * جلب مؤشرات الأداء الرئيسية من قاعدة البيانات
 */
export async function GET(request: NextRequest) {
  try {
    // تحقق من المصادقة
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // تحقق من صلاحيات الأدمن
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user || user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // جلب إحصائيات عامة
    const [
      usersCount,
      rolesCount,
      settingsCount,
      recentLogsCount,
    ] = await Promise.all([
      // إجمالي المستخدمين
      prisma.user.count(),

      // إجمالي الأدوار
      prisma.role.count(),

      // إجمالي الإعدادات
      prisma.systemSetting.count(),

      // السجلات في آخر 24 ساعة
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // جلب بيانات من mv_org_kpis
    const orgKpis = await prisma.$queryRaw<Array<{
      org_id: number;
      engagements_total: bigint;
      findings_total: bigint;
      recs_total: bigint;
      actions_total: bigint;
      recs_open: bigint;
      recs_wip: bigint;
      recs_closed: bigint;
    }>>`
      SELECT * FROM core.mv_org_kpis
      ORDER BY org_id
      LIMIT 1
    `;

    // حساب إجمالي التوصيات
    const totalRecs = orgKpis.length > 0
      ? Number(orgKpis[0].recs_total)
      : 0;

    const openRecs = orgKpis.length > 0
      ? Number(orgKpis[0].recs_open)
      : 0;

    // حساب نسبة الإنجاز
    const completionRate = totalRecs > 0
      ? Math.round(((totalRecs - openRecs) / totalRecs) * 100)
      : 0;

    // جلب آخر السجلات
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    console.log('🔍 Recent Logs Count:', recentLogs.length);
    console.log('🔍 Recent Logs Data:', recentLogs.map(l => ({ id: l.id, action: l.action })));

    // جلب اتجاهات الشهر الحالي (للرسم البياني)
    const currentMonth = new Date();
    currentMonth.setDate(currentMonth.getDate() - 30); // آخر 30 يوماً بدلاً من الشهر الحالي
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyLogs = await prisma.$queryRaw<Array<{
      day: Date;
      count: bigint;
    }>>`
      SELECT
        DATE_TRUNC('day', "createdAt") as day,
        COUNT(*) as count
      FROM public.audit_logs
      WHERE "createdAt" >= ${currentMonth}
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY day
    `;

    console.log('📊 Monthly Logs Count:', monthlyLogs.length);
    console.log('📊 Monthly Logs Data:', monthlyLogs);

    const responseData = {
      summary: {
        users: {
          value: usersCount,
          label: 'المستخدمون',
          change: 0, // يمكن حسابه بمقارنة مع الشهر الماضي
          trend: 'neutral' as const,
        },
        roles: {
          value: rolesCount,
          label: 'الأدوار',
          change: 0,
          trend: 'neutral' as const,
        },
        completionRate: {
          value: completionRate,
          label: 'نسبة الإنجاز',
          change: 0,
          trend: 'neutral' as const,
        },
        recentLogs: {
          value: recentLogsCount,
          label: 'آخر 24 ساعة',
          change: 0,
          trend: 'neutral' as const,
        },
      },
      orgKpis: orgKpis.length > 0 ? {
        engagements: Number(orgKpis[0].engagements_total),
        findings: Number(orgKpis[0].findings_total),
        recommendations: {
          total: Number(orgKpis[0].recs_total),
          open: Number(orgKpis[0].recs_open),
          inProgress: Number(orgKpis[0].recs_wip),
          closed: Number(orgKpis[0].recs_closed),
        },
        actions: Number(orgKpis[0].actions_total),
      } : null,
      recentLogs: recentLogs.map((log: any) => ({
        id: log.id,
        action: log.action,
        actorEmail: log.actorEmail || 'Unknown',
        createdAt: log.createdAt,
        target: log.target,
      })),
      trends: {
        dailyActivity: monthlyLogs.map(item => ({
          label: new Date(item.day).toLocaleDateString('ar-EG', {
            day: 'numeric',
            month: 'short'
          }),
          value: Number(item.count),
        })),
      },
    };

    console.log('✅ API Response Summary:', {
      usersCount,
      rolesCount,
      recentLogsLength: responseData.recentLogs.length,
      dailyActivityLength: responseData.trends.dailyActivity.length,
    });

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
