'use client';
import { useI18n, Locale } from '@/lib/i18n';

interface DashboardKPI {
  title: string;
  value: number;
  total: number;
  color: 'blue' | 'green' | 'orange' | 'purple';
  description: string;
}

const clsx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

export default function DashboardView({ locale }: { locale: Locale }) {
  const i18n = useI18n(locale);
  const isRTL = locale === 'ar';

  // Mock KPI data
  const kpis: DashboardKPI[] = [
    {
      title: locale === 'ar' ? 'المهام المكتملة' : 'Completed Tasks',
      value: 32,
      total: 45,
      color: 'green',
      description: locale === 'ar' ? 'من إجمالي المهام المطلوبة' : 'of total required tasks'
    },
    {
      title: locale === 'ar' ? 'الأدلة المرفوعة' : 'Uploaded Evidence',
      value: 28,
      total: 40,
      color: 'blue',
      description: locale === 'ar' ? 'من الأدلة المطلوبة' : 'of required evidence files'
    },
    {
      title: locale === 'ar' ? 'النتائج المرصودة' : 'Identified Findings',
      value: 7,
      total: 0,
      color: 'orange',
      description: locale === 'ar' ? 'نتيجة تحتاج مراجعة' : 'findings need review'
    },
    {
      title: locale === 'ar' ? 'التقارير الجاهزة' : 'Reports Ready',
      value: 3,
      total: 5,
      color: 'purple',
      description: locale === 'ar' ? 'تقارير جاهزة للمراجعة' : 'reports ready for review'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500', 
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50', 
    purple: 'bg-purple-50'
  };

  function KPICard({ kpi }: { kpi: DashboardKPI }) {
    const progress = kpi.total > 0 ? (kpi.value / kpi.total) * 100 : 0;
    
    return (
      <div className={clsx('rounded-lg border border-gray-200 p-6', bgColorClasses[kpi.color])}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{kpi.title}</h3>
          <div className={clsx('w-3 h-3 rounded-full', colorClasses[kpi.color])}></div>
        </div>
        
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{kpi.value}</span>
            {kpi.total > 0 && <span className="text-lg text-gray-600">/ {kpi.total}</span>}
          </div>
          <p className="text-sm text-gray-600 mt-1">{kpi.description}</p>
        </div>

        {kpi.total > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={clsx('h-2 rounded-full transition-all duration-300', colorClasses[kpi.color])}
              style={{ width: `${Math.min(progress, 100)}%` }}
            ></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-gray-600">
          {locale === 'ar' 
            ? 'نظرة عامة على حالة التدقيق والمهام الجارية' 
            : 'Overview of audit status and ongoing tasks'
          }
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <KPICard key={index} kpi={kpi} />
        ))}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">
                {locale === 'ar' ? 'مهمة جديدة' : 'New Engagement'}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ar' ? 'إنشاء مهمة تدقيق جديدة' : 'Create a new audit engagement'}
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-medium text-gray-900">
                {locale === 'ar' ? 'رفع أدلة' : 'Upload Evidence'}
              </div>
              <div className="text-sm text-gray-600">
                {locale === 'ar' ? 'رفع ملفات الأدلة للمراجعة' : 'Upload evidence files for review'}
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {locale === 'ar' ? 'تم رفع دليل جديد' : 'New evidence uploaded'}
                </div>
                <div className="text-gray-600">
                  {locale === 'ar' ? 'منذ ساعتين' : '2 hours ago'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 border-l-4 border-green-500 bg-green-50 rounded">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {locale === 'ar' ? 'تم اعتماد التقرير' : 'Report approved'}
                </div>
                <div className="text-gray-600">
                  {locale === 'ar' ? 'منذ 4 ساعات' : '4 hours ago'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'التنبيهات' : 'Notifications'}
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="font-medium text-orange-900 text-sm">
                {locale === 'ar' ? 'موعد نهائي قريب' : 'Deadline Approaching'}
              </div>
              <div className="text-orange-700 text-sm">
                {locale === 'ar' ? 'تقرير التدقيق مطلوب خلال 3 أيام' : 'Audit report due in 3 days'}
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-900 text-sm">
                {locale === 'ar' ? 'مراجعة مطلوبة' : 'Review Required'}
              </div>
              <div className="text-blue-700 text-sm">
                {locale === 'ar' ? '5 نتائج تحتاج مراجعة القائد' : '5 findings need lead review'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}