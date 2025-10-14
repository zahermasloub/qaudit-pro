'use client';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-3">
      <div className="bg-white border rounded-2xl p-3 flex items-center justify-between gap-2">
        <div className="text-base font-semibold">إعدادات النظام</div>
        <button
          type="button"
          className="px-3 py-1.5 text-sm rounded-md border font-medium bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        >
          إضافة/تعديل
        </button>
      </div>
      <div className="bg-white border rounded-2xl p-0 overflow-hidden">
        <div className="table-wrap overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr className="[&>th]:px-3 [&>th]:py-2 text-right">
                <th>المفتاح</th>
                <th>النوع</th>
                <th>القيمة</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="[&>td]:px-3 [&>td]:py-2 text-slate-700">
                <td>org.name</td>
                <td>string</td>
                <td>QAudit Pro</td>
                <td>
                  <button type="button" className="text-blue-600 hover:underline">
                    تعديل
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
