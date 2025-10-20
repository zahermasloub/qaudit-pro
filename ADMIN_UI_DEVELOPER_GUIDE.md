# دليل المطور — Admin UI Refresh

## 📦 ما تم إنجازه

تم إجراء تدقيق شامل وإعادة بناء جزئية لواجهة الأدمن في **QAudit Pro**. النظام يعمل على:
- **Next.js 14** (App Router) + React 18 + TypeScript
- **Tailwind CSS** + shadcn/ui
- **PostgreSQL 18** مع RLS + TLS
- **RTL** كلغة أساسية (العربية)

---

## 📋 التقارير المنتجة

### 1. تقرير التدقيق (`ADMIN_UI_AUDIT.md`)
- ✅ 20 ملاحظة مصنفة (Must/Should/Could)
- ✅ فحوص WCAG 2.1 AA (38% متوافق حالياً)
- ✅ خريطة هيكلية ASCII للصفحات الحالية
- ✅ خطة عمل مرحلية (4 Sprints)

**أهم النتائج**:
- Dashboard يعرض بيانات ثابتة (—) بدلاً من KPIs حقيقية
- الجداول بدون virtualization/pagination متقدم
- عدم وجود نظام توست/إشعارات موحد
- نقص في ARIA labels و keyboard navigation
- لا توجد واجهة لإدارة المرفقات (core.attachments)

---

### 2. مواصفة التصميم (`ADMIN_UI_SPEC.md`)
- ✅ خريطة تنقل كاملة (Sitemap)
- ✅ Design Tokens (CSS Variables)
- ✅ Wireframes نصية ASCII
- ✅ خريطة المكونات (Component Map)
- ✅ حالات Responsive (360px → 1920px)
- ✅ تدفقات التفاعل (Mermaid Diagrams)
- ✅ إرشادات A11y
- ✅ مصادر البيانات (API Endpoints + SQL Queries)

**الصفحات المستهدفة**:
- `/admin/dashboard` — KPIs + مخططات + نشاط حديث
- `/admin/users` — جدول متقدم + CRUD + RLS Preview
- `/admin/roles` — بطاقات + permissions checkboxes
- `/admin/settings` — tabs + Feature Flags
- `/admin/logs` — فلاتر متقدمة + تصدير CSV
- `/admin/attachments` ⭐ **جديد** — رفع/تنزيل/معاينة

---

## 🎨 Design System المُنفّذ

### ملف `styles/design-tokens.css`

```css
:root {
  /* Spacing: --space-1 to --space-12 */
  /* Colors: --color-bg-*, --color-text-*, --color-brand-* */
  /* Shadows: --shadow-sm to --shadow-2xl */
  /* Typography: --text-xs to --text-4xl */
  /* Z-Index: --z-dropdown to --z-toast */
  /* Transitions: --transition-fast to --transition-slowest */
  /* Focus: --focus-ring-width, --focus-ring-color */
}

[data-theme='dark'] {
  /* Dark mode overrides */
}

@media (prefers-contrast: high) {
  /* High contrast adjustments */
}

@media (prefers-reduced-motion: reduce) {
  /* Disable animations */
}
```

**الاستخدام**:
```css
.my-component {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
}
```

---

## 🧩 المكونات المُنشأة

### 1. `<Toaster />` — نظام الإشعارات

**المكتبة**: `sonner`  
**المكان**: `components/ui/Toaster.tsx`

```tsx
// في app/layout.tsx
import { Toaster } from '@/components/ui/Toaster';

<body>
  {children}
  <Toaster />
</body>
```

**الاستخدام**:
```tsx
import { toast } from 'sonner';

// Success
toast.success('تم حفظ التغييرات بنجاح');

// Error
toast.error('حدث خطأ أثناء الحفظ');

// مع إجراء
toast('تم حذف المستخدم', {
  action: {
    label: 'تراجع',
    onClick: () => undoDelete(),
  },
});
```

**الميزات**:
- ✅ RTL كامل
- ✅ Dark Mode
- ✅ أنواع: success/error/warning/info
- ✅ إمكانية إضافة أزرار actions
- ✅ إغلاق تلقائي بعد 4 ثواني

---

### 2. `<EmptyState />` — حالة فارغة

