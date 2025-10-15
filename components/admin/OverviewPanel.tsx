import Link from 'next/link';

type QuickLink = {
  href: string;
  label: string;
  description: string;
};

const QUICK_LINKS: QuickLink[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    description: 'ملخّص مؤشرات العمل والمهام النشطة.',
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'إدارة أعضاء الفريق وأدوارهم.',
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    description: 'تحديث الصلاحيات وتوزيع المهام.',
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    description: 'إعدادات النظام العامة وتفضيلات الفريق.',
  },
  {
    href: '/admin/logs',
    label: 'Logs',
    description: 'سجل الأحداث والتغييرات الأخيرة.',
  },
  {
    href: '/admin/backups',
    label: 'Backups',
    description: 'إدارة النسخ الاحتياطية وجدولتها.',
  },
] as const;

export function OverviewPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {QUICK_LINKS.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
        >
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
              {link.label}
            </span>
            <p className="text-sm text-slate-600">{link.description}</p>
          </div>
          <span className="mt-4 text-sm font-semibold text-slate-900 group-hover:text-primary">
            انتقل الآن {'->'}
          </span>
        </Link>
      ))}
    </div>
  );
}
