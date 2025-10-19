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
          title: 'تم حفظ اختبار الإجراءات بنجاح',
          message: `تم إنشاء الاختبار: ${result.code}`,
        });
        reset();
        onSuccess();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'تعذر حفظ الاختبار',
          message: error.error || 'حدث خطأ غير متوقع',
        });
      }
    } catch (error) {
      addToast({
        type: 'error',
        title: 'تعذر الاتصال',
        message: 'حدث خلل أثناء الاتصال بالخادم',
      });
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-3xl">
        <div className="flex max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold">إنشاء اختبار جديد</h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="grid grid-cols-1 gap-4 md:col-span-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">كود الاختبار</label>
                    <input
                      {...register('code')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="TEST-001"
                    />
                    {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">الحالة</label>
                    <select
                      {...register('status')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    >
                      <option value="planned">مخطط</option>
                      <option value="in_progress">قيد التنفيذ</option>
                      <option value="completed">مكتمل</option>
                      <option value="blocked">معلق</option>
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium">عنوان الاختبار</label>
                  <input
                    {...register('title')}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="اختبار فعالية الرقابة على عمليات الشراء"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">هدف الاختبار</label>
                  <textarea
                    {...register('objective')}
                    className="h-20 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="وضح الهدف من هذا الاختبار والإجراءات التي سيغطيها..."
                  />
                  {errors.objective && (
                    <p className="mt-1 text-xs text-red-500">{errors.objective.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">معرّف الرقابة</label>
                    <input
                      {...register('controlId')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="CTL-001 (اختياري)"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">معرّف الخطر</label>
                    <input
                      {...register('riskId')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="RISK-001 (اختياري)"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium">خطوات الاختبار</label>
                    <button
                      type="button"
                      onClick={() => {
                        const newSteps = [...testSteps, ''];
                        setTestSteps(newSteps);
                        setValue('testSteps', newSteps);
                      }}
                      className="text-sm text-blue-600 transition-colors hover:text-blue-700"
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
                            className="px-2 text-red-600 transition-colors hover:text-red-700"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.testSteps && (
                    <p className="mt-1 text-xs text-red-500">{errors.testSteps.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">النتائج المتوقعة</label>
                  <textarea
                    {...register('expectedResults')}
                    className="h-16 w-full rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="أدخل النتائج التي تتوقع الوصول إليها عند تنفيذ الاختبار..."
                  />
                  {errors.expectedResults && (
                    <p className="mt-1 text-xs text-red-500">{errors.expectedResults.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">المكلف بالتنفيذ</label>
                    <input
                      {...register('assignedTo')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="auditor@example.com"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium">الساعات المخططة</label>
                    <input
                      type="number"
                      {...register('plannedHours', { valueAsNumber: true })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2"
                      placeholder="8"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-bold text-gray-700 transition-colors hover:bg-gray-50"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-5 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'جارٍ الحفظ...' : 'حفظ الاختبار'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
