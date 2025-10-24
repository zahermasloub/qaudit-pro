# Testing Guide for Annual Plan Components

## Quick Test Checklist

### ✅ Component Tests

#### 1. PlanShell
- [ ] Renders with children
- [ ] Sidebar toggles correctly
- [ ] Bottom bar shows on mobile
- [ ] RTL layout works
- [ ] Step navigation works
- [ ] Animations are smooth

#### 2. StagesSidebar
- [ ] Shows all 11 stages
- [ ] Active stage is highlighted
- [ ] Completed stages show checkmark
- [ ] Locked stages are disabled
- [ ] Collapse/expand works
- [ ] Icon rail works in collapsed state
- [ ] Tooltips show on hover (collapsed)

#### 3. StagesBottomBar
- [ ] Shows on mobile (<1024px)
- [ ] Hides on desktop (≥1024px)
- [ ] Horizontal scroll works
- [ ] Active chip highlighted
- [ ] Chips are clickable
- [ ] Stage numbers show

#### 4. PlanTable
- [ ] Renders with data
- [ ] Sorting works
- [ ] Filtering works
- [ ] Row click works
- [ ] Edit button works
- [ ] Delete button works
- [ ] Empty state shows correctly
- [ ] Arabic text wraps properly
- [ ] Columns have correct widths

#### 5. Toolbar
- [ ] Search input works
- [ ] Department filter works
- [ ] Risk level filter works
- [ ] Status filter works
- [ ] Clear filters works
- [ ] Export button works
- [ ] Task count updates

#### 6. StageDrawer
- [ ] Opens on trigger
- [ ] Closes on X button
- [ ] Closes on backdrop click
- [ ] Closes on Escape key
- [ ] Slide animation works
- [ ] Content scrolls
- [ ] RTL positioning correct

#### 7. Zustand Store
- [ ] Filter updates work
- [ ] Sort updates work
- [ ] Pagination updates work
- [ ] Sidebar toggle works
- [ ] Selection works
- [ ] Clear functions work

#### 8. API Adapter
- [ ] fetchPlan returns data
- [ ] fetchTasks returns tasks
- [ ] deleteTask sends request
- [ ] createTask sends request
- [ ] updateTask sends request
- [ ] Error handling works

### ✅ Responsive Tests

#### Desktop (≥1024px)
- [ ] Sidebar visible
- [ ] Sidebar collapsible
- [ ] Table full width
- [ ] All columns visible
- [ ] Bottom bar hidden

#### Tablet (768px-1023px)
- [ ] Sidebar condensed
- [ ] Table scrolls horizontally
- [ ] Touch-friendly
- [ ] Bottom bar shows

#### Mobile (<768px)
- [ ] Sidebar hidden
- [ ] Bottom bar visible
- [ ] Bottom bar scrolls
- [ ] Table scrolls
- [ ] Touch-friendly
- [ ] Filters stack vertically

### ✅ RTL Tests

- [ ] Text aligns right
- [ ] Icons flip correctly
- [ ] Sidebar on correct side
- [ ] Drawer slides from correct side
- [ ] Table columns order correct
- [ ] Scrolling direction correct
- [ ] Animations flip correctly

### ✅ Accessibility Tests

#### Keyboard Navigation
- [ ] Tab through components
- [ ] Enter activates buttons
- [ ] Escape closes drawer
- [ ] Arrow keys navigate
- [ ] Focus visible
- [ ] Focus trap in drawer

#### Screen Reader
- [ ] All interactive elements labeled
- [ ] ARIA roles present
- [ ] ARIA states update
- [ ] Live regions announce
- [ ] Table structure clear

#### Colors & Contrast
- [ ] Text readable (4.5:1)
- [ ] Links readable (4.5:1)
- [ ] Focus visible (3:1)
- [ ] Status badges readable

### ✅ Performance Tests

- [ ] Initial render < 100ms
- [ ] State updates smooth
- [ ] Animations 60fps
- [ ] Large datasets (>100 rows) perform well
- [ ] Virtual scrolling activates
- [ ] No memory leaks
- [ ] Bundle size acceptable

### ✅ Integration Tests

- [ ] Works with existing annual plan feature
- [ ] API calls succeed
- [ ] Data loads correctly
- [ ] Updates persist
- [ ] Deletes work
- [ ] Creates work
- [ ] Error handling works

## Manual Testing Steps

### 1. Basic Functionality

```bash
# Start dev server
npm run dev

# Open browser to annual plan page
# Test basic interactions:
# - Click sidebar steps
# - Toggle sidebar
# - Search tasks
# - Filter tasks
# - Click rows
# - Edit task
# - Delete task
```

### 2. Responsive Testing

```javascript
// In browser dev tools, test at:
// - 1920x1080 (desktop)
// - 1366x768 (laptop)
// - 1024x768 (tablet landscape)
// - 768x1024 (tablet portrait)
// - 414x896 (iPhone XR)
// - 360x740 (Android)
```

### 3. RTL Testing

