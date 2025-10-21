'use client';

import React from 'react';
import { X, LucideIcon } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  disabled?: boolean;
}

interface BulkActionsBarProps {
  /**
   * عدد الصفوف المحددة
   */
  selectedCount: number;

  /**
   * الإجراءات المتاحة
   */
  actions: BulkAction[];

  /**
   * دالة إلغاء التحديد
   */
  onClearSelection: () => void;

  /**
   * هل يعرض progress indicator
   */
  loading?: boolean;

  /**
   * رسالة التحميل
   */
  loadingMessage?: string;
}

/**
 * BulkActionsBar Component
 * شريط الإجراءات الجماعية الذي يظهر عند تحديد صفوف في الجدول
 *
 * @example
 * ```tsx
 * const bulkActions: BulkAction[] = [
 *   {
 *     id: 'delete',
 *     label: 'حذف',
 *     icon: Trash2,
 *     onClick: handleBulkDelete,
 *     variant: 'danger',
 *   },
 *   {
 *     id: 'export',
 *     label: 'تصدير',
 *     icon: Download,
 *     onClick: handleExport,
 *   },
 * ];
 *
 * <BulkActionsBar
 *   selectedCount={5}
 *   actions={bulkActions}
 *   onClearSelection={() => setSelection({})}
 * />
 * ```
 */
export function BulkActionsBar({
  selectedCount,
  actions,
  onClearSelection,
  loading = false,
  loadingMessage = 'جارٍ المعالجة...',
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className="
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        bg-bg-elevated border-2 border-border-base rounded-xl shadow-2xl
        px-6 py-4
        flex items-center gap-4
        animate-in slide-in-from-bottom-4 duration-300
      "
      role="toolbar"
      aria-label="إجراءات جماعية"
    >
      {/* Selected Count */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 dark:bg-brand-950 rounded-lg">
        <span className="text-sm font-semibold text-brand-700 dark:text-brand-300">
          {selectedCount}
        </span>
        <span className="text-sm text-brand-600 dark:text-brand-400">محدد</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-border-base" />

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center gap-3 px-4">
          <div className="w-5 h-5 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium text-text-secondary">{loadingMessage}</span>
        </div>
      ) : (
        <>
          {/* Actions */}
          <div className="flex items-center gap-2">
            {actions.map(action => {
              const Icon = action.icon;
              const variantStyles = {
                default: 'bg-bg-muted hover:bg-bg-subtle text-text-primary',
                danger:
                  'bg-error-50 hover:bg-error-100 text-error-700 dark:bg-error-950 dark:hover:bg-error-900 dark:text-error-300',
                success:
                  'bg-success-50 hover:bg-success-100 text-success-700 dark:bg-success-950 dark:hover:bg-success-900 dark:text-success-300',
              };

              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`
                    px-4 py-2 rounded-lg
                    text-sm font-medium
                    transition-fast
                    focus-ring
                    disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center gap-2
                    ${variantStyles[action.variant || 'default']}
                  `}
                  aria-label={action.label}
                >
                  <Icon size={16} />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="w-px h-8 bg-border-base" />
        </>
      )}

      {/* Clear Selection */}
      <button
        type="button"
        onClick={onClearSelection}
        disabled={loading}
        className="
          p-2 rounded-lg
          text-text-tertiary hover:text-text-primary hover:bg-bg-muted
          transition-fast
          focus-ring
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="إلغاء التحديد"
      >
        <X size={18} />
      </button>
    </div>
  );
}
