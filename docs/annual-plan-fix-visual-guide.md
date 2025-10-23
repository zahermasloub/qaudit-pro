# Annual Plan UI Fix - Visual Guide

## Problem Illustration

### Before Fix (Issue State)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Annual Internal Audit Plan                         [+ Create Plan] │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────┬───────────┐
│ ProcessStepper   │            Main Content Area                 │   RBIA    │
│   320px width    │                                              │  320px    │
│ ┌──────────────┐ │ ┌────────────────────────────────────────┐ │ ┌───────┐ │
│ │ 1 Annual Plan│ │ │          KPI Cards                     │ │ │ RBIA  │ │
│ │ 2 Planning   │ │ │  [Plan] [Tasks] [Hours] [Progress]    │ │ │ Info  │ │
│ │ 3 Process... │ │ │                                        │ │ │       │ │
│ │ 4 Work Prog..│ │ │          Filters & Search              │ │ │       │ │
│ │ 5 Fieldwork  │ │ │  [Search] [Dept] [Risk] [Status]       │ │ │       │ │
│ │ ...          │ │ │                                        │ │ │       │ │
│ └──────────────┘ │ │ Table with Fixed Columns:              │ │ │       │ │
│                  │ │ | Code | Title | Dept | Risk | Type |  │ │ │       │ │
│                  │ │ |------|-------|------|------|-------|  │ │ │       │ │
│                  │ │ | Very long task title that wraps... │ │ │       │ │
│                  │ │ | Another long title ............... │ │ │       │ │
│                  │ └────────────────────────────────────────┘ │ └───────┘ │
│                  │                                              │           │
└──────────────────┴──────────────────────────────────────────────┴───────────┘
        ↑                            ↑                                  ↑
      Fixed                      Flexible                            Fixed
     320px                     Grows/Shrinks                          320px


**PROBLEM:** When table loads with wide data:

┌───────┬─────────────────────────────────────────────────────────────────────┬──┐
│ Proc..│                 Main Content (EXPANDED!)                            │RB│
│ 120px │ Table forces expansion ────────────────────────────────────────────▶│ │
│       │ | Code | Very Long Task Title That Doesn't Wrap | Dept | Risk...   │ │
│       │ ───────────────────────────────────────────────────────────────────▶│ │
└───────┴─────────────────────────────────────────────────────────────────────┴──┘
   ↑                                    ↑                                      ↑
SHRUNK!                            TOO WIDE!                              SHRUNK!
 120px                          (Forces expansion)                        100px

Text gets cut off: "Proc..." instead of "ProcessStepper"
```

### After Fix (Solved State)
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Header: Annual Internal Audit Plan                         [+ Create Plan] │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────────────────────────────────┬───────────┐
│ ProcessStepper   │            Main Content Area                 │   RBIA    │
│   320px width    │         (Properly Contained)                 │  320px    │
│ ┌──────────────┐ │ ┌────────────────────────────────────────┐ │ ┌───────┐ │
│ │ ✓ Annual Plan│ │ │          KPI Cards                     │ │ │ RBIA  │ │
│ │   Planning   │ │ │  [Plan] [Tasks] [Hours] [Progress]    │ │ │ Info  │ │
│ │   Process &  │ │ │                                        │ │ │       │ │
│ │   Risk       │ │ │          Filters & Search              │ │ │       │ │
│ │   Work Prog. │ │ │  [Search] [Dept] [Risk] [Status]       │ │ │       │ │
│ │   Fieldwork  │ │ │                                        │ │ │       │ │
│ │   ...        │ │ │ ┌────────────────────────────────────┐ │ │ │       │ │
│ └──────────────┘ │ │ │ Table (Respects Container):        │ │ │ │       │ │
│                  │ │ │ Code │ Title      │ Dept │ Risk │  │ │ │ │       │ │
│  Fixed 320px     │ │ │──────│────────────│──────│──────│  │ │ │ │       │ │
│                  │ │ │ A-01 │ Task title │ HR   │ High │  │ │ │ │       │ │
│                  │ │ │      │ wraps here │      │      │  │ │ │ │       │ │
│                  │ │ │ A-02 │ Another    │ IT   │ Med  │  │ │ │ │       │ │
│                  │ │ │      │ long title │      │      │  │ │ │ │       │ │
│                  │ │ └────────────────────────────────────┘ │ │ └───────┘ │
│                  │ │     ↑ Text wraps within column width   │ │           │
│                  │ └────────────────────────────────────────┘ │           │
│                  │            ↑ No overflow, no scroll        │           │
└──────────────────┴──────────────────────────────────────────────┴───────────┘
        ↑                            ↑                                  ↑
      Fixed                    Constrained                           Fixed
     320px                  (minmax(0,1fr))                          320px

**SOLUTION:** Grid columns are constrained:
- Left: 320px (fixed)
- Middle: minmax(0, 1fr) - can shrink to 0, max is remaining space
- Right: 320px (fixed)
```

