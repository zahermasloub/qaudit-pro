'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

type AuditLog = {
  id: string;
  actorEmail: string | null;
  action: string;
  target: string | null;
  createdAt: string;
};

export default function AdminLogs() {
  const [rows, setRows] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      const data = await res.json();
      if (data.ok) {
        setRows(data.rows);
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  }

  return (
    <div className="container-shell">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">سجلات النشاط</h1>
        <p className="text-gray-600">مراقبة نشاط النظام والمستخدمين</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="بحث في الإجراءات..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="datetime-local"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <input
            type="datetime-local"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            فلترة
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  التاريخ والوقت
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  المستخدم
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  الإجراء
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الهدف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                  </td>
                  <td className="px-4 py-3 text-sm">{log.actorEmail || '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-mono">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-600">{log.target || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rows.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
          لا توجد سجلات
        </div>
      )}
    </div>
  );
}
