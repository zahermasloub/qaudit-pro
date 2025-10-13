import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/Toast-v2';
import { daysUntil, formatDateAr, isOverdue } from '@/lib/date';
import { cn } from '@/lib/utils';

interface PBCItem {
  id: string;
  code: string;
  description: string;
  ownerId: string;
  dueDate: string;
  status: 'open' | 'partial' | 'complete';
  engagementId: string;
  createdAt: string;
}

// Mock data - سيتم استبداله بـ API call لاحقاً
const MOCK_PBCS: PBCItem[] = [
  {
    id: '1',
    code: 'PBC-001',
    description: 'قوائم الموظفين للربع الأول',
    ownerId: 'hr@company.com',
    dueDate: '2025-01-15',
    status: 'open',
    engagementId: 'ENG-001',
    createdAt: '2025-01-01',
  },
  {
    id: '2',
    code: 'PBC-002',
    description: 'التقارير المالية الشهرية',
    ownerId: 'finance@company.com',
    dueDate: '2025-01-20',
    status: 'partial',
    engagementId: 'ENG-001',
    createdAt: '2025-01-02',
  },
  {
    id: '3',
    code: 'PBC-003',
    description: 'مستندات الامتثال التنظيمي',
    ownerId: 'compliance@company.com',
    dueDate: '2025-01-10',
    status: 'complete',
    engagementId: 'ENG-001',
    createdAt: '2025-01-01',
  },
];

interface PBCTableProps {
  engagementId?: string;
  onRefresh?: () => void;
}

export default function PBCTable({ engagementId, onRefresh }: PBCTableProps) {
  const [pbcs, setPbcs] = useState<PBCItem[]>(MOCK_PBCS);
  const [filteredPbcs, setFilteredPbcs] = useState<PBCItem[]>(MOCK_PBCS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const { addToast } = useToast();

  // Due date row styling function
  function getDueRowClassName(dueDate?: string | null): string {
    if (!dueDate) return '';
    if (isOverdue(dueDate)) return 'bg-danger-50 hover:bg-danger-50/70';
    const days = daysUntil(dueDate);
    if (days <= 3) return 'bg-warning-50 hover:bg-warning-50/70';
    if (days <= 7) return 'bg-brand-50 hover:bg-brand-50/60';
    return '';
  }

  // Export CSV function
  const handleExport = () => {
    const queryParams = new URLSearchParams();
    if (statusFilter !== 'all') queryParams.set('status', statusFilter);
    if (searchTerm) queryParams.set('q', searchTerm);
    if (fromDate) queryParams.set('from', fromDate);
    if (toDate) queryParams.set('to', toDate);

    const url = `/api/pbc/export?${queryParams.toString()}`;
    window.open(url, '_blank');

    // Show toast notification
    addToast({
      type: 'success',
      title: 'جارٍ تنزيل CSV',
      message: 'سيتم تحميل الملف قريباً...',
      duration: 3000,
    });
  };

  // Filter logic
  useEffect(() => {
    let filtered = [...pbcs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pbc => pbc.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        pbc =>
          pbc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pbc.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Date range filter
    if (fromDate) {
      filtered = filtered.filter(pbc => new Date(pbc.dueDate) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(pbc => new Date(pbc.dueDate) <= new Date(toDate));
    }

    setFilteredPbcs(filtered);
  }, [pbcs, statusFilter, searchTerm, fromDate, toDate]);

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-brand-100 text-brand-800 border-brand-200',
      partial: 'bg-warning-100 text-warning-800 border-warning-200',
      complete: 'bg-success-100 text-success-800 border-success-200',
    };

    const labels = {
      open: 'مفتوح',
      partial: 'جزئي',
      complete: 'مكتمل',
    };

    return (
      <span
        className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return formatDateAr(dateStr);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card-base bg-white p-4">
        <div className="space-y-4">
          {/* First Row - Search and Status */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1 text-neutral-700">البحث</label>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="البحث بالرمز أو الوصف..."
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              />
            </div>

            <div className="sm:w-48">
              <label className="block text-sm font-medium mb-1 text-neutral-700">الحالة</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              >
                <option value="all">الكل</option>
                <option value="open">مفتوح</option>
                <option value="partial">جزئي</option>
                <option value="complete">مكتمل</option>
              </select>
            </div>
          </div>

          {/* Second Row - Date Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 sm:flex-none sm:w-40">
              <label className="block text-sm font-medium mb-1 text-neutral-700">من تاريخ</label>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              />
            </div>

            <div className="flex-1 sm:flex-none sm:w-40">
              <label className="block text-sm font-medium mb-1 text-neutral-700">إلى تاريخ</label>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={onRefresh} disabled={loading}>
                {loading ? 'جارٍ التحديث...' : 'تحديث'}
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                تصدير CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-neutral-600">
          عرض <span className="font-medium">{filteredPbcs.length}</span> من أصل{' '}
          <span className="font-medium">{pbcs.length}</span> طلب
        </div>

        {/* Legend for color coding */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-danger-50 border border-danger-200"></div>
            <span className="text-neutral-600">متأخر</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-warning-50 border border-warning-200"></div>
            <span className="text-neutral-600">≤ 3 أيام</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-brand-50 border border-brand-200"></div>
            <span className="text-neutral-600">≤ 7 أيام</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card-base bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-compact">
            <thead>
              <tr>
                <th className="text-right px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">
                  الرمز
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">
                  الوصف
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">
                  المسؤول
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">
                  تاريخ الاستحقاق
                </th>
                <th className="text-right px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredPbcs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    {searchTerm || statusFilter !== 'all' || fromDate || toDate
                      ? 'لا توجد نتائج تطابق الفلاتر'
                      : 'لا توجد طلبات مستندات'}
                  </td>
                </tr>
              ) : (
                filteredPbcs.map(pbc => (
                  <tr
                    key={pbc.id}
                    className={cn(
                      'transition-colors hover:bg-neutral-50',
                      getDueRowClassName(pbc.dueDate),
                    )}
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm font-medium text-neutral-900">{pbc.code}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-neutral-800">{pbc.description}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">{pbc.ownerId}</span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-neutral-800">
                        {formatDate(pbc.dueDate)}
                        {isOverdue(pbc.dueDate) && (
                          <span className="block text-xs text-danger-600 font-medium">
                            متأخر بـ {Math.abs(daysUntil(pbc.dueDate))} يوم
                          </span>
                        )}
                        {!isOverdue(pbc.dueDate) && daysUntil(pbc.dueDate) <= 7 && (
                          <span className="block text-xs text-warning-600 font-medium">
                            باقي {daysUntil(pbc.dueDate)} أيام
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">{getStatusBadge(pbc.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
