const MODULE_FLAGS = [
  { name: 'Evidence Intake', status: 'مُفعّل', description: 'استقبال الأدلة ومتابعة حالتها اليومية.' },
  { name: 'Fieldwork Automation', status: 'قيد التحضير', description: 'أتمتة أعمال الميدان وتوليد المهام التلقائية.' },
  { name: 'Compliance Mapping', status: 'مجدول', description: 'ربط اللوائح بالدلائل والأنشطة الرقابية.' },
  { name: 'Reporting Suite', status: 'مُفعّل', description: 'تجميع التقارير ونشرها داخليًا وخارجيًا.' },
] as const;

export function ModulesFlagsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-neutral-600">
        استخدم هذه القائمة لمتابعة حالة الوحدات الرئيسية في المنصّة، وسيتم ربطها بخطوات التفعيل الفعلية في
        المراحل القادمة.
      </p>
      <ul className="space-y-3">
        {MODULE_FLAGS.map(module => (
          <li key={module.name} className="flex flex-col gap-3 rounded-2xl border border-stroke bg-muted p-5 transition hover:border-brand-100">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold text-brand-900">{module.name}</h3>
              <span className="inline-flex items-center justify-center rounded-full bg-surface px-3 py-0.5 text-xs font-semibold text-brand-700">
                {module.status}
              </span>
            </div>
            <p className="text-sm text-neutral-600">{module.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
