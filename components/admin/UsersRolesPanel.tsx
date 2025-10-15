const ROLE_SUMMARY = [
  {
    role: 'Admin',
    description: 'تحكم كامل في إعدادات المنصّة، إنشاء الأعضاء وإدارة الوحدات.',
    responsibilities: ['إدارة الإعدادات', 'إدارة الصلاحيات', 'مراجعة السجلات'],
  },
  {
    role: 'Audit Manager',
    description: 'قيادة مشاريع التدقيق، ومتابعة المخرجات وحوكمة الجودة.',
    responsibilities: ['إسناد المهام', 'مراجعة الأدلة', 'تأكيد الامتثال'],
  },
  {
    role: 'IA_Lead',
    description: 'دور القيادة الداخلية الحالي؛ سيتم دمجه مع الأدوار الجديدة تدريجيًا.',
    responsibilities: ['مراجعة الأعمال اليومية', 'توجيه فرق العمل'],
  },
] as const;

export function UsersRolesPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        هذه نظرة سريعة على الأدوار الحرجة. سنربط اللوحة قريبًا بواجهات الإدارة التفصيلية لإجراء التعديلات مباشرةً.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {ROLE_SUMMARY.map(role => (
          <div
            key={role.role}
            className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h3 className="text-lg font-semibold text-slate-900">{role.role}</h3>
              <p className="text-sm text-slate-600">{role.description}</p>
            </div>
            <ul className="space-y-1 text-sm text-slate-600">
              {role.responsibilities.map(item => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
