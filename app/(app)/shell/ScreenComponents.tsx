import { useI18n, Locale } from '@/lib/i18n';

const clsx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

export function PlanningScreen({ locale }: { locale: Locale }) {
  const i18n = useI18n(locale);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {(i18n.menu as any).planning}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Planning */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'خطة المهمة' : 'Engagement Planning'}
          </h3>
          <div className="space-y-3">
            <div className="p-3 border border-gray-200 rounded-lg">
              <div className="font-medium text-gray-900">
                {locale === 'ar' ? 'مهمة تدقيق العمليات المالية' : 'Financial Operations Audit'}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {locale === 'ar' ? 'الحالة: في التخطيط' : 'Status: Planning'}
              </div>
            </div>
          </div>
        </div>

        {/* PBC Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'طلبات PBC' : 'PBC Requests'}
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="font-medium text-yellow-900">
                {locale === 'ar' ? '15 طلب معلق' : '15 Pending Requests'}
              </div>
              <div className="text-sm text-yellow-700">
                {locale === 'ar' ? 'يتطلب مراجعة' : 'Requires review'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProcessRiskScreen({ locale }: { locale: Locale }) {
  const i18n = useI18n(locale);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {(i18n.menu as any).processRisk}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Maps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'خرائط العمليات' : 'Process Maps'}
          </h3>
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-500">
              {locale === 'ar' ? 'لا توجد خرائط' : 'No maps yet'}
            </div>
          </div>
        </div>

        {/* Risk Registry */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'سجل المخاطر' : 'Risk Registry'}
          </h3>
          <div className="space-y-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-sm font-medium text-red-900">
                {locale === 'ar' ? 'مخاطر عالية: 3' : 'High Risk: 3'}
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-sm font-medium text-yellow-900">
                {locale === 'ar' ? 'مخاطر متوسطة: 7' : 'Medium Risk: 7'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'مصفوفة الضوابط' : 'Controls Matrix'}
          </h3>
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-500">
              {locale === 'ar' ? 'قيد الإعداد' : 'Under development'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProgramScreen({ locale }: { locale: Locale }) {
  const i18n = useI18n(locale);
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {(i18n.menu as any).program}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Programs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'برامج الاختبار' : 'Test Programs'}
          </h3>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg">
                <div className="font-medium text-gray-900">
                  {locale === 'ar' ? `اختبار ${i}` : `Test ${i}`}
                </div>
                <div className="text-sm text-gray-600">
                  {locale === 'ar' ? 'جاهز للتنفيذ' : 'Ready for execution'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sample Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'اختيار العينات' : 'Sample Selection'}
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                {locale === 'ar' ? 'إجمالي السكان: 1,250' : 'Population: 1,250'}
              </div>
              <div className="text-sm text-blue-700 mt-1">
                {locale === 'ar' ? 'العينة المطلوبة: 25' : 'Required sample: 25'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}