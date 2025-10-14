'use client';

export default function AdminRolesPage() {
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 flex items-center justify-between gap-2">
        <div className="text-base font-semibold">الأدوار والصلاحيات</div>
        <button
          type="button"
          className="px-3 py-1.5 text-sm rounded-md border font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        >
          دور جديد
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="bg-white border rounded-2xl p-4">
          <div className="font-semibold mb-2">Admin</div>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700">
              ALL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
