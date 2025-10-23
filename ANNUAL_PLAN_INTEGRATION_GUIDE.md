# Integration Guide - Annual Plan New Components

This guide shows how to integrate the new annual plan components into your application.

## Quick Start

### 1. Basic Setup

```tsx
import { PlanShell, ProcessStep } from '@/src/components/shell/PlanShell';
import { PlanTable } from '@/src/components/table/PlanTable';
import { Toolbar } from '@/src/components/table/Toolbar';
import { usePlanStore } from '@/src/state/plan.store';
import { fetchPlan, fetchTasks } from '@/src/lib/api';

export function MyPlanPage() {
  const [tasks, setTasks] = useState([]);
  const [activeStepId, setActiveStepId] = useState(1);
  
  // Define your process steps
  const steps: ProcessStep[] = [
    { id: 1, label: 'Annual Plan', status: 'completed' },
    { id: 2, label: 'Planning', status: 'available' },
    // ... add more steps
  ];
  
  return (
    <PlanShell
      steps={steps}
      activeStepId={activeStepId}
      onStepClick={setActiveStepId}
      locale="ar"
      dir="rtl"
    >
      <Toolbar
        locale="ar"
        departments={departments}
        totalTasks={tasks.length}
        filteredTasks={filteredTasks.length}
      />
      <PlanTable
        data={tasks}
        locale="ar"
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PlanShell>
  );
}
```

### 2. State Management Integration

```tsx
import { usePlanStore } from '@/src/state/plan.store';

function MyComponent() {
  // Access global state
  const { 
    filters, 
    setFilter, 
    clearFilters,
    sidebarCollapsed,
    toggleSidebar 
  } = usePlanStore();
  
  // Use in your component
  const handleSearch = (query: string) => {
    setFilter('search', query);
  };
  
  return (
    <input 
      value={filters.search || ''} 
      onChange={e => handleSearch(e.target.value)} 
    />
  );
}
```

### 3. API Integration

```tsx
import { fetchPlan, fetchTasks, deleteTask } from '@/src/lib/api';

async function loadData(planId: string) {
  try {
    // Fetch plan with tasks
    const plan = await fetchPlan(planId);
    setSelectedPlan(plan);
    
    // Or fetch tasks separately
    const tasks = await fetchTasks(planId);
    setTasks(tasks);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

async function handleDelete(taskId: string) {
  const success = await deleteTask(planId, taskId);
  if (success) {
    // Reload data
    await loadData(planId);
  }
}
```

## Migration from Existing Implementation

### Before (Old Implementation)

```tsx
// Old way - monolithic component
export function OldAnnualPlanScreen() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({});
  const [sidebar, setSidebar] = useState(true);
  
  return (
    <div>
      {/* Custom sidebar */}
      {sidebar && <CustomSidebar />}
      
      {/* Custom table */}
      <table>
        {tasks.map(task => (
          <tr key={task.id}>
            <td>{task.code}</td>
            {/* ... more cells */}
          </tr>
        ))}
      </table>
    </div>
  );
}
```

### After (New Implementation)

```tsx
// New way - modular components
import { PlanShell } from '@/src/components/shell/PlanShell';
import { PlanTable } from '@/src/components/table/PlanTable';
import { usePlanStore } from '@/src/state/plan.store';

export function NewAnnualPlanScreen() {
  const [tasks, setTasks] = useState([]);
  // Filters now managed by store
  const { filters } = usePlanStore();
  
  return (
    <PlanShell
      steps={steps}
      activeStepId={activeStepId}
      onStepClick={handleStepClick}
    >
      {/* Filters built-in */}
      <Toolbar {...toolbarProps} />
      
      {/* Powerful table with built-in features */}
      <PlanTable
        data={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </PlanShell>
  );
}
```

## Common Use Cases

### 1. Adding a Custom Action Button

```tsx
<Toolbar
  locale="ar"
  departments={departments}
  totalTasks={100}
  filteredTasks={75}
  onExport={() => console.log('Export')}
/>
```

### 2. Handling Row Selection

```tsx
import { usePlanStore } from '@/src/state/plan.store';

function MyTableActions() {
  const { selectedRows, clearSelection } = usePlanStore();
  
  const handleBulkDelete = async () => {
    for (const id of selectedRows) {
      await deleteTask(planId, id);
    }
    clearSelection();
  };
  
  return (
    <button onClick={handleBulkDelete} disabled={selectedRows.size === 0}>
      Delete {selectedRows.size} tasks
    </button>
  );
}
```

### 3. Custom Column Definitions

