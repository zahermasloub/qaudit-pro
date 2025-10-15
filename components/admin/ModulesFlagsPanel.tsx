const MODULE_FLAGS = [
  { name: 'Evidence Intake', status: 'مُفعّل', description: 'استقبال الأدلة ومتابعة حالتها.' },
  { name: 'Fieldwork Automation', status: 'قيد التحضير', description: 'أتمتة مهام الميدانية والمهام اليومية.' },
  { name: 'Compliance Mapping', status: 'مجدول', description: 'ربط اللوائح بالمهام والدلائل.' },
  { name: 'Reporting Suite', status: 'مُفعّل', description: 'تجميع التقارير ونشرها داخليًا.' },
] as const;

export function ModulesFlagsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        استخدم هذه القائمة لمتابعة حالة الوحدات الرئيسية في المنصّة. سيتم ربطها بإجراءات التفعيل الفعلية لاحقًا.
      </p>
      <ul className="space-y-3">
        {MODULE_FLAGS.map(module => (
          <li
            key={module.name}
            className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300"
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-slate-900">{module.name}</h3>
              <span className="inline-flex items-center justify-center rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-slate-600">
                {module.status}
              </span>
            </div>
            <p className="text-sm text-slate-600">{module.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
