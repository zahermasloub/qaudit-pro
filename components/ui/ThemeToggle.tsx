'use client';

import { Monitor, Moon, Sun } from 'lucide-react';
import React, { useState } from 'react';

import { useTheme } from '@/lib/ThemeProvider';

/**
 * ThemeToggle Component
 * زر تبديل الثيم مع قائمة منسدلة للاختيار بين Light/Dark/System
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'light' as const, label: 'فاتح', icon: Sun },
    { value: 'dark' as const, label: 'داكن', icon: Moon },
    { value: 'system' as const, label: 'النظام', icon: Monitor },
  ];

  const currentOption = options.find((opt) => opt.value === theme) || options[2];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          p-2 rounded-lg
          border border-border-base bg-bg-base
          text-text-secondary hover:text-text-primary
          hover:bg-bg-muted
          transition-fast
          focus-ring
        "
        aria-label="تبديل الثيم"
        aria-expanded={isOpen}
      >
        <CurrentIcon size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="
              absolute left-0 mt-2 z-50
              w-40 py-1 rounded-lg
              border border-border-base bg-bg-elevated
              shadow-lg
              animate-in fade-in slide-in-from-top-2
              duration-200
            "
          >
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
                  className={`
                    w-full px-3 py-2
                    flex items-center gap-3
                    text-sm text-right
                    transition-fast
                    ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-text-secondary hover:bg-bg-muted hover:text-text-primary'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="flex-1">{option.label}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-brand-600 dark:text-brand-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Resolved Theme Indicator (for debugging, can be removed) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute -bottom-6 left-0 text-xs text-text-tertiary">
          {resolvedTheme}
        </div>
      )}
    </div>
  );
}
