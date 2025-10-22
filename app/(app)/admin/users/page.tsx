'use client';

import { useEffect, useState } from 'react';
import { Edit, Trash2, UserPlus, Download, Shield } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/DataTable';
import { FiltersBar, FilterOption } from '@/components/ui/FiltersBar';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { BulkActionsBar, BulkAction } from '@/components/ui/BulkActionsBar';
import { RoleAssignDialog } from '@/components/admin/RoleAssignDialog';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';
import { RLSPreviewBar } from '@/components/admin/RLSPreviewBar';
import { useRLSPreview } from '@/lib/RLSPreviewContext';
import { useUndo } from '@/lib/UndoContext';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  locale: string;
  createdAt: string;
  roles: Array<{
    Role: {
      id: string;
      name: string;
    };
  }>;
}

export default function AdminUsersPage() {
  const { isPreviewMode, previewUser } = useRLSPreview();
  const { registerAction } = useUndo();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Bulk Actions State
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [roleAssignDialogOpen, setRoleAssignDialogOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dashboard' },
    { label: 'المستخدمين', current: true },
  ];

  const filters: FilterOption[] = [
    {
      id: 'role',
      label: 'الدور',
      type: 'select',
      options: [
        { value: 'Admin', label: 'مدير' },
        { value: 'IA_Lead', label: 'قائد التدقيق' },
        { value: 'IA_Auditor', label: 'مدقق' },
        { value: 'User', label: 'مستخدم' },
      ],
    },
    {
      id: 'locale',
      label: 'اللغة',
      type: 'select',
      options: [
        { value: 'ar', label: 'العربية' },
        { value: 'en', label: 'الإنجليزية' },
      ],
    },
  ];

  // جلب المستخدمين
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (data.ok) {
        setUsers(data.users);
      } else {
        toast.error('فشل في جلب المستخدمين');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }

  // حذف مستخدم واحد
  async function handleDelete(user: User) {
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.ok) {
        // تسجيل الإجراء للتراجع
        registerAction({
          type: 'delete',
          entityType: 'user',
          entityId: user.id,
          data: user,
          description: `تم حذف ${user.email}`,
        });

        fetchUsers(); // إعادة تحميل القائمة
      } else {
        toast.error(data.error || 'فشل في حذف المستخدم');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  }

  // حذف عدة مستخدمين
  async function handleBulkDelete() {
    if (selectedUsers.length === 0) return;

    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // حذف كل مستخدم على حدة
      for (const user of selectedUsers) {
        try {
          const response = await fetch(`/api/admin/users/${user.id}`, {
            method: 'DELETE',
          });
          const data = await response.json();

          if (data.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      // عرض النتيجة
      if (successCount > 0) {
        toast.success(`تم حذف ${successCount} مستخدم بنجاح`);
      }
      if (failCount > 0) {
        toast.error(`فشل في حذف ${failCount} مستخدم`);
      }

      // إعادة تحميل البيانات
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      toast.error('حدث خطأ أثناء الحذف الجماعي');
    } finally {
      setBulkProcessing(false);
      setBulkDeleteDialogOpen(false);
    }
  }

  // تصدير المستخدمين المحددين إلى CSV
  function handleExportSelected() {
    if (selectedUsers.length === 0) return;

    const csvHeaders = ['البريد الإلكتروني', 'الاسم', 'الدور', 'اللغة', 'تاريخ الإنشاء'];
    const csvRows = selectedUsers.map(user => [
      user.email,
      user.name || '—',
      user.role,
      user.locale === 'ar' ? 'العربية' : 'الإنجليزية',
      new Date(user.createdAt).toLocaleDateString('ar-EG'),
    ]);

    const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success(`تم تصدير ${selectedUsers.length} مستخدم`);
  }

  // تعيين دور جماعي
  async function handleBulkAssignRole(roleId: string) {
    if (selectedUsers.length === 0) return;

    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // تعيين الدور لكل مستخدم
      for (const user of selectedUsers) {
        try {
          const response = await fetch(`/api/admin/users/${user.id}/roles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roleId }),
          });
          const data = await response.json();

          if (data.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          failCount++;
        }
      }

      // عرض النتيجة
      if (successCount > 0) {
        toast.success(`تم تعيين الدور لـ ${successCount} مستخدم بنجاح`);
      }
      if (failCount > 0) {
        toast.error(`فشل في تعيين الدور لـ ${failCount} مستخدم`);
      }

      // إعادة تحميل البيانات
      await fetchUsers();
      setSelectedUsers([]);
    } catch (error) {
      console.error('Error bulk assigning role:', error);
      toast.error('حدث خطأ أثناء تعيين الدور');
    } finally {
      setBulkProcessing(false);
      setRoleAssignDialogOpen(false);
    }
  }

  // تعريف الأعمدة
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'email',
      header: 'البريد الإلكتروني',
      cell: ({ row }) => (
        <span className="font-medium text-text-primary">{row.original.email}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'الاسم',
      cell: ({ row }) => <span className="text-text-secondary">{row.original.name || '—'}</span>,
    },
    {
      accessorKey: 'role',
      header: 'الدور الأساسي',
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {row.original.role}
        </span>
      ),
    },
    {
      id: 'roles',
      header: 'الأدوار المضافة',
      cell: ({ row }) => {
        const userRoles = row.original.roles || [];
        if (userRoles.length === 0) {
          return <span className="text-text-tertiary text-xs">—</span>;
        }
        return (
          <div className="flex gap-1 flex-wrap">
            {userRoles.slice(0, 2).map(ur => (
              <span
                key={ur.Role.id}
                className="px-2 py-0.5 rounded-full text-xs bg-bg-muted text-text-secondary"
              >
                {ur.Role.name}
              </span>
            ))}
            {userRoles.length > 2 && (
              <span className="text-xs text-text-tertiary">+{userRoles.length - 2}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'locale',
      header: 'اللغة',
      cell: ({ row }) => (
        <span className="text-text-secondary text-sm">
          {row.original.locale === 'ar' ? 'العربية' : 'الإنجليزية'}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'تاريخ الإنشاء',
      cell: ({ row }) => (
        <span className="text-text-tertiary text-sm">
          {new Date(row.original.createdAt).toLocaleDateString('ar-EG')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              // TODO: فتح حوار التعديل
              toast.info('قريباً: حوار التعديل');
            }}
            className="p-1.5 rounded-lg text-brand-600 hover:bg-brand-50 transition-fast focus-ring"
            aria-label={`تعديل ${row.original.email}`}
          >
            <Edit size={16} />
          </button>
          <button
            type="button"
            onClick={() => {
              setUserToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
            className="p-1.5 rounded-lg text-error-600 hover:bg-error-50 transition-fast focus-ring"
            aria-label={`حذف ${row.original.email}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  // تطبيق الفلاتر
  const filteredUsers = users.filter(user => {
    // فلتر RLS Preview Mode
    // في وضع المعاينة، نعرض فقط المستخدمين الذين لهم نفس الدور أو أقل
    if (isPreviewMode && previewUser) {
      // قواعد RLS بسيطة للتوضيح:
      // - Admin يرى الجميع
      // - IA_Lead يرى IA_Auditor و User فقط (لا يرى Admin)
      // - IA_Auditor يرى User فقط
      // - User يرى نفسه فقط

      const roleHierarchy: Record<string, number> = {
        Admin: 4,
        IA_Lead: 3,
        IA_Auditor: 2,
        User: 1,
      };

      const previewUserLevel = roleHierarchy[previewUser.role] || 0;
      const userLevel = roleHierarchy[user.role] || 0;

      // User يرى نفسه فقط
      if (previewUser.role === 'User' && user.id !== previewUser.id) {
        return false;
      }

      // غير Admin لا يرى Admin
      if (previewUser.role !== 'Admin' && user.role === 'Admin') {
        return false;
      }

      // كل دور يرى من هم في نفس المستوى أو أقل
      if (userLevel > previewUserLevel) {
        return false;
      }
    }

    // فلتر البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesEmail = user.email.toLowerCase().includes(query);
      const matchesName = user.name?.toLowerCase().includes(query);
      if (!matchesEmail && !matchesName) return false;
    }

    // فلتر الدور
    if (filterValues.role && user.role !== filterValues.role) {
      return false;
    }

    // فلتر اللغة
    if (filterValues.locale && user.locale !== filterValues.locale) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* RLS Preview Bar */}
      <RLSPreviewBar pageName="المستخدمين" />

      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة المستخدمين</h1>
          <p className="text-sm text-text-tertiary mt-1">عرض وإدارة جميع مستخدمي النظام</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateDialogOpen(true)}
          className="
            px-4 py-2 rounded-lg
            bg-brand-600 text-white font-medium
            hover:bg-brand-700 transition-fast
            focus-ring
            flex items-center gap-2
          "
        >
          <UserPlus size={18} />
          <span>مستخدم جديد</span>
        </button>
      </div>

      {/* Filters */}
      <FiltersBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="بحث بالبريد أو الاسم..."
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
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="لا يوجد مستخدمين"
          message={
            searchQuery || Object.keys(filterValues).length > 0
              ? 'لم يتم العثور على مستخدمين مطابقين للبحث أو الفلاتر'
              : 'لا يوجد مستخدمين في النظام'
          }
          action={{
            label: 'إضافة مستخدم',
            onClick: () => setCreateDialogOpen(true),
          }}
        />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          pagination
          pageSize={10}
          selectable
          getRowId={row => row.id}
          onSelectionChange={setSelectedUsers}
        />
      )}

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedUsers.length}
        loading={bulkProcessing}
        loadingMessage={`جارٍ حذف ${selectedUsers.length} مستخدم...`}
        onClearSelection={() => setSelectedUsers([])}
        actions={[
          {
            id: 'export',
            label: 'تصدير CSV',
            icon: Download,
            onClick: handleExportSelected,
            variant: 'default',
          },
          {
            id: 'assign-role',
            label: 'تعيين دور',
            icon: Shield,
            onClick: () => setRoleAssignDialogOpen(true),
            variant: 'default',
          },
          {
            id: 'delete',
            label: `حذف (${selectedUsers.length})`,
            icon: Trash2,
            onClick: () => setBulkDeleteDialogOpen(true),
            variant: 'danger',
          },
        ]}
      />

      {/* Delete Confirmation Dialog (Single) */}
      {userToDelete && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
          }}
          onConfirm={() => handleDelete(userToDelete)}
          type="danger"
          title="حذف المستخدم"
          message={`هل أنت متأكد من حذف المستخدم "${userToDelete.email}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
          confirmLabel="حذف"
          cancelLabel="إلغاء"
        />
      )}

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
        type="danger"
        title="حذف جماعي"
        message={`هل أنت متأكد من حذف ${selectedUsers.length} مستخدم؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmLabel={`حذف ${selectedUsers.length} مستخدم`}
        cancelLabel="إلغاء"
      />

      {/* Role Assign Dialog */}
      <RoleAssignDialog
        open={roleAssignDialogOpen}
        onClose={() => setRoleAssignDialogOpen(false)}
        onConfirm={handleBulkAssignRole}
        userCount={selectedUsers.length}
        loading={bulkProcessing}
      />

      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
