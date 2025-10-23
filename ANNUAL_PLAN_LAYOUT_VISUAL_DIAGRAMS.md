# Annual Plan Layout - Visual Diagrams

## 📐 Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Header (Fixed, z-index: 40)                                        │
│  ┌────────────┐  ┌──────────────────────────────────────────────┐  │
│  │   Logo     │  │  Annual Plan - FY 2024 - Version 1.0         │  │
│  └────────────┘  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    Main Container (max-width: 1440px)               │
│  ┌───────────────┬─────────────────────────────────────────────┐   │
│  │               │                                             │   │
│  │   SIDEBAR     │           MAIN CONTENT                      │   │
│  │   (Sticky)    │                                             │   │
│  │   z-50        │   ┌─────────────────────────────────────┐   │   │
│  │               │   │  KPI Summary Cards (Grid 1x4)       │   │   │
│  │  ┌─────────┐  │   │  [Plan Status] [Tasks] [Hours] [%]  │   │   │
│  │  │ Toggle  │  │   └─────────────────────────────────────┘   │   │
│  │  └─────────┘  │                                             │   │
│  │               │   ┌─────────────────────────────────────┐   │   │
│  │  Process      │   │  Filters & Search                   │   │   │
│  │  Stages:      │   │  [Search] [Dept] [Risk] [Status]    │   │   │
│  │               │   └─────────────────────────────────────┘   │   │
│  │  ┌─────────┐  │                                             │   │
│  │  │ ① Plan  │  │   ┌─────────────────────────────────────┐   │   │
│  │  └─────────┘  │   │  TABLE WRAPPER (Scrollable)         │   │   │
│  │  ┌─────────┐  │   │  max-height: calc(100vh - 420px)    │   │   │
│  │  │ ② Plan  │  │   │  ┌───────────────────────────────┐  │   │   │
│  │  └─────────┘  │   │  │ Header (Sticky top: 0)        │  │   │   │
│  │  ┌─────────┐  │   │  ├───────────────────────────────┤  │   │   │
│  │  │ ③ Risk  │  │   │  │ Code │ Title      │ Dept ... │  │   │   │
│  │  └─────────┘  │   │  ├───────────────────────────────┤  │   │   │
│  │     ...       │   │  │ A001 │ تدقيق مالي │ Finance  │  │   │   │
│  │               │   │  │ A002 │ تدقيق عمل  │ Ops      │  │   │   │
│  │  72px or      │   │  │ ...  │ ...        │ ...      │  │   │   │
│  │  280px        │   │  │      │ [Scrolls ↓]│          │  │   │   │
│  │               │   │  └───────────────────────────────┘  │   │   │
│  │               │   └─────────────────────────────────────┘   │   │
│  │               │                                             │   │
│  └───────────────┴─────────────────────────────────────────────┘   │
│      Collapsed        Main (min-width: 0, overflow: visible)       │
│      or Expanded                                                   │
└─────────────────────────────────────────────────────────────────────┘

Legend:
━━ Fixed/Sticky Element
── Regular Container
┌┐ Scrollable Region
```

---

## 📱 Mobile Layout (<1024px)

```
┌─────────────────────────────────────────┐
│  Header (Fixed)                         │
│  ┌────┐  ┌───────────────────────────┐  │
│  │ ☰  │  │  Annual Plan - FY 2024    │  │
│  └────┘  └───────────────────────────┘  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│        Main Content (Full Width)        │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  KPI Cards (Grid 1x2 or 2x2)    │   │
│  │  [Status] [Tasks]               │   │
│  │  [Hours]  [Progress]            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Filters (Stacked)              │   │
│  │  [Search Field]                 │   │
│  │  [Department ▼]                 │   │
│  │  [Risk Level ▼] [Status ▼]      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  TABLE WRAPPER                  │   │
│  │  max-height: calc(100vh-360px)  │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ Code │ Title    │ Status  │  │   │
│  │  ├───────────────────────────┤  │   │
│  │  │ A001 │ Task 1   │ Active  │  │   │
│  │  │ A002 │ Task 2   │ Done    │  │   │
│  │  │ ...  │ ...      │ ...     │  │   │
│  │  │      │ [Scrolls]│         │  │   │
│  │  └───────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [Padding for bottom bar - 72px]       │
│                                         │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  Bottom Bar (Fixed, z-30)               │
│  ┌─────────────────────────────────┐   │
│  │ ◄ [Stage 1] [Stage 2] [S3] ... ► │   │
│  │   (Horizontal Scroll)             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔄 Sidebar Collapse Animation

