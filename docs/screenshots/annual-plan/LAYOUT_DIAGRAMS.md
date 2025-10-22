# Annual Plan Layout - Visual Documentation

## Before: Flex Layout (Problematic)

```
┌─────────────────────────────────────────────────────────────┐
│                       Header (Fixed)                        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ ┌─────────────┐  ┌───────────────────────────────────────┐ │
│ │  Process    │  │                                       │ │
│ │  Stepper    │  │        Main Content                   │ │
│ │             │  │                                       │ │
│ │  (Shrinks   │  │  KPI Cards (4x)                      │ │
│ │   when      │  │                                       │ │
│ │   table     │  │  ┌─────────────────────────────────┐ │ │
│ │   loads!)   │  │  │   Table (Wide, causes issues)  │ │ │
│ │             │  │  │   ─────────────────────────────►│ │ │
│ │             │  │  │   Horizontal Scroll            │ │ │
│ │             │  │  └─────────────────────────────────┘ │ │
│ └─────────────┘  └───────────────────────────────────────┘ │
│  flex-shrink      flex-1 (grows, pushes sidebar)          │
└─────────────────────────────────────────────────────────────┘

Problem: When table content loads and is wide, the flex layout allows
the main content to push the sidebar, causing it to shrink.
```

## After: CSS Grid Layout (Fixed)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Header (Fixed)                                 │
└─────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌─────────────────────────────────┐ ┌──────────────────┐ │
│ │ Process  │ │                                 │ │   RBIA Info      │ │
│ │ Stepper  │ │   Main Content (min-w-0)        │ │                  │ │
│ │ (320px)  │ │                                 │ │   (320px)        │ │
│ │ Fixed    │ │   KPI Cards (4x, when loaded)   │ │   Fixed          │ │
│ │ Width    │ │   ┌───────┬───────┬───────┐     │ │   Width          │ │
│ │          │ │   │Status │Tasks  │Hours  │...  │ │                  │ │
│ │ Step 1 ✓ │ │   └───────┴───────┴───────┘     │ │   Hidden on      │ │
│ │ Step 2   │ │                                 │ │   mobile/tablet  │ │
│ │ Step 3   │ │   ┌───────────────────────────┐ │ │                  │ │
│ │ Step 4   │ │   │ Table (table-fixed)       │ │ │   Key Phases:    │ │
│ │ ...      │ │   │ ┌────┬──────────┬────┐    │ │ │   - Planning     │ │
│ │ Step 11  │ │   │ │Code│Title     │...│    │ │ │   - Risk Assess  │ │
│ │          │ │   │ │    │(wraps)   │   │    │ │ │   - Fieldwork    │ │
│ │ Progress │ │   │ └────┴──────────┴────┘    │ │ │   - Reporting    │ │
│ │ [▓▓▓░░]  │ │   │ No horizontal scroll!     │ │ │                  │ │
│ │          │ │   └───────────────────────────┘ │ │                  │ │
│ └──────────┘ └─────────────────────────────────┘ └──────────────────┘ │
│  320px fixed  1fr flexible (grows/shrinks)        320px fixed         │
└─────────────────────────────────────────────────────────────────────────┘

Grid: grid-cols-[320px_1fr] gap-6 lg:grid-cols-[320px_1fr_320px]
Solution: Explicit column sizes prevent any shrinking. min-w-0 on main
content allows proper overflow handling and text wrapping.
```

## Mobile Layout (<1024px)

```
┌────────────────────────────────┐
│      Header (Fixed)            │
└────────────────────────────────┘
┌────────────────────────────────┐
│ ┌────────────────────────────┐ │
│ │ Process Stepper (Accordion)│ │
│ │ [▼] مراحل العملية    1/11 │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │   KPI Cards (Stacked)      │ │
│ │   ┌──────────────────────┐ │ │
│ │   │ Status               │ │ │
│ │   └──────────────────────┘ │ │
│ │   ┌──────────────────────┐ │ │
│ │   │ Tasks                │ │ │
│ │   └──────────────────────┘ │ │
│ └────────────────────────────┘ │
│                                │
│ ┌────────────────────────────┐ │
│ │ Table (Full Width)         │ │
│ │ Text wraps in cells        │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘

