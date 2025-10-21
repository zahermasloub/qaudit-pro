# Annual Plan Page Layout - Visual Structure

## Desktop Layout (≥ 1024px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         STICKY HEADER (z-50)                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ 📋 الخطة السنوية للتدقيق الداخلي        [+ إنشاء خطة جديدة] │   │
│  │    السنة المالية: 2025                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      MAIN CONTAINER (max-w-7xl)                         │
│                                                                         │
│  ┌────────────────────────────────────┬──────────────────────────────┐ │
│  │  MAIN CONTENT (flex-1 min-w-0)     │  SIDEBAR (300px fixed)       │ │
│  │  ┌──────────────────────────────┐  │  ┌────────────────────────┐ │ │
│  │  │    KPI CARDS (Grid 4 cols)   │  │  │ PROCESS STEPPER        │ │ │
│  │  │  ┌─────┬─────┬─────┬─────┐   │  │  │ ╔═══════════════════╗ │ │ │
│  │  │  │حالة │مهام │ساعات│إنجاز│   │  │  │ ║ مراحل العملية    ║ │ │ │
│  │  │  │الخطة│ 5   │1080 │ 20% │   │  │  │ ║ 1 من 5 مكتملة    ║ │ │ │
│  │  │  └─────┴─────┴─────┴─────┘   │  │  │ ╚═══════════════════╝ │ │ │
│  │  └──────────────────────────────┘  │  │                        │ │ │
│  │                                     │  │ ┌──────────────────┐  │ │ │
│  │  ┌──────────────────────────────┐  │  │ │ ✅ 1. إعداد     │  │ │ │
│  │  │   FILTERS & SEARCH BAR        │  │  │ │    الخطة        │  │ │ │
│  │  │  [🔍 Search] [Dept▾] [Risk▾] │  │  │ └──────────────────┘  │ │ │
│  │  │  [Status▾]  [Export CSV]      │  │  │                        │ │ │
│  │  └──────────────────────────────┘  │  │ ┌──────────────────┐  │ │ │
│  │                                     │  │ │ 🔵 2. تحديد      │  │ │ │
│  │  ┌──────────────────────────────┐  │  │ │    المهام        │  │ │ │
│  │  │     TASKS TABLE               │  │  │ └──────────────────┘  │ │ │
│  │  │  ┌────┬──────┬──────┬───┐    │  │  │                        │ │ │
│  │  │  │Code│Title │Dept  │...│    │  │  │ ┌──────────────────┐  │ │ │
│  │  │  ├────┼──────┼──────┼───┤    │  │  │ │ ⚪ 3. تخصيص     │  │ │ │
│  │  │  │...1│......│......│...│    │  │  │ │    الموارد      │  │ │ │
│  │  │  │...2│......│......│...│    │  │  │ └──────────────────┘  │ │ │
│  │  │  │...3│......│......│...│    │  │  │                        │ │ │
│  │  │  │...4│......│......│...│    │  │  │ ┌──────────────────┐  │ │ │
│  │  │  │...5│......│......│...│    │  │  │ │ 🔒 4. مراجعة    │  │ │ │
│  │  │  └────┴──────┴──────┴───┘    │  │  │ │    الجودة       │  │ │ │
│  │  └──────────────────────────────┘  │  │ └──────────────────┘  │ │ │
│  │                                     │  │                        │ │ │
│  └─────────────────────────────────────┤  │ ┌──────────────────┐  │ │ │
│              ▲                          │  │ │ 🔒 5. المصادقة  │  │ │ │
│              │ space-y-6 (24px)        │  │ │    والاعتماد    │  │ │ │
│              ▼                          │  │ └──────────────────┘  │ │ │
│                                         │  │                        │ │ │
│                                         │  │ ┌──────────────────┐  │ │ │
│                                         │  │ │ التقدم: 20%      │  │ │ │
│   ◄───────── gap-6 (24px) ────────────►│  │ │ ████░░░░░░░░     │  │ │ │
│                                         │  │ └──────────────────┘  │ │ │
│                                         │  │                        │ │ │
│                                         │  │ STICKY: top-[88px]    │ │ │
│                                         │  └────────────────────────┘ │ │
└─────────────────────────────────────────┴──────────────────────────────┘
```

## Tablet/Mobile Layout (< 1024px)

```
┌─────────────────────────────────────────┐
│       STICKY HEADER (z-50)              │
│ ┌─────────────────────────────────────┐ │
│ │ 📋 الخطة السنوية                   │ │
│ │ [+ إنشاء خطة]                       │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│          MAIN CONTENT                   │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  PROCESS ACCORDION (Collapsible)  │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ مراحل العملية [1/5] ▼      │  │ │
│  │  ├─────────────────────────────┤  │ │
│  │  │ ✅ 1. إعداد الخطة          │  │ │
│  │  │ 🔵 2. تحديد المهام          │  │ │
│  │  │ ⚪ 3. تخصيص الموارد         │  │ │
│  │  │ 🔒 4. مراجعة الجودة         │  │ │
│  │  │ 🔒 5. المصادقة والاعتماد    │  │ │
│  │  ├─────────────────────────────┤  │ │
│  │  │ ████░░░░░░░░ 20%            │  │ │
│  │  └─────────────────────────────┘  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         KPI CARDS (Stack)         │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ حالة الخطة: معتمدة         │  │ │
│  │  └─────────────────────────────┘  │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ المهام المخططة: 5          │  │ │
│  │  └─────────────────────────────┘  │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ إجمالي الساعات: 1080       │  │ │
│  │  └─────────────────────────────┘  │ │
│  │  ┌─────────────────────────────┐  │ │
│  │  │ نسبة الإنجاز: 20%           │  │ │
│  │  └─────────────────────────────┘  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      FILTERS (Stack)              │ │
│  │  [🔍 Search...             ]      │ │
│  │  [Department ▾             ]      │ │
│  │  [Risk Level ▾             ]      │ │
│  │  [Status ▾                 ]      │ │
│  │  [Export CSV]                     │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │      TASKS TABLE (Responsive)     │ │
│  │  (Horizontal scroll enabled)      │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

