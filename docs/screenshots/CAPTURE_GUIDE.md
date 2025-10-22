# Screenshot Capture Guide - دليل التقاط الصور

## Quick Start Guide

### Prerequisites
1. Development server running: `npm run dev`
2. Browser at 1440px width (for desktop screenshots)
3. Database with test data (or use wizard to create plan)
4. Both light and dark themes tested

---

## Screenshots to Capture

### 1. Before Changes (for comparison)
**File**: `00-before-implementation.png`

**Steps**:
```bash
# Checkout previous commit
git checkout HEAD~3

# Start dev server
npm run dev

# Navigate to Annual Plan page
# Take screenshot at 1440px width
```

---

### 2. Empty State (Default)
**File**: `01-empty-state-light.png`, `01-empty-state-dark.png`

**Steps**:
1. Ensure no plans exist in database
2. Navigate to Annual Plan page
3. Verify shows:
   - ProcessStepper on left
   - Empty state card in center
   - "Create New Plan" button
4. Take screenshot

**Expected View**:
```
┌──────────────────────────────────────────┐
│ 📋 الخطة السنوية للتدقيق الداخلي       │
│ [+ إنشاء خطة جديدة]                    │
└──────────────────────────────────────────┘
┌─────────┐  ┌────────────────────────────┐
│ مراحل   │  │                            │
│ العملية│  │    📋 لم يتم إنشاء خطة    │
│         │  │                            │
│ 1. خطة │  │    ابدأ بإنشاء خطة جديدة  │
│ 2. تخطيط│  │                            │
│ ...     │  │    [+ إنشاء خطة جديدة]    │
│         │  │                            │
└─────────┘  └────────────────────────────┘
```

---

### 3. Plan Created and Loaded
**File**: `02-plan-loaded-light.png`, `02-plan-loaded-dark.png`

**Steps**:
1. Click "Create New Plan"
2. Fill wizard with test data:
   - Plan Ref: "AP-2025-001"
   - Fiscal Year: 2025
   - Add 5-7 tasks with varying content
3. Submit wizard
4. Verify plan loads automatically
5. Verify first step shows checkmark (✓✓)
6. Scroll to show entire table
7. Take screenshot

**Expected View**:
```
┌──────────────────────────────────────────┐
│ 📋 الخطة السنوية 2025                  │
│ [+ إنشاء خطة جديدة]                    │
└──────────────────────────────────────────┘
┌─────────┐  ┌────────────────────────────┐
│ مراحل   │  │ [KPI Cards: 4 boxes]       │
│ العملية│  │ حالة | مهام | ساعات | %   │
│         │  └────────────────────────────┘
│ ✓ خطة  │  ┌────────────────────────────┐
│ 2. تخطيط│  │ بحث: [ ] إدارة: [ ] ...  │
│ ...     │  └────────────────────────────┘
│         │  ┌────────────────────────────┐
│         │  │ الجدول الكامل (9 أعمدة)  │
│         │  │ IA-01 | مراجعة... | [✏️🗑️]│
│         │  │ IA-02 | تدقيق... | [✏️🗑️] │
└─────────┘  └────────────────────────────┘
```

**Verify**:
- ✅ Table has no horizontal scroll
- ✅ Arabic text wraps properly
- ✅ All 9 columns visible
- ✅ Edit and Delete buttons present
- ✅ First step shows checkmark

---

### 4. Stage Navigation (Content Switching)
**File**: `03-stage-navigation-light.png`

**Steps**:
1. With plan already loaded
2. Click on Stage 3 "فهم العملية والمخاطر"
3. Verify:
   - Page scrolls to top smoothly
   - Table disappears
   - Shows "Under Development" placeholder
   - Step 3 is now active
4. Take screenshot

**Expected View**:
```
┌──────────────────────────────────────────┐
│ 📋 الخطة السنوية للتدقيق الداخلي       │
└──────────────────────────────────────────┘
┌─────────┐  ┌────────────────────────────┐
│ مراحل   │  │                            │
│ العملية│  │       🚧 قيد التطوير       │
│         │  │                            │
│ ✓ خطة  │  │   محتوى فهم العملية       │
│ 2. تخطيط│  │   والمخاطر سيكون متاحًا   │
│ ● العملية│  │   قريبًا                  │
│ ...     │  │                            │
└─────────┘  └────────────────────────────┘
```