```tsx
import { ColumnDef } from '@tanstack/react-table';
import { AuditTask } from '@/src/lib/api';

// Extend the base columns
const customColumns: ColumnDef<AuditTask>[] = [
  ...getColumns('ar'),
  {
    accessorKey: 'customField',
    header: 'Custom',
    cell: ({ getValue }) => <CustomComponent value={getValue()} />
  }
];

<PlanTable data={tasks} columns={customColumns} />
```

### 4. Drawer for Task Details

```tsx
import { StageDrawer } from '@/src/components/shell/StageDrawer';

function MyComponent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const handleRowClick = (task) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };
  
  return (
    <>
      <PlanTable onRowClick={handleRowClick} />
      
      <StageDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedTask?.title}
      >
        {/* Task details here */}
        <div>{selectedTask?.description}</div>
      </StageDrawer>
    </>
  );
}
```

### 5. Filtering Data Client-Side

```tsx
import { usePlanStore } from '@/src/state/plan.store';

function FilteredData() {
  const { filters } = usePlanStore();
  const [tasks, setTasks] = useState([]);
  
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.search && !task.title.includes(filters.search)) {
        return false;
      }
      if (filters.department && task.department !== filters.department) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);
  
  return <PlanTable data={filteredTasks} />;
}
```

## Theming

### Custom Colors

```tsx
// In your tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'plan-primary': '#1e40af',  // Custom primary color
        'plan-secondary': '#64748b', // Custom secondary color
      }
    }
  }
}
```

### Custom Table Styles

```css
/* In your globals.css */
.annual-plan-table-wrapper tbody tr:hover {
  background: #f8fafc; /* Custom hover color */
}

.status-badge {
  border-radius: 0.5rem; /* Custom badge rounding */
}
```

## Performance Tips

### 1. Virtual Scrolling for Large Datasets

```tsx
import { useVirtualSwitch } from '@/src/hooks/useVirtualSwitch';

function LargeTable({ data }) {
  const { mode } = useVirtualSwitch(data.length, 100);
  
  // Use mode to determine rendering strategy
  if (mode === 'virtual') {
    return <VirtualizedTable data={data} />;
  }
  return <PlanTable data={data} />;
}
```

### 2. Memoization

```tsx
const memoizedColumns = useMemo(() => getColumns(locale), [locale]);
const memoizedData = useMemo(() => filterData(tasks), [tasks]);

<PlanTable data={memoizedData} columns={memoizedColumns} />
```

### 3. Pagination

```tsx
const { pageIndex, pageSize, setPageIndex } = usePlanStore();

const paginatedData = useMemo(() => {
  const start = pageIndex * pageSize;
  return tasks.slice(start, start + pageSize);
}, [tasks, pageIndex, pageSize]);
```

## Accessibility

All components are accessible by default, but you can enhance them:

```tsx
// Add descriptive labels
<PlanTable
  aria-label="Annual audit plan tasks"
  data={tasks}
/>

// Keyboard shortcuts
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'n' && e.ctrlKey) {
      openNewTaskDialog();
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

## Troubleshooting

### Issue: Sidebar not collapsing
**Solution**: Make sure you're using the store's toggle function:
```tsx
const { toggleSidebar } = usePlanStore();
<button onClick={toggleSidebar}>Toggle</button>
```

### Issue: Filters not working
**Solution**: The table uses store filters. Make sure to use the store:
```tsx
const { filters, setFilter } = usePlanStore();
```

### Issue: RTL layout issues
**Solution**: Set the dir prop on PlanShell:
```tsx
<PlanShell dir="rtl" locale="ar">
```

### Issue: Table not updating
**Solution**: Ensure data is a new array reference:
```tsx
setTasks([...newTasks]); // Creates new reference
```

## Testing

### Unit Test Example

```tsx
import { render, screen } from '@testing-library/react';
import { PlanTable } from '@/src/components/table/PlanTable';

test('renders table with data', () => {
  const mockData = [
    { id: '1', code: 'T001', title: 'Task 1', /* ... */ }
  ];
  
  render(<PlanTable data={mockData} />);
  
  expect(screen.getByText('T001')).toBeInTheDocument();
  expect(screen.getByText('Task 1')).toBeInTheDocument();
});
```

### Integration Test Example

```tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { usePlanStore } from '@/src/state/plan.store';

test('store manages filters correctly', () => {
  const { result } = renderHook(() => usePlanStore());
  
  act(() => {
    result.current.setFilter('search', 'test');
  });
  
  expect(result.current.filters.search).toBe('test');
});
```

## Further Reading

- [TanStack Table Documentation](https://tanstack.com/table/latest)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
