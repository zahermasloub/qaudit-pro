# Annual Plan Screenshots Guide

## Required Screenshots for PR

This directory should contain before/after screenshots demonstrating the grid layout fix.

### Required Screenshots:

#### 1. Empty State
**Filename:** `01-empty-state.png`
**Description:** 
- Page before selecting any step
- Should show "No Plan Created Yet" message
- ProcessStepper visible on left at 320px width
- RBIA info panel visible on right at 320px width

#### 2. Annual Plan Table Loaded (After Fix)
**Filename:** `02-annual-plan-table-loaded.png`
**Description:**
- Page after creating/loading an annual plan with multiple tasks
- Table should display full width without horizontal scroll
- ProcessStepper should maintain 320px width (NOT shrunk)
- All columns visible and properly sized
- Text should wrap properly in Arabic
- Verify at 1440px viewport width

#### 3. Wide Screen Test (1920px)
**Filename:** `03-wide-screen-1920px.png`
**Description:**
- Same view as #2 but at 1920px viewport
- Verify layout remains stable
- Sidebars maintain 320px width
- Container respects max-width

#### 4. Narrow Screen Test (1280px)
**Filename:** `04-narrow-screen-1280px.png`
**Description:**
- Same view as #2 but at 1280px viewport
- Critical test for sidebar shrinking issue
- ProcessStepper MUST stay at 320px
- Table should fit without horizontal scroll

#### 5. Different Step Selected
**Filename:** `05-different-step-prioritization.png`
**Description:**
- After clicking on "Planning" or "Prioritization" step
- Should show placeholder content ("Under Development")
- Verify step highlighting in ProcessStepper
- Verify KPI cards remain visible

#### 6. Annual Plan Completed Status
**Filename:** `06-annual-plan-completed-checkmarks.png`
**Description:**
- Close-up of ProcessStepper showing first step with ✓✓ (completed status)
- Should appear after plan is created with tasks
- Verify green checkmark styling

#### 7. RTL Layout (Arabic)
**Filename:** `07-rtl-arabic-layout.png`
**Description:**
- Full page view in RTL mode
- Verify ProcessStepper on RIGHT side
- Verify RBIA info on LEFT side  
- Verify table text alignment is proper for Arabic
- Critical: ProcessStepper should NOT shift left

#### 8. Table Dense Mode
**Filename:** `08-table-compact-density.png`
**Description:**
- Table with "Compact" density selected
- Verify all columns still visible
- Verify no layout shifts

## How to Capture Screenshots

### Setup
1. Start the development server: `npm run dev`
2. Navigate to: `http://localhost:3001/rbia/plan`
3. Create a test annual plan with at least 10 tasks

### Browser Settings
- Use Chrome or Firefox DevTools
- Set viewport size as specified
- Enable Arabic language in browser if testing RTL

### Viewport Sizes
- 1280px: Narrow desktop
- 1440px: Standard desktop  
- 1920px: Wide desktop

### Screenshot Tools
- **Chrome DevTools**: Cmd/Ctrl + Shift + P → "Capture screenshot"
- **Firefox DevTools**: Right-click → "Take a Screenshot"
- **Third-party**: Lightshot, ShareX, or similar

## Before/After Comparison

### Before (Issue):
- ProcessStepper shrinks when table loads
- Sidebar shifts left in RTL
- Text gets cut off
- Horizontal scroll may appear

### After (Fixed):
- ProcessStepper maintains 320px width
- Sidebars stay fixed in position
- All text visible and wrapped properly
- No horizontal scroll

## Naming Convention
- Use descriptive names with numbers for ordering
- Use lowercase with hyphens
- Include viewport size when relevant
- PNG format preferred for UI screenshots
