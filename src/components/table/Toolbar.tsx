/**
 * Toolbar - Filters and actions for the table
 */

'use client';

import React from 'react';
import { usePlanStore } from '@/src/state/plan.store';

type ToolbarProps = {
  locale?: 'ar' | 'en';
  departments: string[];
  onExport?: () => void;
  totalTasks: number;
  filteredTasks: number;
};

export function Toolbar({
  locale = 'ar',
  departments,
  onExport,
  totalTasks,
  filteredTasks,
}: ToolbarProps) {
  const { filters, setFilter, clearFilters } = usePlanStore();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            value={filters.search || ''}
            onChange={(e) => setFilter('search', e.target.value)}
          />
        </div>

        {/* Department Filter */}
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            value={filters.department || ''}
            onChange={(e) => setFilter('department', e.target.value)}
          >
            <option value="">{locale === 'ar' ? 'جميع الإدارات' : 'All Departments'}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Level Filter */}
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            value={filters.riskLevel || ''}
            onChange={(e) => setFilter('riskLevel', e.target.value)}
          >
            <option value="">{locale === 'ar' ? 'جميع المخاطر' : 'All Risk Levels'}</option>
            <option value="very_high">{locale === 'ar' ? 'عالية جداً' : 'Very High'}</option>
            <option value="high">{locale === 'ar' ? 'عالية' : 'High'}</option>
            <option value="medium">{locale === 'ar' ? 'متوسطة' : 'Medium'}</option>
            <option value="low">{locale === 'ar' ? 'منخفضة' : 'Low'}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            value={filters.status || ''}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
            <option value="not_started">{locale === 'ar' ? 'لم تبدأ' : 'Not Started'}</option>
            <option value="in_progress">{locale === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
            <option value="completed">{locale === 'ar' ? 'مكتملة' : 'Completed'}</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {locale === 'ar'
              ? `عرض ${filteredTasks} من ${totalTasks} مهمة`
              : `Showing ${filteredTasks} of ${totalTasks} tasks`}
          </div>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              {locale === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
            </button>
          )}
        </div>
        {onExport && (
          <button
            onClick={onExport}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {locale === 'ar' ? 'تصدير CSV' : 'Export CSV'}
          </button>
        )}
      </div>
    </div>
  );
}
