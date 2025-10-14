'use client';

import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { type AnnualPlanFormValues, annualPlanSchema, sumAlloc } from './annual-plan.schema';

type OrgOption = { id: string; name: string; depts?: OrgOption[] };

interface AnnualPlanFormProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  defaultYear?: number;
  orgOptions?: OrgOption[];
  onSuccess?: (id: string) => void;
}

export default function AnnualPlanForm({
  open,
  onOpenChange,
  defaultYear,
  orgOptions = [],
  onSuccess,
}: AnnualPlanFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<AnnualPlanFormValues>({
    resolver: zodResolver(annualPlanSchema),
    defaultValues: {
      title: '',
      fiscalYear: defaultYear ?? new Date().getFullYear() + 1,
      version: '1.0',
      status: 'draft',
      introduction: '',
      orgUnitId: undefined,
      departmentId: undefined,
      totalAvailableHours: 0,
      plannedTaskHours: 0,
      advisoryHours: 0,
      emergencyHours: 0,
      followUpHours: 0,
      trainingHours: 0,
      administrativeHours: 0,
    },
  });

  const orgId = form.watch('orgUnitId');
  const selectedOrg = useMemo(() => orgOptions.find(o => o.id === orgId), [orgId, orgOptions]);

  const watchedValues = form.watch();
  const remaining = useMemo(() => {
    return watchedValues.totalAvailableHours - sumAlloc(watchedValues);
  }, [watchedValues]);

  const allocation = sumAlloc(watchedValues);

  async function onSubmit(v: AnnualPlanFormValues) {
    setIsLoading(true);
    try {
      const r = await fetch('/api/annual-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(v),
      });
      const data = await r.json();

      if (!r.ok || !data.ok) {
        throw new Error(data?.error ?? 'Failed to save plan');
      }

      // Show success message - you can replace with toast
      alert('تم إنشاء الخطة السنوية بنجاح');
      onSuccess?.(data.id);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      alert(`فشل حفظ الخطة: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">إنشاء الخطة السنوية</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* القسم (1): المعلومات الأساسية */}
          <section className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">المعلومات الأساسية</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الخطة</label>
                <input
                  {...form.register('title')}
                  placeholder="الخطة السنوية للتدقيق الداخلي لعام 2026"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {form.formState.errors.title && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    السنة المالية
                  </label>
                  <input
                    type="number"
                    {...form.register('fiscalYear', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الإصدار</label>
                  <input
                    {...form.register('version')}
                    placeholder="1.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">حالة الخطة</label>
                <select
                  {...form.register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">مسودة</option>
                  <option value="under_review">قيد المراجعة</option>
                  <option value="approved">معتمدة</option>
                  <option value="cancelled">ملغاة</option>
                  <option value="completed">مكتملة</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الإدارة</label>
                  <select
                    {...form.register('orgUnitId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">—</option>
                    {orgOptions.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
                  <select
                    {...form.register('departmentId')}
                    disabled={!selectedOrg}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">—</option>
                    {selectedOrg?.depts?.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                مقدمة / ملخص تنفيذي
              </label>
              <textarea
                rows={4}
                {...form.register('introduction')}
                placeholder="منهجية التدقيق المبني على المخاطر…"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </section>

          {/* القسم (2): الموارد والتوزيع */}
          <section className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 border-b pb-2">
              تحديد الموارد وتوزيعها
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  إجمالي الساعات المتاحة
                </label>
                <input
                  type="number"
                  {...form.register('totalAvailableHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="rounded-lg border border-gray-200 p-3 bg-slate-50">
                <div className="text-xs text-slate-500">الإجمالي المُخصص</div>
                <div className="text-lg font-semibold">{allocation}</div>
              </div>

              <div
                className={`rounded-lg border p-3 ${
                  remaining < 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <div className="text-xs">{remaining < 0 ? 'تجاوز الساعات' : 'المتبقي'}</div>
                <div className="text-lg font-semibold">{remaining}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مهام التدقيق المخطط لها
                </label>
                <input
                  type="number"
                  {...form.register('plannedTaskHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مهام استشارية
                </label>
                <input
                  type="number"
                  {...form.register('advisoryHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  مهام خاصة / طارئة
                </label>
                <input
                  type="number"
                  {...form.register('emergencyHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  متابعة توصيات التدقيق
                </label>
                <input
                  type="number"
                  {...form.register('followUpHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  التدريب والتطوير
                </label>
                <input
                  type="number"
                  {...form.register('trainingHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  الشؤون الإدارية
                </label>
                <input
                  type="number"
                  {...form.register('administrativeHours', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </section>

          {/* الأزرار */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isLoading || remaining < 0}
              className="px-3 py-1.5 text-sm rounded-md border font-medium transition-colors whitespace-nowrap bg-blue-600 text-white border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
