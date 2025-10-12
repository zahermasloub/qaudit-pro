/**
 * Test Execution Form - نموذج تنفيذ خطوات الاختبار
 * يدعم تنفيذ مفرد ومجموعة من الخطوات مع ربط الأدلة
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { testExecutionSchema, getResultLabel, type TestExecutionFormValues } from '@/features/fieldwork/execution/test-execution.schema';
import { Button } from '@/components/ui/button';

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
  auditTestTitle = 'اختبار غير محدد',
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
      executedBy: 'auditor@example.com', // TODO: Get from auth session
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
        throw new Error(result.error || 'خطأ في تنفيذ الخطوة');
      }

      if (result.ok) {
        console.log('✅ تم تنفيذ خطوة الاختبار بنجاح:', result.run);
        onSuccess(result.run.id);
        reset();
        onOpenChange(false);

        // TODO: Add toast notification
        alert(`تم تنفيذ الخطوة ${data.stepIndex + 1} بنجاح!`);
      } else {
        throw new Error(result.error || 'فشل في حفظ التنفيذ');
      }

    } catch (error) {
      console.error('Test execution error:', error);
      setSubmitError(error instanceof Error ? error.message : 'خطأ غير معروف');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEvidenceIdsChange = (value: string) => {
    // تحويل النص المفصول بأسطر إلى مصفوفة
    const ids = value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);
    setValue('evidenceIds', ids);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            تنفيذ خطوة اختبار
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* معلومات الاختبار */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">معلومات الاختبار</h3>
            <p className="text-sm text-gray-600">
              <strong>اسم الاختبار:</strong> {auditTestTitle}
            </p>
            <p className="text-sm text-gray-600">
              <strong>معرف الاختبار:</strong> {auditTestId}
            </p>
          </div>

          {/* رقم الخطوة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              رقم الخطوة
            </label>
            <input
              {...register('stepIndex', { valueAsNumber: true })}
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {errors.stepIndex && (
              <p className="mt-1 text-sm text-red-600">{errors.stepIndex.message}</p>
            )}
          </div>

          {/* الإجراء المتخذ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الإجراء المتخذ <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('actionTaken')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب تفاصيل الإجراء الذي تم اتخاذه في هذه الخطوة..."
            />
            {errors.actionTaken && (
              <p className="mt-1 text-sm text-red-600">{errors.actionTaken.message}</p>
            )}
          </div>

          {/* النتيجة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نتيجة التنفيذ <span className="text-red-500">*</span>
            </label>
            <select
              {...register('result')}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                watchedResult === 'pass' ? 'text-green-700' :
                watchedResult === 'fail' ? 'text-red-700' :
                'text-orange-700'
              }`}
            >
              <option value="pass" className="text-green-700">✅ {getResultLabel('pass')}</option>
              <option value="fail" className="text-red-700">❌ {getResultLabel('fail')}</option>
              <option value="exception" className="text-orange-700">⚠️ {getResultLabel('exception')}</option>
            </select>
            {errors.result && (
              <p className="mt-1 text-sm text-red-600">{errors.result.message}</p>
            )}
          </div>

          {/* مرجع العينة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              مرجع العينة (اختياري)
            </label>
            <input
              {...register('sampleRef')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="مثال: SAMPLE-001"
            />
            {errors.sampleRef && (
              <p className="mt-1 text-sm text-red-600">{errors.sampleRef.message}</p>
            )}
          </div>

          {/* معرفات الأدلة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              معرفات الأدلة (اختياري)
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="معرف واحد في كل سطر..."
              onChange={(e) => handleEvidenceIdsChange(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              اكتب معرف دليل واحد في كل سطر لربطه بهذه الخطوة
            </p>
          </div>

          {/* ملاحظات */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ملاحظات إضافية (اختياري)
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أي ملاحظات أو تفاصيل إضافية..."
            />
            {errors.notes && (
              <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
            )}
          </div>

          {/* منفذ الاختبار */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              منفذ الاختبار <span className="text-red-500">*</span>
            </label>
            <input
              {...register('executedBy')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="auditor@example.com"
            />
            {errors.executedBy && (
              <p className="mt-1 text-sm text-red-600">{errors.executedBy.message}</p>
            )}
          </div>

          {/* رسالة الخطأ */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  جاري التنفيذ...
                </>
              ) : (
                'تنفيذ الخطوة'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TestExecutionForm;