## CSS Grid Comparison

### Before (Using `1fr`)
```css
.grid {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 1.5rem;
}

/* What happens:
   1. Left: 320px fixed
   2. Middle: 1fr = "take remaining space, but respect my content's min-width"
   3. Right: 320px fixed
   
   When table has wide content:
   - Grid respects content's intrinsic minimum width
   - Middle column expands beyond viewport
   - Fixed columns get pushed/shrunk to accommodate
*/
```

### After (Using `minmax(0,1fr)`)
```css
.grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 320px;
  gap: 1.5rem;
}

/* What happens:
   1. Left: 320px fixed
   2. Middle: minmax(0, 1fr) = "min width is 0, max is remaining space"
   3. Right: 320px fixed
   
   When table has wide content:
   - Grid forces middle column to stay within available space
   - Content must wrap/overflow within column (thanks to min-w-0 on main)
   - Fixed columns maintain their width
*/
```

## RTL Layout Behavior

### Issue in RTL (Arabic)
```
RTL Mode (Right-to-Left):

Before Fix:
┌────────────────────────────────────────────────────────────────────────┐
│                                                    ةيونسلا ةطخلا :رئادلا │
└────────────────────────────────────────────────────────────────────────┘
        
┌───┬──────────────────────────────────────────────────────────┬─────────┐
│RB │                 Main Content (EXPANDED!)                 │  Proc.. │
│IA │                                                          │  100px  │
└───┴──────────────────────────────────────────────────────────┴─────────┘
                                                                    ↑
                                                          ProcessStepper
                                                          SHRUNK & SHIFTED!

After Fix:
┌────────────────────────────────────────────────────────────────────────┐
│  [ديدج طيطخت ءاشنإ +]                    ةيونسلا ةطخلا ةجراد ةيلخادلا │
└────────────────────────────────────────────────────────────────────────┘

┌───────────┬──────────────────────────────────────────────┬──────────────┐
│   RBIA    │            Main Content Area                 │ ProcessStepper│
│  320px    │         (Properly Contained)                 │   320px width│
│ ┌───────┐ │ ┌────────────────────────────────────────┐ │ ┌──────────┐ │
│ │ RBIA  │ │ │                                        │ │ │ ✓ ةطخلا   │ │
│ │ Info  │ │ │            KPI Cards                   │ │ │  ةيونسلا │ │
│ │       │ │ │  [Progress] [Hours] [Tasks] [Plan]     │ │ │  طيطختلا │ │
│ │       │ │ │                                        │ │ │  رطاخملا │ │
│ └───────┘ │ │          Table with Arabic Text        │ │ │  و ةيلمعلا│ │
│           │ │ ├──────┬───────────┬─────┬──────┤       │ │ │  ...     │ │
│           │ │ │ تاءارجإ│ ةلاحلا    │ رطخ  │ زمرلا│       │ │ └──────────┘ │
└───────────┴─┴────────┴───────────┴─────┴──────┴───────┴─┴──────────────┘
      ↑                      ↑                                   ↑
    Fixed                Constrained                          Fixed
   320px              (minmax(0,1fr))                        320px
```

## Responsive Behavior

### Mobile (< 1024px)
```
┌─────────────────────────────────────────┐
│ Header                    [+ Create]    │
├─────────────────────────────────────────┤
│                                         │
│  ProcessStepper                         │
│  ┌─────────────────────────────────┐   │
│  │ 1 Annual Plan                   │   │
│  │ 2 Planning                      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Main Content (Full Width)              │
│  ┌─────────────────────────────────┐   │
│  │ KPI Cards (Stacked)             │   │
│  │ [Plan Status]                   │   │
│  │ [Total Tasks]                   │   │
│  │ [Total Hours]                   │   │
│  │ [Completion]                    │   │
│  │                                 │   │
│  │ Table (Horizontal Scroll OK)    │   │
│  │ [→ Scroll to see more →]       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  (RBIA Sidebar Hidden on Mobile)        │
│                                         │
└─────────────────────────────────────────┘
```

