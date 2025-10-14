'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { SettingInput } from '@/features/admin/settings/setting.schema';

type Setting = {
  id: string;
  key: string;
  value: string | null;
  type: string | null;
  updatedAt: string;
};

export default function AdminSettings() {
  const [items, setItems] = useState<Setting[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset } = useForm<SettingInput>();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.ok) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  }

  async function onSubmit(data: SettingInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok) {
        reset();
        setShowDialog(false);
        fetchSettings();
      }
    } catch (error) {
      console.error('Error saving setting:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">إعدادات النظام</h1>
          <p className="text-gray-600">تكوين الإعدادات العامة</p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          + إضافة إعداد
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المفتاح</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">القيمة</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                آخر تحديث
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{item.key}</td>
                <td className="px-4 py-3 text-sm">{item.value || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {item.type || 'string'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(item.updatedAt).toLocaleString('ar-SA')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">إضافة/تحديث إعداد</h3>
              <button className="text-gray-500" onClick={() => setShowDialog(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المفتاح</label>
                <input
                  {...register('key', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
                  placeholder="app.feature.enabled"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">القيمة</label>
                <input
                  {...register('value')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="القيمة"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">النوع</label>
                <select
                  {...register('type')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
