/**
 * Test Execution Form - نموذج تنفيذ اختبار تدقيقي
 * يجمع تفاصيل خطوات التنفيذ ونتائجها لدعم تقارير الميدان.
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  getResultLabel,
  type TestExecutionFormValues,
  testExecutionSchema,
} from '@/features/fieldwork/execution/test-execution.schema';

interface TestExecutionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  auditTestId: string;
  auditTestTitle?: string;
  defaultStepIndex?: number;
  onSuccess: (runId: string) => void;
}

const TestExecutionForm: React.FC<TestExecutionFormProps> = ({
  open,
  onOpenChange,
  engagementId,
  auditTestId,
  auditTestTitle = 'اختبار بدون عنوان',
  defaultStepIndex = 0,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TestExecutionFormValues>({
    resolver: zodResolver(testExecutionSchema),
    defaultValues: {
      engagementId,
      auditTestId,
      stepIndex: defaultStepIndex,
      actionTaken: '',
      result: 'pass',
      notes: '',
      sampleRef: '',
      evidenceIds: [],
      executedBy: 'auditor@example.com', // TODO: استبدالها بمستخدم الجلسة
    },
  });

  const watchedResult = watch('result');

  const onSubmit = async (data: TestExecutionFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/fieldwork/test-runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'تعذر حفظ نتائج التنفيذ');
      }

      if (result.ok) {
        onSuccess(result.run.id);
        reset();
        onOpenChange(false);
        alert(`تم تسجيل نتيجة الخطوة ${data.stepIndex + 1} بنجاح!`);
      } else {
        throw new Error(result.error || 'فشل غير متوقع أثناء التنفيذ');
      }
    } catch (error) {
      console.error('Test execution error:', error);
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ غير معروف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvidenceIdsChange = (value: string) => {
    const ids = value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    setValue('evidenceIds', ids);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" dir="rtl">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-2xl">
        <div className="flex max-h-[88vh] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">تسجيل تنفيذ اختبار</h2>
              <p className="text-sm text-gray-500">الاختبار: {auditTestTitle}</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="إغلاق"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-6 py-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  رقم الخطوة <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('stepIndex', { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.stepIndex && (
                  <p className="mt-1 text-sm text-red-600">{errors.stepIndex.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الإجراء المتخذ <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register('actionTaken')}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل وصفًا مختصرًا لما تم تنفيذه أثناء هذه الخطوة..."
                />
                {errors.actionTaken && (
                  <p className="mt-1 text-sm text-red-600">{errors.actionTaken.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  نتيجة التنفيذ <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('result')}
                  className={`w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    watchedResult === 'pass'
                      ? 'text-green-700'
                      : watchedResult === 'fail'
                        ? 'text-red-700'
                        : 'text-orange-700'
                  }`}
                >
                  <option value="pass" className="text-green-700">
                    ✓ {getResultLabel('pass')}
                  </option>
                  <option value="fail" className="text-red-700">
                    ✕ {getResultLabel('fail')}
                  </option>
                  <option value="exception" className="text-orange-700">
                    ! {getResultLabel('exception')}
                  </option>
                </select>
                {errors.result && (
                  <p className="mt-1 text-sm text-red-600">{errors.result.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  مرجع العينة (اختياري)
                </label>
                <input
                  {...register('sampleRef')}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: SAMPLE-001"
                />
                {errors.sampleRef && (
                  <p className="mt-1 text-sm text-red-600">{errors.sampleRef.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  المرفقات الداعمة (اختياري)
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل معرف كل دليل في سطر مستقل..."
                  onChange={e => handleEvidenceIdsChange(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">
                  مثال: إذا كان لديك ثلاثة أدلة، أدرج كل معرف في سطر منفصل.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  الملاحظات العامة (اختياري)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أضف أي ملاحظات أو معلومات إضافية تتعلق بالخطوة المنفذة..."
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  منفذ الاختبار <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('executedBy')}
                  type="email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="auditor@example.com"
                />
                {errors.executedBy && (
                  <p className="mt-1 text-sm text-red-600">{errors.executedBy.message}</p>
                )}
              </div>

              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t bg-white px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    جارٍ الحفظ...
                  </>
                ) : (
                  'حفظ التنفيذ'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TestExecutionForm;
