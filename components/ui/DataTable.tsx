'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  /**
   * تعريف الأعمدة
   */
  columns: ColumnDef<TData, TValue>[];

  /**
   * البيانات
   */
  data: TData[];

  /**
   * هل الجدول قابل للتحديد (checkboxes)
   */
  selectable?: boolean;

  /**
   * دالة عند تحديد الصفوف
   */
  onSelectionChange?: (selectedRows: TData[]) => void;

  /**
   * دالة للحصول على ID فريد لكل صف (مطلوب عند استخدام selectable)
   */
  getRowId?: (row: TData) => string;

  /**
   * هل يعرض pagination
   */
  pagination?: boolean;

  /**
   * عدد الصفوف لكل صفحة
   */
  pageSize?: number;

  /**
   * حالة التحميل
   */
  loading?: boolean;

  /**
   * رسالة حالة فارغة
   */
  emptyMessage?: string;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

/**
 * DataTable Component
 * جدول بيانات متقدم مع sorting, filtering, pagination, row selection
 *
 * @example
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   {
 *     accessorKey: 'name',
 *     header: 'الاسم',
 *   },
 *   {
 *     accessorKey: 'email',
 *     header: 'البريد الإلكتروني',
 *   },
 * ];
 *
 * <DataTable
 *   columns={columns}
 *   data={users}
 *   selectable
 *   pagination
 *   onSelectionChange={(rows) => console.log(rows)}
 * />
 * ```
 */
export function DataTable<TData, TValue>({
  columns,
  data,
  selectable = false,
  onSelectionChange,
  getRowId,
  pagination = true,
  pageSize = 10,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // إنشاء أعمدة مع checkbox إذا كان الجدول قابل للتحديد
  const tableColumns = React.useMemo(() => {
    if (!selectable) return columns;

    const selectColumn: ColumnDef<TData, TValue> = {
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            aria-label="تحديد الكل"
            className="
              w-4 h-4 rounded border-2 border-border-base
              text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
              cursor-pointer transition-fast
              checked:bg-brand-600 checked:border-brand-600
            "
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            aria-label={`تحديد الصف ${row.id}`}
            className="
              w-4 h-4 rounded border-2 border-border-base
              text-brand-600 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
              cursor-pointer transition-fast
              checked:bg-brand-600 checked:border-brand-600
            "
          />
        </div>
      ),
      size: 50,
      enableSorting: false,
      enableHiding: false,
    };

    return [selectColumn, ...columns];
  }, [selectable, columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getRowId: getRowId,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: {
      pagination: {
        pageSize,
      },
    },
    enableRowSelection: selectable,
  });

  // تحديث الصفوف المحددة
  React.useEffect(() => {
    if (onSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
      onSelectionChange(selectedRows);
    }
  }, [rowSelection, onSelectionChange, table]);

  if (loading) {
    return (
      <div className="w-full space-y-3">
        {Array.from({ length: pageSize }).map((_, i) => (
          <div key={i} className="h-12 bg-bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Table */}
      <div className="border border-border-base rounded-xl overflow-hidden bg-bg-elevated">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead className="bg-bg-muted">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-right text-sm font-semibold text-text-primary"
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            'flex items-center gap-2',
                            header.column.getCanSort() &&
                              'cursor-pointer select-none hover:text-brand-600',
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-text-tertiary">
                              {header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp size={16} />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown size={16} />
                              ) : (
                                <ArrowUpDown size={16} />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border-base">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className={cn(
                      'transition-colors hover:bg-bg-subtle',
                      row.getIsSelected() && 'bg-brand-50 dark:bg-brand-950',
                    )}
                    data-state={row.getIsSelected() && 'selected'}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-4 py-3 text-sm text-text-secondary">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-text-tertiary">
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && data.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <span>
              صف {table.getState().pagination.pageIndex * pageSize + 1} إلى{' '}
              {Math.min((table.getState().pagination.pageIndex + 1) * pageSize, data.length)} من{' '}
              {data.length}
            </span>
            {selectable && Object.keys(rowSelection).length > 0 && (
              <>
                <span className="text-text-tertiary">•</span>
                <span className="font-medium text-brand-600">
                  {Object.keys(rowSelection).length} محدد
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="
                px-3 py-1.5 rounded-lg border border-border-base
                text-sm font-medium text-text-secondary
                hover:bg-bg-muted transition-fast
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-ring
              "
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="الصفحة السابقة"
            >
              <ChevronRight size={18} />
            </button>

            <span className="text-sm text-text-secondary">
              صفحة {table.getState().pagination.pageIndex + 1} من {table.getPageCount()}
            </span>

            <button
              type="button"
              className="
                px-3 py-1.5 rounded-lg border border-border-base
                text-sm font-medium text-text-secondary
                hover:bg-bg-muted transition-fast
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-ring
              "
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="الصفحة التالية"
            >
              <ChevronLeft size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
