'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input-v2';

import { type EngagementFormValues, engagementSchema } from './engagement.schema';

interface EngagementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EngagementForm({ open, onOpenChange, onSuccess }: EngagementFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState({
    scope: [] as string[],
    criteria: [] as string[],
    constraints: [] as string[],
    auditeeUnits: [] as string[],
    stakeholders: [] as string[],
  });

  const form = useForm<EngagementFormValues>({
    resolver: zodResolver(engagementSchema),
    defaultValues: {
      code: '',
      title: '',
      objective: '',
      scope: [],
      criteria: [],
      constraints: [],
      auditeeUnits: [],
      stakeholders: [],
      startDate: '',
      endDate: '',
      budgetHours: 0,
      independenceDisclosureUrl: '',
      createdBy: 'user@example.com', // Default for now
    },
  });

  const addTag = (field: keyof typeof tags, value: string) => {
    if (value.trim() && !tags[field].includes(value.trim())) {
      const newTags = [...tags[field], value.trim()];
      setTags(prev => ({ ...prev, [field]: newTags }));
      form.setValue(field, newTags);
    }
  };

  const removeTag = (field: keyof typeof tags, index: number) => {
    const newTags = tags[field].filter((_, i) => i !== index);
    setTags(prev => ({ ...prev, [field]: newTags }));
    form.setValue(field, newTags);
  };

  const onSubmit = async (values: EngagementFormValues) => {
    setIsSubmitting(true);
    try {
      // Validate date range
      if (new Date(values.startDate) >= new Date(values.endDate)) {
        form.setError('endDate', { message: 'تاريخ النهاية يجب أن يكون بعد تاريخ البداية' });
        return;
      }

      const response = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        console.log('✅ تم حفظ المهمة بنجاح');
        onSuccess();
        onOpenChange(false);
        form.reset();
        setTags({
          scope: [],
          criteria: [],
          constraints: [],
          auditeeUnits: [],
          stakeholders: [],
        });
      } else {
        const error = await response.json();
        console.error('❌ خطأ في حفظ المهمة:', error.error);
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl bg-white rounded-2xl shadow-xl border border-gray-200 min-h-[40vh] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
          <h2 className="text-xl font-semibold">إنشاء مهمة تدقيق جديدة</h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

  <form onSubmit={form.handleSubmit(onSubmit)} className="px-2 sm:px-6 py-4 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">كود المهمة</label>
              <Input {...form.register('code')} placeholder="ENG-2024-001" />
              {form.formState.errors.code && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">عنوان المهمة</label>
              <Input {...form.register('title')} placeholder="تدقيق العمليات المالية" />
              {form.formState.errors.title && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-sm font-medium mb-1">هدف المهمة</label>
            <textarea
              {...form.register('objective')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              placeholder="تقييم فعالية الضوابط الداخلية للعمليات المالية..."
            />
            {form.formState.errors.objective && (
              <p className="text-red-600 text-sm mt-1">{form.formState.errors.objective.message}</p>
            )}
          </div>

          {/* Tags Fields */}
          {[
            { key: 'scope', label: 'النطاق', placeholder: 'إضافة نطاق جديد' },
            { key: 'criteria', label: 'المعايير', placeholder: 'إضافة معيار جديد' },
            { key: 'constraints', label: 'القيود', placeholder: 'إضافة قيد جديد' },
            { key: 'auditeeUnits', label: 'الوحدات المُدققة', placeholder: 'إضافة وحدة جديدة' },
            { key: 'stakeholders', label: 'أصحاب المصلحة', placeholder: 'إضافة صاحب مصلحة جديد' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder={placeholder}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(key as keyof typeof tags, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={e => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addTag(key as keyof typeof tags, input.value);
                    input.value = '';
                  }}
                >
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags[key as keyof typeof tags].map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(key as keyof typeof tags, index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              {form.formState.errors[key as keyof EngagementFormValues] && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors[key as keyof EngagementFormValues]?.message}
                </p>
              )}
            </div>
          ))}

          {/* Dates and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">تاريخ البداية</label>
              <Input type="date" {...form.register('startDate')} />
              {form.formState.errors.startDate && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">تاريخ النهاية</label>
              <Input type="date" {...form.register('endDate')} />
              {form.formState.errors.endDate && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">ساعات الميزانية</label>
              <Input
                type="number"
                {...form.register('budgetHours', { valueAsNumber: true })}
                placeholder="160"
              />
              {form.formState.errors.budgetHours && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.budgetHours.message}
                </p>
              )}
            </div>
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                رابط إفصاح الاستقلالية (اختياري)
              </label>
              <Input {...form.register('independenceDisclosureUrl')} placeholder="https://..." />
              {form.formState.errors.independenceDisclosureUrl && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.independenceDisclosureUrl.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">البريد الإلكتروني للمنشئ</label>
              <Input {...form.register('createdBy')} placeholder="user@company.com" />
              {form.formState.errors.createdBy && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.createdBy.message}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4 mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ المهمة'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
