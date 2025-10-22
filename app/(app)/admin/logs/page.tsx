'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/DataTable';
import { FiltersBar, FilterOption } from '@/components/ui/FiltersBar';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';

interface AuditLog {
  id: string;
  action: string;
  actorEmail: string | null;
  createdAt: string;
  target: string | null;
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dashboard' },
    { label: 'السجلات', current: true },
  ];

  const filters: FilterOption[] = [
    {
      id: 'from',
      label: 'من تاريخ',
      type: 'date',
    },
    {
      id: 'to',
      label: 'إلى تاريخ',
      type: 'date',
    },
    {
      id: 'actorEmail',
      label: 'المستخدم',
      type: 'text',
    },
  ];

  // جلب السجلات
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (searchQuery) params.set('q', searchQuery);
      if (filterValues.from) {
        params.set('from', new Date(filterValues.from).toISOString());
      }
      if (filterValues.to) {
        params.set('to', new Date(filterValues.to).toISOString());
      }

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const json = await response.json();

      if (Array.isArray(json.items)) {
        setLogs(json.items);
      } else {
        setLogs([]);
        toast.error('فشل في جلب السجلات');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setLogs([]);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterValues]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // تصدير CSV
  function handleExportCSV() {
    if (logs.length === 0) {
      toast.error('لا توجد سجلات للتصدير');
      return;
    }

    try {
      // إنشاء محتوى CSV
      const headers = ['ID', 'الإجراء', 'المستخدم', 'الهدف', 'التاريخ'];
      const rows = logs.map(log => [
        log.id,
        log.action,
        log.actorEmail || '-',
        log.target || '-',
        new Date(log.createdAt).toLocaleString('ar-EG'),
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');

      // إنشاء Blob وتنزيل
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('تم تصدير السجلات بنجاح');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('فشل في تصدير السجلات');
    }
  }

  // تعريف الأعمدة
  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'action',
      header: 'الإجراء',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-text-primary">{row.original.action}</span>
      ),
    },
    {
      accessorKey: 'actorEmail',
      header: 'المستخدم',
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {row.original.actorEmail || <span className="text-text-tertiary">—</span>}
        </span>
      ),
    },
    {
      accessorKey: 'target',
      header: 'الهدف',
      cell: ({ row }) => (
        <span className="text-text-secondary">
          {row.original.target || <span className="text-text-tertiary">—</span>}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'التاريخ والوقت',
      cell: ({ row }) => (
        <time className="text-text-tertiary text-sm" dir="ltr">
          {new Date(row.original.createdAt).toLocaleString('ar-EG', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      ),
    },
  ];

  // تطبيق الفلاتر المحلية (للبريد الإلكتروني)
  const filteredLogs = logs.filter(log => {
    if (filterValues.actorEmail) {
      const query = filterValues.actorEmail.toLowerCase();
      if (!log.actorEmail?.toLowerCase().includes(query)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">سجلات النظام</h1>
          <p className="text-sm text-text-tertiary mt-1">عرض جميع الأحداث والإجراءات في النظام</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg
              border border-border-base bg-bg-elevated text-text-secondary
              hover:bg-bg-muted transition-fast
              focus-ring
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            aria-label="إعادة تحميل"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="
              px-4 py-2 rounded-lg
              bg-brand-600 text-white font-medium
              hover:bg-brand-700 transition-fast
              focus-ring
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <Download size={18} />
            <span>تصدير CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="بحث في الإجراءات..."
        filters={filters}
        filterValues={filterValues}
        onFilterChange={(id, value) => setFilterValues(prev => ({ ...prev, [id]: value }))}
        onClearFilters={() => {
          setSearchQuery('');
          setFilterValues({});
        }}
      />

      {/* Data Table */}
      {loading ? (
        <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
          <EmptyState title="جارٍ التحميل..." message="يرجى الانتظار..." />
        </div>
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="لا توجد سجلات"
          message={
            searchQuery || Object.keys(filterValues).length > 0
              ? 'لم يتم العثور على سجلات مطابقة للبحث أو الفلاتر'
              : 'لم يتم تسجيل أي أحداث بعد'
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredLogs} pagination pageSize={20} />
      )}
    </div>
  );
}