---

### 5. Delete Confirmation
**File**: `04-delete-task-light.png`

**Steps**:
1. On plan view with table
2. Click delete button (🗑️) on a task
3. Capture screenshot showing confirmation dialog
4. Click "OK" to confirm
5. Verify task is removed and table updates

---

### 6. Mobile View
**File**: `05-mobile-responsive.png`

**Steps**:
1. Resize browser to 375px width
2. Navigate to plan view
3. Verify:
   - ProcessStepper collapses to accordion
   - KPI cards stack vertically
   - Filters stack vertically
   - Table adapts (may need horizontal scroll on mobile - acceptable)
4. Take screenshot

---

### 7. Dark Theme
**File**: `*-dark.png` versions

Repeat screenshots 1-5 in dark mode.

---

## Using Playwright (Optional)

Create a test file: `tests/annual-plan-screenshots.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Annual Plan Screenshots', () => {
  test('01 - Empty State', async ({ page }) => {
    await page.goto('http://localhost:3001/rbia/plan');
    await page.setViewportSize({ width: 1440, height: 900 });
    
    // Wait for page to load
    await page.waitForSelector('text=إنشاء خطة جديدة');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'docs/screenshots/annual-plan/01-empty-state.png',
      fullPage: true 
    });
  });

  test('02 - Plan Loaded', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3001/auth/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Create plan via API or wizard
    // ...
    
    await page.goto('http://localhost:3001/rbia/plan');
    await page.waitForSelector('table');
    
    await page.screenshot({ 
      path: 'docs/screenshots/annual-plan/02-plan-loaded.png',
      fullPage: true 
    });
  });

  // Add more tests...
});
```

Run with:
```bash
npx playwright test tests/annual-plan-screenshots.spec.ts
```

---

## Checklist

Before submitting screenshots:

- [ ] All screenshots at 1440px width (desktop)
- [ ] Mobile screenshot at 375px width
- [ ] Both light and dark themes captured
- [ ] Clear, high-resolution images
- [ ] No sensitive data visible
- [ ] File names match convention
- [ ] Before/after comparison included

---

## File Naming Convention

```
docs/screenshots/annual-plan/
├── 00-before-implementation.png
├── 01-empty-state-light.png
├── 01-empty-state-dark.png
├── 02-plan-loaded-light.png
├── 02-plan-loaded-dark.png
├── 03-stage-navigation-light.png
├── 03-stage-navigation-dark.png
├── 04-delete-task-light.png
├── 05-mobile-responsive.png
└── README.md
```

---

## Tips

1. **Clean Data**: Use clean test data with realistic Arabic content
2. **Zoom Level**: Ensure browser zoom is at 100%
3. **Developer Tools**: Close DevTools before screenshot
4. **Extensions**: Disable browser extensions that modify UI
5. **Network**: Ensure all resources loaded (check Network tab)
6. **Timing**: Wait for animations to complete
7. **Cursor**: Move cursor out of frame

---

## Manual Capture Steps

### macOS
1. `Cmd + Shift + 5` for screenshot tool
2. Select "Capture Entire Screen" or "Capture Selected Window"
3. Click browser window
4. Save to `docs/screenshots/annual-plan/`

### Windows
1. `Windows + Shift + S` for Snip & Sketch
2. Select "Window Snip" or "Fullscreen Snip"
3. Click browser window
4. Save to `docs\screenshots\annual-plan\`

### Linux
1. Use `gnome-screenshot` or `scrot`
2. Command: `gnome-screenshot -w` (window only)
3. Save to `docs/screenshots/annual-plan/`

---

## After Capturing

1. Review all screenshots for quality
2. Ensure no sensitive data visible
3. Compress images if over 1MB (use ImageOptim, TinyPNG)
4. Commit to repository:
   ```bash
   git add docs/screenshots/annual-plan/*.png
   git commit -m "docs: Add annual plan UI screenshots"
   git push
   ```

---

**Note**: Screenshots are essential for documentation and review. Take time to capture high-quality images that clearly demonstrate the implemented features.
