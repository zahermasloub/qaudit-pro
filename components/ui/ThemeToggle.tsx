/**
 * ========================================
 * ThemeToggle Component (Enhanced)
 * ========================================
 * مكون محسّن لتبديل الثيم بين الفاتح والداكن
 *
 * الميزات:
 * - تبديل بين light/dark/system
 * - حفظ الاختيار في localStorage (عبر ThemeProvider)
 * - اختصار لوحة المفاتيح: Shift+L
 * - دعم A11y كامل (ARIA labels، focus visible، keyboard navigation)
 * - أيقونة متحركة تعكس الحالة الحالية
 *
 * الاستخدام:
 * ```tsx
 * <ThemeToggle />
 * ```
 */

'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useTheme } from '@/lib/ThemeProvider';

type ThemeOption = 'light' | 'dark' | 'system';

/**
 * ThemeToggle Component
 * زر تبديل الثيم مع قائمة منسدلة للاختيار بين Light/Dark/System
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // منع hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // اختصار لوحة المفاتيح: Shift+L للتبديل السريع
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'L') {
        e.preventDefault();
        // تبديل دوري: light -> dark -> system -> light
        const nextTheme: Record<ThemeOption, ThemeOption> = {
          light: 'dark',
          dark: 'system',
          system: 'light',
        };
        setTheme(nextTheme[theme]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [theme, setTheme]);

  // إغلاق القائمة عند الضغط على Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Skeleton أثناء التحميل لمنع flash
  if (!mounted) {
    return (
      <div
        className="h-10 w-10 rounded-lg animate-pulse"
        style={{ backgroundColor: 'var(--color-bg-muted)' }}
        aria-hidden="true"
      />
    );
  }

  const options: Array<{ value: ThemeOption; label: string; icon: typeof Sun }> = [
    { value: 'light', label: 'فاتح', icon: Sun },
    { value: 'dark', label: 'داكن', icon: Moon },
    { value: 'system', label: 'النظام', icon: Monitor },
  ];

  const currentOption = options.find((opt) => opt.value === theme) || options[0];
  const CurrentIcon = currentOption.icon;

  const themeLabels: Record<ThemeOption, string> = {
    light: 'الوضع الفاتح',
    dark: 'الوضع الداكن',
    system: 'حسب النظام',
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center justify-center
          h-10 w-10 rounded-lg
          border transition-all
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        "
        style={{
          backgroundColor: 'var(--color-bg-elevated)',
          borderColor: 'var(--color-border-base)',
          color: 'var(--color-text-secondary)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
          e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
        aria-label={`قائمة اختيار الثيم - الحالي: ${themeLabels[theme]}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={`الثيم: ${themeLabels[theme]} (اضغط Shift+L للتبديل)`}
      >
        <CurrentIcon size={20} aria-hidden="true" />
        <span className="sr-only">تبديل الثيم</span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop للإغلاق عند الضغط خارج القائمة */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="
              absolute mt-2 z-50
              min-w-[180px] rounded-lg
              border shadow-lg
              animate-in fade-in slide-in-from-top-2
            "
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              borderColor: 'var(--color-border-base)',
              left: 'auto',
              right: 0,
            }}
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="theme-menu-button"
          >
            <div className="py-1">
            {options.map((option) => {
              const Icon = option.icon;
              const isActive = theme === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTheme(option.value);
                    setIsOpen(false);
                  }}
                  className="
                    w-full flex items-center gap-3 px-4 py-2.5
                    text-sm transition-all
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset
                  "
                  style={{
                    backgroundColor: isActive
                      ? 'var(--color-bg-muted)'
                      : 'transparent',
                    color: isActive
                      ? 'var(--color-text-primary)'
                      : 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                  role="menuitem"
                  aria-current={isActive ? 'true' : undefined}
                >
                  <Icon
                    size={18}
                    aria-hidden="true"
                    style={{
                      color: isActive
                        ? 'var(--color-brand-600)'
                        : 'currentColor',
                    }}
                  />
                  <span className="flex-1 text-right">{option.label}</span>
                  {isActive && (
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-brand-600)' }}
                      aria-hidden="true"
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
            </div>

            {/* Keyboard Shortcut Hint */}
            <div
              className="px-4 py-2 border-t text-xs"
              style={{
                borderColor: 'var(--color-border-base)',
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'var(--color-bg-subtle)',
              }}
            >
              اضغط{' '}
              <kbd
                className="px-1.5 py-0.5 rounded text-xs font-mono"
                style={{
                  backgroundColor: 'var(--color-bg-muted)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--color-border-base)',
                }}
              >
                Shift+L
              </kbd>{' '}
              للتبديل السريع
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * ThemeToggleCompact Component
 * نسخة مدمجة بدون قائمة منسدلة - تبديل مباشر بين light/dark
 */
export function ThemeToggleCompact({ className = '' }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center
        h-10 w-10 rounded-lg
        border transition-all
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        ${className}
      `}
      style={{
        backgroundColor: 'var(--color-bg-elevated)',
        borderColor: 'var(--color-border-base)',
        color: 'var(--color-text-secondary)',
      }}
      aria-label={`تبديل إلى ${resolvedTheme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}`}
      aria-pressed={resolvedTheme === 'dark'}
      title={`الوضع الحالي: ${resolvedTheme === 'dark' ? 'داكن' : 'فاتح'}`}
    >
      <Icon size={20} aria-hidden="true" />
      <span className="sr-only">تبديل الثيم</span>
    </button>
  );
}