### Desktop (≥ 1024px)
```
┌──────────────────┬───────────────────────┬──────────────┐
│ ProcessStepper   │    Main Content       │    RBIA      │
│    320px         │   Flexible Width      │   320px      │
└──────────────────┴───────────────────────┴──────────────┘
      Always           Grows/Shrinks           Always
      Visible          with Viewport           Visible
```

## Key Classes Explained

### Grid Container
```tsx
<div className="grid grid-cols-[320px_minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
```
- `grid`: CSS Grid layout
- `grid-cols-[320px_minmax(0,1fr)]`: 2 columns on mobile/tablet
  - Column 1: 320px fixed
  - Column 2: minmax(0, 1fr) - flexible but constrained
- `gap-6`: 1.5rem gap between columns
- `lg:grid-cols-[...]`: 3 columns on large screens (≥1024px)

### Sidebar (ProcessStepper)
```tsx
<aside className="min-w-[320px] w-[320px] shrink-0 flex-none">
```
- `min-w-[320px]`: Minimum width constraint
- `w-[320px]`: Explicit width
- `shrink-0`: Tailwind - don't shrink in flex context
- `flex-none`: CSS - flex: 0 0 auto (never grow or shrink)

### Main Content
```tsx
<main className="min-w-0 space-y-6">
```
- `min-w-0`: Allow content to shrink below intrinsic minimum
- `space-y-6`: 1.5rem vertical spacing between children

### Table Container
```tsx
<div className="w-full overflow-hidden">
  <table className="w-full table-fixed">
```
- `overflow-hidden`: Hide any overflow (no scrollbars)
- `table-fixed`: Table layout algorithm uses explicit widths

## Testing Scenarios

### Scenario 1: No Data
✅ ProcessStepper: 320px, showing all text
✅ Main: Empty state centered
✅ RBIA: 320px, showing all content

### Scenario 2: Data Loaded (5 tasks)
✅ ProcessStepper: 320px, step 1 shows ✓✓
✅ Main: KPI cards + table with 5 rows
✅ Table: No horizontal scroll
✅ RBIA: 320px, no shift

### Scenario 3: Data Loaded (20+ tasks)
✅ ProcessStepper: 320px (NOT shrunk)
✅ Main: KPI cards + table with scrollable content
✅ Table: Vertical scroll only
✅ Text: Wraps properly in Title column

### Scenario 4: Viewport Resize (1920px → 1280px)
✅ ProcessStepper: Maintains 320px
✅ Main: Shrinks smoothly
✅ Table: Adjusts within constraints
✅ No layout jumps or shifts

### Scenario 5: RTL Mode
✅ ProcessStepper: On RIGHT, 320px
✅ RBIA: On LEFT, 320px  
✅ Table: Right-aligned content
✅ Text: Proper Arabic wrapping
✅ No LEFT shift when table loads

## Browser DevTools Inspection

### Chrome DevTools
1. Open DevTools (F12)
2. Select the grid container
3. In Elements tab, look for:
   ```
   display: grid
   grid-template-columns: 320px minmax(0px, 1fr) 320px
   gap: 1.5rem
   ```
4. In Computed tab, verify:
   - Left sidebar: width = 320px
   - Right sidebar: width = 320px
   - Middle: width = (viewport - 320 - 320 - gaps)

### Testing Grid Behavior
1. Add temporary border for visualization:
   ```css
   .grid > * { border: 2px solid red; }
   ```
2. Load table data
3. Observe: Sidebars should NOT change width
4. Resize viewport
5. Observe: Middle column shrinks, sidebars stay 320px

## Summary

**Problem**: CSS Grid with `1fr` allows content to force column expansion
**Solution**: CSS Grid with `minmax(0,1fr)` constrains column to available space
**Result**: Sidebars maintain fixed 320px width regardless of table content
**Benefit**: Stable, predictable layout that works in both LTR and RTL modes
