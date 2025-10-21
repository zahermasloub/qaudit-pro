'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertTriangle, X, User as UserIcon } from 'lucide-react';
import { useRLSPreview, PreviewUser } from '@/lib/RLSPreviewContext';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface RLSPreviewBarProps {
  /**
   * الصفحة الحالية (لتخصيص الرسائل)
   */
  pageName?: string;
}

/**
 * RLSPreviewBar Component
 * شريط معاينة RLS يظهر في أعلى الصفحة عند تفعيل Preview Mode
 *
 * @example
 * ```tsx
 * <RLSPreviewBar pageName="المستخدمين" />
 * ```
 */
export function RLSPreviewBar({ pageName = 'البيانات' }: RLSPreviewBarProps) {
  const { isPreviewMode, previewUser, enablePreview, disablePreview } = useRLSPreview();
  const [users, setUsers] = useState<User[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // جلب المستخدمين عند فتح القائمة
  useEffect(() => {
    if (showUserPicker && users.length === 0) {
      fetchUsers();
    }
  }, [showUserPicker]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.ok) {
        setUsers(data.users);
      } else {
        toast.error('فشل في جلب المستخدمين');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ أثناء جلب المستخدمين');
    } finally {
      setLoading(false);
    }
  }

  function handleSelectUser(user: User) {
    enablePreview({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    setShowUserPicker(false);
    toast.success(`تم التبديل إلى معاينة بصلاحيات: ${user.email}`);
  }

  function handleDisablePreview() {
    disablePreview();
    toast.info('تم إيقاف وضع المعاينة');
  }

  // تصفية المستخدمين حسب البحث
  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      user.name?.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <>
      {/* Preview Mode Banner */}
      {isPreviewMode && previewUser ? (
        <div
          className="
            sticky top-0 z-40
            bg-warning-50 dark:bg-warning-950
            border-b-2 border-warning-400 dark:border-warning-600
            px-6 py-3
            flex items-center justify-between gap-4
            shadow-md
          "
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900">
              <AlertTriangle className="w-5 h-5 text-warning-700 dark:text-warning-300" />
            </div>
            <div>
              <div className="text-sm font-bold text-warning-900 dark:text-warning-100">
                وضع المعاينة نشط
              </div>
              <div className="text-xs text-warning-700 dark:text-warning-300">
                تعرض {pageName} كما يراها:{' '}
                <span className="font-semibold">{previewUser.name || previewUser.email}</span> (
                {previewUser.role})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUserPicker(true)}
              className="
                px-3 py-1.5 rounded-lg
                text-xs font-medium
                bg-warning-100 dark:bg-warning-900
                text-warning-800 dark:text-warning-200
                hover:bg-warning-200 dark:hover:bg-warning-800
                transition-fast
                focus-ring
                flex items-center gap-2
              "
            >
              <UserIcon size={14} />
              <span>تغيير المستخدم</span>
            </button>
            <button
              type="button"
              onClick={handleDisablePreview}
              className="
                px-3 py-1.5 rounded-lg
                text-xs font-medium
                bg-error-600 hover:bg-error-700
                text-white
                transition-fast
                focus-ring
                flex items-center gap-2
              "
            >
              <EyeOff size={14} />
              <span>إيقاف المعاينة</span>
            </button>
          </div>
        </div>
      ) : (
        /* Enable Preview Button (when not in preview mode) */
        <div className="flex items-center justify-end gap-2 mb-4">
          <button
            type="button"
            onClick={() => setShowUserPicker(true)}
            className="
              px-4 py-2 rounded-lg
              text-sm font-medium
              bg-bg-muted hover:bg-bg-subtle
              text-text-secondary hover:text-text-primary
              border border-border-base
              transition-fast
              focus-ring
              flex items-center gap-2
            "
          >
            <Eye size={16} />
            <span>معاينة كمستخدم</span>
          </button>
        </div>
      )}

      {/* User Picker Dialog */}
      {showUserPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowUserPicker(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-picker-title"
        >
          <div
            className="
              bg-bg-elevated border-2 border-border-base rounded-2xl shadow-2xl
              w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col
              animate-in zoom-in-95 duration-200
            "
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border-base">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-50 dark:bg-brand-950">
                  <Eye className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h2 id="user-picker-title" className="text-lg font-bold text-text-primary">
                    معاينة كمستخدم
                  </h2>
                  <p className="text-sm text-text-secondary">
                    اختر مستخدم لمعاينة البيانات بصلاحياته
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowUserPicker(false)}
                className="
                  p-2 rounded-lg
                  text-text-tertiary hover:text-text-primary hover:bg-bg-muted
                  transition-fast
                  focus-ring
                "
                aria-label="إغلاق"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-border-base">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالبريد أو الاسم أو الدور..."
                className="
                  w-full px-4 py-2 rounded-lg
                  bg-bg-base border border-border-base
                  text-text-primary placeholder:text-text-tertiary
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                  transition-fast
                "
              />
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  <span className="mr-3 text-sm text-text-secondary">جارٍ التحميل...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-text-tertiary">
                    {searchQuery ? 'لم يتم العثور على مستخدمين' : 'لا يوجد مستخدمين'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className={`
                        w-full p-4 rounded-lg border-2 text-right
                        transition-fast
                        ${
                          previewUser?.id === user.id
                            ? 'border-brand-600 bg-brand-50 dark:bg-brand-950'
                            : 'border-border-base hover:border-brand-300 hover:bg-bg-subtle'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="font-medium text-text-primary">{user.email}</div>
                          {user.name && (
                            <div className="text-sm text-text-secondary mt-0.5">{user.name}</div>
                          )}
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                              {user.role}
                            </span>
                          </div>
                        </div>
                        {previewUser?.id === user.id && (
                          <div className="flex-shrink-0">
                            <Eye className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border-base bg-bg-subtle">
              <div className="flex items-start gap-2 text-xs text-text-tertiary">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <p>
                  <strong>ملاحظة:</strong> وضع المعاينة يعرض البيانات فقط كما يراها المستخدم
                  المختار. لن تتمكن من تنفيذ إجراءات بصلاحيات ذلك المستخدم.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
