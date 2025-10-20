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
  const [tab, setTab] = useState<'basic' | 'steps' | 'extra'>('basic');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl w-full min-h-[60vh] max-h-[90vh]">
          <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
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
          <div className="flex border-b bg-slate-50 px-2 sm:px-6">
            <button
              className={`px-4 py-2 font-medium transition-colors ${tab === 'basic' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setTab('basic')}
              type="button"
            >
              بيانات أساسية
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${tab === 'steps' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setTab('steps')}
              type="button"
            >
              خطوات الاختبار
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${tab === 'extra' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setTab('extra')}
              type="button"
            >
              تفاصيل إضافية
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-6 py-3 sm:py-4">
              {tab === 'basic' && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="grid grid-cols-1 gap-3 md:col-span-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">كود الاختبار</label>
                      <input
                        {...register('code')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="TEST-001"
                      />
                      {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">الحالة</label>
                      <select
                        {...register('status')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                      className="h-20 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="وضح الهدف من هذا الاختبار والإجراءات التي سيغطيها..."
                    />
                    {errors.objective && (
                      <p className="mt-1 text-xs text-red-500">{errors.objective.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">معرّف الرقابة</label>
                      <input
                        {...register('controlId')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="CTL-001 (اختياري)"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">معرّف الخطر</label>
                      <input
                        {...register('riskId')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="RISK-001 (اختياري)"
                      />
                    </div>
                  </div>
                </div>
              )}
              {tab === 'steps' && (
                <>
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
                          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
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
                </>
              )}
              {tab === 'extra' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium">النتائج المتوقعة</label>
                    <textarea
                      {...register('expectedResults')}
                      className="h-16 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      placeholder="أدخل النتائج التي تتوقع الوصول إليها عند تنفيذ الاختبار..."
                    />
                    {errors.expectedResults && (
                      <p className="mt-1 text-xs text-red-500">{errors.expectedResults.message}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:col-span-2 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium">المكلف بالتنفيذ</label>
                      <input
                        {...register('assignedTo')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="auditor@example.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">الساعات المخططة</label>
                      <input
                        type="number"
                        {...register('plannedHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="8"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="sticky bottom-0 flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium transition-colors hover:bg-gray-50"
                disabled={loading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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
