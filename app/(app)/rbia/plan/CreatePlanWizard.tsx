'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreatePlanWizardProps {
  onClose?: () => void;
}

interface PlanItem {
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  auditType: string;
  plannedQuarter: string;
  estimatedHours: number;
}

export default function CreatePlanWizard({ onClose }: CreatePlanWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1 State
  const [year, setYear] = useState(new Date().getFullYear() + 1);
  const [version, setVersion] = useState('v1');
  const [ownerId, setOwnerId] = useState('');
  const [planId, setPlanId] = useState<string | null>(null);

  // Step 2 State
  const [items, setItems] = useState<PlanItem[]>([
    {
      code: '',
      title: '',
      department: 'عام',
      riskLevel: 'medium',
      auditType: 'operational',
      plannedQuarter: 'Q1',
      estimatedHours: 40,
    },
  ]);

  // Generate year options (current year + 5 years)
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i);

  // Step 1: Create Plan
  const handleCreatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
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
      // Filter out empty items (must have code and title)
      const validItems = items.filter(item =>
        item.code.trim() !== '' && item.title.trim() !== ''
      );

      if (validItems.length === 0) {
        toast.error('يجب إضافة مهمة واحدة على الأقل برمز وعنوان');
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
    setItems([
      ...items,
      {
        code: '',
        title: '',
        department: 'عام',
        riskLevel: 'medium',
        auditType: 'operational',
        plannedQuarter: 'Q1',
        estimatedHours: 40,
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
  const updateItem = (index: number, field: keyof PlanItem, value: any) => {
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
                step === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-green-500 text-white'
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
                step === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="text-sm font-medium">البنود الأولية</span>
          </div>
        </div>
      </div>

      {/* Step 1: Plan Data */}
      {step === 1 && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            إنشاء خطة سنوية جديدة
          </h2>

          <div className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم النسخة
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="v1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                افتراضي: v1
              </p>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium"
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

      {/* Step 2: Initial Tasks */}
      {step === 2 && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              إضافة المهام الأولية
            </h2>
            <button
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + إضافة مهمة
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الرمز *
                  </label>
                  <input
                    type="text"
                    value={item.code}
                    onChange={e => updateItem(index, 'code', e.target.value)}
                    placeholder="TASK-001"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    العنوان *
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateItem(index, 'title', e.target.value)}
                    placeholder="مراجعة المشتريات"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    القسم
                  </label>
                  <input
                    type="text"
                    value={item.department}
                    onChange={e => updateItem(index, 'department', e.target.value)}
                    placeholder="عام"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    مستوى المخاطر
                  </label>
                  <select
                    value={item.riskLevel}
                    onChange={e => updateItem(index, 'riskLevel', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="very_high">عالي جداً</option>
                    <option value="high">عالي</option>
                    <option value="medium">متوسط</option>
                    <option value="low">منخفض</option>
                    <option value="very_low">منخفض جداً</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    نوع التدقيق
                  </label>
                  <select
                    value={item.auditType}
                    onChange={e => updateItem(index, 'auditType', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="financial">مالي</option>
                    <option value="operational">تشغيلي</option>
                    <option value="compliance">امتثال</option>
                    <option value="it">تقنية معلومات</option>
                    <option value="investigative">تحقيقات</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الساعات
                  </label>
                  <input
                    type="number"
                    value={item.estimatedHours}
                    onChange={e => updateItem(index, 'estimatedHours', Number(e.target.value))}
                    min="1"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الربع
                  </label>
                  <select
                    value={item.plannedQuarter}
                    onChange={e => updateItem(index, 'plannedQuarter', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </div>

                {items.length > 1 && (
                  <div className="col-span-12 flex justify-end">
                    <button
                      onClick={() => removeItem(index)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      🗑️ حذف
                    </button>
                  </div>
                )}
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
              {loading ? 'جاري الحفظ...' : 'حفظ البنود والانتقال →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
