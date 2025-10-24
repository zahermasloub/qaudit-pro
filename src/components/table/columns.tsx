import type { ColumnDef } from '@tanstack/react-table';

import type { PlanRow } from '@/src/lib/api';

export const planColumns: ColumnDef<PlanRow>[] = [
  {
    accessorKey: 'title',
    header: 'اسم المهمة',
    cell: (ctx) => <span className="is-text">{ctx.getValue() as string}</span>,
    size: 260,
  },
  {
    accessorKey: 'dept',
    header: 'الإدارة/القسم',
    cell: (ctx) => <span className="is-text">{ctx.getValue() as string}</span>,
    size: 200,
  },
  { accessorKey: 'type', header: 'نوع التدقيق' },
  { accessorKey: 'start', header: 'البداية' },
  { accessorKey: 'end', header: 'النهاية' },
  {
    accessorKey: 'code',
    header: 'الرمز',
    cell: (ctx) => <span className="is-token">{ctx.getValue() as string}</span>,
    size: 160,
  },
];
