# Annual Plan Redesign - Visual Architecture

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header Bar                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Title & Fiscal Year Info     [+ Create New Plan Button] │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PlanShell                                 │
│  ┌────────────┐  ┌──────────────────────────────────────────┐   │
│  │            │  │                                          │   │
│  │  Stages    │  │          Main Content Area               │   │
│  │  Sidebar   │  │  ┌────────────────────────────────────┐  │   │
│  │            │  │  │        KPI Cards (4 cards)         │  │   │
│  │  [1] Plan  │  │  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌───┐  │  │   │
│  │  [2] ...   │  │  │  │Status│ │Tasks │ │Hours │ │%  │  │  │   │
│  │  [3] ...   │  │  │  └──────┘ └──────┘ └──────┘ └───┘  │  │   │
│  │  [4] ...   │  │  └────────────────────────────────────┘  │   │
│  │  [5] ...   │  │                                          │   │
│  │  [6] ...   │  │  ┌────────────────────────────────────┐  │   │
│  │  [7] ...   │  │  │          Toolbar                   │  │   │
│  │  [8] ...   │  │  │  [Search] [Dept▾] [Risk▾] [Status▾] │  │   │
│  │  [9] ...   │  │  │  Showing X of Y  [Clear] [Export]  │  │   │
│  │  [10] ..   │  │  └────────────────────────────────────┘  │   │
│  │  [11] QA   │  │                                          │   │
│  │            │  │  ┌────────────────────────────────────┐  │   │
│  │  [Expand]  │  │  │          PlanTable                 │  │   │
│  │            │  │  │  ┌──────────────────────────────┐  │  │   │
│  │            │  │  │  │ Code│Title│Dept│Risk│Hours │  │  │   │
│  │            │  │  │  ├──────────────────────────────┤  │  │   │
│  │            │  │  │  │ ... │ ... │... │... │ ...  │  │  │   │
│  │            │  │  │  │ ... │ ... │... │... │ ...  │  │  │   │
│  │            │  │  │  └──────────────────────────────┘  │  │   │
│  │            │  │  └────────────────────────────────────┘  │   │
│  └────────────┘  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│              Mobile Bottom Bar (< 1024px)                        │
│  [1 Plan] [2 Planning] [3 Risk] ... (horizontal scroll) ─→      │
└─────────────────────────────────────────────────────────────────┘
```

## State Flow Diagram

```
┌──────────────────┐
│  usePlanStore    │
│  (Zustand)       │
│                  │
│  • filters       │◄──── User interactions
│  • sort          │      (search, filter, etc.)
│  • pagination    │
│  • selection     │
│  • sidebar       │
└────────┬─────────┘
         │
         │ State updates
         ▼
┌──────────────────┐      ┌──────────────────┐
│   Toolbar        │      │   PlanTable      │
│                  │      │                  │
│  • Search input  │      │  • Filtered data │
│  • Filter select │      │  • Sorted rows   │
│  • Actions       │      │  • Pagination    │
└──────────────────┘      └──────────────────┘
```

## Data Flow

```
┌─────────────────┐
│  API Adapter    │
│  (src/lib/api)  │
└────────┬────────┘
         │
         │ fetch
         ▼
┌─────────────────┐       ┌──────────────────┐
│ Backend API     │       │  Component State │
│ /api/annual-    │◄─────►│  (local state)   │
│      plans/*    │       │  • selectedPlan  │
└─────────────────┘       │  • tasks         │
                          │  • loading       │
                          └──────────────────┘
                                   │
                                   │ render
                                   ▼
                          ┌──────────────────┐
                          │  UI Components   │
                          │  • PlanShell     │
                          │  • PlanTable     │
                          │  • Toolbar       │
                          └──────────────────┘
```

## Responsive Layout Breakpoints

### Desktop (≥1024px)
```
┌────────────────────────────────────────┐
│            Header (fixed)              │
├───────┬────────────────────────────────┤
│       │                                │
│ Side  │        Main Content            │
│ bar   │                                │
│       │                                │
│ 72px  │       Flexible width           │
│ or    │                                │
│280px  │                                │
└───────┴────────────────────────────────┘
```

### Tablet (768px - 1023px)
```
┌────────────────────────────────────────┐
│            Header (fixed)              │
├───────┬────────────────────────────────┤
│       │                                │
│ Side  │        Main Content            │
│ 72px  │      (full width avail)        │
│       │                                │
└───────┴────────────────────────────────┘
└────────────────────────────────────────┘
│      Bottom Bar (stages)               │
└────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌────────────────────────────────────────┐
│            Header (fixed)              │
├────────────────────────────────────────┤
│                                        │
│        Main Content                    │
│        (full width)                    │
│                                        │
│        (padding bottom for             │
│         bottom bar)                    │
│                                        │
└────────────────────────────────────────┘
└────────────────────────────────────────┘
│      Bottom Bar (stages scroll)        │
└────────────────────────────────────────┘
```

## Animation States

### Sidebar Toggle
```
Collapsed (72px)  ──toggle──►  Expanded (280px)
    │                              │
    │◄─────────toggle──────────────┘
    
[Icon Rail]           [Full Stepper with Labels]
```

### Page Transitions
```
Step 1 (Annual Plan)
    │ fadeOut
    ▼
[Transition (200ms)]
    │ fadeIn
    ▼
Step 2 (Planning)
```

### Drawer States
```
Closed (off-screen)  ──open──►  Open (slide in)
         │                          │
         │◄──────close──────────────┘
         
  x: 100% (RTL)              x: 0
```

## Component Communication

```
┌─────────────────────────────────────────────────────┐
│                  Parent Component                    │
│            (EnhancedAnnualPlanScreen)                │
└───────────┬─────────────────────────────────────────┘
            │
            │ Props
            ├──────────────┬──────────────┬────────────┐
            ▼              ▼              ▼            ▼
    ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌────────┐
    │ PlanShell │  │ PlanTable │  │  Toolbar  │  │Drawer  │
    └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └───┬────┘
          │              │              │            │
          │ Events       │ Events       │ Events     │ Events
          │              │              │            │
          └──────────────┴──────────────┴────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │   Handlers   │
                  │ • onStepClick│
                  │ • onRowClick │
                  │ • onFilter   │
                  │ • onEdit     │
                  │ • onDelete   │
                  └──────────────┘
```

## Styling Architecture

```
Tailwind Config
    │
    ├─► Design Tokens (colors, spacing)
    │
    ├─► Custom Utilities
    │   • .is-text (Arabic wrapping)
    │   • .is-token (truncation)
    │   • .sticky-col (sticky columns)
    │
    └─► Component Styles
        • .annual-plan-* (layout)
        • .thcell, .tdcell (table)
        • .status-badge (badges)
        • .stage-chip (mobile chips)
```

## File Dependencies

```
EnhancedAnnualPlanScreen.tsx
    ├─► PlanShell
    │   ├─► StagesSidebar
    │   ├─► StagesBottomBar
    │   └─► framer-motion
    │
    ├─► PlanTable
    │   ├─► columns
    │   └─► @tanstack/react-table
    │
    ├─► Toolbar
    │   └─► usePlanStore
    │
    ├─► StageDrawer
    │   ├─► @radix-ui/react-dialog
    │   └─► framer-motion
    │
    ├─► api (adapter)
    │
    └─► usePlanStore (zustand)
```