Grid collapses to single column.
RBIA Info sidebar hidden on mobile.
```

## Table Column Layout (table-fixed)

```
┌────┬──────────────────────┬─────────┬──────┬────────┬───┬──────┬────────┬─────────┐
│Code│ Task Title          │Department│ Risk │  Type  │ Q │Hours │ Status │ Actions │
│96px│ 28% (flexible)      │  128px   │ 96px │ 112px  │80 │ 96px │ 112px  │  96px   │
├────┼──────────────────────┼─────────┼──────┼────────┼───┼──────┼────────┼─────────┤
│A001│تدقيق النظام المالي │ المالية │ عالية│ تشغيلي │ Q1│  120 │ مكتملة │ ✏️ 🗑️ │
│    │للمشتريات والتوريدات│         │      │        │   │      │        │         │
│    │(wraps nicely)       │         │      │        │   │      │        │         │
├────┼──────────────────────┼─────────┼──────┼────────┼───┼──────┼────────┼─────────┤
│A002│مراجعة ضوابط        │   IT    │متوسطة│  مالي  │ Q2│   80 │قيد التنفيذ│ ✏️ 🗑️│
│    │الوصول               │         │      │        │   │      │        │         │
└────┴──────────────────────┴─────────┴──────┴────────┴───┴──────┴────────┴─────────┘

Key Features:
- Fixed column widths prevent expansion
- Task Title gets 28% width for long Arabic text
- whitespace-normal + leading-6 for natural wrapping
- No horizontal scroll needed
```

## Content View Switching

```
┌──────────────────────────────────────────────┐
│  Step Selected: "Annual Plan"                │
│  contentView: 'annualPlan'                   │
│  URL: ?step=annualPlan                       │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │ KPI Cards (always shown when loaded)   │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ Filters & Search                       │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ Tasks Table                            │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

Switch to "Planning":
↓
┌──────────────────────────────────────────────┐
│  Step Selected: "Planning"                   │
│  contentView: 'prioritization'               │
│  URL: ?step=prioritization                   │
├──────────────────────────────────────────────┤
│  ┌────────────────────────────────────────┐  │
│  │ KPI Cards (still shown)                │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │      🚧 Under Development              │  │
│  │  Planning content coming soon          │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

Note: KPI Cards stay visible, only main content changes
Table/filters only shown for annualPlan view
```

## ProcessStepper States

```
┌─────────────────────────────────┐
│ مراحل العملية                   │
│ 1 من 11 مكتملة                  │
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │[1] الخطة السنوية        ✓✓│ │ ← Completed (has plan + tasks)
│ └─────────────────────────────┘ │    Green background + checkmark
│ ┌─────────────────────────────┐ │
│ │[2] التخطيط              ○ │ │ ← Available
│ └─────────────────────────────┘ │    White background, clickable
│ ┌─────────────────────────────┐ │
│ │[3] فهم العملية والمخاطر ○ │ │ ← Available
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │[4] برنامج العمل        🔒 │ │ ← Locked (if implemented)
│ └─────────────────────────────┘ │    Gray background, not clickable
│           ...                   │
├─────────────────────────────────┤
│ التقدم الكلي              9%    │
│ [▓░░░░░░░░░░░░░░░░░░░░░]        │
└─────────────────────────────────┘

Active step uses aria-current="step" for screen readers
Locked steps have aria-disabled="true"
```

## Accessibility Features

### Focus States
```
Button/Input at rest:        Button/Input focused:
┌───────────────┐           ┌───────────────┐
│   Normal      │           │║  Focused    ║│ ← 2px blue ring
└───────────────┘           │║   + offset  ║│    with offset
                            └───────────────┘
```

### ARIA Attributes
```tsx
// ProcessStepper step button
<div
  role="button"
  tabIndex={0}
  aria-current="step"           // For active step
  aria-disabled="true"          // For locked steps
  aria-label="الخطة السنوية، مكتملة"  // Full description
>

// Table action buttons
<button
  aria-label="تعديل تدقيق النظام المالي"  // Includes task name
  title="تعديل"
>
  ✏️
</button>
```

## RTL Support

All layouts work correctly in RTL mode:
- Grid columns maintain correct order
- Text alignment natural for Arabic
- Focus rings and borders adapt
- Sidebar positions appropriate for RTL

## Responsive Breakpoints

```
Mobile:  < 768px   → Single column, accordion stepper
Tablet:  768-1023  → Two columns (stepper + main)
Desktop: ≥ 1024px  → Three columns (stepper + main + info)
Wide:    ≥ 1440px  → Max container width for optimal reading
```
