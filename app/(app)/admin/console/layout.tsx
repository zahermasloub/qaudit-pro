import type { ReactNode } from 'react';
import Link from 'next/link';

type ConsoleLayoutProps = {
  children: ReactNode;
};

export default function AdminConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    <div className="min-h-screen bg-muted">
      <div className="bg-gradient-to-b from-brand-500/15 to-transparent dark:from-brand-400/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <h1 className="text-2xl font-semibold tracking-tight text-contrast">الإدارة</h1>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-stroke/80 bg-surface px-4 py-2 text-sm font-medium text-brand-700 transition hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <span className="ltr:hidden">العودة للوحة القديمة</span>
            <span className="rtl:hidden">Back to legacy</span>
            <svg
              aria-hidden
              className="opacity-70"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path fill="currentColor" d="M10 19l-7-7l7-7v5h8v4h-8z" />
            </svg>
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-6">{children}</main>
    </div>
  );
}
