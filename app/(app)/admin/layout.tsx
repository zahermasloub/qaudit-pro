import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-surface min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="container-shell mx-auto w-full px-3 sm:px-4 lg:px-6 py-4">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">الإدارة</h1>
        <div className="grid grid-cols-1 gap-4">{children}</div>
      </div>
    </div>
  );
}