### Collapsed State (72px)
```
┌────────┐
│   ☰    │ ← Toggle button
├────────┤
│   ①   │ ← Icon + number
├────────┤
│   ②   │
├────────┤
│   ③   │
├────────┤
│   ④   │
├────────┤
│   ⑤   │
├────────┤
│  ...  │
└────────┘
  72px
```

### Expanded State (280px)
```
┌───────────────────────────────┐
│  مراحل العملية          ▼ ☰  │ ← Header + Toggle
├───────────────────────────────┤
│  ① الخطة السنوية             │ ← Full label
│     (Annual Plan)             │
├───────────────────────────────┤
│  ② التخطيط                    │
│     (Planning)                │
├───────────────────────────────┤
│  ③ فهم العملية والمخاطر       │
│     (Process & Risk)          │
├───────────────────────────────┤
│  ④ برنامج العمل والعينات     │
│     (Work Program)            │
├───────────────────────────────┤
│  [Scroll ↓]                   │
└───────────────────────────────┘
          280px
```

### Animation Sequence
```
72px ──────────────► 280px
     transition: 250ms
     cubic-bezier(0.4, 0, 0.2, 1)
     
72px ◄────────────── 280px
     (Same smooth easing)
```

---

## 📊 Table Cell Behavior

### Text Wrapping (Arabic Content)
```
┌─────────────────────────────────────────┐
│ Title Column (.cell-text)               │
├─────────────────────────────────────────┤
│ تدقيق النظام المالي والإداري للشركة   │ ← Wraps naturally
│ بما يتوافق مع معايير التدقيق الدولية  │
└─────────────────────────────────────────┘
   Min-width: 260px, expands as needed
   white-space: normal
   overflow-wrap: break-word
```

### Token Ellipsis (Codes/IDs)
```
┌──────────────┐
│ Code Column  │
│ (.cell-token)│
├──────────────┤
│ AUDIT-20...  │ ← Truncated with ...
└──────────────┘
   Width: 100px fixed
   white-space: nowrap
   text-overflow: ellipsis
```

---

## 🎯 Z-Index Stacking Context

### Layer Visualization (Side View)
```
          ┌───────────────────┐  z-100 (Tooltips)
          │    Tooltip        │
          └───────────────────┘
               ↓
    ┌──────────────────────────┐  z-50 (Sidebar)
    │      Sidebar             │
    │   (Always on top)        │
    └──────────────────────────┘
               ↓
         ┌────────────────┐      z-30 (Bottom Bar - Mobile)
         │  Bottom Bar    │
         └────────────────┘
               ↓
    ┌─────────────────────────┐   z-20 (Table Header - Sticky)
    │   Table Header          │
    └─────────────────────────┘
               ↓
    ┌─────────────────────────┐   z-10 (Main Content)
    │     Main Content        │
    │  ┌───────────────────┐  │
    │  │  Table Body       │  │   z-5
    │  └───────────────────┘  │
    └─────────────────────────┘
```

---

## 🔀 Overflow Strategy

### Parent Chain (overflow: visible)
```
<html>
  └─ <body>
      └─ <div class="annual-plan-container">  ← overflow-x: clip (only)
          └─ <div class="annual-plan-shell">   ← overflow: visible
              ├─ <aside class="annual-plan-sidebar">      ← overflow: visible
              │   └─ <div class="sidebar-inner">          ← overflow: visible
              │       └─ [Sidebar content expands freely]
              │
              └─ <main class="annual-plan-main">          ← overflow: visible
                  └─ <div class="table-wrapper">          ← overflow: auto ✓
                      └─ [Table scrolls here only]
```

**Key Points**:
- Only `.annual-plan-container` has `overflow-x: clip` (prevents page scroll)
- Only `.annual-plan-table-wrapper` has `overflow: auto` (table scrolls)
- Everything else: `overflow: visible` (allows sidebar expansion)

