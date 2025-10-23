# Visual Test Guide - Annual Plan Layout

## 🎨 Visual States to Verify

### Desktop View (≥1024px)

#### State 1: Sidebar Expanded (Default)
```
┌─────────────────────────────────────────────────────────────────┐
│                         Header                                  │
├─────────────────┬───────────────────────────────────────────────┤
│  Process Steps  │  Main Content Area                            │
│  ┌───────────┐  │  ┌──────────────────────────────────────────┐ │
│  │ 1 Annual  │◄─┼──│ Active: Shows KPIs + Filters + Table     │ │
│  │   Plan    │  │  └──────────────────────────────────────────┘ │
│  ├───────────┤  │                                              │
│  │ 2 Planning│  │  Table scrolls here ▼                        │
│  ├───────────┤  │  ┌──────────────────────────────────────────┐ │
│  │ 3 Process │  │  │ Code │ Title        │ Dept │ Risk │...  │ │
│  │   & Risk  │  │  ├──────┼──────────────┼──────┼──────┼───  │ │
│  ├───────────┤  │  │ A001 │ Audit task 1 │ HR   │ High │...  │ │
│  │ ...       │  │  │ A002 │ Very long... │ IT   │ Med  │...  │ │
│  └───────────┘  │  └──────────────────────────────────────────┘ │
│                 │  ▲ Scrollable area (max-height: vh - 420px)  │
│  [280px wide]   │  [Flexible 1fr]                               │
└─────────────────┴───────────────────────────────────────────────┘
```

