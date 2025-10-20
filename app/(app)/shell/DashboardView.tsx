'use client';
import type { Locale } from '@/lib/i18n';

export default function DashboardView({
  locale,
  engagementId,
}: {
  locale: Locale;
  engagementId?: string;
}) {
  // engagementId can be used for filtering data in real implementation
  console.log('Dashboard for engagement:', engagementId);

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-8 px-4"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-4xl space-y-6">
      {/* Filters */}
  <div className="bg-white border rounded-2xl p-4 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 shadow-md">
  <select className="border rounded-lg px-4 py-3 text-base w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>{locale === 'ar' ? 'آخر 30 يومًا' : 'Last 30 days'}</option>
          <option>{locale === 'ar' ? 'آخر 90 يومًا' : 'Last 90 days'}</option>
        </select>
  <select className="border rounded-lg px-4 py-3 text-base w-full sm:w-auto focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option>{locale === 'ar' ? 'جميع المهام' : 'All engagements'}</option>
          <option>ENG-DEMO</option>
        </select>
        <div className="ms-auto flex gap-2">
          <button className="px-5 py-3 rounded-lg border text-base font-bold bg-white hover:bg-slate-100 transition-colors">
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
          <button className="px-5 py-3 rounded-lg border text-base font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            {locale === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI Cards - responsive grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">
            {locale === 'ar' ? 'إنجاز الخطة' : 'Plan Progress'}
          </div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">64%</div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">
            {locale === 'ar' ? 'تغطية الاختبارات' : 'Test Coverage'}
          </div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">72%</div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">
            {locale === 'ar' ? 'طلبات PBC' : 'PBC Requests'}
          </div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">
            9 <span className="text-sm font-normal">(3/1/5)</span>
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">
            {locale === 'ar' ? 'تنفيذ الإجراءات' : 'Procedure Execution'}
          </div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">55%</div>
        </div>
      </div>

      {/* Charts - responsive grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-2xl p-4 min-h-[220px] sm:min-h-[260px]">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'مخطط التقدّم' : 'Progress Chart'}
          </h3>
          <div className="text-gray-500 text-sm">
            {locale === 'ar' ? 'العرض قريبًا...' : 'Coming soon...'}
          </div>
        </div>
        <div className="bg-white border rounded-2xl p-4 min-h-[220px] sm:min-h-[260px]">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'نتائج حسب الأولوية' : 'Results by Priority'}
          </h3>
          <div className="text-gray-500 text-sm">
            {locale === 'ar' ? 'العرض قريبًا...' : 'Coming soon...'}
          </div>
        </div>
      </div>

      {/* Table example with overflow solution */}
      <div className="table-wrap rounded-2xl border bg-white th-sticky overflow-x-auto">
        <table className="w-full text-base min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-right p-3 font-semibold text-slate-700">{locale === 'ar' ? 'المهمة' : 'Task'}</th>
              <th className="text-right p-3 font-semibold text-slate-700">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-right p-3 font-semibold text-slate-700">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th className="text-right p-3 font-semibold text-slate-700">{locale === 'ar' ? 'المالك' : 'Owner'}</th>
              <th className="text-right p-3 font-semibold text-slate-700">{locale === 'ar' ? 'التقدم' : 'Progress'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3 truncate-cell text-slate-900 text-right">
                ENG-2025-001 - {locale === 'ar' ? 'مراجعة النظام المالي' : 'Financial System Review'}
              </td>
              <td className="p-3 text-slate-900 text-right">
                <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {locale === 'ar' ? 'نشط' : 'Active'}
                </span>
              </td>
              <td className="p-3 text-slate-900 text-right">2025-01-15</td>
              <td className="p-3 text-slate-900 text-right">Ahmad M.</td>
              <td className="p-3 text-slate-900 text-right">65%</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 truncate-cell text-slate-900 text-right">
                ENG-2025-002 - {locale === 'ar' ? 'تدقيق أمن المعلومات' : 'Information Security Audit'}
              </td>
              <td className="p-3 text-slate-900 text-right">
                <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {locale === 'ar' ? 'تخطيط' : 'Planning'}
                </span>
              </td>
              <td className="p-3 text-slate-900 text-right">2025-02-01</td>
              <td className="p-3 text-slate-900 text-right">Sara K.</td>
              <td className="p-3 text-slate-900 text-right">25%</td>
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
