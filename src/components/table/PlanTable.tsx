'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useVirtualSwitch } from '@/src/hooks/useVirtualSwitch';
import type { PlanRow } from '@/src/lib/api';
import { fetchPlanTasks } from '@/src/lib/api';
import { usePlanStore } from '@/src/state/plan.store';

import { planColumns } from './columns';

type PlanTableProps = {
  planId: string;
};

export function PlanTable({ planId }: PlanTableProps) {
  const { pageIndex, pageSize, set, total } = usePlanStore();
  const [data, setData] = React.useState<PlanRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const json = await fetchPlanTasks(planId, pageIndex * pageSize, pageSize);
        if (!active) return;
        setData(json.rows);
        set({ total: json.total });
      } catch (err) {
        if (!active) return;
        setError((err as Error).message);
        setData([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [planId, pageIndex, pageSize, set]);

  const table = useReactTable({
    data,
    columns: planColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {},
  });

  const useVirtual = useVirtualSwitch(total, 2000);
  const parentRef = React.useRef<HTMLDivElement>(null);
  const virtualRowCount = table.getRowModel().rows.length;

  const rowVirtualizer = useVirtualizer({
    count: virtualRowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 6,
    enabled: useVirtual,
  });

  return (
    <div ref={parentRef} className="w-full max-h-[calc(100vh-260px)] overflow-auto [contain:content]">
      <table className="w-full table-fixed border-collapse min-w-full [width:max-content]">
        <thead className="sticky top-0 z-10 bg-slate-900 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="thcell">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {useVirtual ? (
            <tr>
              <td colSpan={planColumns.length} className="p-0">
                <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative">
                  {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = table.getRowModel().rows[virtualRow.index];
                    if (!row) return null;
                    return (
                      <div
                        key={row.id}
                        className="absolute left-0 right-0"
                        style={{ transform: `translateY(${virtualRow.start}px)` }}
                      >
                        <div className="table-row">
                          {row.getVisibleCells().map((cell) => (
                            <div key={cell.id} className="table-cell tdcell">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="tdcell">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {loading && <div className="p-3 text-sm">...?????</div>}
      {!loading && error && <div className="p-3 text-sm text-red-600">{error}</div>}
    </div>
  );
}