**Check:**
- [ ] Sidebar is 280px wide
- [ ] Table doesn't push sidebar
- [ ] Clicking stage 2 changes content (doesn't move table)
- [ ] Collapse button visible (top-right of sidebar)

---

#### State 2: Sidebar Collapsed (Icon Rail)
```
┌─────────────────────────────────────────────────────────────────┐
│                         Header                                  │
├───┬─────────────────────────────────────────────────────────────┤
│ ↔ │  Main Content Area (Wider now)                             │
│   │  ┌────────────────────────────────────────────────────────┐ │
│ 1 │  │ KPIs + Filters + Table                                 │ │
│ ● │  └────────────────────────────────────────────────────────┘ │
│   │                                                             │
│ 2 │  Table area (same scroll behavior)                         │
│   │  ┌────────────────────────────────────────────────────────┐ │
│ 3 │  │ Code │ Title              │ Dept     │ Risk │...       │ │
│   │  ├──────┼────────────────────┼──────────┼──────┼───       │ │
│ 4 │  │ A001 │ Audit task 1       │ HR       │ High │...       │ │
│   │  │ A002 │ Long Arabic text.. │ IT       │ Med  │...       │ │
│...│  └────────────────────────────────────────────────────────┘ │
│   │                                                             │
│[72px]  [Table has more horizontal space]                       │
└───┴─────────────────────────────────────────────────────────────┘
```

**Check:**
- [ ] Sidebar is 72px wide (icon rail)
- [ ] Numbers with circular backgrounds visible
- [ ] Active stage highlighted
- [ ] Hover shows tooltip with stage name
- [ ] Expand button visible (arrow icon)
- [ ] Main content area expanded (more table space)
- [ ] **Smooth transition** (200ms ease)

---

### Mobile View (<1024px)

```
┌─────────────────────────────────────────┐
│              Header                     │
├─────────────────────────────────────────┤
│  Main Content (Full Width)              │
│  ┌───────────────────────────────────┐  │
│  │ KPIs (Stacked 2x2 or vertical)    │  │
│  ├───────────────────────────────────┤  │
│  │ Filters (Vertical)                │  │
│  ├───────────────────────────────────┤  │
│  │ ┌───────────────────────────────┐ │  │
│  │ │ Table (Scrolls)               │ │  │
│  │ │ Code │ Title    │ Risk │ ... │ │  │
│  │ │──────┼──────────┼──────┼──── │ │  │
│  │ │ A001 │ Task 1   │ High │ ... │ │  │
│  │ │ A002 │ Arabic...│ Med  │ ... │ │  │
│  │ └───────────────────────────────┘ │  │
│  │ ▲ Scrolls (max-height: vh-320px)  │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ ┌─┐ →         │
│ │1│ │2│ │3│ │4│ │5│ │6│ │7│ ...        │
│ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘ └─┘            │
│ Bottom Bar (Fixed, Horizontal Scroll)  │
└─────────────────────────────────────────┘
```

**Check:**
- [ ] Sidebar completely hidden
- [ ] Bottom bar visible and fixed
- [ ] Bottom bar scrolls horizontally
- [ ] Active stage highlighted in blue
- [ ] Stage chips show number + label
- [ ] Tapping stage changes content
- [ ] Table adjusts height for bottom bar
- [ ] No horizontal page scroll

---

## 🧪 Test Scenarios

### Scenario 1: Sidebar Toggle
1. Load page (desktop)
2. Sidebar should be **expanded** (280px)
3. Click collapse button (→)
4. Sidebar smoothly transitions to **72px** icon rail
5. Main content area expands
6. Table doesn't jump or shift
7. Click expand button (←)
8. Sidebar returns to 280px
9. Transition is smooth (200ms)

**Expected**: No layout shift, no horizontal scroll, smooth animation

---

### Scenario 2: Table Scroll Behavior
1. Load a plan with 20+ tasks
2. Scroll down in table area
3. Table header should stay **sticky** at top
4. Only table content scrolls (not entire page)
5. Zebra rows visible during scroll
6. Hover effect works on rows
7. Scrollbar appears only in table area

**Expected**: Internal scroll, sticky header, no page scroll

---

### Scenario 3: Stage Navigation (Desktop)
1. Expanded sidebar: Click "Stage 2 - Planning"
2. Content area changes to show planning content
3. Table **doesn't move or resize**
4. Active stage highlighted in sidebar
5. Collapsed sidebar: Click icon "3"
6. Content changes
7. Icon "3" highlighted
8. Main area remains stable

**Expected**: Content changes, layout stable, no shifts

---

### Scenario 4: Mobile Bottom Bar
1. Resize to mobile (<1024px)
2. Sidebar disappears
3. Bottom bar appears fixed at bottom
4. Scroll stages horizontally
5. Tap "Stage 5"
6. Content changes
7. Stage 5 chip highlighted in blue
8. Table area visible above bottom bar

**Expected**: Bottom bar fixed, horizontal scroll, active highlight

---

### Scenario 5: Arabic Text Wrapping
1. View table with long Arabic task titles
2. Text should wrap naturally (not ellipsize)
3. Line height: 1.6 for readability
4. Words break at syllables (hyphens if needed)
5. No horizontal overflow in title column

**Expected**: Natural wrapping, readable multi-line Arabic

---

### Scenario 6: Token Columns (Code/IDs)
1. View table with long codes (e.g., "AUDIT-2024-Q1-FINANCE-001")
2. Code column should show ellipsis (...)
3. Max width: 160px
4. Tooltip shows full code on hover
5. Quarter column: no wrap, shows full text (e.g., "Q1-2024")

**Expected**: Ellipsis for overflow, tooltips, no wrapping

---

### Scenario 7: Keyboard Navigation
1. Tab to sidebar
2. Arrow Down: moves to next stage
3. Arrow Up: moves to previous stage
4. Enter/Space: activates stage
5. Focus visible (blue ring)
6. Tab to table: navigates table cells
7. Escape: (optional) collapses sidebar

**Expected**: Full keyboard control, visible focus

---

### Scenario 8: RTL Support
1. Switch locale to Arabic (dir="rtl")
2. Sidebar on right (logical inline-end)
3. Collapse button mirrors correctly
4. Table aligns right
5. Bottom bar scrolls naturally
6. Active highlights correct side

**Expected**: Everything mirrors, no visual bugs

---

## 📐 Measurement Checklist

### Desktop Expanded
- Sidebar width: **280px** ✓
- Grid gap: **16px** (1rem) ✓
- Main content: **calc(100% - 296px)** (280 + 16) ✓
- Table max-height: **calc(100vh - 420px)** ✓

### Desktop Collapsed
- Sidebar width: **72px** ✓
- Grid gap: **16px** ✓
- Main content: **calc(100% - 88px)** (72 + 16) ✓
- Transition duration: **200ms** ✓

### Mobile
- Sidebar: **display: none** ✓
- Bottom bar height: ~**48px** (with padding) ✓
- Table max-height: **calc(100vh - 320px)** ✓
- Stage chips: **flex-shrink: 0** (prevent squish) ✓

---

## 🎯 Acceptance Test Script

### Test 1: Visual Stability
```
GIVEN I am on the Annual Plan page (desktop)
WHEN I collapse the sidebar
THEN the table should not move horizontally
AND the table should not change its scroll position
AND the transition should be smooth
```

### Test 2: Mobile Layout
```
GIVEN I am on a mobile device (<1024px)
WHEN I view the Annual Plan page
THEN the sidebar should be hidden
AND a bottom bar with stages should be visible
AND the bottom bar should scroll horizontally
AND the active stage should be highlighted
```

### Test 3: Table Scrolling
```
GIVEN the table has more rows than fit in viewport
WHEN I scroll down in the table area
THEN only the table content should scroll
AND the header should remain sticky
AND the page should not scroll
```

### Test 4: Text Handling
```
GIVEN a task with a long Arabic title
WHEN I view the table
THEN the title should wrap to multiple lines
AND should be readable with proper line-height

GIVEN a task with a long code
WHEN I view the table
THEN the code should show ellipsis (...)
AND the full code should appear in a tooltip on hover
```

---

## 🐛 Common Issues to Check

### Issue 1: Table Pushes Sidebar
**Symptom**: Sidebar width changes when table content loads  
**Fix**: Ensure `grid-template-columns: auto minmax(0, 1fr)` is applied  
**Test**: Load large dataset, sidebar should stay 280px

### Issue 2: Horizontal Page Scroll
**Symptom**: Entire page scrolls horizontally on mobile  
**Fix**: Ensure `overflow-x: hidden` on body and container  
**Test**: Resize to mobile, try to scroll page left/right

### Issue 3: Table Header Not Sticky
**Symptom**: Header scrolls with content  
**Fix**: Ensure `position: sticky; top: 0; z-index: 10;` on thead  
**Test**: Scroll table, header should stay visible

### Issue 4: Bottom Bar Not Fixed
**Symptom**: Bottom bar scrolls with page on mobile  
**Fix**: Ensure `position: fixed; bottom: 0;` on bottom bar  
**Test**: Scroll page on mobile, bottom bar should stay at bottom

### Issue 5: Transition Jerky
**Symptom**: Sidebar collapse/expand is not smooth  
**Fix**: Ensure `transition: inline-size 0.2s ease;` is applied  
**Test**: Toggle sidebar multiple times rapidly

---

## 📸 Visual Checkpoints

### Checkpoint 1: Desktop Expanded
![Expected: 280px sidebar with full stage labels]

### Checkpoint 2: Desktop Collapsed
![Expected: 72px icon rail with numbered circles]

### Checkpoint 3: Mobile Bottom Bar
![Expected: Fixed bar with horizontal chip scroll]

### Checkpoint 4: Table Scroll
![Expected: Sticky header, scrollable body]

### Checkpoint 5: Arabic Wrapping
![Expected: Multi-line readable text in title column]

---

## ✅ Final Verification

Run through this checklist before marking as complete:

- [ ] Desktop sidebar expands/collapses smoothly
- [ ] Table never causes horizontal layout shift
- [ ] Mobile bottom bar fixed and scrollable
- [ ] Table scrolls internally with sticky header
- [ ] Arabic text wraps naturally (Title, Department)
- [ ] Token columns ellipsize (Code, Quarter)
- [ ] Keyboard navigation works
- [ ] RTL layout correct
- [ ] No console errors
- [ ] Performance smooth (no jank)
- [ ] Responsive breakpoints work (1024px transition)
- [ ] All ARIA labels present
- [ ] Focus indicators visible

---

**Test Date**: ___________  
**Tester**: ___________  
**Result**: PASS / FAIL  
**Notes**: _________________________________
