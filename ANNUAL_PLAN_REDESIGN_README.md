# Annual Plan Redesign - New Components

This document describes the new modular components created for the annual audit plan interface redesign.

## Overview

The redesign follows a modern, modular architecture with the following key features:

- **State Management**: Zustand for lightweight, performant state management
- **UI Components**: Radix UI for accessible, composable components
- **Animations**: Framer Motion for smooth transitions
- **Table**: TanStack Table for powerful data grid functionality
- **RTL Support**: Full right-to-left layout support for Arabic

## Directory Structure

```
src/
├── components/
│   ├── shell/
│   │   ├── PlanShell.tsx           # Main container with sidebar layout
│   │   ├── StagesSidebar.tsx       # Desktop collapsible sidebar
│   │   ├── StagesBottomBar.tsx     # Mobile bottom navigation
│   │   └── StageDrawer.tsx         # Drawer for details/forms
│   ├── table/
│   │   ├── PlanTable.tsx           # Main table with TanStack Table
│   │   ├── columns.tsx             # Column definitions
│   │   └── Toolbar.tsx             # Filters and actions toolbar
│   └── EnhancedAnnualPlanScreen.tsx # Example implementation
├── state/
│   └── plan.store.ts               # Zustand store for plan state
├── hooks/
│   └── useVirtualSwitch.ts         # Custom hook for virtualization
└── lib/
    └── api.ts                      # API adapter for backend calls
```

## Key Components

### PlanShell

The main container component that provides the layout structure:

```tsx
import { PlanShell, ProcessStep } from '@/src/components/shell/PlanShell';

const steps: ProcessStep[] = [
  { id: 1, label: 'Annual Plan', status: 'completed' },
  { id: 2, label: 'Planning', status: 'available' },
  // ... more steps
];

<PlanShell
  steps={steps}
  activeStepId={activeStepId}
  onStepClick={handleStepClick}
  locale="ar"
  dir="rtl"
>
  {/* Your content here */}
</PlanShell>
```

### PlanTable

A powerful table component with filtering, sorting, and pagination:

```tsx
import { PlanTable } from '@/src/components/table/PlanTable';

<PlanTable
  data={tasks}
  locale="ar"
  onRowClick={handleRowClick}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Toolbar

Filters and actions for the table:

```tsx
import { Toolbar } from '@/src/components/table/Toolbar';

<Toolbar
  locale="ar"
  departments={departments}
  onExport={handleExport}
  totalTasks={100}
  filteredTasks={75}
/>
```

### StageDrawer

A drawer component for displaying details or forms:

```tsx
import { StageDrawer } from '@/src/components/shell/StageDrawer';

<StageDrawer
  open={drawerOpen}
  onOpenChange={setDrawerOpen}
  title="Task Details"
  locale="ar"
>
  {/* Drawer content */}
</StageDrawer>
```

## State Management

The Zustand store provides centralized state management:

```tsx
import { usePlanStore } from '@/src/state/plan.store';

const { filters, setFilter, clearFilters, sidebarCollapsed, toggleSidebar } = usePlanStore();
```

### Store API

- `sidebarCollapsed`: Boolean for sidebar state
- `view`: 'table' | 'cards' view mode
- `pageIndex`: Current page number
- `pageSize`: Number of items per page
- `sort`: Current sort configuration
- `filters`: Object of active filters
- `selectedRows`: Set of selected row IDs
- `toggleSidebar()`: Toggle sidebar collapse
- `setView(view)`: Set view mode
- `setFilter(key, value)`: Set a filter
- `clearFilters()`: Clear all filters
- `toggleRowSelection(id)`: Toggle row selection

## API Adapter

The API adapter provides a clean interface to the backend:

```tsx
import { fetchPlan, fetchTasks, deleteTask } from '@/src/lib/api';

// Fetch a plan
const plan = await fetchPlan(planId);

// Fetch tasks
const tasks = await fetchTasks(planId);

// Delete a task
const success = await deleteTask(planId, taskId);
```

## Styling

Custom Tailwind utilities are provided for RTL support:

```css
.is-text  - For readable Arabic text wrapping
.is-token - For code/identifier truncation
.sticky-col - For sticky first columns
.thcell - Table header cell styles
.tdcell - Table data cell styles
```

## Responsive Design

- **Desktop**: Sidebar + main content layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation bar

## Accessibility

All components follow WCAG 2.1 AA guidelines:

- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader support

## Example Usage

See `src/components/EnhancedAnnualPlanScreen.tsx` for a complete implementation example.

## Dependencies

- `@radix-ui/react-dialog` - Accessible dialog/drawer
- `@radix-ui/react-tooltip` - Accessible tooltips
- `@radix-ui/react-dropdown-menu` - Accessible dropdowns
- `@radix-ui/react-scroll-area` - Custom scrollbars
- `framer-motion` - Animation library
- `zustand` - State management
- `@tanstack/react-table` - Table library
- `tailwind-variants` - Tailwind utility variants

## Migration Notes

To use these new components in an existing page:

1. Replace the old layout with `PlanShell`
2. Replace table implementation with `PlanTable`
3. Use `Toolbar` for filters instead of custom filter UI
4. Use `usePlanStore` for state instead of local useState
5. Import API functions from `src/lib/api.ts`

## Performance

- Virtual scrolling for large datasets (via `useVirtualSwitch`)
- Optimized re-renders with Zustand
- Memoized column definitions
- Efficient filtering and sorting with TanStack Table

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)
