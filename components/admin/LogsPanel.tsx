const LOG_MESSAGE = [
  {
    time: 'قبل دقيقة',
    actor: 'Audit Manager',
    action: 'راجع سجلات النسخ الاحتياطية.',
  },
  {
    time: 'قبل 12 دقيقة',
    actor: 'Admin',
    action: 'حدّث إعدادات SMTP للبيئة المحلية.',
  },
  {
    time: 'قبل ساعة',
    actor: 'IA_Lead',
    action: 'أرسل تنبيهًا حول مهام الامتثال المتأخرة.',
  },
] as const;

export function LogsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        عند تفعيل التكامل مع نظام السجلات سيتم عرض أحدث الأحداث هنا مع المرشحات اللازمة. فيما يلي نموذج للعرض.
      </p>
      <ol className="space-y-3">
        {LOG_MESSAGE.map(entry => (
          <li key={`${entry.actor}-${entry.time}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-slate-900">{entry.actor}</span>
              <span className="text-xs text-slate-500">{entry.time}</span>
            </div>
            <p className="text-sm text-slate-600">{entry.action}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
