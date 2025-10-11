import React, { useState, useEffect } from 'react';

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
    createdAt: '2025-01-01'
  },
  {
    id: '2',
    code: 'PBC-002',
    description: 'التقارير المالية الشهرية',
    ownerId: 'finance@company.com',
    dueDate: '2025-01-20',
    status: 'partial',
    engagementId: 'ENG-001',
    createdAt: '2025-01-02'
  },
  {
    id: '3',
    code: 'PBC-003',
    description: 'مستندات الامتثال التنظيمي',
    ownerId: 'compliance@company.com',
    dueDate: '2025-01-10',
    status: 'complete',
    engagementId: 'ENG-001',
    createdAt: '2025-01-01'
  }
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

  // Filter logic
  useEffect(() => {
    let filtered = [...pbcs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(pbc => pbc.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(pbc =>
        pbc.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pbc.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPbcs(filtered);
  }, [pbcs, statusFilter, searchTerm]);

  const getStatusBadge = (status: string) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800 border-blue-200',
      partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      complete: 'bg-green-100 text-green-800 border-green-200'
    };

    const labels = {
      open: 'مفتوح',
      partial: 'جزئي',
      complete: 'مكتمل'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">البحث</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالرمز أو الوصف..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="sm:w-48">
            <label className="block text-sm font-medium mb-1">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="all">الكل</option>
              <option value="open">مفتوح</option>
              <option value="partial">جزئي</option>
              <option value="complete">مكتمل</option>
            </select>
          </div>

          <div className="sm:w-32">
            <label className="block text-sm font-medium mb-1">&nbsp;</label>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? '...' : 'تحديث'}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          عرض {filteredPbcs.length} من أصل {pbcs.length} طلب
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرمز
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الوصف
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المسؤول
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الاستحقاق
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPbcs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    {searchTerm || statusFilter !== 'all'
                      ? 'لا توجد نتائج تطابق الفلاتر'
                      : 'لا توجد طلبات مستندات'
                    }
                  </td>
                </tr>
              ) : (
                filteredPbcs.map((pbc) => (
                  <tr key={pbc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{pbc.code}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-900">{pbc.description}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{pbc.ownerId}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{formatDate(pbc.dueDate)}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(pbc.status)}
                    </td>
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
