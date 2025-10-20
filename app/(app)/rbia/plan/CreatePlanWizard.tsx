'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface CreatePlanWizardProps {
  onClose?: () => void;
}

interface PlanItem {
  au_id: string;
  type: string;
  priority: string;
  effort: number;
  period_start: string;
  period_end: string;
  deliverable_type: string;
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
      au_id: '',
      type: 'audit',
      priority: 'high',
      effort: 80,
      period_start: `${year}-Q1`,
      period_end: `${year}-Q1`,
      deliverable_type: 'report',
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
      // Filter out empty items
      const validItems = items.filter(item => item.au_id.trim() !== '');

      if (validItems.length === 0) {
        toast.error('يجب إضافة بند واحد على الأقل');
        setLoading(false);
        return;
      }

      // Save items via API
      const response = await fetch('/api/plan/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          items: validItems.map(item => ({
            plan_id: planId,
            au_id: item.au_id,
            type: item.type,
            priority: item.priority,
            effort_hours: item.effort,
            period_start: item.period_start,
            period_end: item.period_end,
            deliverable_type: item.deliverable_type,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل حفظ البنود');
      }

      toast.success(`✅ تم حفظ ${validItems.length} بند بنجاح`);

      // Redirect to plan page
      router.push(`/rbia/plan?plan_id=${planId}`);

      if (onClose) {
        onClose();
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
        au_id: '',
        type: 'audit',
        priority: 'medium',
        effort: 80,
        period_start: `${year}-Q1`,
        period_end: `${year}-Q1`,
        deliverable_type: 'report',
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

      {/* Step 2: Initial Items */}
      {step === 2 && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              إضافة البنود الأولية
            </h2>
            <button
              onClick={addItem}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
            >
              + إضافة بند
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg bg-gray-50"
              >
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    معرّف الكيان
                  </label>
                  <input
                    type="text"
                    value={item.au_id}
                    onChange={e => updateItem(index, 'au_id', e.target.value)}
                    placeholder="AU-001"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    النوع
                  </label>
                  <select
                    value={item.type}
                    onChange={e => updateItem(index, 'type', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="audit">تدقيق</option>
                    <option value="advisory">استشاري</option>
                    <option value="investigation">تحقيق</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الأولوية
                  </label>
                  <select
                    value={item.priority}
                    onChange={e => updateItem(index, 'priority', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="high">عالية</option>
                    <option value="medium">متوسطة</option>
                    <option value="low">منخفضة</option>
                  </select>
                </div>

                <div className="col-span-1">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    الساعات
                  </label>
                  <input
                    type="number"
                    value={item.effort}
                    onChange={e => updateItem(index, 'effort', Number(e.target.value))}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    البداية
                  </label>
                  <select
                    value={item.period_start}
                    onChange={e => updateItem(index, 'period_start', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={`${year}-Q1`}>Q1</option>
                    <option value={`${year}-Q2`}>Q2</option>
                    <option value={`${year}-Q3`}>Q3</option>
                    <option value={`${year}-Q4`}>Q4</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    النهاية
                  </label>
                  <select
                    value={item.period_end}
                    onChange={e => updateItem(index, 'period_end', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={`${year}-Q1`}>Q1</option>
                    <option value={`${year}-Q2`}>Q2</option>
                    <option value={`${year}-Q3`}>Q3</option>
                    <option value={`${year}-Q4`}>Q4</option>
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
