import type { ReactNode } from 'react';
import Link from 'next/link';

type ConsoleLayoutProps = {
  children: ReactNode;
};

export default function AdminConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">الأدمن</p>
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم الموحّدة</h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            العودة للوحة القديمة
          </Link>
        </header>
        <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{children}</main>
      </div>
    </div>
  );
}
