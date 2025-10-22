'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { userCreateSchema, type UserCreateInput } from '@/features/admin/users/user.schema';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateUserDialog({ open, onClose, onSuccess }: CreateUserDialogProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserCreateInput>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'IA_Auditor',
      locale: 'ar',
      roleIds: [],
    },
  });

  async function onSubmit(data: UserCreateInput) {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.ok) {
        toast.success('تم إنشاء المستخدم بنجاح');
        reset();
        onClose();
        onSuccess?.();
      } else {
        toast.error(result.error || 'فشل في إنشاء المستخدم');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('حدث خطأ أثناء إنشاء المستخدم');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-bg-elevated rounded-2xl shadow-xl border border-border-base">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-base">
          <h2 className="text-xl font-bold text-text-primary">إضافة مستخدم جديد</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-text-tertiary hover:bg-bg-hover transition-fast focus-ring"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">
              الاسم <span className="text-error-600">*</span>
            </label>
            <input
              id="name"
              type="text"
              {...register('name')}
              className={`
                w-full px-4 py-2 rounded-lg
                border ${errors.name ? 'border-error-600' : 'border-border-base'}
                bg-bg-base text-text-primary
                focus:outline-none focus:ring-2 focus:ring-brand-500
                transition-fast
              `}
              placeholder="أدخل اسم المستخدم"
              disabled={loading}
            />
            {errors.name && <p className="mt-1 text-sm text-error-600">{errors.name.message}</p>}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              البريد الإلكتروني <span className="text-error-600">*</span>
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`
                w-full px-4 py-2 rounded-lg
                border ${errors.email ? 'border-error-600' : 'border-border-base'}
                bg-bg-base text-text-primary
                focus:outline-none focus:ring-2 focus:ring-brand-500
                transition-fast
              `}
              placeholder="example@domain.com"
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
              كلمة المرور <span className="text-error-600">*</span>
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`
                w-full px-4 py-2 rounded-lg
                border ${errors.password ? 'border-error-600' : 'border-border-base'}
                bg-bg-base text-text-primary
                focus:outline-none focus:ring-2 focus:ring-brand-500
                transition-fast
              `}
              placeholder="أدخل كلمة مرور قوية (8 أحرف على الأقل)"
              disabled={loading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-text-primary mb-2">
              الدور الأساسي <span className="text-error-600">*</span>
            </label>
            <select
              id="role"
              {...register('role')}
              className={`
                w-full px-4 py-2 rounded-lg
                border ${errors.role ? 'border-error-600' : 'border-border-base'}
                bg-bg-base text-text-primary
                focus:outline-none focus:ring-2 focus:ring-brand-500
                transition-fast
              `}
              disabled={loading}
            >
              <option value="">اختر الدور</option>
              <option value="Admin">مدير (Admin)</option>
              <option value="IA_Lead">قائد التدقيق (IA Lead)</option>
              <option value="IA_Auditor">مدقق (IA Auditor)</option>
              <option value="User">مستخدم (User)</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-error-600">{errors.role.message}</p>}
          </div>

          {/* Locale Field */}
          <div>
            <label htmlFor="locale" className="block text-sm font-medium text-text-primary mb-2">
              اللغة المفضلة <span className="text-error-600">*</span>
            </label>
            <select
              id="locale"
              {...register('locale')}
              className={`
                w-full px-4 py-2 rounded-lg
                border ${errors.locale ? 'border-error-600' : 'border-border-base'}
                bg-bg-base text-text-primary
                focus:outline-none focus:ring-2 focus:ring-brand-500
                transition-fast
              `}
              disabled={loading}
            >
              <option value="ar">العربية</option>
              <option value="en">الإنجليزية</option>
            </select>
            {errors.locale && (
              <p className="mt-1 text-sm text-error-600">{errors.locale.message}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-base">
            <button
              type="button"
              onClick={onClose}
              className="
                px-4 py-2 rounded-lg
                bg-bg-muted text-text-secondary
                hover:bg-bg-hover transition-fast
                focus-ring
              "
              disabled={loading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="
                px-4 py-2 rounded-lg
                bg-brand-600 text-white font-medium
                hover:bg-brand-700 transition-fast
                focus-ring
                flex items-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              disabled={loading}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{loading ? 'جارٍ الإنشاء...' : 'إنشاء المستخدم'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
