'use client';

import { Search, X, ArrowRight, Zap, Users, Shield, Settings as SettingsIcon, FileText, Database } from 'lucide-react';
import React, { useEffect, useState, useCallback } from 'react';

interface CommandAction {
  id: string;
  title: string;
  description?: string;
  icon?: React.ElementType;
  keywords: string[];
  onSelect: () => void;
  category: 'navigation' | 'actions' | 'admin';
}

interface CommandPaletteProps {
  /**
   * Commands/Actions available
   */
  actions: CommandAction[];

  /**
   * هل الـ palette مفتوح
   */
  open: boolean;

  /**
   * دالة عند الإغلاق
   */
  onClose: () => void;
}

/**
 * CommandPalette Component
 * لوحة أوامر سريعة للتنقل والإجراءات (Cmd+K / Ctrl+K)
 *
 * @example
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * useEffect(() => {
 *   const handleKeyDown = (e: KeyboardEvent) => {
 *     if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
 *       e.preventDefault();
 *       setOpen(true);
 *     }
 *   };
 *   window.addEventListener('keydown', handleKeyDown);
 *   return () => window.removeEventListener('keydown', handleKeyDown);
 * }, []);
 *
 * <CommandPalette
 *   actions={actions}
 *   open={open}
 *   onClose={() => setOpen(false)}
 * />
 * ```
 */
export function CommandPalette({ actions, open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // تصفية الأوامر حسب البحث
  const filteredActions = actions.filter((action) => {
    const searchLower = search.toLowerCase();
    return (
      action.title.toLowerCase().includes(searchLower) ||
      action.description?.toLowerCase().includes(searchLower) ||
      action.keywords.some((keyword) => keyword.toLowerCase().includes(searchLower))
    );
  });

  // إعادة تعيين الفهرس عند تغيير البحث
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // إعادة تعيين البحث عند الفتح
  useEffect(() => {
    if (open) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [open]);

  // التعامل مع لوحة المفاتيح
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? filteredActions.length - 1 : prev - 1
        );
      } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredActions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filteredActions, selectedIndex, onClose]
  );

  // تنفيذ الأمر
  const handleSelect = (action: CommandAction) => {
    action.onSelect();
    onClose();
  };

  // تجميع الأوامر حسب الفئة
  const categorizedActions = {
    navigation: filteredActions.filter((a) => a.category === 'navigation'),
    actions: filteredActions.filter((a) => a.category === 'actions'),
    admin: filteredActions.filter((a) => a.category === 'admin'),
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Command Palette */}
      <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-8">
        <div
          className="
            w-full max-w-2xl mt-20
            bg-bg-elevated rounded-xl
            border border-border-base
            shadow-2xl
            animate-in fade-in slide-in-from-top-4
            duration-200
          "
          role="dialog"
          aria-modal="true"
          aria-label="لوحة الأوامر"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-base">
            <Search size={20} className="text-text-tertiary flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="ابحث عن صفحة أو إجراء..."
              autoFocus
              className="
                flex-1 bg-transparent
                text-text-primary placeholder:text-text-tertiary
                outline-none text-base
              "
            />
            <button
              type="button"
              onClick={onClose}
              className="
                p-1 rounded-md
                text-text-tertiary hover:text-text-primary hover:bg-bg-muted
                transition-fast
              "
              aria-label="إغلاق"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {filteredActions.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-text-tertiary text-sm">
                  لم يتم العثور على نتائج
                </p>
              </div>
            ) : (
              <>
                {/* Navigation Category */}
                {categorizedActions.navigation.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
                      التنقل
                    </div>
                    {categorizedActions.navigation.map((action, index) => {
                      const Icon = action.icon || ArrowRight;
                      const isSelected =
                        filteredActions.indexOf(action) === selectedIndex;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() =>
                            setSelectedIndex(filteredActions.indexOf(action))
                          }
                          className={`
                            w-full px-3 py-2.5 rounded-lg
                            flex items-center gap-3
                            text-right transition-fast
                            ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-900/20'
                                : 'hover:bg-bg-muted'
                            }
                          `}
                        >
                          <Icon
                            size={18}
                            className={
                              isSelected
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-text-tertiary'
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                isSelected
                                  ? 'text-brand-700 dark:text-brand-300'
                                  : 'text-text-primary'
                              }`}
                            >
                              {action.title}
                            </div>
                            {action.description && (
                              <div className="text-xs text-text-tertiary truncate">
                                {action.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Actions Category */}
                {categorizedActions.actions.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
                      إجراءات
                    </div>
                    {categorizedActions.actions.map((action) => {
                      const Icon = action.icon || Zap;
                      const isSelected =
                        filteredActions.indexOf(action) === selectedIndex;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() =>
                            setSelectedIndex(filteredActions.indexOf(action))
                          }
                          className={`
                            w-full px-3 py-2.5 rounded-lg
                            flex items-center gap-3
                            text-right transition-fast
                            ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-900/20'
                                : 'hover:bg-bg-muted'
                            }
                          `}
                        >
                          <Icon
                            size={18}
                            className={
                              isSelected
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-text-tertiary'
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                isSelected
                                  ? 'text-brand-700 dark:text-brand-300'
                                  : 'text-text-primary'
                              }`}
                            >
                              {action.title}
                            </div>
                            {action.description && (
                              <div className="text-xs text-text-tertiary truncate">
                                {action.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Admin Category */}
                {categorizedActions.admin.length > 0 && (
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-text-tertiary uppercase">
                      إدارة
                    </div>
                    {categorizedActions.admin.map((action) => {
                      const Icon = action.icon || SettingsIcon;
                      const isSelected =
                        filteredActions.indexOf(action) === selectedIndex;

                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={() => handleSelect(action)}
                          onMouseEnter={() =>
                            setSelectedIndex(filteredActions.indexOf(action))
                          }
                          className={`
                            w-full px-3 py-2.5 rounded-lg
                            flex items-center gap-3
                            text-right transition-fast
                            ${
                              isSelected
                                ? 'bg-brand-50 dark:bg-brand-900/20'
                                : 'hover:bg-bg-muted'
                            }
                          `}
                        >
                          <Icon
                            size={18}
                            className={
                              isSelected
                                ? 'text-brand-600 dark:text-brand-400'
                                : 'text-text-tertiary'
                            }
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium ${
                                isSelected
                                  ? 'text-brand-700 dark:text-brand-300'
                                  : 'text-text-primary'
                              }`}
                            >
                              {action.title}
                            </div>
                            {action.description && (
                              <div className="text-xs text-text-tertiary truncate">
                                {action.description}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-2 border-t border-border-base bg-bg-muted/50">
            <div className="flex items-center justify-between text-xs text-text-tertiary">
              <div className="flex items-center gap-4">
                <span>↑↓ للتنقل</span>
                <span>Enter للتحديد</span>
                <span>Esc للإغلاق</span>
              </div>
              <span className="hidden sm:inline">Cmd+K أو Ctrl+K للفتح</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Export types
export type { CommandAction };
