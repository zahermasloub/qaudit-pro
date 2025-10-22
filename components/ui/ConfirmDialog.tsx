'use client';

import { AlertTriangle, Info, XCircle } from 'lucide-react';
import React from 'react';

interface ConfirmDialogProps {
  /**
   * هل الحوار مفتوح
   */
  open: boolean;

  /**
   * دالة عند الإغلاق
   */
  onClose: () => void;

  /**
   * عنوان الحوار
   */
  title: string;

  /**
   * الرسالة التوضيحية
   */
  message: string;

  /**
   * نوع الحوار (يحدد الألوان والأيقونة)
   */
  type?: 'info' | 'warning' | 'danger';

  /**
   * نص زر التأكيد
   */
  confirmLabel?: string;

  /**
   * نص زر الإلغاء
   */
  cancelLabel?: string;

  /**
   * دالة عند التأكيد
   */
  onConfirm: () => void | Promise<void>;

  /**
   * حالة التحميل
   */
  loading?: boolean;
}

/**
 * ConfirmDialog Component
 * حوار تأكيد للإجراءات الحساسة
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <ConfirmDialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   type="danger"
 *   title="حذف المستخدم"
 *   message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
 *   confirmLabel="حذف"
 *   onConfirm={async () => {
 *     await deleteUser();
 *     setOpen(false);
 *   }}
 * />
 * ```
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  message,
  type = 'info',
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);

  // Escape key to close
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !isConfirming) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, isConfirming, onClose]);

  // Lock body scroll
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
    } finally {
      setIsConfirming(false);
    }
  };

  const typeConfig = {
    info: {
      icon: Info,
      iconClass: 'text-info-500',
      bgClass: 'bg-info-50 [data-theme="dark"]:bg-info-950',
      btnClass: 'bg-info-500 hover:bg-info-600',
    },
    warning: {
      icon: AlertTriangle,
      iconClass: 'text-warning-500',
      bgClass: 'bg-warning-50 [data-theme="dark"]:bg-warning-950',
      btnClass: 'bg-warning-500 hover:bg-warning-600',
    },
    danger: {
      icon: XCircle,
      iconClass: 'text-danger-500',
      bgClass: 'bg-danger-50 [data-theme="dark"]:bg-danger-950',
      btnClass: 'bg-danger-500 hover:bg-danger-600',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;
  const isDisabled = isConfirming || loading;

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-bg-overlay transition-opacity"
        onClick={isDisabled ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="
          relative z-10
          bg-bg-elevated
          border border-border-base
          rounded-2xl
          shadow-xl
          max-w-md w-full
          p-6
          animate-in fade-in-0 zoom-in-95 duration-200
        "
      >
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full ${config.bgClass} flex items-center justify-center mb-4`}
        >
          <Icon className={config.iconClass} size={24} />
        </div>

        {/* Title */}
        <h2 id="dialog-title" className="text-xl font-semibold text-text-primary mb-2">
          {title}
        </h2>

        {/* Message */}
        <p id="dialog-description" className="text-sm text-text-secondary mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDisabled}
            className="
              px-4 py-2
              bg-bg-muted hover:bg-bg-subtle
              text-text-secondary
              rounded-lg
              font-medium text-sm
              transition-fast
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDisabled}
            className={`
              px-4 py-2
              ${config.btnClass}
              text-text-inverse
              rounded-lg
              font-medium text-sm
              transition-fast
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            `}
          >
            {(isConfirming || loading) && (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
