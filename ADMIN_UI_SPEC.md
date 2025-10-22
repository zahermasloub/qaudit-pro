# مواصفة تصميم واجهة الأدمن — QAudit Pro Admin UI Specification

**المشروع**: QAudit Pro — نظام تدقيق داخلي حكومي  
**النطاق**: إعادة بناء شاملة لواجهة `/admin/*`  
**التاريخ**: 2025-01-20  
**المصمم**: GitHub Copilot — AI UI/UX Expert  
**الإصدار**: 2.0 (Admin UI Refresh)

---

## 📚 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [خريطة التنقل](#خريطة-التنقل-sitemap)
3. [Design Tokens](#design-tokens)
4. [Wireframes نصية](#wireframes-نصية)
5. [خريطة المكونات](#خريطة-المكونات-component-map)
6. [حالات Responsive](#حالات-responsive)
7. [تدفقات التفاعل](#تدفقات-التفاعل-interaction-flows)
8. [حالات الواجهة](#حالات-الواجهة-ui-states)
9. [إرشادات إمكانية الوصول](#إرشادات-إمكانية-الوصول-a11y)
10. [مصادر البيانات](#مصادر-البيانات-data-sources)

---

## 🎯 نظرة عامة

### الأهداف الرئيسية

1. **قابلية الاستخدام**: تمكين المدراء من إدارة المستخدمين/الأدوار/الإعدادات بكفاءة
2. **الشفافية**: عرض KPIs حقيقية من قاعدة البيانات (mv_org_kpis)
3. **إمكانية الوصول**: WCAG 2.1 AA، RTL كامل، Dark Mode، لوحة المفاتيح
4. **الأداء**: جداول virtualized، lazy loading، حفظ حالة الفلاتر
5. **الأمان**: تأكيدات للإجراءات الحساسة، RLS، audit logging

### المبادئ التصميمية

- **الوضوح أولاً**: كل عنصر له هدف واضح
- **الاتساق**: نفس الأنماط عبر جميع الصفحات
- **التغذية الراجعة**: كل إجراء له نتيجة مرئية (toast/animation)
- **التسامح مع الأخطاء**: undo، confirmations، inline validation
- **التدرج في الإفصاح**: إخفاء التعقيد، إظهار التفاصيل عند الحاجة

---

## 🗺️ خريطة التنقل (Sitemap)

```
/admin
├── layout (AdminLayout)
│   ├── Header
│   │   ├── Breadcrumbs
│   │   ├── Search (Cmd+K)
│   │   ├── ThemeToggle
│   │   └── UserMenu
│   └── Content
│
├── /admin (Overview — OverviewPanel)
│   └── 6 Cards → Dashboard, Users, Roles, Settings, Logs, Attachments
│
├── /admin/dashboard ⭐ NEW
│   ├── KPI Cards (4-6 metrics)
│   ├── Trends Chart (Line)
│   ├── Recent Activity Feed
│   └── Quick Actions
│
├── /admin/users
│   ├── FiltersBar (search, role, status, dept)
│   ├── DataTable (virtualized)
│   │   ├── Columns: checkbox, name, email, roles, dept, status, actions
│   │   ├── Row Actions: Edit, Delete, View As (RLS Preview)
│   │   └── Bulk Actions: Assign Role, Deactivate, Export
│   ├── CreateUserDialog (RHF + Zod)
│   └── EditUserDrawer
│
├── /admin/roles
│   ├── Role Cards Grid
│   ├── CreateRoleDialog
│   │   ├── Name, Description
│   │   ├── Permission Checkboxes (grouped)
│   │   └── Preview: "Users with this role can..."
│   └── EditRoleDrawer
│
├── /admin/settings
│   ├── Tabs: General, Security, Backup, Features
│   ├── General: org.name, locale, timezone
│   ├── Security: password_policy, session_timeout
│   ├── Backup: auto_backup_enabled, cron_expr
│   ├── Features: enable_new_admin_ui, enable_attachments_manager
│   └── SettingEditDialog (inline edit)
│
├── /admin/logs
│   ├── FiltersBar (search, action, actor, date range)
│   ├── DataTable (virtualized)
│   │   ├── Columns: timestamp, action, actor, target, ip, details
│   │   └── Row Actions: View Payload (JSON Modal)
│   └── ExportCSV
│
├── /admin/attachments ⭐ NEW
│   ├── FiltersBar (search, type, engagement, date)
│   ├── DataTable/Grid View Toggle
│   │   ├── Columns: thumbnail, name, type, size, engagement, uploader, date, actions
│   │   └── Row Actions: Download, Rename, Tag, Delete
│   ├── Upload Zone (Drag & Drop)
│   │   ├── Chunked Upload (files > 10MB)
│   │   ├── Progress Bar
│   │   └── Virus Scan Status
│   └── PreviewModal (images/PDF inline)
│
└── /admin/backups
    ├── Schedule Manager (existing)
    └── Manual Backup Trigger
```

---

## 🎨 Design Tokens

### ملف: `styles/design-tokens.css`

```css
:root {
  /* ===== Spacing Scale ===== */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.5rem; /* 24px */
  --space-6: 2rem; /* 32px */
  --space-8: 3rem; /* 48px */
  --space-10: 4rem; /* 64px */

  /* ===== Colors — Light Mode ===== */
  --color-bg-base: #ffffff;
  --color-bg-subtle: #f8fafc; /* slate-50 */
  --color-bg-muted: #f1f5f9; /* slate-100 */
  --color-bg-elevated: #ffffff;

  --color-text-primary: #0f172a; /* slate-900 */
  --color-text-secondary: #475569; /* slate-600 */
  --color-text-tertiary: #94a3b8; /* slate-400 */
  --color-text-inverse: #ffffff;

  --color-border-base: #e2e8f0; /* slate-200 */
  --color-border-strong: #cbd5e1; /* slate-300 */

  --color-brand-50: #eef7ff;
  --color-brand-500: #1f7fff;
  --color-brand-600: #1765d6;
  --color-brand-700: #124fac;

  --color-success-50: #ecfdf5;
  --color-success-500: #10b981;
  --color-success-600: #059669;

  --color-warning-50: #fffbeb;
  --color-warning-500: #f59e0b;
  --color-warning-600: #d97706;

  --color-danger-50: #fef2f2;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;

  /* ===== Shadows ===== */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* ===== Border Radius ===== */
  --radius-sm: 0.375rem; /* 6px */
  --radius-md: 0.5rem; /* 8px */
  --radius-lg: 0.75rem; /* 12px */
  --radius-xl: 1rem; /* 16px */
  --radius-2xl: 1.5rem; /* 24px */
  --radius-full: 9999px;

  /* ===== Typography ===== */
  --font-arabic: 'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif;
  --font-mono: 'Consolas', 'Monaco', 'Courier New', monospace;

  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */

  /* ===== Z-Index ===== */
  --z-base: 0;
  --z-dropdown: 1000;
  --z-sticky: 1100;
  --z-overlay: 1200;
  --z-modal: 1300;
  --z-toast: 1400;

  /* ===== Transitions ===== */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);

  /* ===== Focus Ring ===== */
  --focus-ring-width: 2px;
  --focus-ring-offset: 2px;
  --focus-ring-color: var(--color-brand-500);
}

/* ===== Dark Mode ===== */
[data-theme='dark'] {
  --color-bg-base: #0a0a0a;
  --color-bg-subtle: #171717; /* neutral-900 */
  --color-bg-muted: #262626; /* neutral-800 */
  --color-bg-elevated: #1c1c1c;

  --color-text-primary: #f5f5f5; /* neutral-100 */
  --color-text-secondary: #a3a3a3; /* neutral-400 */
  --color-text-tertiary: #737373; /* neutral-500 */
  --color-text-inverse: #0a0a0a;

  --color-border-base: #404040; /* neutral-700 */
  --color-border-strong: #525252; /* neutral-600 */

  /* Brand colors stay the same but slightly adjusted for dark */
  --color-brand-500: #3b82f6; /* blue-500 */
  --color-brand-600: #2563eb;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
}

/* ===== RTL Support ===== */
[dir='rtl'] {
  /* Tailwind RTL plugin handles most cases */
  /* Custom overrides if needed */
}

/* ===== High Contrast Mode ===== */
@media (prefers-contrast: high) {
  :root {
    --color-border-base: #000000;
    --color-text-primary: #000000;
    --focus-ring-width: 3px;
  }

  [data-theme='dark'] {
    --color-border-base: #ffffff;
    --color-text-primary: #ffffff;
  }
}

/* ===== Reduced Motion ===== */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### تحديث `tailwind.config.ts`

```typescript
import animate from 'tailwindcss-animate';
import rtl from 'tailwindcss-rtl';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Map CSS variables to Tailwind
        brand: {
          50: 'rgb(var(--color-brand-50) / <alpha-value>)',
          500: 'var(--color-brand-500)',
          600: 'var(--color-brand-600)',
          700: 'var(--color-brand-700)',
        },
        success: {
          50: 'var(--color-success-50)',
          500: 'var(--color-success-500)',
          600: 'var(--color-success-600)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
        },
        danger: {
          50: 'var(--color-danger-50)',
          500: 'var(--color-danger-500)',
          600: 'var(--color-danger-600)',
        },
      },
      spacing: {
        0: 'var(--space-0)',
        1: 'var(--space-1)',
        2: 'var(--space-2)',
        3: 'var(--space-3)',
        4: 'var(--space-4)',
        5: 'var(--space-5)',
        6: 'var(--space-6)',
        8: 'var(--space-8)',
        10: 'var(--space-10)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      fontFamily: {
        arabic: 'var(--font-arabic)',
        mono: 'var(--font-mono)',
      },
      transitionDuration: {
        fast: 'var(--transition-fast)',
        base: 'var(--transition-base)',
        slow: 'var(--transition-slow)',
      },
      zIndex: {
        dropdown: 'var(--z-dropdown)',
        sticky: 'var(--z-sticky)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
      },
    },
  },
  plugins: [rtl, animate],
};
```

---

## 📐 Wireframes نصية

### 1. Admin Dashboard (`/admin/dashboard`)

```
┌────────────────────────────────────────────────────────────────┐
│ 🏠 الرئيسية > الإدارة > لوحة التحكم        [🔍][🌙][👤]        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────── KPI Cards ──────────────────────┐   │
│  │ ┌────────┬────────┬────────┬────────┬────────┬────────┐ │   │
│  │ │   45   │   128  │   87   │   12   │   23   │   5    │ │   │
│  │ │ Engs   │Findings│  Recs  │Overdue │Actions │ Open   │ │   │
│  │ │ [→]    │ [→]    │ [→]    │ [⚠️→]  │ [→]    │ [→]    │ │   │
│  │ └────────┴────────┴────────┴────────┴────────┴────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 📊 الاتجاهات الشهرية (Line Chart)                        │ │
│  │    Engagements per Month                                 │ │
│  │    [Jan][Feb][Mar][Apr][May][Jun]                        │ │
│  │     ▁   ▂   ▃   ▅   ▇   █                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌───────────────────┬────────────────────────────────────┐   │
│  │ 🔔 النشاط الأخير  │  🔧 إجراءات سريعة                 │   │
│  │ ────────────────  │  ─────────────────                 │   │
│  │ • User X added    │  [+ مستخدم جديد]                   │   │
│  │   2 min ago       │  [⚙️ الإعدادات]                    │   │
│  │ • Role Y modified │  [📂 المرفقات]                     │   │
│  │   5 min ago       │  [📥 تصدير التقرير]                │   │
│  │ • Setting changed │                                    │   │
│  │   12 min ago      │                                    │   │
│  └───────────────────┴────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### 2. Users Management (`/admin/users`)

```
┌────────────────────────────────────────────────────────────────┐
│ 🏠 > الإدارة > المستخدمون                      [🔍][🌙][👤]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [🔍 بحث...] [الدور▼] [الحالة▼] [القسم▼]  [+ مستخدم]   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────── DataTable ──────────────────────┐  │
│  │ [✓] الاسم        البريد           الدور      الحالة  ⚡│  │
│  │ ───────────────────────────────────────────────────────│  │
│  │ [ ] أحمد محمد    ahmed@gov.sa    Admin      نشط   [⋮]│  │
│  │ [ ] سارة علي     sara@gov.sa     Auditor    نشط   [⋮]│  │
│  │ [ ] خالد حسن     khaled@gov.sa   Manager    معطل  [⋮]│  │
│  │ ...                                                    │  │
│  │ ───────────────────────────────────────────────────────│  │
│  │ ◀ 1 2 3 ... 10 ▶                    [تصدير CSV]      │  │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  [عند التحديد] ⚡ Bulk Actions:                               │
│  [تغيير الدور] [تعطيل] [حذف]                                 │
└────────────────────────────────────────────────────────────────┘
```

### 3. Attachments Manager (`/admin/attachments`)

```
┌────────────────────────────────────────────────────────────────┐
│ 🏠 > الإدارة > المرفقات                        [🔍][🌙][👤]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ [🔍 بحث...] [النوع▼] [الارتباط▼] [التاريخ▼]  [⇅ رفع]  │ │
│  │ [📋 Grid View] [📊 Table View]                           │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────── Grid View ──────────────────────┐  │
│  │ ┌────────┬────────┬────────┬────────┐                   │  │
│  │ │ [📄]   │ [📊]   │ [🖼️]   │ [📁]   │                   │  │
│  │ │ report │ budget │ photo  │ docs   │                   │  │
│  │ │ .pdf   │ .xlsx  │ .jpg   │ .zip   │                   │  │
│  │ │ 2.4MB  │ 1.1MB  │ 850KB  │ 5.2MB  │                   │  │
│  │ │ [👁️][⬇️]│ [👁️][⬇️]│ [👁️][⬇️]│ [👁️][⬇️]│                   │  │
│  │ └────────┴────────┴────────┴────────┘                   │  │
│  │ ...                                                      │  │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────── Upload Zone ────────────────────────┐  │
│  │                                                          │  │
│  │         📤 اسحب الملفات هنا أو انقر للتصفح              │  │
│  │                                                          │  │
│  │         [الحد الأقصى: 50MB | PDF, DOCX, XLSX, JPG]      │  │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧩 خريطة المكونات (Component Map)

| المكوّن              | الغرض                      | الحالات                                   | Props الرئيسية                                  | مصدر البيانات            | الأحداث                  |
| -------------------- | -------------------------- | ----------------------------------------- | ----------------------------------------------- | ------------------------ | ------------------------ |
| **AdminLayout**      | Layout رئيسي لصفحات الأدمن | default                                   | `children`                                      | —                        | —                        |
| **Breadcrumbs**      | مسار التنقل                | empty, 1-level, multi-level               | `items: {label, href}[]`                        | URL params               | `onNavigate`             |
| **ThemeToggle**      | تبديل Dark/Light           | light, dark, auto                         | `initialTheme?`                                 | localStorage             | `onChange`               |
| **KPICard**          | بطاقة مؤشر أداء            | loading, success, error                   | `label, value, icon, trend, href`               | API                      | `onClick`                |
| **DataTable**        | جدول بيانات متقدم          | loading, empty, error, success            | `columns, data, onSort, onFilter, virtualizer?` | API                      | `onRowClick, onSelect`   |
| **FiltersBar**       | شريط فلاتر موحد            | collapsed, expanded                       | `filters: FilterDef[], values, onChange`        | Local state              | `onApply, onReset`       |
| **CreateUserDialog** | حوار إنشاء مستخدم          | open, closed, submitting                  | `open, onClose, onSubmit`                       | Form state               | `onSuccess, onError`     |
| **EditUserDrawer**   | درج تعديل مستخدم           | open, closed, loading, saving             | `userId, open, onClose`                         | `/api/admin/users/:id`   | `onSave`                 |
| **ConfirmDialog**    | حوار تأكيد                 | open, closed                              | `title, message, type, onConfirm, onCancel`     | —                        | `onConfirm, onCancel`    |
| **Toast**            | إشعار مؤقت                 | info, success, warning, error             | `message, type, duration, action?`              | Toast Context            | `onClose, onAction`      |
| **Skeleton**         | عنصر تحميل                 | shimmer, pulse                            | `variant: text\|rect\|circle, width, height`    | —                        | —                        |
| **EmptyState**       | حالة فارغة                 | default, error                            | `icon, title, message, action?`                 | —                        | `onAction`               |
| **FileUploader**     | رافع ملفات                 | idle, dragging, uploading, success, error | `accept, maxSize, onUpload`                     | FileReader API           | `onProgress, onComplete` |
| **AttachmentCard**   | بطاقة مرفق                 | default, selected                         | `id, name, type, size, thumbnail?`              | `/api/admin/attachments` | `onClick, onDownload`    |
| **ChartWidget**      | مكوّن مخطط                 | loading, success, error                   | `type: line\|bar, data, config`                 | API                      | —                        |

---

## 📱 حالات Responsive

### Breakpoints

```typescript
const breakpoints = {
  xs: '360px', // Mobile S
  sm: '414px', // Mobile M
  md: '768px', // Tablet
  lg: '1024px', // Laptop
  xl: '1280px', // Desktop
  '2xl': '1440px', // Desktop L
  '3xl': '1920px', // Ultra-wide
};
```

### Admin Dashboard — Responsive Behavior

| العنصر           | xs-sm (≤414px)           | md (768px)         | lg (1024px)        | xl+ (1280px+)      |
| ---------------- | ------------------------ | ------------------ | ------------------ | ------------------ |
| KPI Cards        | Stack (1 col)            | Grid 2×3           | Grid 3×2           | Grid 6×1           |
| Chart            | Full width, height 200px | Full, 250px        | Full, 300px        | Full, 350px        |
| Activity/Actions | Stack                    | Side-by-side 50/50 | Side-by-side 60/40 | Side-by-side 70/30 |

### DataTable — Responsive Behavior

| Viewport | السلوك                                               |
| -------- | ---------------------------------------------------- |
| xs-sm    | جدول أفقي قابل للتمرير + أعمدة ثابتة (name, actions) |
| md       | جميع الأعمدة مرئية + font أصغر                       |
| lg+      | جدول كامل + spacing مريح                             |

**Sticky Columns**: عمود الإجراءات دائماً ثابت على يسار/يمين الجدول (حسب RTL/LTR).

---

## 🔄 تدفقات التفاعل (Interaction Flows)

### Flow 1: إضافة مستخدم جديد

```mermaid
graph TD
    A[/admin/users] -->|Click "+ مستخدم"| B[CreateUserDialog Opens]
    B -->|Fill Form| C{Validation}
    C -->|Invalid| D[Show Inline Errors]
    D --> B
    C -->|Valid| E[Submit POST /api/admin/users]
    E -->|Success| F[Close Dialog + Show Toast]
    F --> G[Refresh Table]
    E -->|Error| H[Show Error Toast]
    H --> B
```

### Flow 2: فلترة السجلات

```mermaid
graph TD
    A[/admin/logs] -->|Change Filter| B[Update URL Params]
    B --> C[Trigger API Call]
    C --> D{Response}
    D -->|Success| E[Update Table]
    D -->|Error| F[Show Error State]
    E --> G[Save Filters to localStorage]
```

### Flow 3: رفع مرفق

```mermaid
graph TD
    A[/admin/attachments] -->|Drag File| B[FileUploader Active]
    B -->|Drop| C{Check Size/Type}
    C -->|Invalid| D[Show Error Toast]
    C -->|Valid| E{File Size}
    E -->|> 10MB| F[Chunked Upload]
    E -->|≤ 10MB| G[Single Upload]
    F --> H[Show Progress Bar]
    G --> H
    H -->|Complete| I[POST /api/admin/attachments]
    I -->|Success| J[Show in Grid + Toast]
    I -->|Error| K[Show Error + Retry Option]
```

---

## 🎭 حالات الواجهة (UI States)

### DataTable States

| الحالة        | العرض                           | الشروط                            |
| ------------- | ------------------------------- | --------------------------------- |
| **Loading**   | Skeleton Rows (5-10)            | `isLoading === true`              |
| **Empty**     | EmptyState مع أيقونة + CTA      | `data.length === 0 && !isLoading` |
| **Error**     | EmptyState مع رسالة خطأ + Retry | `error !== null`                  |
| **Success**   | صفوف البيانات                   | `data.length > 0 && !isLoading`   |
| **Filtering** | Overlay شفاف + Spinner          | `isFiltering === true`            |

### Form States

| الحالة         | العرض                             | الشروط                  |
| -------------- | --------------------------------- | ----------------------- |
| **Idle**       | نموذج فارغ                        | Initial state           |
| **Validating** | Inline errors تظهر تدريجياً       | `onBlur` أو `onChange`  |
| **Submitting** | زر معطل + Spinner                 | `isSubmitting === true` |
| **Success**    | Toast + Close dialog              | Response 200            |
| **Error**      | Error banner + ممكن إعادة الإرسال | Response 4xx/5xx        |

### Attachment Upload States

| الحالة        | العرض                     |
| ------------- | ------------------------- |
| **Idle**      | منطقة رفع عادية           |
| **Dragging**  | منطقة مضيئة + حد متقطع    |
| **Uploading** | Progress bar + نسبة مئوية |
| **Scanning**  | "جارٍ فحص الفيروسات..."   |
| **Complete**  | ✅ رمز + "تم الرفع بنجاح" |
| **Error**     | ❌ رسالة خطأ + زر إعادة   |

---

## ♿ إرشادات إمكانية الوصول (A11y)

### ARIA Attributes

```tsx
// DataTable
<table role="table" aria-label="جدول المستخدمين">
  <thead>
    <tr>
      <th scope="col" aria-sort="ascending">الاسم</th>
      <th scope="col">البريد</th>
    </tr>
  </thead>
</table>

// Dialog
<div role="dialog" aria-labelledby="dialog-title" aria-modal="true">
  <h2 id="dialog-title">مستخدم جديد</h2>
  {/* content */}
</div>

// Toast
<div role="status" aria-live="polite" aria-atomic="true">
  تم إضافة المستخدم بنجاح
</div>

// Loading
<div role="status" aria-live="polite" aria-busy="true">
  جارِ التحميل...
</div>
```

### Keyboard Navigation

| المفتاح      | الإجراء                      |
| ------------ | ---------------------------- |
| `Tab`        | التنقل بين العناصر التفاعلية |
| `Shift+Tab`  | التنقل العكسي                |
| `Enter`      | تفعيل زر/رابط                |
| `Space`      | تبديل checkbox/toggle        |
| `Esc`        | إغلاق Dialog/Drawer/Dropdown |
| `Cmd/Ctrl+K` | فتح Command Palette          |
| `↑ ↓`        | التنقل في القوائم/Dropdown   |
| `Home/End`   | الانتقال لأول/آخر عنصر       |

### Focus Management

```tsx
// Focus Trap في Dialog
import { FocusTrap } from '@radix-ui/react-focus-scope';

<FocusTrap>
  <Dialog>
    {/* المحتوى */}
  </Dialog>
</FocusTrap>

// Focus Visible Ring
.focus-visible:focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring-color);
  outline-offset: var(--focus-ring-offset);
}
```

### Color Contrast

- جميع النصوص: ≥ 4.5:1 (WCAG AA)
- النصوص الكبيرة (≥18px): ≥ 3:1
- عناصر الواجهة: ≥ 3:1

**أداة الفحص**: https://webaim.org/resources/contrastchecker/

---

## 💾 مصادر البيانات (Data Sources)

### API Endpoints

| الصفحة      | Endpoint                     | الطريقة | الباراميترات                         | الاستجابة                                                            |
| ----------- | ---------------------------- | ------- | ------------------------------------ | -------------------------------------------------------------------- |
| Dashboard   | `/api/admin/kpis`            | GET     | `org_id?`                            | `{engagements_total, findings_total, recs_total, recs_overdue, ...}` |
| Users       | `/api/admin/users`           | GET     | `q?, role?, status?, page?, limit?`  | `{users: User[], total, page}`                                       |
| Users       | `/api/admin/users`           | POST    | `{name, email, password, roles[]}`   | `{user: User}`                                                       |
| Users       | `/api/admin/users/:id`       | PATCH   | `{name?, roles?}`                    | `{user: User}`                                                       |
| Users       | `/api/admin/users/:id`       | DELETE  | —                                    | `{success: true}`                                                    |
| Roles       | `/api/admin/roles`           | GET     | —                                    | `{roles: Role[]}`                                                    |
| Roles       | `/api/admin/roles`           | POST    | `{name, description, permissions[]}` | `{role: Role}`                                                       |
| Settings    | `/api/admin/settings`        | GET     | —                                    | `{settings: Setting[]}`                                              |
| Settings    | `/api/admin/settings`        | POST    | `{key, value, type}`                 | `{setting: Setting}`                                                 |
| Logs        | `/api/admin/logs`            | GET     | `q?, action?, from?, to?, take?`     | `{items: AuditLog[]}`                                                |
| Attachments | `/api/admin/attachments`     | GET     | `q?, type?, engagement_id?`          | `{items: Attachment[]}`                                              |
| Attachments | `/api/admin/attachments`     | POST    | `FormData: file, engagement_id?`     | `{attachment: Attachment}`                                           |
| Attachments | `/api/admin/attachments/:id` | DELETE  | —                                    | `{success: true}`                                                    |

### Database Queries (Example)

```sql
-- KPIs من mv_org_kpis
SELECT
  SUM(engagements_total) AS engagements_total,
  SUM(findings_total) AS findings_total,
  SUM(recs_total) AS recs_total,
  SUM(recs_open) AS recs_open,
  SUM(recs_wip) AS recs_wip,
  SUM(recs_closed) AS recs_closed
FROM core.mv_org_kpis
WHERE org_id = $1; -- RLS: يمرر من app.user_id

-- التوصيات المتأخرة
SELECT COUNT(*) AS recs_overdue
FROM core.vw_recommendations_tracker
WHERE is_overdue = TRUE;

-- Users مع Pagination
SELECT u.id, u.name, u.email, u.role, u.created_at,
  ARRAY_AGG(r.name) AS roles
FROM core.users u
LEFT JOIN core.user_roles ur ON ur.user_id = u.id
LEFT JOIN core.roles r ON r.id = ur.role_id
WHERE ($1 IS NULL OR u.email ILIKE '%' || $1 || '%')
  AND ($2 IS NULL OR r.name = $2)
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT $3 OFFSET $4;
```

---

## 📋 قائمة تحقق التنفيذ

### المرحلة 1: التأسيس

- [ ] إنشاء `styles/design-tokens.css`
- [ ] تحديث `tailwind.config.ts`
- [ ] إضافة ThemeProvider (Dark Mode)
- [ ] إعداد Toast Context (sonner أو radix)

### المرحلة 2: المكونات المشتركة

- [ ] `DataTable` (TanStack Table + virtualization)
- [ ] `FiltersBar`
- [ ] `ConfirmDialog`
- [ ] `Toast`
- [ ] `EmptyState`
- [ ] `Skeleton`

### المرحلة 3: صفحات الأدمن

- [ ] `/admin/dashboard` مع KPIs حقيقية
- [ ] `/admin/users` مع CRUD كامل
- [ ] `/admin/roles` مع permission checkboxes
- [ ] `/admin/settings` مع tabs
- [ ] `/admin/logs` مع filters متقدمة
- [ ] `/admin/attachments` (جديد)

### المرحلة 4: التحسينات

- [ ] Breadcrumbs
- [ ] Command Palette (Cmd+K)
- [ ] Bulk Actions
- [ ] CSV Export
- [ ] Feature Flags
- [ ] RLS Preview ("View As User")
- [ ] Undo للإجراءات الحساسة

### المرحلة 5: الاختبارات

- [ ] اختبارات قابلية الاستخدام (7 سيناريوهات)
- [ ] فحص WCAG مع axe DevTools
- [ ] اختبار لوحة المفاتيح
- [ ] اختبار قارئ الشاشة (NVDA)
- [ ] اختبار Responsive (360px → 1920px)

---

## 🚀 الخطوات التالية

1. ✅ مراجعة وموافقة مدير المشروع على المواصفة
2. ⏭️ بدء التنفيذ: إنشاء فرع `feat/admin-ui-refresh`
3. ⏭️ تطبيق Design Tokens + المكونات المشتركة
4. ⏭️ إعادة بناء صفحات الأدمن تدريجياً
5. ⏭️ اختبارات A11y + قابلية الاستخدام
6. ⏭️ فتح Pull Request مع لقطات/GIF
7. ⏭️ Code Review + تحسينات الأداء
8. ⏭️ Merge + Deploy مع Feature Flag

---

**التوقيع**: GitHub Copilot — AI UI/UX Expert  
**الإصدار**: 2.0  
**تاريخ آخر تحديث**: 2025-01-20