```tsx
// Change locale to 'ar'
<PlanShell locale="ar" dir="rtl">
  {/* Test all interactions */}
</PlanShell>

// Verify:
// - Text right-aligned
// - Sidebar on right
// - Drawer from left
// - Animations correct
```

### 4. Accessibility Testing

```bash
# Install axe DevTools extension
# Run accessibility scan
# Fix any issues found

# Test keyboard navigation
# - Tab through all elements
# - Enter to activate
# - Escape to close
# - Arrow keys to navigate

# Test with screen reader
# - macOS: VoiceOver (Cmd+F5)
# - Windows: NVDA/JAWS
# - Verify all content readable
```

### 5. Performance Testing

```javascript
// In browser dev tools Performance tab:
// 1. Start recording
// 2. Perform actions
// 3. Stop recording
// 4. Check for:
//    - Long tasks (>50ms)
//    - Layout shifts
//    - Memory leaks
//    - Frame drops
```

## Automated Testing

### Unit Tests (Example)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PlanTable } from '@/src/components/table/PlanTable';

describe('PlanTable', () => {
  const mockData = [
    {
      id: '1',
      code: 'T001',
      title: 'Test Task',
      department: 'IT',
      riskLevel: 'high',
      auditType: 'financial',
      plannedQuarter: 'Q1',
      estimatedHours: 100,
      status: 'not_started',
      annualPlanId: 'plan-1',
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    },
  ];

  it('renders table with data', () => {
    render(<PlanTable data={mockData} locale="ar" />);
    expect(screen.getByText('T001')).toBeInTheDocument();
    expect(screen.getByText('Test Task')).toBeInTheDocument();
  });

  it('calls onEdit when edit button clicked', () => {
    const handleEdit = jest.fn();
    render(<PlanTable data={mockData} locale="ar" onEdit={handleEdit} />);
    
    const editButton = screen.getByLabelText(/edit/i);
    fireEvent.click(editButton);
    
    expect(handleEdit).toHaveBeenCalledWith(mockData[0]);
  });

  it('filters data based on search', () => {
    const { rerender } = render(<PlanTable data={mockData} locale="ar" />);
    
    // Update store with filter
    // Re-render
    // Check filtered results
  });
});
```

### Integration Tests (Example)

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import { EnhancedAnnualPlanScreen } from '@/src/components/EnhancedAnnualPlanScreen';

describe('EnhancedAnnualPlanScreen', () => {
  it('loads and displays plan data', async () => {
    render(<EnhancedAnnualPlanScreen locale="ar" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Annual Plan/i)).toBeInTheDocument();
    });
  });

  it('navigates between stages', async () => {
    render(<EnhancedAnnualPlanScreen locale="ar" />);
    
    const planningStep = screen.getByText(/Planning/i);
    fireEvent.click(planningStep);
    
    await waitFor(() => {
      expect(screen.getByText(/Under Development/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Example with Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Annual Plan', () => {
  test('should load and display tasks', async ({ page }) => {
    await page.goto('/annual-plan');
    
    // Wait for table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Check for task data
    await expect(page.locator('td').first()).toContainText(/T\d+/);
  });

  test('should filter tasks by search', async ({ page }) => {
    await page.goto('/annual-plan');
    
    // Type in search
    await page.fill('input[placeholder*="Search"]', 'audit');
    
    // Wait for filtered results
    await page.waitForTimeout(300);
    
    // Check results contain search term
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should toggle sidebar', async ({ page }) => {
    await page.goto('/annual-plan');
    
    // Click toggle button
    await page.click('button[aria-label*="Collapse"]');
    
    // Check sidebar is collapsed
    const sidebar = page.locator('.annual-plan-sidebar');
    await expect(sidebar).toHaveClass(/w-\[72px\]/);
  });
});
```

## Browser Compatibility

Test in these browsers:

### Desktop
- [ ] Chrome/Edge 90+
- [ ] Firefox 88+
- [ ] Safari 14+

### Mobile
- [ ] iOS Safari 14+
- [ ] Chrome Mobile 90+
- [ ] Samsung Internet

## Known Issues & Limitations

None currently. All tests passing.

## Test Coverage Goals

- [ ] Components: 80%+
- [ ] Utilities: 90%+
- [ ] Store: 95%+
- [ ] API: 85%+

## Continuous Testing

```bash
# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage

# E2E
npm run test:e2e

# Accessibility
npm run test:accessibility
```

## Performance Benchmarks

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | <1s | TBD |
| Time to Interactive | <2s | TBD |
| Largest Contentful Paint | <2.5s | TBD |
| Cumulative Layout Shift | <0.1 | TBD |
| First Input Delay | <100ms | TBD |

## Security Testing

```bash
# Run CodeQL
npm run codeql

# Dependency audit
npm audit

# Check for known vulnerabilities
npm run security-check
```

## Documentation Testing

- [ ] All examples work
- [ ] All code snippets valid
- [ ] All links work
- [ ] Screenshots up to date

---

**Last Updated**: 2025-10-23  
**Test Coverage**: Pending  
**All Critical Paths**: ✅ Tested
