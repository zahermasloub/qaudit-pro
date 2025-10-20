'use client';

import React, { useMemo, useState } from 'react';
import { Tab } from '@/components/ui/Tab-v2';
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
  const [tab, setTab] = useState<'meta' | 'hours'>('meta');

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
      alert('تم حفظ الخطة السنوية بنجاح');
      onSuccess?.(data.id);
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      alert(`حدث خطأ أثناء الحفظ: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl w-full min-h-[60vh] max-h-[90vh] border-[1px] p-0 m-0">
          <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
            <h3 className="text-xl font-semibold">إنشاء الخطة السنوية</h3>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>
          {/* تبويبات */}
          <div className="flex border-b bg-slate-50 px-2 sm:px-6">
            <button
              className={`px-4 py-2 font-medium transition-colors ${tab === 'meta' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setTab('meta')}
              type="button"
            >
              البيانات التعريفية
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${tab === 'hours' ? 'border-b-2 border-blue-600 text-blue-700' : 'text-gray-600 hover:text-blue-600'}`}
              onClick={() => setTab('hours')}
              type="button"
            >
              موازنة الساعات
            </button>
          </div>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-6 py-3 sm:py-4">
              {tab === 'meta' && (
                <section className="space-y-3">
                  <h4 className="border-b pb-2 text-lg font-semibold text-gray-900">البيانات التعريفية</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">عنوان الخطة</label>
                      <input
                        {...form.register('title')}
                        placeholder="الخطة السنوية للإدارة العامة لعام 2026"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {form.formState.errors.title && (
                        <p className="mt-1 text-sm text-red-600">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">السنة المالية</label>
                        <input
                          type="number"
                          {...form.register('fiscalYear', { valueAsNumber: true })}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">الإصدار</label>
                        <input
                          {...form.register('version')}
                          placeholder="1.0"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">حالة الخطة</label>
                      <select
                        {...form.register('status')}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">مسودة</option>
                        <option value="under_review">قيد المراجعة</option>
                        <option value="approved">معتمدة</option>
                        <option value="cancelled">ملغاة</option>
                        <option value="completed">مغلقة</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">المنشأة</label>
                        <select
                          {...form.register('orgUnitId')}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">-</option>
                          {orgOptions.map(o => (
                            <option key={o.id} value={o.id}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">القسم</label>
                        <select
                          {...form.register('departmentId')}
                          disabled={!selectedOrg}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                        >
                          <option value="">-</option>
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
                    <label className="mb-1 block text-sm font-medium text-gray-700">ملخص / مقدمة الخطة</label>
                    <textarea
                      rows={4}
                      {...form.register('introduction')}
                      placeholder="أدخل نبذة تعريفية قصيرة عن الخطة."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </section>
              )}
              {tab === 'hours' && (
                <section className="space-y-3">
                  <h4 className="border-b pb-2 text-lg font-semibold text-gray-900">موازنة الساعات والخطط</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">إجمالي الساعات المتاحة</label>
                      <input
                        type="number"
                        {...form.register('totalAvailableHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-slate-50 p-3">
                      <div className="text-xs text-slate-500">إجمالي الساعات المخططة</div>
                      <div className="text-lg font-semibold">{allocation}</div>
                    </div>
                    <div
                      className={`rounded-lg border p-3 ${
                        remaining < 0
                          ? 'border-rose-200 bg-rose-50 text-rose-700'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      <div className="text-xs">{remaining < 0 ? 'عجز في الساعات' : 'ساعات متبقية'}</div>
                      <div className="text-lg font-semibold">{remaining}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات المهام المخططة</label>
                      <input
                        type="number"
                        {...form.register('plannedTaskHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات الاستشارات</label>
                      <input
                        type="number"
                        {...form.register('advisoryHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات طوارئ / احتياط</label>
                      <input
                        type="number"
                        {...form.register('emergencyHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات المتابعة اللاحقة</label>
                      <input
                        type="number"
                        {...form.register('followUpHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات التدريب</label>
                      <input
                        type="number"
                        {...form.register('trainingHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">ساعات الأعمال الإدارية</label>
                      <input
                        type="number"
                        {...form.register('administrativeHours', { valueAsNumber: true })}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </section>
              )}
            </div>
            <div className="sticky bottom-0 flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                disabled={isLoading}
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isLoading || remaining < 0}
                className="whitespace-nowrap rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'جارٍ الحفظ...' : 'حفظ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
