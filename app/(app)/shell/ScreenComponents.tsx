import PBCTable from '@/components/pbc/PbcTable';
import EvidenceTable from '@/features/evidence/evidence.table';
import type { Locale } from '@/lib/i18n';
import { useI18n } from '@/lib/i18n';

export function PlanningScreen({ locale }: { locale: Locale }) {
  const _i18n = useI18n(locale);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-900">{(_i18n.menu as any).planning}</h1>
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

        {/* PBC Requests Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'ملخص طلبات PBC' : 'PBC Requests Summary'}
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                <div className="text-lg font-bold text-blue-900">1</div>
                <div className="text-xs text-blue-700">{locale === 'ar' ? 'مفتوح' : 'Open'}</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                <div className="text-lg font-bold text-yellow-900">1</div>
                <div className="text-xs text-yellow-700">
                  {locale === 'ar' ? 'جزئي' : 'Partial'}
                </div>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                <div className="text-lg font-bold text-green-900">1</div>
                <div className="text-xs text-green-700">
                  {locale === 'ar' ? 'مكتمل' : 'Complete'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PBC Requests Table */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {locale === 'ar' ? 'طلبات المستندات (PBC)' : 'PBC Requests'}
        </h2>
        <PBCTable
          engagementId="ENG-DEMO"
          onRefresh={() => {
            console.log('Refreshing PBC data...');
            // TODO: Re-fetch PBC data from API
          }}
        />
      </div>
    </div>
  );
}

export function ProcessRiskScreen({ locale }: { locale: Locale }) {
  const _i18n = useI18n(locale);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-gray-900">{(_i18n.menu as any).processRisk}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Maps */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'خرائط العمليات' : 'Process Maps'}
          </h3>
          <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-500">{locale === 'ar' ? 'لا توجد خرائط' : 'No maps yet'}</div>
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
        <h1 className="text-2xl font-bold text-gray-900">{(i18n.menu as any).program}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Programs */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'برامج الاختبار' : 'Test Programs'}
          </h3>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
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

export function FieldworkScreen({
  locale,
  engagementId,
}: {
  locale: Locale;
  engagementId: string;
}) {
  const i18n = useI18n(locale);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {locale === 'ar' ? 'العمل الميداني والأدلة' : 'Fieldwork & Evidence'}
        </h1>
        <a
          href="/fieldwork/ENG-DEMO"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {locale === 'ar' ? 'إدارة الأدلة' : 'Manage Evidence'}
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Execution Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'حالة تنفيذ الاختبارات' : 'Test Execution Status'}
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-900">
                  {locale === 'ar' ? 'مكتملة' : 'Completed'}
                </span>
                <span className="text-lg font-bold text-green-900">1</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}
                </span>
                <span className="text-lg font-bold text-blue-900">1</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-900">
                  {locale === 'ar' ? 'مخطط' : 'Planned'}
                </span>
                <span className="text-lg font-bold text-yellow-900">1</span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence Files */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'ملفات الأدلة' : 'Evidence Files'}
          </h3>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-900">0</div>
              <div className="text-xs text-blue-700 mt-1">
                {locale === 'ar' ? 'إجمالي الملفات' : 'Total Files'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-center">
                <div className="text-sm font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-600">
                  {locale === 'ar' ? 'مستندات' : 'Documents'}
                </div>
              </div>
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-center">
                <div className="text-sm font-bold text-gray-900">0</div>
                <div className="text-xs text-gray-600">{locale === 'ar' ? 'صور' : 'Images'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {locale === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-900">
                  {locale === 'ar'
                    ? 'تم إنشاء نظام إدارة الأدلة'
                    : 'Evidence management system created'}
                </p>
                <p className="text-gray-500 text-xs">
                  {locale === 'ar' ? 'منذ دقائق' : 'Just now'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-2xl">✨</span>
          </div>
          <div className="mr-3">
            <h3 className="text-lg font-medium text-blue-900">
              {locale === 'ar' ? 'نظام العمل الميداني المتكامل' : 'Integrated Fieldwork System'}
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              {locale === 'ar'
                ? 'يمكنك الآن الوصول إلى جميع ميزات العمل الميداني من شريط الأدوات أعلاه: رفع الأدلة، تنفيذ الاختبارات، وفحص الفيروسات.'
                : 'All fieldwork features are now accessible from the toolbar above: Evidence upload, test execution, and virus scanning.'}
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar Integration Notice */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {locale === 'ar' ? 'الميزات المدمجة مع شريط الأدوات' : 'Toolbar Integrated Features'}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-2xl mb-2">�</div>
            <span className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'رفع الأدلة' : 'Upload Evidence'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {locale === 'ar' ? 'من شريط الأدوات' : 'Via Toolbar'}
            </span>
          </div>

          <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-2xl mb-2">🧪</div>
            <span className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'تنفيذ اختبار' : 'Run Test'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {locale === 'ar' ? 'من شريط الأدوات' : 'Via Toolbar'}
            </span>
          </div>

          <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-2xl mb-2">�️</div>
            <span className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'فحص الفيروسات' : 'Virus Scan'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {locale === 'ar' ? 'من شريط الأدوات' : 'Via Toolbar'}
            </span>
          </div>

          <div className="flex flex-col items-center p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
            <div className="text-2xl mb-2">🔗</div>
            <span className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'ربط الأدلة' : 'Link Evidence'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {locale === 'ar' ? 'من شريط الأدوات' : 'Via Toolbar'}
            </span>
          </div>
        </div>
      </div>

      {/* Available Features */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {locale === 'ar' ? 'الميزات المتاحة' : 'Available Features'}
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar'
              ? 'رفع الأدلة بجميع الصيغ مع drag & drop'
              : 'Multi-format evidence upload with drag & drop'}
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar'
              ? 'تنفيذ الاختبارات مع ربط الأدلة'
              : 'Test execution with evidence linking'}
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar' ? 'فحص الفيروسات وتأمين الملفات' : 'Virus scanning and file security'}
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar' ? 'دعم التحقق من صحة البيانات بـ Zod' : 'Zod validation support'}
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar'
              ? 'واجهة React Hook Form متقدمة'
              : 'Advanced React Hook Form interface'}
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            {locale === 'ar'
              ? 'تكامل شامل مع AppShell وRBAC'
              : 'Full AppShell and RBAC integration'}
          </li>
        </ul>
      </div>

      {/* Evidence Table */}
      <div className="mt-4 table-section not-opaque">
        <EvidenceTable engagementId={engagementId} />
      </div>
    </div>
  );
}

export function AnnualPlanScreen({ locale }: { locale: Locale }) {
  // Import the comprehensive Annual Plan screen
  const {
    AnnualPlanScreen: AnnualPlanComponent,
  } = require('@/features/annual-plan/AnnualPlan.screen');
  return <AnnualPlanComponent locale={locale} />;
}
