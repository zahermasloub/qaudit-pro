'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreatePlanWizardProps {
  onClose?: () => void;
}

interface PlanTask {
  seqNo: number; // الرقم التسلسلي للمهمة
  taskRef: string; // الرقم المرجعي للمهمة
  deptId: string; // الإدارة / القسم المستهدف
  title: string; // اسم المهمة
  taskType: string; // نوع المهمة
  riskLevel: string; // درجة الخطورة
  impactLevel: string; // تقييم الأثر
  priority: string; // أولوية التنفيذ
  scheduledQuarter: string; // توقيت التنفيذ المقترح
  durationDays: number; // المدة التقديرية للتنفيذ (أيام)
  assignee: string; // المدقق المسؤول
  notes: string; // تعليقات إضافية
}

export default function CreatePlanWizard({ onClose }: CreatePlanWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State - بيانات الخطة الأساسية
  const [planRef, setPlanRef] = useState(''); // الرقم المرجعي للخطة
  const [year, setYear] = useState(new Date().getFullYear() + 1); // السنة المالية
  const [preparedDate, setPreparedDate] = useState(new Date().toISOString().split('T')[0]); // تاريخ إعداد الخطة
  const [approvedBy, setApprovedBy] = useState(''); // الجهة المعتمدة
  const [preparedBy, setPreparedBy] = useState(''); // اسم معدّ الخطة
  const [standards, setStandards] = useState(''); // معايير إعداد الخطة
  const [methodology, setMethodology] = useState(''); // منهجية إعداد الخطة
  const [objectives, setObjectives] = useState(''); // أهداف الخطة السنوية
  const [riskSources, setRiskSources] = useState<string[]>([]); // مصادر تقييم المخاطر
  const [version, setVersion] = useState('v1');
  const [ownerId, setOwnerId] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);

  // Step 2 State
  const [items, setItems] = useState<PlanTask[]>([
    {
      seqNo: 1,
      taskRef: '',
      deptId: '',
      title: '',
      taskType: 'compliance',
      riskLevel: 'medium',
      impactLevel: 'medium',
      priority: 'medium',
      scheduledQuarter: 'Q1',
      durationDays: 20,
      assignee: '',
      notes: '',
    },
  ]);

  // Generate year options (current year + 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

  // الجهات المعتمدة
  const approvedByOptions = [
    { value: 'board', label: 'مجلس الإدارة' },
    { value: 'audit_committee', label: 'لجنة المراجعة' },
    { value: 'executive_committee', label: 'اللجنة التنفيذية' },
    { value: 'audit_management', label: 'إدارة التدقيق الداخلي' },
    { value: 'ceo', label: 'الرئيس التنفيذي' },
    { value: 'other', label: 'أخرى' },
  ];

  // مصادر تقييم المخاطر
  const riskSourceOptions = [
    { value: 'previous_reports', label: 'تقارير تدقيق سابقة' },
    { value: 'interviews', label: 'مقابلات مع الإدارة' },
    { value: 'financial_analysis', label: 'تحليل مالي' },
    { value: 'operational_data', label: 'بيانات تشغيلية' },
    { value: 'external_sources', label: 'مصادر خارجية' },
    { value: 'risk_register', label: 'سجل المخاطر المؤسسي' },
    { value: 'regulatory', label: 'متطلبات تنظيمية' },
    { value: 'stakeholder_input', label: 'مدخلات أصحاب المصلحة' },
  ];

  // Toggle risk source checkbox
  const toggleRiskSource = (value: string) => {
    setRiskSources(prev =>
      prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value],
    );
  };

  // Step 1: Create Plan
  const handleCreatePlan = async () => {
    // Validation
    if (!planRef.trim()) {
      toast.error('الرجاء إدخال الرقم المرجعي للخطة');
      return;
    }
    if (!preparedDate) {
      toast.error('الرجاء اختيار تاريخ إعداد الخطة');
      return;
    }
    if (!approvedBy) {
      toast.error('الرجاء اختيار الجهة المعتمدة');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_ref: planRef,
          year,
          prepared_date: preparedDate,
          approved_by: approvedBy,
          prepared_by: preparedBy,
          standards,
          methodology,
          objectives,
          risk_sources: riskSources,
          version,
          owner_id: ownerId || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل إنشاء الخطة');
      }

      const data = await response.json();
      setPlanId(data.id);
      toast.success('✅ تم إنشاء الخطة بنجاح');
      setStep(2);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Save Items
  const handleSaveItems = async () => {
    if (!planId) {
      toast.error('معرّف الخطة غير موجود');
      return;
    }

    setLoading(true);
    try {
      // Filter out empty items (must have title and taskRef)
      const validItems = items.filter(
        item => item.title.trim() !== '' && item.taskRef.trim() !== '',
      );

      if (validItems.length === 0) {
        toast.error('يجب إضافة مهمة واحدة على الأقل برقم مرجعي وعنوان');
        setLoading(false);
        return;
      }

      // Save tasks via new API
      const response = await fetch(`/api/plan/${planId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: validItems,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل حفظ المهام');
      }

      toast.success(`✅ تم إنشاء الخطة وحفظ ${validItems.length} مهمة بنجاح`);

      // Close wizard and stay in dashboard to view updated KPIs
      if (onClose) {
        // Close the dialog
        onClose();
        // Refresh to reload KPI cards with new data
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        // If standalone page, redirect to dashboard
        router.push('/shell');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new item row
  const addItem = () => {
    const newSeqNo = items.length + 1;
    setItems([
      ...items,
      {
        seqNo: newSeqNo,
        taskRef: '',
        deptId: '',
        title: '',
        taskType: 'compliance',
        riskLevel: 'medium',
        impactLevel: 'medium',
        priority: 'medium',
        scheduledQuarter: 'Q1',
        durationDays: 20,
        assignee: '',
        notes: '',
      },
    ]);
  };

  // Remove item row
  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Update item field
  const updateItem = (index: number, field: keyof PlanTask, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="w-full max-w-4xl mx-auto" dir="rtl">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 1 ? 'bg-blue-600 text-white' : 'bg-green-500 text-white'
              }`}
            >
              {step > 1 ? '✓' : '1'}
            </div>
            <span className="text-sm font-medium">بيانات الخطة</span>
          </div>
          <div className="w-20 h-1 bg-gray-300 rounded"></div>
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">تفاصيل مهام التدقيق</span>
          </div>
        </div>
      </div>

      {/* Step 1: Plan Data */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إنشاء خطة تدقيق سنوية جديدة</h2>

          <div className="space-y-6">
            {/* القسم 1: البيانات الأساسية */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                البيانات الأساسية <span className="text-red-500">*</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* الرقم المرجعي للخطة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرقم المرجعي للخطة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={planRef}
                    onChange={e => setPlanRef(e.target.value)}
                    placeholder="ADP-2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                    dir="ltr"
                  />
                  <p className="text-xs text-gray-500 mt-1">مثال: ADP-2025، AUDIT-2026</p>
                </div>

                {/* السنة المالية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السنة المالية <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {yearOptions.map(y => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                {/* تاريخ إعداد الخطة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ إعداد الخطة <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={preparedDate}
                    onChange={e => setPreparedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* الجهة المعتمدة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجهة المعتمدة <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={approvedBy}
                    onChange={e => setApprovedBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر الجهة المعتمدة</option>
                    {approvedByOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* اسم معدّ الخطة */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم معدّ الخطة
                  </label>
                  <input
                    type="text"
                    value={preparedBy}
                    onChange={e => setPreparedBy(e.target.value)}
                    placeholder="الاسم الكامل لمعد الخطة"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  />
                </div>
              </div>
            </div>

            {/* القسم 2: معلومات تكميلية */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات تكميلية</h3>

              <div className="space-y-4">
                {/* معايير إعداد الخطة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معايير ومرجعيات إعداد الخطة
                  </label>
                  <textarea
                    value={standards}
                    onChange={e => setStandards(e.target.value)}
                    placeholder="مثال: معايير IIA الدولية 2017، معايير ISO 19011، نظام المراجعة الداخلية المحلي..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right"
                  />
                </div>

                {/* منهجية إعداد الخطة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    منهجية وإجراءات إعداد الخطة
                  </label>
                  <textarea
                    value={methodology}
                    onChange={e => setMethodology(e.target.value)}
                    placeholder="وصف تفصيلي للمنهجية المتبعة في إعداد الخطة: تحديد نطاق العمل، تقييم المخاطر، تحديد الأولويات..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right"
                  />
                </div>

                {/* أهداف الخطة السنوية */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    أهداف الخطة السنوية
                  </label>
                  <textarea
                    value={objectives}
                    onChange={e => setObjectives(e.target.value)}
                    placeholder="مثال: تعزيز فعالية الرقابة الداخلية، خفض مستوى المخاطر التشغيلية، ضمان الامتثال للأنظمة والتشريعات..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-right"
                  />
                </div>
              </div>
            </div>

            {/* القسم 3: مصادر تقييم المخاطر */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                مصادر تقييم المخاطر المعتمدة
              </h3>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600 mb-3">
                  اختر المصادر التي تم الاعتماد عليها في تقييم المخاطر:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {riskSourceOptions.map(option => (
                    <label
                      key={option.value}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={riskSources.includes(option.value)}
                        onChange={() => toggleRiskSource(option.value)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* معلومات إضافية (اختيارية) */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رقم النسخة</label>
                  <input
                    type="text"
                    value={version}
                    onChange={e => setVersion(e.target.value)}
                    placeholder="v1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">افتراضي: v1</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المالك (اختياري)
                  </label>
                  <input
                    type="text"
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    placeholder="user-123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleCreatePlan}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'جاري الإنشاء...' : 'إنشاء الخطة →'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Task Details */}
      {step === 2 && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">إضافة تفاصيل المهام</h2>
            <button
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + إضافة مهمة
            </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4"
              >
                {/* الصف الأول */}
                <div className="grid grid-cols-12 gap-3">
                  {/* الرقم التسلسلي */}
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      الرقم التسلسلي
                    </label>
                    <input
                      type="number"
                      value={item.seqNo}
                      onChange={e => updateItem(index, 'seqNo', Number(e.target.value))}
                      min="1"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-gray-100"
                      readOnly
                    />
                  </div>

                  {/* الرقم المرجعي */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      الرقم المرجعي *
                    </label>
                    <input
                      type="text"
                      value={item.taskRef}
                      onChange={e => updateItem(index, 'taskRef', e.target.value)}
                      placeholder="T-001"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                      dir="ltr"
                    />
                  </div>

                  {/* الإدارة / القسم */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      الإدارة / القسم
                    </label>
                    <select
                      value={item.deptId}
                      onChange={e => updateItem(index, 'deptId', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">اختر القسم</option>
                      <option value="finance">المالية</option>
                      <option value="procurement">المشتريات</option>
                      <option value="hr">الموارد البشرية</option>
                      <option value="it">تقنية المعلومات</option>
                      <option value="operations">العمليات</option>
                      <option value="legal">الشؤون القانونية</option>
                      <option value="risk">إدارة المخاطر</option>
                      <option value="compliance">الامتثال</option>
                      <option value="general">عام</option>
                    </select>
                  </div>

                  {/* اسم المهمة */}
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      اسم المهمة *
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={e => updateItem(index, 'title', e.target.value)}
                      placeholder="مراجعة المشتريات السنوية"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* الصف الثاني */}
                <div className="grid grid-cols-12 gap-3">
                  {/* نوع المهمة */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      نوع المهمة
                    </label>
                    <select
                      value={item.taskType}
                      onChange={e => updateItem(index, 'taskType', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="financial">مالي</option>
                      <option value="operational">تشغيلي</option>
                      <option value="compliance">امتثال</option>
                      <option value="it">تقنية معلومات</option>
                      <option value="investigative">تحقيقات</option>
                      <option value="performance">أداء</option>
                      <option value="risk">مخاطر</option>
                    </select>
                  </div>

                  {/* درجة الخطورة */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      درجة الخطورة
                    </label>
                    <select
                      value={item.riskLevel}
                      onChange={e => updateItem(index, 'riskLevel', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="critical">حرج</option>
                      <option value="high">عالي</option>
                      <option value="medium">متوسط</option>
                      <option value="low">منخفض</option>
                    </select>
                  </div>

                  {/* تقييم الأثر */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      تقييم الأثر
                    </label>
                    <select
                      value={item.impactLevel}
                      onChange={e => updateItem(index, 'impactLevel', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="critical">حرج</option>
                      <option value="high">عالي</option>
                      <option value="medium">متوسط</option>
                      <option value="low">منخفض</option>
                    </select>
                  </div>

                  {/* أولوية التنفيذ */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      أولوية التنفيذ
                    </label>
                    <select
                      value={item.priority}
                      onChange={e => updateItem(index, 'priority', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="urgent">عاجل</option>
                      <option value="high">عالي</option>
                      <option value="medium">متوسط</option>
                      <option value="low">منخفض</option>
                    </select>
                  </div>

                  {/* توقيت التنفيذ */}
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      توقيت التنفيذ
                    </label>
                    <select
                      value={item.scheduledQuarter}
                      onChange={e => updateItem(index, 'scheduledQuarter', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Q1">الربع الأول</option>
                      <option value="Q2">الربع الثاني</option>
                      <option value="Q3">الربع الثالث</option>
                      <option value="Q4">الربع الرابع</option>
                    </select>
                  </div>

                  {/* المدة بالأيام */}
                  <div className="col-span-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      المدة (أيام)
                    </label>
                    <input
                      type="number"
                      value={item.durationDays}
                      onChange={e => updateItem(index, 'durationDays', Number(e.target.value))}
                      min="1"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* الصف الثالث */}
                <div className="grid grid-cols-12 gap-3">
                  {/* المدقق المسؤول */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      المدقق المسؤول
                    </label>
                    <input
                      type="text"
                      value={item.assignee}
                      onChange={e => updateItem(index, 'assignee', e.target.value)}
                      placeholder="اسم المدقق"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* تعليقات إضافية */}
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      تعليقات إضافية
                    </label>
                    <textarea
                      value={item.notes}
                      onChange={e => updateItem(index, 'notes', e.target.value)}
                      placeholder="ملاحظات أو تعليمات خاصة..."
                      rows={1}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* زر حذف */}
                  <div className="col-span-2 flex items-end">
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(index)}
                        className="w-full px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded font-medium transition-colors"
                      >
                        🗑️ حذف
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
            >
              ← رجوع
            </button>
            <button
              onClick={handleSaveItems}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ المهام والانتقال →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
