/**
 * PlanTable - Main table component using TanStack Table
 */

'use client';

import React, { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import { AuditTask } from '@/src/lib/api';
import { getColumns } from './columns';
import { usePlanStore } from '@/src/state/plan.store';

type PlanTableProps = {
  data: AuditTask[];
  locale?: 'ar' | 'en';
  onRowClick?: (task: AuditTask) => void;
  onEdit?: (task: AuditTask) => void;
  onDelete?: (task: AuditTask) => void;
};

export function PlanTable({
  data,
  locale = 'ar',
  onRowClick,
  onEdit,
  onDelete,
}: PlanTableProps) {
  const { sort, setSort, filters } = usePlanStore();

  const columns = useMemo(() => {
    const baseColumns = getColumns(locale);
    
    // Add actions column if edit/delete handlers provided
    if (onEdit || onDelete) {
      return [
        ...baseColumns,
        {
          id: 'actions',
          header: locale === 'ar' ? 'إجراءات' : 'Actions',
          size: 100,
          cell: ({ row }: any) => (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(row.original);
                  }}
                  className="text-green-600 hover:text-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                  title={locale === 'ar' ? 'تعديل' : 'Edit'}
                  aria-label={`${locale === 'ar' ? 'تعديل' : 'Edit'} ${row.original.title}`}
                >
                  ✏️
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(row.original);
                  }}
                  className="text-red-600 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  title={locale === 'ar' ? 'حذف' : 'Delete'}
                  aria-label={`${locale === 'ar' ? 'حذف' : 'Delete'} ${row.original.title}`}
                >
                  🗑️
                </button>
              )}
            </div>
          ),
        },
      ];
    }
    return baseColumns;
  }, [locale, onEdit, onDelete]);

  // Filter data based on store filters
  const filteredData = useMemo(() => {
    let result = [...data];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.code.toLowerCase().includes(searchLower) ||
          task.department.toLowerCase().includes(searchLower)
      );
    }

    if (filters.department) {
      result = result.filter((task) => task.department === filters.department);
    }

    if (filters.riskLevel) {
      result = result.filter((task) => task.riskLevel === filters.riskLevel);
    }

    if (filters.status) {
      result = result.filter((task) => task.status === filters.status);
    }

    return result;
  }, [data, filters]);

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting: sort ? [sort] : [],
    },
    onSortingChange: (updater) => {
      const newSort = typeof updater === 'function' ? updater(sort ? [sort] : []) : updater;
      setSort(newSort.length > 0 ? newSort[0] : null);
    },
  });

  if (filteredData.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="text-gray-500">
          {locale === 'ar' ? 'لا توجد مهام تدقيق' : 'No audit tasks found'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="annual-plan-table-wrapper">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            {columns.map((col) => (
              <col
                key={col.id || (col as any).accessorKey}
                style={{ width: `${(col as any).size}px` }}
              />
            ))}
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 px-4 py-3"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="align-top cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