**المكان**: `components/ui/EmptyState.tsx`

```tsx
import { Users, Plus } from 'lucide-react';

<EmptyState
  icon={Users}
  title="لا يوجد مستخدمون"
  message="ابدأ بإضافة أول مستخدم للنظام"
  action={{
    label: 'إضافة مستخدم',
    onClick: () => setShowDialog(true),
    icon: Plus,
  }}
/>
```

**الميزات**:
- ✅ أيقونة من lucide-react
- ✅ نوعين: default, error
- ✅ زر CTA اختياري
- ✅ A11y: role="status", aria-live

---

### 3. `<Skeleton />` — حالة التحميل

**المكان**: `components/ui/Skeleton.tsx`

```tsx
// نص واحد
<Skeleton variant="text" width="60%" />

// عدة سطور
<Skeleton variant="text" lines={3} />

// مستطيل (بطاقة)
<Skeleton variant="rect" width="100%" height="200px" />

// دائرة (صورة شخصية)
<Skeleton variant="circle" width="48px" height="48px" />

// جدول كامل
<SkeletonTable rows={5} cols={4} />

// بطاقة كاملة
<SkeletonCard />
```

**الميزات**:
- ✅ 3 أنواع: text, rect, circle
- ✅ مكونات مركبة: SkeletonTable, SkeletonCard
- ✅ A11y: aria-label="جارِ التحميل"
- ✅ animate-pulse من Tailwind

---

### 4. `<ConfirmDialog />` — حوار تأكيد

**المكان**: `components/ui/ConfirmDialog.tsx`

```tsx
const [open, setOpen] = useState(false);

<ConfirmDialog
  open={open}
  onClose={() => setOpen(false)}
  type="danger"
  title="حذف المستخدم"
  message="هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء."
  confirmLabel="حذف"
  cancelLabel="إلغاء"
  onConfirm={async () => {
    await deleteUser(userId);
    toast.success('تم حذف المستخدم');
    setOpen(false);
  }}
/>
```

**الميزات**:
- ✅ 3 أنواع: info, warning, danger (ألوان وأيقونات مختلفة)
- ✅ دعم async operations
- ✅ حالة loading مع spinner
- ✅ Escape key للإغلاق
- ✅ Lock body scroll
- ✅ A11y: role="dialog", aria-modal, focus trap

---

## 📦 التبعيات المُضافة

```json
{
  "dependencies": {
    "sonner": "^2.0.7"
  }
}
```

**لتثبيت**:
```bash
pnpm install
```

---

## 🚀 الخطوات التالية (للمطورين)

### المرحلة التالية: بناء المكونات المتبقية

#### 1. DataTable (TanStack Table)

```bash
pnpm add @tanstack/react-table @tanstack/react-virtual
```

**المكان المقترح**: `components/ui/DataTable.tsx`

**الميزات المطلوبة**:
- ✅ Virtualization للأداء (1000+ صف)
- ✅ Sorting, filtering, pagination
- ✅ Checkbox للتحديد المتعدد
- ✅ Sticky columns (الإجراءات)
- ✅ Responsive (scroll أفقي في Mobile)
- ✅ حفظ حالة الفلاتر في URL
- ✅ تصدير CSV/Excel

**مثال الاستخدام**:
```tsx
<DataTable
  columns={userColumns}
  data={users}
  onSort={(column, direction) => {}}
  onFilter={(filters) => {}}
  virtualizer
  selectable
  onExport={() => exportToCSV(users)}
/>
```

---

#### 2. FiltersBar

**المكان المقترح**: `components/ui/FiltersBar.tsx`

```tsx
<FiltersBar
  filters={[
    { type: 'search', name: 'q', placeholder: 'بحث...' },
    { type: 'select', name: 'role', label: 'الدور', options: roles },
    { type: 'date-range', name: 'date', label: 'التاريخ' },
  ]}
  values={filterValues}
  onChange={setFilterValues}
  onApply={applyFilters}
  onReset={resetFilters}
/>
```

---

#### 3. KPICard

**المكان المقترح**: `components/admin/KPICard.tsx`

