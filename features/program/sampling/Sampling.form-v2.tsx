import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useToast } from '@/components/ui/Toast-v2';
import {
  type SamplingFormValues,
  samplingSchema,
} from '@/features/program/sampling/sampling.schema';

interface SamplingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auditTestId: string;
  populationSize: number;
  onSuccess: () => void;
}

export default function SamplingForm({
  open,
  onOpenChange,
  auditTestId,
  populationSize,
  onSuccess,
}: SamplingFormProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<SamplingFormValues>({
    resolver: zodResolver(samplingSchema),
    defaultValues: {
      testId: auditTestId,
      populationSize,
      sampleSize: 30,
      method: 'random' as const,
      confidenceLevel: 0.95,
      precisionRate: 0.05,
      criteria: {
        minAmount: 0,
        maxAmount: undefined,
        dateFrom: '',
        dateTo: '',
        category: '',
        riskLevel: undefined,
        randomSeed: undefined,
      },
      notes: '',
    },
  });
  const method = watch('method');
  const sampleSize = watch('sampleSize');

  async function onSubmit(data: SamplingFormValues) {
    setLoading(true);
    try {
      const response = await fetch('/api/samples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        addToast({
          type: 'success',
          title: 'تم إنشاء العينة بنجاح',
          message: `تم إنشاء عينة من ${result.sampleSize} عنصر بطريقة ${getMethodLabel(result.method)}`,
        });
        reset();
        onSuccess();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'خطأ في إنشاء العينة',
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

  function getMethodLabel(method: string): string {
    switch (method) {
      case 'random':
        return 'عشوائية';
      case 'judgment':
        return 'حكمية';
      case 'monetary':
        return 'وحدة نقدية';
      default:
        return method;
    }
  }

  function calculateSampleRatio(): string {
    if (!populationSize || !sampleSize) return '0%';
    return ((sampleSize / populationSize) * 100).toFixed(1) + '%';
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-3xl p-8 max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">إنشاء عينة تدقيق</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">حجم المجتمع</label>
              <input
                type="number"
                {...register('populationSize', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">حجم العينة</label>
              <input
                type="number"
                {...register('sampleSize', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                min="1"
                max={populationSize}
              />
              {errors.sampleSize && (
                <p className="text-red-500 text-xs mt-1">{errors.sampleSize.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">نسبة العينة</label>
              <div className="w-full rounded-lg border border-gray-300 px-3 py-2 bg-gray-50 text-gray-700">
                {calculateSampleRatio()}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">طريقة الاختيار</label>
            <select
              {...register('method')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="random">اختيار عشوائي</option>
              <option value="judgment">اختيار حكمي</option>
              <option value="monetary">وحدة نقدية</option>
            </select>
            {errors.method && <p className="text-red-500 text-xs mt-1">{errors.method.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات إضافية</label>
            <textarea
              {...register('notes')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              placeholder={`ملاحظات حول اختيار العينة للطريقة ${getMethodLabel(method)}...`}
            />
            {errors.notes && <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">الحد الأدنى للمبلغ</label>
              <input
                type="number"
                {...register('criteria.minAmount', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحد الأعلى للمبلغ</label>
              <input
                type="number"
                {...register('criteria.maxAmount', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="100000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">من تاريخ</label>
              <input
                type="date"
                {...register('criteria.dateFrom')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">إلى تاريخ</label>
              <input
                type="date"
                {...register('criteria.dateTo')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">مستوى الثقة</label>
              <select
                {...register('confidenceLevel', { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value={0.9}>90%</option>
                <option value={0.95}>95%</option>
                <option value={0.99}>99%</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">مستوى المخاطر</label>
              <select
                {...register('criteria.riskLevel')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              >
                <option value="">-- اختر --</option>
                <option value="low">منخفض</option>
                <option value="medium">متوسط</option>
                <option value="high">عالي</option>
              </select>
            </div>
          </div>{' '}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">معلومات العينة</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• الطريقة: {getMethodLabel(method)}</p>
              <p>
                • حجم العينة: {sampleSize} من أصل {populationSize}
              </p>
              <p>• النسبة: {calculateSampleRatio()}</p>
              {method === 'monetary' && <p>• سيتم إنشاء hash SHA256 لضمان سلامة العينة</p>}
            </div>
          </div>
          <div className="sticky bottom-0 bg-white pt-4 flex justify-end gap-3 border-t md:col-span-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'جارٍ الإنشاء...' : 'إنشاء العينة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
