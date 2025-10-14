'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import type { RoleInput } from '@/features/admin/roles/role.schema';

type Role = {
  id: string;
  name: string;
  description: string | null;
  permissions: { key: string; label: string | null }[];
};

type Permission = {
  id: string;
  key: string;
  label: string | null;
};

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [perms, setPerms] = useState<Permission[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { register, handleSubmit, reset } = useForm<RoleInput>();

  useEffect(() => {
    fetchRoles();
  }, []);

  async function fetchRoles() {
    try {
      const res = await fetch('/api/admin/roles');
      const data = await res.json();
      if (data.ok) {
        setRoles(data.roles);
        setPerms(data.perms);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  }

  async function onSubmit(data: RoleInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, permissionKeys: selectedPerms }),
      });
      const result = await res.json();
      if (result.ok) {
        reset();
        setSelectedPerms([]);
        setShowDialog(false);
        fetchRoles();
      }
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">الأدوار والصلاحيات</h1>
          <p className="text-gray-600">إدارة الأدوار وتعيين الصلاحيات</p>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          + إضافة دور
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{role.name}</h3>
            {role.description && <p className="text-sm text-gray-600 mb-3">{role.description}</p>}
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 mb-2">الصلاحيات:</div>
              {role.permissions.length > 0 ? (
                role.permissions.map(p => (
                  <div
                    key={p.key}
                    className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block mr-1 mb-1"
                  >
                    {p.label || p.key}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">لا توجد صلاحيات</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">إضافة دور جديد</h3>
              <button className="text-gray-500" onClick={() => setShowDialog(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم الدور</label>
                <input
                  {...register('name', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="مثال: مدير نظام"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  {...register('description')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="وصف اختياري للدور"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الصلاحيات</label>
                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {perms.map(p => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(p.key)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedPerms([...selectedPerms, p.key]);
                          } else {
                            setSelectedPerms(selectedPerms.filter(k => k !== p.key));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{p.label || p.key}</span>
                    </label>
                  ))}
                </div>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
