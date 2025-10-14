'use client';

export default function AdminBackupsPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="bg-white border rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-semibold">سجل النسخ</div>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            تشغيل نسخة الآن
          </button>
        </div>
        <div className="table-wrap overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-right">
                <th>الزمن</th>
                <th>الحالة</th>
                <th>الموقع</th>
                <th>الحجم</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="[&>td]:px-3 [&>td]:py-2 text-slate-700">
                <td>-</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white border rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-base font-semibold">جدولة النسخ</div>
          <button
            type="button"
            className="px-3 py-1.5 text-sm rounded-md border font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
          >
            إضافة جدول
          </button>
        </div>
        <div className="text-slate-600 text-sm">لم تتم إضافة جداول بعد.</div>
      </div>
    </div>
  );
}
