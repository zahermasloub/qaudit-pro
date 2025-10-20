'use client';

import type { ReactNode } from "react";
import { useRouter } from 'next/navigation';
import { Users, Shield, Settings, FileText, Database, LayoutDashboard, Download } from 'lucide-react';
import { CommandPalette, type CommandAction } from '@/components/ui/CommandPalette';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { RLSPreviewProvider } from '@/lib/RLSPreviewContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { isOpen, closePalette } = useCommandPalette();

  // Define admin actions
  const actions: CommandAction[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'لوحة التحكم',
      description: 'عرض الإحصائيات والمؤشرات',
      icon: LayoutDashboard,
      keywords: ['dashboard', 'لوحة', 'احصائيات'],
      onSelect: () => router.push('/admin/dashboard'),
      category: 'navigation',
    },
    {
      id: 'nav-users',
      title: 'المستخدمون',
      description: 'إدارة المستخدمين والصلاحيات',
      icon: Users,
      keywords: ['users', 'مستخدمون', 'حسابات'],
      onSelect: () => router.push('/admin/users'),
      category: 'navigation',
    },
    {
      id: 'nav-roles',
      title: 'الأدوار والصلاحيات',
      description: 'إدارة أدوار المستخدمين',
      icon: Shield,
      keywords: ['roles', 'أدوار', 'صلاحيات', 'permissions'],
      onSelect: () => router.push('/admin/roles'),
      category: 'navigation',
    },
    {
      id: 'nav-logs',
      title: 'سجلات النظام',
      description: 'عرض سجلات الأحداث والإجراءات',
      icon: FileText,
      keywords: ['logs', 'سجلات', 'audit'],
      onSelect: () => router.push('/admin/logs'),
      category: 'navigation',
    },
    {
      id: 'nav-settings',
      title: 'الإعدادات',
      description: 'إعدادات النظام',
      icon: Settings,
      keywords: ['settings', 'إعدادات', 'تكوين'],
      onSelect: () => router.push('/admin/settings'),
      category: 'navigation',
    },
    {
      id: 'nav-attachments',
      title: 'إدارة المرفقات',
      description: 'عرض وإدارة الملفات',
      icon: Database,
      keywords: ['attachments', 'مرفقات', 'ملفات', 'files'],
      onSelect: () => router.push('/admin/attachments'),
      category: 'navigation',
    },

    // Actions
    {
      id: 'action-export-users',
      title: 'تصدير المستخدمين',
      description: 'تصدير قائمة المستخدمين إلى CSV',
      icon: Download,
      keywords: ['export', 'تصدير', 'csv', 'users'],
      onSelect: () => {
        router.push('/admin/users');
        // TODO: Trigger export action
      },
      category: 'actions',
    },
    {
      id: 'action-export-logs',
      title: 'تصدير السجلات',
      description: 'تصدير سجلات النظام إلى CSV',
      icon: Download,
      keywords: ['export', 'تصدير', 'csv', 'logs'],
      onSelect: () => {
        router.push('/admin/logs');
        // TODO: Trigger export action
      },
      category: 'actions',
    },

    // Admin
    {
      id: 'admin-create-user',
      title: 'إنشاء مستخدم جديد',
      description: 'إضافة مستخدم إلى النظام',
      icon: Users,
      keywords: ['create', 'user', 'إنشاء', 'مستخدم', 'جديد'],
      onSelect: () => {
        router.push('/admin/users');
        // TODO: Open create dialog
      },
      category: 'admin',
    },
    {
      id: 'admin-create-role',
      title: 'إنشاء دور جديد',
      description: 'إضافة دور جديد',
      icon: Shield,
      keywords: ['create', 'role', 'إنشاء', 'دور', 'جديد'],
      onSelect: () => {
        router.push('/admin/roles');
        // TODO: Open create dialog
      },
      category: 'admin',
    },
  ];

  return (
    <RLSPreviewProvider>
      <div className="admin-surface min-h-screen w-full bg-bg-base text-text-primary">
        <div className="container-shell mx-auto w-full px-3 sm:px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl font-semibold">الإدارة</h1>
            <div className="text-xs text-text-tertiary hidden sm:block">
              اضغط <kbd className="px-2 py-0.5 rounded border border-border-base bg-bg-muted">Cmd+K</kbd> للبحث السريع
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">{children}</div>
        </div>

        {/* Command Palette */}
        <CommandPalette
          actions={actions}
          open={isOpen}
          onClose={closePalette}
        />
      </div>
    </RLSPreviewProvider>
  );
}