---

## 📐 Responsive Grid Transformation

### Desktop Grid
```
grid-template-columns: auto minmax(0, 1fr)
                       ↑            ↑
                   Sidebar      Main Content
                   72/280px     Flexible
```

### Mobile Grid
```
grid-template-columns: 1fr
                       ↑
                  Main Content
                  (Full width)
                  
Sidebar: display: none
Bottom Bar: display: block (fixed)
```

---

## 🎨 Color & Contrast Hierarchy

### Sidebar States
```
Active Step:
  Background: #eff6ff (blue-50)
  Border: #93c5fd (blue-300)
  Text: #1e3a8a (blue-900)
  
Completed Step:
  Background: #f0fdf4 (green-50)
  Border: #86efac (green-300)
  Text: #14532d (green-900)
  
Available Step:
  Background: #ffffff (white)
  Border: #e5e7eb (gray-200)
  Text: #1f2937 (gray-800)
```

### Table
```
Header:
  Background: #f9fafb (gray-50)
  Text: #6b7280 (gray-600)
  
Row (Even):
  Background: rgba(249,250,251,0.5)
  
Row (Hover):
  Background: #f3f4f6 (gray-100)
```

---

## 🧭 Navigation Flow

### Desktop Navigation
```
User Action          →  Result
───────────────────────────────────────────────
Click Toggle         →  Sidebar: 72px ↔ 280px
Click Stage (Sidebar)→  Change content view
Tab Key             →  Navigate stages
Enter/Space         →  Activate stage
Arrow Up/Down       →  Navigate stages
```

### Mobile Navigation
```
User Action          →  Result
───────────────────────────────────────────────
Scroll Bottom Bar   →  Reveal more stages
Tap Stage Chip      →  Change content view
Swipe Table         →  Horizontal scroll
```

---

## 📏 Measurements Reference

### Desktop Breakpoint (≥1024px)
| Element | Dimension |
|---------|-----------|
| Sidebar (Collapsed) | 72px wide |
| Sidebar (Expanded) | 280px wide |
| Table Max Height | calc(100vh - 420px) |
| Header Height | ~88px |
| Gap Between Columns | 1.5rem (24px) |

### Mobile Breakpoint (<1024px)
| Element | Dimension |
|---------|-----------|
| Bottom Bar Height | ~64px |
| Table Max Height | calc(100vh - 360px) |
| Main Padding Bottom | 72px (for bottom bar) |
| Stage Chip Padding | 0.5rem 0.75rem |

---

## 🔧 Customization Points

### Easy to Change
1. **Sidebar width**: Update `.annual-plan-sidebar` and `.is-open` widths
2. **Table height**: Adjust `max-height` in `.annual-plan-table-wrapper`
3. **Breakpoint**: Change `@media (max-width: 1024px)` to desired value
4. **Column widths**: Modify `.col-*` classes
5. **Transition speed**: Update `transition: width 0.25s` duration

### Requires More Care
1. Z-index hierarchy (maintain relative order)
2. Overflow strategy (keep `visible` chain intact)
3. Grid template (ensure `minmax(0, 1fr)` for flex)

---

## 🎓 Learning Notes

### Why `min-width: 0` on Main?
Prevents flex/grid children from overflowing parent. Without it:
```
Main Column: [────────────Table───────────►] ← Overflows!

With min-width: 0:
Main Column: [────Table with scroll──►] ← Scrolls inside!
```

### Why `overflow: visible` on Ancestors?
Allows sidebar to expand without clipping:
```
With overflow: hidden:
  [Sidebar│Main]
      ↓ (Clipped!)
      
With overflow: visible:
  [Sidebar (expanded) │Main]
      ✓ (Visible!)
```

### Why `table-layout: fixed`?
Predictable column widths, prevents content from pushing columns:
```
Auto layout: [Code│Title──────────────►] ← Unpredictable!
Fixed layout: [Code│Title     ] ← Controlled!
```

---

**Visual Reference Created**: October 23, 2025  
**For**: QAudit Pro - Annual Plan Module  
**Use**: Developer onboarding, debugging, documentation
