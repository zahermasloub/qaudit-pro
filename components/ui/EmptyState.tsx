'use client';

import { LucideIcon } from 'lucide-react';
import React from 'react';

interface EmptyStateProps {
  /**
   * أيقونة من lucide-react
   */
  icon?: LucideIcon;

  /**
   * العنوان الرئيسي
   */
  title: string;

  /**
   * الرسالة التوضيحية
   */
  message?: string;

  /**
   * زر الإجراء الأساسي
   */
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };

  /**
   * نوع الحالة (يحدد الألوان)
   */
  variant?: 'default' | 'error';

  className?: string;
}

/**
 * EmptyState Component
 * يُعرض عندما لا توجد بيانات أو حدث خطأ
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={Users}
 *   title="لا يوجد مستخدمون"
 *   message="ابدأ بإضافة أول مستخدم للنظام"
 *   action={{
 *     label: 'إضافة مستخدم',
 *     onClick: () => setShowDialog(true),
 *     icon: Plus
 *   }}
 * />
 * ```
 */
export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  variant = 'default',
  className = '',
}: EmptyStateProps) {
  const iconColorClass = variant === 'error'
    ? 'text-danger-500'
    : 'text-text-tertiary';

  return (
    <div
      className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className={`mb-4 ${iconColorClass}`} aria-hidden="true">
          <Icon size={64} strokeWidth={1.5} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-text-primary mb-2">
        {title}
      </h3>

      {message && (
        <p className="text-sm text-text-secondary max-w-md mb-6">
          {message}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            bg-brand-500 hover:bg-brand-600
            text-text-inverse
            rounded-lg
            font-medium text-sm
            transition-fast
            focus-ring
          "
        >
          {action.icon && <action.icon size={18} />}
          {action.label}
        </button>
      )}
    </div>
  );
}