```tsx
<KPICard
  label="إجمالي الارتباطات"
  value={45}
  icon={Briefcase}
  trend={{ value: +12, direction: 'up' }}
  href="/admin/engagements"
/>
```

---

### تحسين Admin Dashboard

**الملف**: `app/(app)/admin/dashboard/page.tsx`

**التغييرات المطلوبة**:
1. إنشاء API endpoint: `/api/admin/kpis`
2. جلب بيانات من `mv_org_kpis`:
   ```sql
   SELECT 
     SUM(engagements_total) AS engagements_total,
     SUM(findings_total) AS findings_total,
     SUM(recs_total) AS recs_total,
     SUM(recs_open) AS recs_open
   FROM core.mv_org_kpis;
   ```
3. عرض KPICards بالبيانات الحقيقية
4. إضافة مخطط trends (Recharts أو Chart.js)
5. عرض آخر 5 سجلات من `core.audit_logs`

**الكود المقترح**:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { KPICard } from '@/components/admin/KPICard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Briefcase, FileText, AlertTriangle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/kpis')
      .then(res => res.json())
      .then(data => setKpis(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="الارتباطات"
          value={kpis.engagements_total}
          icon={Briefcase}
          href="/admin/engagements"
        />
        <KPICard
          label="النتائج"
          value={kpis.findings_total}
          icon={FileText}
          href="/admin/findings"
        />
        <KPICard
          label="التوصيات المفتوحة"
          value={kpis.recs_open}
          icon={AlertTriangle}
          href="/admin/recommendations"
        />
      </div>
      {/* Chart, Recent Activity... */}
    </div>
  );
}
```

---

## 🧪 الاختبارات

### قائمة التحقق قبل الدمج

- [ ] جميع الصفحات تعمل بدون أخطاء في Console
- [ ] `pnpm run build` ينجح بدون أخطاء
- [ ] Dark Mode يعمل على جميع الصفحات
- [ ] RTL صحيح (لا تمدد أفقي، لا نصوص مقطوعة)
- [ ] جميع الأزرار يمكن الوصول إليها بـTab
- [ ] Escape يغلق Dialogs/Drawers
- [ ] Toast يظهر في جميع الإجراءات (نجاح/فشل)
- [ ] Responsive على 360px, 768px, 1280px
- [ ] ARIA labels موجودة (فحص مع axe DevTools)
- [ ] Contrast ≥ 4.5:1 (فحص مع Contrast Checker)

### اختبارات قابلية الاستخدام

| السيناريو | الخطوات | النتيجة المتوقعة |
|-----------|---------|-------------------|
| إضافة مستخدم | 1. انقر "+ مستخدم"<br>2. املأ النموذج<br>3. احفظ | يظهر في الجدول فوراً + toast نجاح |
| فلترة السجلات | 1. اختر تاريخ<br>2. اكتب كلمة بحث<br>3. فلتر | الجدول يتحدث فوراً + URL يتحدث |
| Dark Mode | 1. انقر أيقونة القمر | الواجهة تتحول فوراً بدون وميض |
| Keyboard | 1. Tab عبر العناصر<br>2. Esc لإغلاق Dialog | Focus واضح + Dialog يُغلق |

---

## 📚 الموارد الإضافية

- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Tailwind RTL Plugin Docs](https://github.com/20minutes/tailwindcss-rtl)
- [Sonner Documentation](https://sonner.emilkowal.ski/)
- [TanStack Table](https://tanstack.com/table/v8)
- [Lucide Icons](https://lucide.dev/)

---

## 🤝 المساهمة

عند إضافة مكونات جديدة:
1. ✅ استخدم Design Tokens من `design-tokens.css`
2. ✅ أضف ARIA attributes (role, aria-label, aria-describedby)
3. ✅ دعم Keyboard Navigation (Tab, Escape, Enter)
4. ✅ دعم Dark Mode (`[data-theme="dark"]`)
5. ✅ دعم RTL (`[dir="rtl"]`)
6. ✅ اختبر على Responsive breakpoints
7. ✅ أضف JSDoc comments

---

## 📞 الدعم

للأسئلة أو المشاكل، افتح Issue في المستودع أو تواصل مع الفريق.

**آخر تحديث**: 2025-01-20  
**الإصدار**: 2.0 (Admin UI Refresh)
