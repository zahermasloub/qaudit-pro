# 🎨 UI Components Library - QAudit Pro

مكتبة المكونات الكاملة لواجهة الأدمن مع دعم RTL، Dark Mode، وWCAG 2.1 AA

---

## 📦 المكونات المتاحة (10/10)

### مكونات أساسية

#### 1. Toaster
```tsx
import { toast } from 'sonner';

toast.success('تم الحفظ بنجاح');
toast.error('حدث خطأ');
toast.warning('تحذير');
toast.info('معلومة');
```

#### 2. EmptyState
```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  title="لا توجد بيانات"
  message="ابدأ بإضافة أول عنصر"
  actionLabel="إضافة"
  onAction={() => handleAdd()}
/>
```

#### 3. Skeleton
```tsx
import { Skeleton, SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton';

<Skeleton variant="text" />
<Skeleton variant="rect" className="w-full h-64" />
<SkeletonTable rows={5} columns={4} />
```

#### 4. ConfirmDialog
```tsx
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

<ConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={async () => await handleDelete()}
  type="danger"
  title="حذف المستخدم"
  message="هل أنت متأكد؟"
  confirmLabel="حذف"
/>
```

---

### مكونات متقدمة

#### 5. DataTable
```tsx
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'الاسم',
    cell: ({ row }) => <span>{row.getValue('name')}</span>,
  },
];

<DataTable
  columns={columns}
  data={users}
  selectable
  pagination
  pageSize={10}
  onSelectionChange={(rows) => setSelectedUsers(rows)}
/>
```

#### 6. FiltersBar
```tsx
import { FiltersBar, FilterOption } from '@/components/ui/FiltersBar';

const filters: FilterOption[] = [
  {
    id: 'status',
    label: 'الحالة',
    type: 'select',
    options: [
      { value: 'active', label: 'نشط' },
      { value: 'inactive', label: 'غير نشط' },
    ],
  },
  {
    id: 'date',
    label: 'التاريخ',
    type: 'date',
  },
];

<FiltersBar
  searchQuery={searchQuery}
  onSearchChange={setSearchQuery}
  filters={filters}
  filterValues={filterValues}
  onFilterChange={(id, value) => setFilterValues({ ...filterValues, [id]: value })}
  onClearFilters={() => setFilterValues({})}
/>
```

#### 7. KPICard
```tsx
import { KPICard, KPICardGrid } from '@/components/ui/KPICard';
import { Users } from 'lucide-react';

<KPICardGrid>
  <KPICard
    title="إجمالي المستخدمين"
    value={1234}
    change={12.5}
    trend="up"
    description="مقارنة بالشهر الماضي"
    icon={Users}
    onClick={() => router.push('/admin/users')}
  />
</KPICardGrid>
```

#### 8. ChartWidget
```tsx
import { ChartWidget, ChartDataPoint } from '@/components/ui/ChartWidget';

const data: ChartDataPoint[] = [
  { label: 'يناير', value: 30 },
  { label: 'فبراير', value: 45 },
  { label: 'مارس', value: 60 },
];

<ChartWidget
  title="المستخدمين الجدد"
  type="line"
  data={data}
  color="#3b82f6"
  showLegend
/>
```

#### 9. FileUploader
```tsx
import { FileUploader, UploadedFile } from '@/components/ui/FileUploader';

const [files, setFiles] = useState<UploadedFile[]>([]);

<FileUploader
  onUpload={(newFiles) => setFiles([...files, ...newFiles])}
  onRemove={(index) => setFiles(files.filter((_, i) => i !== index))}
  files={files}
  accept="image/*,.pdf"
  maxSize={5}
  maxFiles={10}
  multiple
/>
```

#### 10. Breadcrumbs
```tsx
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';

const items: BreadcrumbItem[] = [
  { label: 'لوحة التحكم', href: '/admin/dashboard' },
  { label: 'المستخدمين', href: '/admin/users' },
  { label: 'تعديل مستخدم', current: true },
];

<Breadcrumbs items={items} showHome homeHref="/admin/dashboard" />
```

---

## 🎨 Design Tokens

جميع المكونات تستخدم متغيرات CSS من `styles/design-tokens.css`:

### الألوان
```css
--color-bg-base          /* خلفية رئيسية */
--color-bg-elevated      /* خلفية مرتفعة */
--color-bg-muted         /* خلفية خافتة */
--color-text-primary     /* نص رئيسي */
--color-text-secondary   /* نص ثانوي */
--color-brand-500        /* لون العلامة التجارية */
--color-error-600        /* لون الخطأ */
--color-success-600      /* لون النجاح */
```

### المسافات
```css
--space-1  /* 4px */
--space-2  /* 8px */
--space-3  /* 12px */
--space-4  /* 16px */
--space-6  /* 24px */
```

### الظلال
```css
--shadow-sm   /* ظل صغير */
--shadow-base /* ظل متوسط */
--shadow-lg   /* ظل كبير */
```

---

## ♿ إمكانية الوصول (A11y)

جميع المكونات تدعم:
- ✅ ARIA attributes
- ✅ Keyboard navigation (Tab, Enter, Space, Escape)
- ✅ Focus rings
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Reduced motion

---

## 🌓 Dark Mode

تفعيل Dark Mode:
```tsx
// في app/layout.tsx
<html dir="rtl" className="dark">
```

جميع الألوان تتكيف تلقائيًا عبر CSS variables.

---

## 🔧 التبعيات المطلوبة

```json
{
  "dependencies": {
    "sonner": "^2.0.7",
    "@tanstack/react-table": "^8.21.3",
    "@tanstack/react-virtual": "^3.13.12",
    "recharts": "^3.3.0",
    "lucide-react": "^0.x.x"
  }
}
```

---

## 📚 التوثيق الكامل

- **ADMIN_UI_AUDIT.md** — تقرير التدقيق (20 ملاحظة)
- **ADMIN_UI_SPEC.md** — المواصفة الكاملة
- **ADMIN_UI_DEVELOPER_GUIDE.md** — دليل المطور
- **PHASE3_COMPLETION_REPORT.md** — تقرير Phase 3

---

## 🚀 البدء السريع

```bash
# 1. تثبيت التبعيات
pnpm install

# 2. تشغيل التطوير
pnpm dev

# 3. بناء الإنتاج
pnpm build
```

---

## 🤝 المساهمة

عند إضافة مكون جديد:
1. استخدم `'use client'` إذا كان تفاعلي
2. أضف TypeScript types كاملة
3. استخدم Design Tokens من `design-tokens.css`
4. أضف ARIA attributes
5. ادعم RTL
6. اختبر Dark Mode
7. وثق في JSDoc مع `@example`

---

**آخر تحديث**: 2025-01-20  
**الحالة**: ✅ 10/10 مكونات جاهزة للإنتاج
