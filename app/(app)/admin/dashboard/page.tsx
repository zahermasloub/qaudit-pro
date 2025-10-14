'use client';

const summaryCards = [
  { label: 'المستخدمون', value: '—' },
  { label: 'الأدوار', value: '—' },
  { label: 'الإعدادات', value: '—' },
  { label: 'آخر 24 ساعة (سجلات)', value: '—' },
] as const;

export default function AdminDashboardPage() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {summaryCards.map(card => (
          <div key={card.label} className="bg-white border rounded-2xl p-4 shadow-sm">
            <div className="text-slate-500 text-xs mb-1">{card.label}</div>
            <div className="text-slate-900 text-2xl font-semibold">{card.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
        <div className="bg-white border rounded-2xl p-4 min-h-[220px]">إحصائيات الاستخدام (Placeholder)</div>
        <div className="bg-white border rounded-2xl p-4 min-h-[220px]">أحدث السجلات (Placeholder)</div>
      </div>
    </div>
  );
}
