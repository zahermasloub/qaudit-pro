'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Shield, Trash2, Edit, Users } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/DataTable';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface Permission {
  id: string;
  key: string;
  label: string | null;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: Permission[];
  users: any[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  ok: boolean;
  roles: Role[];
  perms: Permission[];
}

export default function AdminRolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dashboard' },
    { label: 'الأدوار والصلاحيات', current: true },
  ];

  // جلب الأدوار والصلاحيات
  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      const data: ApiResponse = await response.json();

      if (data.ok) {
        setRoles(data.roles);
        setAllPermissions(data.perms);
      } else {
        toast.error('فشل في جلب الأدوار');
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // حذف دور
  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/admin/roles/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success('تم حذف الدور بنجاح');
        fetchRoles();
      } else {
        toast.error(data.error || 'فشل في حذف الدور');
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteId(null);
    }
  }

  // تعريف الأعمدة
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: 'name',
      header: 'اسم الدور',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-brand-600" />
          <div>
            <div className="font-medium text-text-primary">{row.original.name}</div>
            {row.original.description && (
              <div className="text-xs text-text-tertiary">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'permissions',
      header: 'الصلاحيات',
      cell: ({ row }) => {
        const perms = row.original.permissions;
        const displayCount = 3;
        const hasMore = perms.length > displayCount;

        return (
          <div className="flex flex-wrap gap-1">
            {perms.slice(0, displayCount).map((p) => (
              <span
                key={p.id}
                className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              >
                {p.label || p.key}
              </span>
            ))}
            {hasMore && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                +{perms.length - displayCount}
              </span>
            )}
            {perms.length === 0 && (
              <span className="text-text-tertiary text-sm">لا توجد صلاحيات</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'users',
      header: 'المستخدمين',
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-text-secondary">
          <Users size={16} />
          <span>{row.original.users.length}</span>
        </div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => (
        <time className="text-text-tertiary text-sm">
          {new Date(row.original.createdAt).toLocaleDateString('ar-EG')}
        </time>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedRole(row.original)}
            className="
              p-2 rounded-lg
              text-text-secondary hover:text-brand-600 hover:bg-brand-50
              dark:hover:bg-brand-900/20
              transition-fast
              focus-ring
            "
            aria-label="عرض التفاصيل"
          >
            <Edit size={18} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteId(row.original.id)}
            disabled={row.original.users.length > 0}
            className="
              p-2 rounded-lg
              text-text-secondary hover:text-red-600 hover:bg-red-50
              dark:hover:bg-red-900/20
              transition-fast
              focus-ring
              disabled:opacity-30 disabled:cursor-not-allowed
            "
            aria-label="حذف"
            title={
              row.original.users.length > 0
                ? `لا يمكن حذف دور له ${row.original.users.length} مستخدم`
                : 'حذف الدور'
            }
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">الأدوار والصلاحيات</h1>
          <p className="text-sm text-text-tertiary mt-1">
            إدارة أدوار المستخدمين وصلاحيات النظام
          </p>
        </div>
        <button
          type="button"
          className="
            px-4 py-2 rounded-lg
            bg-brand-600 text-white font-medium
            hover:bg-brand-700 transition-fast
            focus-ring
            flex items-center gap-2
          "
        >
          <Plus size={18} />
          <span>دور جديد</span>
        </button>
      </div>

      {/* Permission Matrix Card */}
      {allPermissions.length > 0 && (
        <div className="p-4 rounded-xl border border-border-base bg-bg-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-brand-600" />
            <h2 className="font-semibold text-text-primary">الصلاحيات المتاحة</h2>
            <span className="text-sm text-text-tertiary">({allPermissions.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allPermissions.map((perm) => (
              <span
                key={perm.id}
                className="px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {perm.label || perm.key}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      {loading ? (
        <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
          <EmptyState title="جارٍ التحميل..." message="يرجى الانتظار..." />
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          title="لا توجد أدوار"
          message="ابدأ بإنشاء دور جديد لتنظيم الصلاحيات"
        />
      ) : (
        <DataTable columns={columns} data={roles} pagination pageSize={10} />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteId && (
        <ConfirmDialog
          open={!!deleteId}
          onClose={() => setDeleteId(null)}
          title="تأكيد الحذف"
          message="هل أنت متأكد من حذف هذا الدور؟ هذا الإجراء لا يمكن التراجع عنه."
          confirmLabel="حذف"
          cancelLabel="إلغاء"
          type="danger"
          onConfirm={() => handleDelete(deleteId)}
        />
      )}

      {/* Role Details Modal (Placeholder) */}
      {selectedRole && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRole(null)}
        >
          <div
            className="bg-bg-elevated rounded-xl border border-border-base max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">{selectedRole.name}</h2>
              <button
                onClick={() => setSelectedRole(null)}
                className="p-2 hover:bg-bg-muted rounded-lg transition-fast"
              >
                ✕
              </button>
            </div>
            {selectedRole.description && (
              <p className="text-text-secondary mb-4">{selectedRole.description}</p>
            )}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-text-primary mb-2">الصلاحيات:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedRole.permissions.length > 0 ? (
                    selectedRole.permissions.map((p) => (
                      <span
                        key={p.id}
                        className="px-3 py-1.5 rounded-lg text-sm bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                      >
                        {p.label || p.key}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-tertiary">لا توجد صلاحيات</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-text-primary mb-2">
                  المستخدمين ({selectedRole.users.length}):
                </h3>
                {selectedRole.users.length > 0 ? (
                  <div className="space-y-1">
                    {selectedRole.users.map((u: any) => (
                      <div key={u.id} className="text-sm text-text-secondary">
                        {u.User?.name || u.User?.email || 'مستخدم'}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-text-tertiary text-sm">لا يوجد مستخدمين</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
