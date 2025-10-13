import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useToast } from '@/components/ui/Toast-v2';
import { type TestFormValues, testSchema } from '@/features/program/tests/test.schema';

interface TestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  onSuccess: () => void;
}

export default function TestForm({ open, onOpenChange, engagementId, onSuccess }: TestFormProps) {
  const [loading, setLoading] = useState(false);
  const [testSteps, setTestSteps] = useState<string[]>(['']);
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TestFormValues>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      engagementId,
      code: '',
      title: '',
      objective: '',
      controlId: '',
      riskId: '',
      testSteps: [''],
      expectedResults: '',
      status: 'planned' as const,
      assignedTo: '',
      plannedHours: 8,
    },
  });

  async function onSubmit(data: TestFormValues) {
    setLoading(true);
    try {
      const response = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        addToast({
          type: 'success',
          title: 'تم إنشاء الاختبار بنجاح',
          message: `تم حفظ الاختبار: ${result.code}`,
        });
        reset();
        onSuccess();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'خطأ في حفظ الاختبار',
          message: error.error || 'حدث خطأ غير متوقع',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'خطأ في الاتصال',
        message: 'تعذر الاتصال بالخادم',
      });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">اختبار تدقيق جديد</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رمز الاختبار</label>
              <input
                {...register('code')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="TEST-001"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="planned">مخطط</option>
                <option value="in_progress">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="blocked">محجوب</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">عنوان الاختبار</label>
            <input
              {...register('title')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="اختبار صحة البيانات المالية"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">هدف الاختبار</label>
            <textarea
              {...register('objective')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              placeholder="التأكد من دقة واكتمال البيانات المالية..."
            />
            {errors.objective && (
              <p className="text-red-500 text-xs mt-1">{errors.objective.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">معرف الضابطة</label>
              <input
                {...register('controlId')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="CTL-001 (اختياري)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">معرف المخاطرة</label>
              <input
                {...register('riskId')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="RISK-001 (اختياري)"
              />
            </div>
          </div>

          {/* Test Steps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">خطوات الاختبار</label>
              <button
                type="button"
                onClick={() => {
                  const newSteps = [...testSteps, ''];
                  setTestSteps(newSteps);
                  setValue('testSteps', newSteps);
                }}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                + إضافة خطوة
              </button>
            </div>
            <div className="space-y-2">
              {testSteps.map((step, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={step}
                    onChange={e => {
                      const newSteps = [...testSteps];
                      newSteps[index] = e.target.value;
                      setTestSteps(newSteps);
                      setValue('testSteps', newSteps);
                    }}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2"
                    placeholder={`الخطوة ${index + 1}`}
                  />
                  {testSteps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = testSteps.filter((_, i) => i !== index);
                        setTestSteps(newSteps);
                        setValue('testSteps', newSteps);
                      }}
                      className="text-red-600 hover:text-red-700 px-2"
                    >
                      حذف
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.testSteps && (
              <p className="text-red-500 text-xs mt-1">{errors.testSteps.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">النتائج المتوقعة</label>
            <textarea
              {...register('expectedResults')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-16"
              placeholder="النتائج التي نتوقعها من هذا الاختبار..."
            />
            {errors.expectedResults && (
              <p className="text-red-500 text-xs mt-1">{errors.expectedResults.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">المكلف بالتنفيذ</label>
              <input
                {...register('assignedTo')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="auditor@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الساعات المخططة</label>
              <input
                type="number"
                {...register('plannedHours', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="8"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ الاختبار'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
