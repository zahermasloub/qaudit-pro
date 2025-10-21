import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useToast } from '@/components/ui/Toast-v2';
import { type PBCFormValues } from '@/features/planning/pbc/pbc.schema';

interface PBCFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  onSuccess: () => void;
}

export default function PBCForm({ open, onOpenChange, engagementId, onSuccess }: PBCFormProps) {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PBCFormValues>({
    defaultValues: {
      engagementId,
      code: '',
      description: '',
      ownerId: '',
      dueDate: '',
      status: 'open',
      attachments: [],
      notes: '',
    },
  });

  async function onSubmit(data: PBCFormValues) {
    setLoading(true);
    try {
      const response = await fetch('/api/pbc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, engagementId }),
      });

      if (response.ok) {
        const result = await response.json();
        addToast({
          type: 'success',
          title: 'تم إنشاء PBC بنجاح',
          message: `تم حفظ طلب المستندات: ${data.code}`,
        });
        reset();
        onSuccess();
      } else {
        const error = await response.json();
        addToast({
          type: 'error',
          title: 'خطأ في حفظ PBC',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 min-h-[40vh] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">طلب مستندات جديد (PBC)</h3>
          <button
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            onClick={() => onOpenChange(false)}
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">رمز الطلب</label>
              <input
                {...register('code')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="PBC-001"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">المسؤول</label>
              <input
                {...register('ownerId')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                placeholder="owner@example.com"
              />
              {errors.ownerId && (
                <p className="text-red-500 text-xs mt-1">{errors.ownerId.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              {...register('description')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 h-20 text-sm"
              placeholder="وصف المستندات المطلوبة"
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {errors.dueDate && (
                <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                {...register('status')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="open">مفتوح</option>
                <option value="partial">جزئي</option>
                <option value="complete">مكتمل</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ملاحظات</label>
            <textarea
              {...register('notes')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 h-16 text-sm"
              placeholder="ملاحظات إضافية (اختيارية)"
            />
          </div>

          <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4 mt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium transition-colors hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
