'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string | null;
}

interface RoleAssignDialogProps {
  /**
   * حالة الحوار (مفتوح/مغلق)
   */
  open: boolean;

  /**
   * دالة إغلاق الحوار
   */
  onClose: () => void;

  /**
   * دالة التأكيد مع الدور المختار
   */
  onConfirm: (roleId: string) => void;

  /**
   * عدد المستخدمين المحددين
   */
  userCount: number;

  /**
   * حالة التحميل
   */
  loading?: boolean;
}

/**
 * RoleAssignDialog Component
 * حوار اختيار دور لتعيينه لعدة مستخدمين
 *
 * @example
 * ```tsx
 * <RoleAssignDialog
 *   open={dialogOpen}
 *   onClose={() => setDialogOpen(false)}
 *   onConfirm={(roleId) => assignRoleToUsers(roleId)}
 *   userCount={5}
 * />
 * ```
 */
export function RoleAssignDialog({
  open,
  onClose,
  onConfirm,
  userCount,
  loading = false,
}: RoleAssignDialogProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [fetchingRoles, setFetchingRoles] = useState(false);

  // جلب الأدوار عند فتح الحوار
  useEffect(() => {
    if (open) {
      fetchRoles();
    }
  }, [open]);

  async function fetchRoles() {
    try {
      setFetchingRoles(true);
      const response = await fetch('/api/admin/roles');
      const data = await response.json();

      if (data.ok) {
        setRoles(data.roles);
      } else {
        toast.error('فشل في جلب الأدوار');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('حدث خطأ أثناء جلب الأدوار');
    } finally {
      setFetchingRoles(false);
    }
  }

  function handleConfirm() {
    if (!selectedRoleId) {
      toast.error('يرجى اختيار دور');
      return;
    }
    onConfirm(selectedRoleId);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-assign-title"
    >
      <div
        className="
          bg-bg-elevated border-2 border-border-base rounded-2xl shadow-2xl
          w-full max-w-md mx-4
          animate-in zoom-in-95 duration-200
        "
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-base">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950">
              <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h2 id="role-assign-title" className="text-lg font-bold text-text-primary">
                تعيين دور جماعي
              </h2>
              <p className="text-sm text-text-secondary">اختر دور لتعيينه لـ {userCount} مستخدم</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              p-2 rounded-lg
              text-text-tertiary hover:text-text-primary hover:bg-bg-muted
              transition-fast
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {fetchingRoles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-brand-600" />
              <span className="mr-3 text-sm text-text-secondary">جارٍ تحميل الأدوار...</span>
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-text-tertiary">لا توجد أدوار متاحة</p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary mb-2">اختر الدور</label>
              {roles.map(role => (
                <label
                  key={role.id}
                  className={`
                    flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer
                    transition-fast
                    ${
                      selectedRoleId === role.id
                        ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
                        : 'border-border-base hover:border-brand-300 hover:bg-bg-subtle'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRoleId === role.id}
                    onChange={e => setSelectedRoleId(e.target.value)}
                    className="
                      mt-0.5 w-4 h-4
                      text-brand-600
                      focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                      cursor-pointer
                    "
                  />
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{role.name}</div>
                    {role.description && (
                      <div className="text-sm text-text-secondary mt-1">{role.description}</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border-base bg-bg-subtle">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg
              text-sm font-medium text-text-secondary
              hover:bg-bg-muted
              transition-fast
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || !selectedRoleId || fetchingRoles}
            className="
              px-4 py-2 rounded-lg
              text-sm font-medium text-white
              bg-brand-600 hover:bg-brand-700
              transition-fast
              focus-ring
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>جارٍ التعيين...</span>
              </>
            ) : (
              <span>تعيين الدور</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
