import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { pbcSchema, type PBCFormValues } from '@/features/planning/pbc/pbc.schema';

interface PBCFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  onSuccess: () => void;
}

export default function PBCForm({ open, onOpenChange, engagementId, onSuccess }: PBCFormProps) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PBCFormValues>({
    defaultValues: {
      engagementId,
      code: '',
      description: '',
      ownerId: '',
      dueDate: '',
      status: 'open',
      attachments: [],
      notes: ''
    }
  });

  async function onSubmit(data: PBCFormValues) {
    setLoading(true);
    try {
      const response = await fetch('/api/pbc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, engagementId })
      });
      
      if (response.ok) {
        reset();
        onSuccess();
      } else {
        const error = await response.json();
        console.error('PBC Error:', error);
      }
    } catch (error) {
      console.error('Submit Error:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">طلب مستندات جديد (PBC)</h3>
          <button 
            className="text-gray-500 hover:text-gray-700" 
            onClick={() => onOpenChange(false)}
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">رمز الطلب</label>
              <input
                {...register('code')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="PBC-001"
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">المسؤول</label>
              <input
                {...register('ownerId')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="owner@example.com"
              />
              {errors.ownerId && <p className="text-red-500 text-xs mt-1">{errors.ownerId.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">الوصف</label>
            <textarea
              {...register('description')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-20"
              placeholder="وصف المستندات المطلوبة"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ الاستحقاق</label>
              <input
                type="date"
                {...register('dueDate')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">الحالة</label>
              <select
                {...register('status')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-16"
              placeholder="ملاحظات إضافية (اختيارية)"
            />
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
              {loading ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
