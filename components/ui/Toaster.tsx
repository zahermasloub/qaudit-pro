'use client';

import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Toaster component for QAudit Pro
 * Provides RTL-aware toast notifications with dark mode support
 *
 * Usage:
 * ```tsx
 * import { toast } from 'sonner';
 *
 * toast.success('تم حفظ التغييرات');
 * toast.error('حدث خطأ');
 * toast.info('معلومة مهمة');
 * toast.warning('تحذير');
 * ```
 */
export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      dir="rtl"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-bg-elevated group-[.toaster]:text-text-primary group-[.toaster]:border-border-base group-[.toaster]:shadow-card group-[.toaster]:rounded-xl',
          description: 'group-[.toast]:text-text-secondary text-sm',
          actionButton:
            'group-[.toast]:bg-brand-500 group-[.toast]:text-text-inverse group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-bg-muted group-[.toast]:text-text-secondary group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm',
          success: 'group-[.toast]:!bg-success-50 group-[.toast]:!border-success-200 [data-theme="dark"] group-[.toast]:!bg-success-950 [data-theme="dark"] group-[.toast]:!border-success-800',
          error: 'group-[.toast]:!bg-danger-50 group-[.toast]:!border-danger-200 [data-theme="dark"] group-[.toast]:!bg-danger-950 [data-theme="dark"] group-[.toast]:!border-danger-800',
          warning: 'group-[.toast]:!bg-warning-50 group-[.toast]:!border-warning-200 [data-theme="dark"] group-[.toast]:!bg-warning-950 [data-theme="dark"] group-[.toast]:!border-warning-800',
          info: 'group-[.toast]:!bg-info-50 group-[.toast]:!border-info-200 [data-theme="dark"] group-[.toast]:!bg-info-950 [data-theme="dark"] group-[.toast]:!border-info-800',
        },
        duration: 4000,
      }}
      {...props}
    />
  );
};
