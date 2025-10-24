# 🎨 دليل التقنيات المستخدمة في تصميم الواجهات - QAudit Pro

**المشروع**: QAudit Pro - نظام التدقيق الداخلي  
**التاريخ**: 23 أكتوبر 2025  
**الإصدار**: 1.0

---

## 📋 جدول المحتويات

1. [التقنيات الأساسية](#1-التقنيات-الأساسية)
2. [التصميم والتنسيق](#2-التصميم-والتنسيق)
3. [الخطوط والطباعة](#3-الخطوط-والطباعة)
4. [مكونات الواجهة](#4-مكونات-الواجهة)
5. [الجداول وعرض البيانات](#5-الجداول-وعرض-البيانات)
6. [الرسوم المتحركة](#6-الرسوم-المتحركة)
7. [التصميم المتجاوب](#7-التصميم-المتجاوب)
8. [دعم RTL](#8-دعم-rtl)
9. [نظام الألوان](#9-نظام-الألوان)
10. [التخطيط والبنية](#10-التخطيط-والبنية)
11. [إمكانية الوصول](#11-إمكانية-الوصول)
12. [الأداء والتحسين](#12-الأداء-والتحسين)
13. [أدوات مساعدة](#13-أدوات-مساعدة)
14. [الرسوم البيانية](#14-الرسوم-البيانية)
15. [نظام التصميم](#15-نظام-التصميم)

---

## 1. التقنيات الأساسية

### React 18.2.0
**الاستخدام**: مكتبة بناء واجهات المستخدم

```javascript
import React, { useState, useEffect } from 'react';

export function MyComponent() {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return <div>Content</div>;
}
```

**المميزات**:
- ✅ Component-based architecture
- ✅ Virtual DOM للأداء العالي
- ✅ React Hooks (useState, useEffect, useCallback, useMemo)
- ✅ Client Components ('use client')
- ✅ Server Components (Next.js)

---

### Next.js 14.2.5
**الاستخدام**: إطار عمل React للتطبيقات الكاملة

```javascript
// app/page.tsx - Server Component
export default function Page() {
  return <div>Server Component</div>;
}

// app/client-component.tsx
'use client';
export default function ClientComponent() {
  return <div>Client Component</div>;
}

// app/api/route.ts - API Route
export async function GET(request: Request) {
  return Response.json({ data: 'Hello' });
}
```

**المميزات**:
- ✅ App Router (app directory)
- ✅ Server-Side Rendering (SSR)
- ✅ Static Site Generation (SSG)
- ✅ API Routes
- ✅ Dynamic imports
- ✅ Image optimization
- ✅ Font optimization

---

### TypeScript 5.4.2
**الاستخدام**: لغة برمجة مع فحص الأنواع

```typescript
// Type definitions
interface User {
  id: string;
  name: string;
  role: 'admin' | 'user' | 'auditor';
}

interface AnnualPlan {
  id: string;
  title: string;
  fiscalYear: number;
  status: 'draft' | 'approved' | 'completed';
  tasks: AuditTask[];
}

// Component with typed props
interface Props {
  plan: AnnualPlan;
  onUpdate: (id: string) => void;
}

export function PlanCard({ plan, onUpdate }: Props) {
  return <div>{plan.title}</div>;
}
```

**المميزات**:
- ✅ Type safety
- ✅ IntelliSense support
- ✅ Compile-time error checking
- ✅ Better refactoring

---

## 2. التصميم والتنسيق

### Tailwind CSS 3.4.10
**الاستخدام**: Utility-first CSS framework

```jsx
// Utility classes
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    Action
  </button>
</div>

// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4">
  Responsive width
</div>

// Dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Dark mode support
</div>
```

**الكلاسات الأكثر استخداماً**:
```css
/* Layout */
.flex, .grid, .block, .inline-block
.items-center, .justify-between
.gap-4, .space-x-4, .space-y-2

/* Sizing */
.w-full, .h-screen, .min-h-screen
.max-w-7xl, .container

/* Spacing */
.p-4, .px-6, .py-3, .m-4, .mx-auto

/* Typography */
.text-sm, .text-base, .text-lg, .text-xl
.font-normal, .font-medium, .font-bold
.text-gray-600, .text-blue-600

/* Colors */
.bg-white, .bg-gray-50, .bg-blue-600
.text-gray-900, .text-white
.border-gray-200

/* Effects */
.shadow-sm, .shadow-md, .shadow-lg
.rounded-lg, .rounded-full
.transition-colors, .duration-200

/* States */
.hover:bg-gray-50, .focus:ring-2
.disabled:opacity-50
```

---

### CSS Custom Properties (Variables)
**الاستخدام**: متغيرات CSS قابلة لإعادة الاستخدام

```css
/* globals.css */
:root {
  /* Colors */
  --background: #ffffff;
  --foreground: #171717;
  --surface: 255 255 255;
  --muted: 247 247 248;
  --stroke: 230 232 236;
  
  /* Spacing */
  --page-padding: 12px;
  --container-max: 1280px;
  
  /* Border radius */
  --card-radius: 16px;
  
  /* Shadows */
  --shadow-light: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-medium: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  
  /* Transitions */
  --transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark mode */
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
  --surface: 22 24 28;
  --muted: 30 32 38;
  --stroke: 92 96 106;
}

/* Usage */
.card {
  background: var(--background);
  color: var(--foreground);
  border-radius: var(--card-radius);
  box-shadow: var(--shadow-medium);
}
```

---

### Tailwind Plugins

#### tailwindcss-animate
```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('tailwindcss-animate')]
}

// Usage
<div className="animate-fade-in">Fade in</div>
<div className="animate-slide-up">Slide up</div>
<div className="animate-spin">Spinner</div>
```

#### tailwindcss-rtl
```javascript
// tailwind.config.js
module.exports = {
  plugins: [require('tailwindcss-rtl')]
}

// Usage
<div className="ltr:text-left rtl:text-right">
  Auto-flip text alignment
</div>
```

---

## 3. الخطوط والطباعة

### Tajawal Font (خط تجوال)
**الاستخدام**: خط عربي احترافي

```javascript
// Import in layout or component
import '@fontsource/tajawal';
import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/500.css';
import '@fontsource/tajawal/700.css';
```

```css
/* globals.css */
:root {
  --font-arabic: 'Tajawal', 'Cairo', 'Noto Sans Arabic', system-ui, sans-serif;
}

html, body {
  font-family: var(--font-arabic);
}
```

**الأوزان المتاحة**:
- 300 - Light
- 400 - Regular
- 500 - Medium
- 700 - Bold
- 900 - Black

---

### Typography Scale

```css
/* Tailwind Typography Classes */
.text-xs    { font-size: 0.75rem; }   /* 12px */
.text-sm    { font-size: 0.875rem; }  /* 14px */
.text-base  { font-size: 1rem; }      /* 16px */
.text-lg    { font-size: 1.125rem; }  /* 18px */
.text-xl    { font-size: 1.25rem; }   /* 20px */
.text-2xl   { font-size: 1.5rem; }    /* 24px */
.text-3xl   { font-size: 1.875rem; }  /* 30px */
.text-4xl   { font-size: 2.25rem; }   /* 36px */

/* Font Weights */
.font-light   { font-weight: 300; }
.font-normal  { font-weight: 400; }
.font-medium  { font-weight: 500; }
.font-semibold{ font-weight: 600; }
.font-bold    { font-weight: 700; }

/* Line Heights */
.leading-tight  { line-height: 1.25; }
.leading-snug   { line-height: 1.375; }
.leading-normal { line-height: 1.5; }
.leading-relaxed{ line-height: 1.625; }
.leading-loose  { line-height: 2; }
```

---

## 4. مكونات الواجهة

### Lucide React (Icons)
**الاستخدام**: مكتبة أيقونات SVG

```jsx
import { 
  ChevronDown, 
  ChevronUp,
  CheckCircle, 
  Clock, 
  Lock,
  Settings,
  User,
  Search,
  Filter,
  Download
} from 'lucide-react';

// Usage
<button className="flex items-center gap-2">
  <Search className="w-4 h-4" />
  <span>Search</span>
</button>

<CheckCircle className="w-5 h-5 text-green-600" />
<Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />

// Responsive sizing
<Settings className="w-5 h-5 md:w-6 md:h-6" />
```

**الأيقونات الأكثر استخداماً**:
- Navigation: ChevronLeft, ChevronRight, Menu, X
- Actions: Plus, Minus, Edit, Trash, Save, Download
- Status: CheckCircle, XCircle, AlertCircle, Info
- UI: Search, Filter, Settings, User, Bell
- Media: Play, Pause, Volume, Image, File

---

### Custom Components

#### ProcessStepper
```tsx
import ProcessStepper from '@/app/(app)/rbia/plan/ProcessStepper';

interface ProcessStep {
  id: number;
  label: string;
  status: 'active' | 'completed' | 'locked' | 'available';
}

const steps: ProcessStep[] = [
  { id: 1, label: 'الخطة السنوية', status: 'completed' },
  { id: 2, label: 'التخطيط', status: 'active' },
  { id: 3, label: 'فهم العملية', status: 'available' },
];

<ProcessStepper
  steps={steps}
  activeStepId={2}
  onStepClick={(stepId) => console.log(stepId)}
  completedCount={1}
/>
```

#### Button Component
```tsx
// Custom button with variants
<button className="btn btn-primary">
  Primary Button
</button>

<button className="btn btn-secondary">
  Secondary Button
</button>

<button className="btn btn-ghost">
  Ghost Button
</button>

// CSS
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
  @apply focus:ring-blue-500;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-900 hover:bg-gray-300;
  @apply focus:ring-gray-500;
}
```

---

## 5. الجداول وعرض البيانات

### TanStack React Table 8.21.3
**الاستخدام**: إدارة الجداول المعقدة

```tsx
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

const columns = [
  {
    accessorKey: 'code',
    header: 'Code',
    size: 100,
  },
  {
    accessorKey: 'title',
    header: 'Title',
    size: 300,
  },
];

const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
});

// Render
<table>
  <thead>
    {table.getHeaderGroups().map(headerGroup => (
      <tr key={headerGroup.id}>
        {headerGroup.headers.map(header => (
          <th key={header.id}>
            {flexRender(header.column.columnDef.header, header.getContext())}
          </th>
        ))}
      </tr>
    ))}
  </thead>
  <tbody>
    {table.getRowModel().rows.map(row => (
      <tr key={row.id}>
        {row.getVisibleCells().map(cell => (
          <td key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

---

### TanStack React Virtual 3.13.12
**الاستخدام**: Virtual scrolling للأداء

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const rowVirtualizer = useVirtualizer({
  count: 10000, // Large dataset
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // Row height
  overscan: 5, // Extra rows to render
});

<div ref={parentRef} className="h-[600px] overflow-auto">
  <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
    {rowVirtualizer.getVirtualItems().map(virtualRow => (
      <div
        key={virtualRow.index}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }}
      >
        Row {virtualRow.index}
      </div>
    ))}
  </div>
</div>
```

---

### Table Utilities

```css
/* Table Layout */
.annual-plan-table-wrapper {
  width: 100%;
  max-height: calc(100vh - 420px);
  overflow: auto;
  contain: content;
  -webkit-overflow-scrolling: touch;
}

.annual-plan-table-wrapper table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

/* Cell Text Handling */
.cell-text {
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
  line-height: 1.6;
}

.cell-token {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

/* Column Widths */
.col-code { width: 100px; }
.col-title { min-width: 260px; }
.col-department { width: 140px; }
.col-status { width: 120px; }
```

---

## 6. الرسوم المتحركة

### CSS Transitions

```css
/* Smooth transitions */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Specific properties */
.transition-colors {
  transition-property: color, background-color, border-color;
}

.transition-transform {
  transition-property: transform;
}

/* Custom easing */
.ease-in-out {
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Usage */
.sidebar {
  width: 72px;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.is-open {
  width: 280px;
}
```

---

### Keyframe Animations

```css
/* Fade in */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-in-out;
}

/* Slide up */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.4s ease-out;
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

---

### Hover & Focus Effects

```css
/* Button hover */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card hover */
.card:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transform: scale(1.02);
}

/* Focus ring */
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
}

/* Link hover */
.link:hover {
  color: #2563eb;
  text-decoration: underline;
}
```

---

## 7. التصميم المتجاوب

### Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',  // Primary breakpoint
      'xl': '1280px',
      '2xl': '1536px',
    }
  }
}
```

```jsx
// Usage
<div className="
  w-full           /* Mobile: 100% */
  sm:w-11/12       /* Small: 91.67% */
  md:w-3/4         /* Medium: 75% */
  lg:w-2/3         /* Large: 66.67% */
  xl:w-1/2         /* XL: 50% */
">
  Responsive width
</div>

// Hide/Show based on screen size
<div className="hidden lg:block">
  Desktop only
</div>

<div className="lg:hidden">
  Mobile only
</div>

// Responsive grid
<div className="
  grid 
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Medium: 2 columns */
  lg:grid-cols-3   /* Large: 3 columns */
  xl:grid-cols-4   /* XL: 4 columns */
  gap-4
">
  {/* Items */}
</div>
```

---

### Mobile-First Approach

```css
/* Base styles (Mobile) */
.container {
  width: 100%;
  padding: 1rem;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 1.5rem;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1280px;
    margin-inline: auto;
    padding: 2rem;
  }
}
```

---

### Container Queries (Future)

```css
@container (min-width: 400px) {
  .card {
    flex-direction: row;
  }
}
```

---

## 8. دعم RTL

### Logical Properties

```css
/* Instead of left/right, use inline */
.element {
  inline-size: 280px;           /* width */
  block-size: 100%;              /* height */
  
  padding-inline: 1rem;          /* padding-left/right (auto-flips) */
  padding-block: 0.5rem;         /* padding-top/bottom */
  
  margin-inline-start: 1rem;     /* margin-left in LTR, margin-right in RTL */
  margin-inline-end: 1rem;       /* margin-right in LTR, margin-left in RTL */
  
  inset-inline-start: 0;         /* left in LTR, right in RTL */
  inset-inline-end: 0;           /* right in LTR, left in RTL */
  
  border-inline-start: 1px solid; /* border-left/right */
}
```

---

### Direction Attribute

```tsx
// App-wide direction
<html dir={locale === 'ar' ? 'rtl' : 'ltr'}>

// Component-specific
<div dir="rtl">
  <p>النص العربي</p>
</div>

<div dir="ltr">
  <p>English text</p>
</div>
```

---

### RTL-Specific Overrides

```css
/* RTL-specific styles */
[dir="rtl"] .sidebar {
  border-left: none;
  border-right: 1px solid #e5e7eb;
}

[dir="rtl"] .icon {
  transform: scaleX(-1); /* Flip horizontally */
}

/* Tailwind RTL plugin */
<div className="
  text-left 
  rtl:text-right
">
  Auto-flip alignment
</div>

<div className="
  ltr:pl-4 
  rtl:pr-4
">
  Auto-flip padding
</div>
```

---

## 9. نظام الألوان

### Primary Colors (Blue)

```css
/* Tailwind blue scale */
.bg-blue-50   { background: #eff6ff; }
.bg-blue-100  { background: #dbeafe; }
.bg-blue-200  { background: #bfdbfe; }
.bg-blue-300  { background: #93c5fd; }
.bg-blue-400  { background: #60a5fa; }
.bg-blue-500  { background: #3b82f6; }
.bg-blue-600  { background: #2563eb; } /* Primary */
.bg-blue-700  { background: #1d4ed8; }
.bg-blue-800  { background: #1e40af; }
.bg-blue-900  { background: #1e3a8a; }
```

---

### Semantic Colors

```css
/* Success - Green */
.text-green-600 { color: #16a34a; }
.bg-green-50    { background: #f0fdf4; }
.bg-green-100   { background: #dcfce7; }

/* Warning - Orange */
.text-orange-600 { color: #ea580c; }
.bg-orange-50    { background: #fff7ed; }
.bg-orange-100   { background: #ffedd5; }

/* Error - Red */
.text-red-600 { color: #dc2626; }
.bg-red-50    { background: #fef2f2; }
.bg-red-100   { background: #fee2e2; }

/* Info - Blue */
.text-blue-600 { color: #2563eb; }
.bg-blue-50    { background: #eff6ff; }

/* Neutral - Gray */
.text-gray-600 { color: #4b5563; }
.bg-gray-50    { background: #f9fafb; }
.bg-gray-100   { background: #f3f4f6; }
.bg-gray-900   { color: #111827; }
```

---

### Dark Mode

```css
/* Light mode (default) */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

/* Dark mode */
.dark {
  --background: #0a0a0a;
  --foreground: #ededed;
}

/* Usage with Tailwind */
<div className="bg-white dark:bg-gray-900">
  <p className="text-gray-900 dark:text-white">
    Text with dark mode support
  </p>
</div>
```

---

### Color Utilities

```jsx
// Dynamic color based on status
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    in_progress: 'bg-blue-100 text-blue-800',
    not_started: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Usage
<span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
  {task.status}
</span>
```

---

## 10. التخطيط والبنية

### CSS Grid

```css
/* Two-column layout */
.annual-plan-shell {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1.5rem;
}

/* Responsive grid */
.grid-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Named grid areas */
.dashboard {
  display: grid;
  grid-template-areas:
    "header header header"
    "sidebar main main"
    "footer footer footer";
  grid-template-columns: 280px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }
```

---

### Flexbox

```css
/* Flex container */
.flex-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* Flex items */
.flex-grow   { flex-grow: 1; }
.flex-shrink { flex-shrink: 0; }
.flex-1      { flex: 1 1 0%; }

/* Direction */
.flex-row    { flex-direction: row; }
.flex-col    { flex-direction: column; }

/* Wrap */
.flex-wrap   { flex-wrap: wrap; }

/* Usage */
<div className="flex items-center justify-between gap-4">
  <div className="flex-1">Content</div>
  <div className="flex-shrink-0">Actions</div>
</div>
```

---

### Sticky Positioning

```css
/* Sticky sidebar */
.sidebar-inner {
  position: sticky;
  top: 88px; /* Below header */
  max-height: calc(100vh - 96px);
}

/* Sticky table header */
.table-wrapper thead {
  position: sticky;
  top: 0;
  z-index: 20;
  background: #fff;
}

/* Sticky footer */
.footer {
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #e5e7eb;
}
```

---

### Z-Index Strategy

```css
/* Z-index scale */
:root {
  --z-base: 1;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 100;
}

/* Implementation */
.sidebar       { z-index: 50; }
.bottom-bar    { z-index: 30; }
.table-header  { z-index: 20; }
.main-content  { z-index: 10; }
.tooltip       { z-index: 100; }
```

---

## 11. إمكانية الوصول

### ARIA Attributes

```tsx
// Expandable section
<button
  onClick={toggle}
  aria-expanded={isOpen}
  aria-controls="content-id"
  aria-label="Toggle sidebar"
>
  Toggle
</button>

<div id="content-id" aria-hidden={!isOpen}>
  Content
</div>

// Current step indicator
<button aria-current="step">
  Step 1
</button>

// Tab navigation
<div role="tablist">
  <button role="tab" aria-selected={isActive}>
    Tab 1
  </button>
</div>

// Loading state
<div aria-busy="true" aria-live="polite">
  Loading...
</div>
```

---

### Focus Management

```css
/* Focus ring */
:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
  border-radius: 4px;
}

/* Remove default outline */
:focus {
  outline: none;
}

/* Skip to content link */
.skip-to-content {
  position: absolute;
  top: -100px;
  left: 0;
  padding: 1rem;
  background: #fff;
  z-index: 100;
}

.skip-to-content:focus {
  top: 0;
}
```

---

### Semantic HTML

```tsx
// Proper semantic structure
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
    </section>
  </article>
</main>

<aside aria-label="Process stages sidebar">
  <nav aria-label="Process stages">
    {/* Stages */}
  </nav>
</aside>

<footer>
  <p>Copyright info</p>
</footer>
```

---

### Keyboard Navigation

```tsx
// Keyboard event handler
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
  
  if (e.key === 'Escape') {
    handleClose();
  }
  
  if (e.key === 'ArrowUp') {
    navigatePrevious();
  }
  
  if (e.key === 'ArrowDown') {
    navigateNext();
  }
};

// Focusable interactive elements
<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  tabIndex={0}
>
  Interactive element
</button>

// Skip non-interactive elements
<div tabIndex={-1}>
  Not focusable
</div>
```

---

## 12. الأداء والتحسين

### CSS Containment

```css
/* Layout containment */
.container {
  contain: layout;
}

/* Content containment */
.table-wrapper {
  contain: content;
}

/* Size containment */
.fixed-size {
  contain: size;
}

/* Combined */
.optimized {
  contain: layout style;
}
```

---

### GPU Acceleration

```css
/* Will-change hint */
.sidebar {
  will-change: width;
  transition: width 0.25s;
}

/* Transform for GPU */
.animated {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 3D transform */
.slide {
  transform: translate3d(0, 0, 0);
}
```

---

### Smooth Scrolling

```css
/* iOS momentum scrolling */
.scrollable {
  -webkit-overflow-scrolling: touch;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
.scrollable::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.scrollable::-webkit-scrollbar-track {
  background: #f3f4f6;
  border-radius: 4px;
}

.scrollable::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.scrollable::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
```

---

### Image Optimization

```tsx
import Image from 'next/image';

// Optimized image with Next.js
<Image
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  quality={85}
  priority={false}
  loading="lazy"
  placeholder="blur"
/>
```

---

## 13. أدوات مساعدة

### clsx
**الاستخدام**: دمج الكلاسات بشكل شرطي

```tsx
import clsx from 'clsx';

// Conditional classes
const className = clsx(
  'base-class',
  isActive && 'active-class',
  isDisabled && 'disabled-class',
  {
    'large': size === 'large',
    'small': size === 'small',
  }
);

// Usage in component
<button
  className={clsx(
    'px-4 py-2 rounded-lg',
    isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900',
    isLoading && 'opacity-50 cursor-not-allowed'
  )}
>
  Button
</button>
```

---

### Tailwind Merge

```tsx
import { cn } from '@/lib/utils';

// Merge and deduplicate Tailwind classes
const className = cn(
  'px-4 py-2',   // Base padding
  'px-6',        // Override padding-x
  'text-sm',     // Font size
);
// Result: 'py-2 px-6 text-sm'

// Usage
interface ButtonProps {
  className?: string;
}

function Button({ className }: ButtonProps) {
  return (
    <button className={cn('px-4 py-2 bg-blue-600', className)}>
      Button
    </button>
  );
}

// Override base classes
<Button className="px-6 bg-green-600" />
```

---

### Date-fns

```tsx
import { format, formatDistance, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';

// Format date
const formatted = format(new Date(), 'dd/MM/yyyy');
// "23/10/2025"

// With Arabic locale
const arabicDate = format(new Date(), 'PPP', { locale: ar });
// "٢٣ أكتوبر ٢٠٢٥"

// Relative time
const relative = formatDistance(new Date(), addDays(new Date(), 3));
// "3 days"

// With Arabic
const relativeAr = formatDistance(new Date(), addDays(new Date(), 3), { 
  locale: ar,
  addSuffix: true 
});
// "في خلال ٣ أيام"
```

---

## 14. الرسوم البيانية

### Recharts 3.3.0

```tsx
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Data
const data = [
  { month: 'Jan', value: 400 },
  { month: 'Feb', value: 300 },
  { month: 'Mar', value: 600 },
];

// Line Chart
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line 
      type="monotone" 
      dataKey="value" 
      stroke="#2563eb" 
      strokeWidth={2}
    />
  </LineChart>
</ResponsiveContainer>

// Bar Chart
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="month" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="value" fill="#2563eb" />
  </BarChart>
</ResponsiveContainer>

// Pie Chart
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      dataKey="value"
      nameKey="month"
      cx="50%"
      cy="50%"
      outerRadius={80}
      fill="#2563eb"
      label
    />
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

---

## 15. نظام التصميم

### Design Tokens

```css
:root {
  /* Spacing scale (4px base) */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  
  /* Border radius */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.375rem; /* 6px */
  --radius-lg: 0.5rem;   /* 8px */
  --radius-xl: 0.75rem;  /* 12px */
  --radius-2xl: 1rem;    /* 16px */
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  
  /* Line heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* Transitions */
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

### Component Patterns

```tsx
// Button variants
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2',
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500': variant === 'primary',
          'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500': variant === 'secondary',
          'bg-transparent hover:bg-gray-100': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': variant === 'danger',
          
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          
          'w-full': fullWidth,
          'opacity-50 cursor-not-allowed': disabled || loading,
        }
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
}
```

---

### Card Component

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        {
          'p-3': padding === 'sm',
          'p-6': padding === 'md',
          'p-8': padding === 'lg',
          'hover:shadow-md transition-shadow': hover,
        },
        className
      )}
    >
      {children}
    </div>
  );
}
```

---

### Badge Component

```tsx
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

function Badge({ children, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
        {
          'bg-gray-100 text-gray-800': variant === 'default',
          'bg-green-100 text-green-800': variant === 'success',
          'bg-orange-100 text-orange-800': variant === 'warning',
          'bg-red-100 text-red-800': variant === 'error',
        }
      )}
    >
      {children}
    </span>
  );
}
```

---

## 📊 ملخص التقنيات

| الفئة | التقنية | الإصدار | الاستخدام |
|------|---------|----------|-----------|
| **Framework** | React | 18.2.0 | مكتبة الواجهات |
| | Next.js | 14.2.5 | إطار العمل |
| | TypeScript | 5.4.2 | لغة البرمجة |
| **Styling** | Tailwind CSS | 3.4.10 | CSS Framework |
| | CSS Variables | - | Design tokens |
| **Typography** | Tajawal | 5.2.7 | خط عربي |
| **Icons** | Lucide React | 0.453.0 | أيقونات SVG |
| **Tables** | TanStack Table | 8.21.3 | جداول متقدمة |
| | TanStack Virtual | 3.13.12 | Virtual scrolling |
| **Charts** | Recharts | 3.3.0 | رسوم بيانية |
| **Utilities** | clsx | 2.0.0 | دمج الكلاسات |
| | date-fns | 4.1.0 | تنسيق التواريخ |
| **Animation** | CSS Transitions | - | رسوم متحركة |
| | Tailwind Animate | 1.0.7 | Keyframes |

---

## 🎨 أمثلة عملية

### مثال كامل: بطاقة مهمة تدقيق

```tsx
import { CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AuditTaskCardProps {
  task: {
    id: string;
    title: string;
    code: string;
    status: 'completed' | 'in_progress' | 'not_started';
    dueDate: Date;
    assignee: string;
  };
}

function AuditTaskCard({ task }: AuditTaskCardProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: 'مكتملة',
    },
    in_progress: {
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      label: 'قيد التنفيذ',
    },
    not_started: {
      icon: Clock,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      label: 'لم تبدأ',
    },
  };

  const config = statusConfig[task.status];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {task.title}
          </h3>
          <p className="text-sm text-gray-600">{task.code}</p>
        </div>
        
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
          <Icon className="w-3 h-3" />
          {config.label}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          <span className="font-medium">المُكلف:</span> {task.assignee}
        </div>
        <div>
          <span className="font-medium">الموعد:</span>{' '}
          {format(task.dueDate, 'PPP', { locale: ar })}
        </div>
      </div>
    </div>
  );
}
```

---

### مثال: جدول بيانات متقدم

```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

function AuditTasksTable({ tasks }) {
  const columns = [
    {
      accessorKey: 'code',
      header: 'الرمز',
      size: 100,
      cell: ({ getValue }) => (
        <span className="font-mono text-sm">{getValue()}</span>
      ),
    },
    {
      accessorKey: 'title',
      header: 'عنوان المهمة',
      size: 300,
      cell: ({ getValue }) => (
        <div className="cell-text">{getValue()}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'الحالة',
      size: 120,
      cell: ({ getValue }) => {
        const status = getValue();
        const colors = {
          completed: 'bg-green-100 text-green-800',
          in_progress: 'bg-blue-100 text-blue-800',
          not_started: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status]}`}>
            {status}
          </span>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="annual-plan-table-wrapper">
      <table className="w-full table-fixed border-collapse">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="px-4 py-3 text-start text-xs font-medium text-gray-600 uppercase"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-4 py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 📚 مصادر إضافية

### الوثائق الرسمية
- React: https://react.dev
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs
- TanStack Table: https://tanstack.com/table
- Lucide Icons: https://lucide.dev
- Recharts: https://recharts.org

### أدوات مفيدة
- Tailwind CSS IntelliSense (VS Code Extension)
- Prettier (Code formatting)
- ESLint (Code linting)
- Chrome DevTools
- React Developer Tools

---

## 🎯 الخلاصة

هذا الدليل يغطي جميع التقنيات المستخدمة في تصميم وتطوير واجهات مشروع QAudit Pro. التقنيات مختارة بعناية لتوفير:

✅ **أداء عالي** - React 18, Virtual scrolling, CSS containment  
✅ **تجربة مستخدم ممتازة** - Responsive design, Smooth animations, RTL support  
✅ **سهولة الصيانة** - TypeScript, Component-based, Design tokens  
✅ **إمكانية الوصول** - ARIA, Keyboard navigation, Semantic HTML  
✅ **دعم كامل للغة العربية** - RTL, Arabic fonts, Logical properties  

---

**تاريخ الإنشاء**: 23 أكتوبر 2025  
**الإصدار**: 1.0  
**المشروع**: QAudit Pro - نظام التدقيق الداخلي  

---

*هذا الملف جاهز للتحميل والمشاركة مع فريق التطوير* 📥