## Key Measurements

### Desktop Layout:
- **Header Height:** ~80px (p-6 + text)
- **Sidebar Width:** 300px (fixed)
- **Gap Between Columns:** 24px (gap-6)
- **Sidebar Sticky Offset:** 88px (top-[88px])
- **Max Container Width:** 1280px (max-w-7xl)
- **Content Padding:** 24px (p-6)

### Responsive Breakpoints:
- **Desktop:** ≥ 1024px (lg:block)
- **Tablet:** 768px - 1023px
- **Mobile:** < 768px

### Z-Index Layers:
- **Header:** z-50 (highest)
- **Sidebar (Desktop):** Default stacking
- **Dropdown Menus:** Should be > z-50 if needed

### Colors (Theme Variables):
- **Surface:** `bg-surface` (white in light, dark in dark mode)
- **Background:** `bg-bg` (gray-50 in light)
- **Border:** `border-border` (gray-200)
- **Text:** `text-text`, `text-text-2`
- **Primary:** `bg-primary-600` (blue)

## Component Props

### ProcessStepper
```tsx
interface ProcessStepperProps {
  steps: ProcessStep[];        // Array of 5 steps
  activeStepId: number;         // Currently active step (1-5)
  onStepClick: (id: number) => void;  // Handler for step clicks
  completedCount?: number;      // Number of completed steps
}

interface ProcessStep {
  id: number;                   // Step number (1-5)
  label: string;                // Step label (RTL/LTR)
  status: 'active' | 'completed' | 'locked' | 'available';
  lockReason?: string;          // Tooltip for locked steps
  dueDate?: string;             // Optional due date
  isOverdue?: boolean;          // Optional overdue flag
}
```

## Interaction Flow

```
User Action                ProcessStepper Response
─────────────────────────────────────────────────────
1. Page Load            → Show step 2 as active
                         → Show step 1 as completed
                         → Show steps 4-5 as locked

2. Click Step 3         → Switch to step 3
                         → Show toast notification
                         → Update activeStepId state
                         → Change visual state

3. Click Locked Step    → No action
                         → Show tooltip with reason
                         → Cursor: not-allowed

4. Keyboard ↓           → Focus next available step
                         → Skip locked steps

5. Press Enter          → Activate focused step
                         → Same as click action

6. Mobile View          → Collapse sidebar
                         → Show accordion header
                         → Toggle on click
```

## RTL Layout Considerations

In RTL mode (`dir="rtl"`):
- **Sidebar Position:** Right side (natural flex order)
- **Content Order:** Content on left, sidebar on right
- **Text Alignment:** Right-to-left
- **Icons:** Mirror-friendly icons (not flipped)
- **Padding/Margin:** Logical properties used

## File Structure

```
features/annual-plan/
├── AnnualPlan.screen.tsx       ← Modified (main component)
├── annual-plan.form.tsx        ← Existing (modal form)
└── annual-plan.schema.ts       ← Existing (validation)

app/(app)/rbia/plan/
└── ProcessStepper.tsx          ← Reused (imported)
```

## Notes

1. **No Duplicate ProcessStepper**: The ProcessStepper is shown only once in the sidebar/accordion
2. **Sticky Behavior**: Header sticks at top, sidebar sticks below header
3. **Scroll Independence**: Sidebar scrolls independently from main content
4. **Touch-Friendly**: Minimum 44px height for mobile touch targets
5. **Keyboard Navigation**: Full support with skip-locked logic
6. **Screen Reader Support**: ARIA attributes for all interactive elements
