'use client';
import type { Locale } from '@/lib/i18n';

export default function DashboardView({ locale, engagementId }: {
  locale: Locale;
  engagementId?: string;
}) {
  // engagementId can be used for filtering data in real implementation
  console.log('Dashboard for engagement:', engagementId);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white border rounded-2xl p-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
        <select className="border rounded-md px-2 py-2 text-sm w-full sm:w-auto">
          <option>{locale === 'ar' ? 'آخر 30 يومًا' : 'Last 30 days'}</option>
          <option>{locale === 'ar' ? 'آخر 90 يومًا' : 'Last 90 days'}</option>
        </select>
        <select className="border rounded-md px-2 py-2 text-sm w-full sm:w-auto">
          <option>{locale === 'ar' ? 'جميع المهام' : 'All engagements'}</option>
          <option>ENG-DEMO</option>
        </select>
        <div className="ms-auto flex gap-2">
          <button className="px-3 py-2 rounded-md border text-sm bg-white hover:bg-slate-50">
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </button>
          <button className="px-3 py-2 rounded-md border text-sm bg-slate-900 text-white hover:bg-black">
            {locale === 'ar' ? 'تصدير' : 'Export'}
          </button>
        </div>
      </div>

      {/* KPI Cards - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4 gap-3 lg:gap-4">
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">{locale === 'ar' ? 'إنجاز الخطة' : 'Plan Progress'}</div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">64%</div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">{locale === 'ar' ? 'تغطية الاختبارات' : 'Test Coverage'}</div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">72%</div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">{locale === 'ar' ? 'طلبات PBC' : 'PBC Requests'}</div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">9 <span className="text-sm font-normal">(3/1/5)</span></div>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="text-slate-500 text-xs mb-1">{locale === 'ar' ? 'تنفيذ الإجراءات' : 'Procedure Execution'}</div>
          <div className="text-slate-900 text-2xl md:text-3xl font-semibold">55%</div>
        </div>
      </div>

      {/* Charts - responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
        <div className="bg-white border rounded-2xl p-4 min-h-[220px] sm:min-h-[260px]">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'مخطط التقدّم' : 'Progress Chart'}
          </h3>
          <div className="text-gray-500 text-sm">{locale === 'ar' ? 'العرض قريبًا...' : 'Coming soon...'}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4 min-h-[220px] sm:min-h-[260px]">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'نتائج حسب الأولوية' : 'Results by Priority'}
          </h3>
          <div className="text-gray-500 text-sm">{locale === 'ar' ? 'العرض قريبًا...' : 'Coming soon...'}</div>
        </div>
      </div>

      {/* Table example with overflow solution */}
      <div className="table-wrap th-sticky">
        <table className="w-full text-sm bg-white border rounded-2xl overflow-hidden">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="text-left p-3 font-semibold">{locale === 'ar' ? 'المهمة' : 'Task'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'ar' ? 'المسؤول' : 'Owner'}</th>
              <th className="text-left p-3 font-semibold">{locale === 'ar' ? 'التقدم' : 'Progress'}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="p-3 truncate-cell">ENG-2025-001 - {locale === 'ar' ? 'مراجعة النظام المالي' : 'Financial System Review'}</td>
              <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{locale === 'ar' ? 'نشط' : 'Active'}</span></td>
              <td className="p-3">2025-01-15</td>
              <td className="p-3">Ahmad M.</td>
              <td className="p-3">65%</td>
            </tr>
            <tr className="border-b">
              <td className="p-3 truncate-cell">ENG-2025-002 - {locale === 'ar' ? 'تدقيق أمان المعلومات' : 'Information Security Audit'}</td>
              <td className="p-3"><span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">{locale === 'ar' ? 'تخطيط' : 'Planning'}</span></td>
              <td className="p-3">2025-02-01</td>
              <td className="p-3">Sara K.</td>
              <td className="p-3">25%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
