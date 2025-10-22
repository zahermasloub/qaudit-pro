'use client';

import { useEffect, useState } from 'react';

/**
 * PlanKpis interface matching the API response
 */
interface PlanKpis {
  completionPct: number;
  totalHours: number;
  itemsCount: number;
  status: string;
}

/**
 * KpiCards Component
 *
 * Displays 4 KPI cards for annual plan metrics:
 * - Completion Percentage
 * - Total Hours
 * - Number of Tasks
 * - Plan Status
 *
 * @param planId - UUID of the annual plan to display metrics for
 *
 * @example
 * ```tsx
 * <KpiCards planId="550e8400-e29b-41d4-a716-446655440000" />
 * ```
 */
export default function KpiCards({ planId }: { planId?: string }) {
  const [kpis, setKpis] = useState<PlanKpis>({
    completionPct: 0,
    totalHours: 0,
    itemsCount: 0,
    status: 'draft',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchKpis() {
      try {
        setLoading(true);
        setError(null);

        // If no planId provided, get the latest plan
        let targetPlanId = planId;
        if (!targetPlanId) {
          const plansResponse = await fetch('/api/plan/latest');
          if (plansResponse.ok) {
            const latestPlan = await plansResponse.json();
            targetPlanId = latestPlan.id;
          } else {
            // No plans available
            setLoading(false);
            return;
          }
        }

        const response = await fetch(`/api/plan/${targetPlanId}/kpis`);

        if (!response.ok) {
          throw new Error('فشل في تحميل البيانات');
        }

        const data = await response.json();
        setKpis(data);
      } catch (err) {
        console.error('خطأ في جلب KPIs:', err);
        setError('فشل في تحميل مؤشرات الأداء');
      } finally {
        setLoading(false);
      }
    }

    fetchKpis();
  }, [planId]);

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'nearly_complete':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Status text mapping
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'مكتملة';
      case 'nearly_complete':
        return 'شبه مكتملة';
      case 'in_progress':
        return 'قيد التنفيذ';
      case 'draft':
      default:
        return 'مسودة';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" dir="rtl">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white border rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-red-800" dir="rtl">
        {error}
      </div>
    );
  }

  if (!planId) {
    return (
      <div
        className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-blue-800"
        dir="rtl"
      >
        جارٍ تحميل أحدث خطة سنوية...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" dir="rtl">
      {/* Card 1: Completion Percentage */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-slate-500 text-xs mb-1 font-medium">نسبة الإنجاز</div>
        <div className="flex items-baseline gap-2">
          <div className="text-slate-900 text-3xl font-bold">{kpis.completionPct}</div>
          <div className="text-slate-600 text-lg">%</div>
        </div>
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${kpis.completionPct}%` }}
          ></div>
        </div>
      </div>

      {/* Card 2: Total Hours */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-slate-500 text-xs mb-1 font-medium">إجمالي الساعات</div>
        <div className="flex items-baseline gap-2">
          <div className="text-slate-900 text-3xl font-bold">
            {kpis.totalHours.toLocaleString('ar-SA')}
          </div>
          <div className="text-slate-600 text-sm">ساعة</div>
        </div>
        <div className="mt-2 text-xs text-slate-500">الساعات المقدرة للمهام</div>
      </div>

      {/* Card 3: Number of Tasks */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-slate-500 text-xs mb-1 font-medium">عدد المهام</div>
        <div className="flex items-baseline gap-2">
          <div className="text-slate-900 text-3xl font-bold">
            {kpis.itemsCount.toLocaleString('ar-SA')}
          </div>
          <div className="text-slate-600 text-sm">مهمة</div>
        </div>
        <div className="mt-2 text-xs text-slate-500">إجمالي مهام الخطة</div>
      </div>

      {/* Card 4: Plan Status */}
      <div className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="text-slate-500 text-xs mb-1 font-medium">حالة الخطة</div>
        <div className="mt-2">
          <span
            className={`inline-block px-3 py-2 rounded-lg text-sm font-bold ${getStatusColor(
              kpis.status,
            )}`}
          >
            {getStatusText(kpis.status)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {kpis.completionPct === 0 && 'لم يتم البدء'}
          {kpis.completionPct > 0 && kpis.completionPct < 50 && 'في بداية التنفيذ'}
          {kpis.completionPct >= 50 && kpis.completionPct < 100 && 'قريبة من الإكتمال'}
          {kpis.completionPct === 100 && 'تم إنجاز جميع المهام'}
        </div>
      </div>
    </div>
  );
}
