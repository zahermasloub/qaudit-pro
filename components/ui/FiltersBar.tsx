'use client';

import { Filter, Search, X } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export interface FilterOption {
  /**
   * معرف الفلتر
   */
  id: string;

  /**
   * تسمية الفلتر
   */
  label: string;

  /**
   * نوع الفلتر
   */
  type: 'select' | 'date' | 'text';

  /**
   * خيارات الفلتر (للـ select)
   */
  options?: { value: string; label: string }[];

  /**
   * قيمة افتراضية
   */
  defaultValue?: string;
}

interface FiltersBarProps {
  /**
   * نص البحث
   */
  searchQuery?: string;

  /**
   * دالة عند تغيير نص البحث
   */
  onSearchChange?: (query: string) => void;

  /**
   * placeholder للبحث
   */
  searchPlaceholder?: string;

  /**
   * الفلاتر المتاحة
   */
  filters?: FilterOption[];

  /**
   * قيم الفلاتر الحالية
   */
  filterValues?: Record<string, string>;

  /**
   * دالة عند تغيير الفلاتر
   */
  onFilterChange?: (filterId: string, value: string) => void;

  /**
   * دالة لمسح الفلاتر
   */
  onClearFilters?: () => void;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

/**
 * FiltersBar Component
 * شريط تصفية موحد مع بحث وفلاتر متعددة
 *
 * @example
 * ```tsx
 * const filters: FilterOption[] = [
 *   {
 *     id: 'status',
 *     label: 'الحالة',
 *     type: 'select',
 *     options: [
 *       { value: 'active', label: 'نشط' },
 *       { value: 'inactive', label: 'غير نشط' },
 *     ],
 *   },
 * ];
 *
 * <FiltersBar
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   filters={filters}
 *   filterValues={filterValues}
 *   onFilterChange={handleFilterChange}
 * />
 * ```
 */
export function FiltersBar({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'بحث...',
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  className,
}: FiltersBarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = React.useState(false);

  const hasActiveFilters = React.useMemo(() => {
    return Object.values(filterValues).some((value) => value !== '');
  }, [filterValues]);

  const activeFiltersCount = React.useMemo(() => {
    return Object.values(filterValues).filter((value) => value !== '').length;
  }, [filterValues]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search & Filter Toggle */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        {onSearchChange && (
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="
                w-full h-10 pr-10 pl-4 rounded-lg
                border border-border-base bg-bg-elevated
                text-text-primary placeholder:text-text-tertiary
                focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                transition-fast
              "
              aria-label={searchPlaceholder}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="
                  absolute left-3 top-1/2 -translate-y-1/2
                  text-text-tertiary hover:text-text-secondary
                  transition-fast
                "
                aria-label="مسح البحث"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        {/* Filters Toggle */}
        {filters.length > 0 && (
          <button
            type="button"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={cn(
              'px-4 h-10 rounded-lg border transition-fast',
              'flex items-center gap-2 font-medium text-sm',
              isFiltersOpen || hasActiveFilters
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                : 'border-border-base bg-bg-elevated text-text-secondary hover:bg-bg-muted',
              'focus-ring'
            )}
            aria-expanded={isFiltersOpen}
            aria-label="عرض الفلاتر"
          >
            <Filter size={18} />
            <span>فلتر</span>
            {activeFiltersCount > 0 && (
              <span
                className="
                  px-1.5 min-w-[20px] h-5 rounded-full
                  bg-brand-600 text-white text-xs font-semibold
                  flex items-center justify-center
                "
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {isFiltersOpen && filters.length > 0 && (
        <div
          className="
            p-4 rounded-xl border border-border-base bg-bg-elevated
            animate-in slide-in-from-top-2 fade-in duration-200
          "
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3 className="text-sm font-semibold text-text-primary">خيارات التصفية</h3>
            {hasActiveFilters && onClearFilters && (
              <button
                type="button"
                onClick={onClearFilters}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-fast"
              >
                مسح الكل
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label htmlFor={filter.id} className="block text-sm font-medium text-text-secondary">
                  {filter.label}
                </label>

                {filter.type === 'select' && filter.options && (
                  <select
                    id={filter.id}
                    value={filterValues[filter.id] || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                    className="
                      w-full h-10 px-3 rounded-lg
                      border border-border-base bg-bg-base
                      text-text-primary
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                      transition-fast
                    "
                  >
                    <option value="">الكل</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'date' && (
                  <input
                    type="date"
                    id={filter.id}
                    value={filterValues[filter.id] || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                    className="
                      w-full h-10 px-3 rounded-lg
                      border border-border-base bg-bg-base
                      text-text-primary
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                      transition-fast
                    "
                  />
                )}

                {filter.type === 'text' && (
                  <input
                    type="text"
                    id={filter.id}
                    value={filterValues[filter.id] || ''}
                    onChange={(e) => onFilterChange?.(filter.id, e.target.value)}
                    placeholder={filter.label}
                    className="
                      w-full h-10 px-3 rounded-lg
                      border border-border-base bg-bg-base
                      text-text-primary placeholder:text-text-tertiary
                      focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                      transition-fast
                    "
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
