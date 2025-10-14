'use client';

import { useCallback, useEffect, useState } from 'react';

type Log = {
  id: string;
  action: string;
  actorEmail?: string | null;
  createdAt: string;
  targetType?: string | null;
};

export default function AdminLogsPage() {
  const [q, setQ] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (from) params.set('from', new Date(from).toISOString());
      if (to) params.set('to', new Date(to).toISOString());
      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      const json = await response.json().catch(() => ({ items: [] }));
      if (Array.isArray(json.items)) {
        setRows(json.items);
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error('Failed to load logs', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [from, q, to]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 flex flex-wrap items-center gap-2">
        <input
          className="border rounded-md px-2 py-1 text-sm min-w-[220px]"
          placeholder="بحث في الإجراءات..."
          value={q}
          onChange={event => setQ(event.target.value)}
        />
        <input
          className="border rounded-md px-2 py-1 text-sm"
          type="datetime-local"
          value={from}
          onChange={event => setFrom(event.target.value)}
        />
        <input
          className="border rounded-md px-2 py-1 text-sm"
          type="datetime-local"
          value={to}
          onChange={event => setTo(event.target.value)}
        />
        <button
          type="button"
          onClick={fetchLogs}
          className="px-3 py-1.5 text-sm rounded-md border font-medium bg-orange-600 text-white border-orange-600 hover:bg-orange-700"
        >
          فلترة
        </button>
      </div>

      <div className="bg-white border rounded-2xl p-0 overflow-hidden">
        <div className="table-wrap overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-right">
                <th>الحدث</th>
                <th>الإجراء</th>
                <th>المستخدم</th>
                <th>التاريخ والوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-slate-500">
                    جارِ التحميل…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-10 text-center text-slate-500">
                    لا توجد سجلات
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map(log => (
                  <tr key={log.id} className="[&>td]:px-3 [&>td]:py-2 text-slate-700">
                    <td>{log.targetType || '-'}</td>
                    <td className="font-mono break-anywhere">{log.action}</td>
                    <td>{log.actorEmail || '-'}</td>
                    <td dir="ltr">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
