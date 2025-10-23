# Annual Plan Layout - Visual Test Checklist

## 📋 Pre-Flight Checks

Before testing, ensure:
- [ ] Browser cache cleared
- [ ] Development server running (`npm run dev`)
- [ ] Logged in to the application
- [ ] Navigate to `/annual-plan` route

---

## 🖥️ Desktop Tests (≥1024px)

### Test 1: Sidebar Toggle
1. **Initial state**: Sidebar should be expanded (280px wide)
2. **Click collapse button** (top-right of sidebar)
   - [ ] Sidebar smoothly animates to 72px wide
   - [ ] Only icons + numbers visible
   - [ ] Table content doesn't shift or jump
3. **Click expand button** (on collapsed sidebar)
   - [ ] Sidebar smoothly animates to 280px wide
   - [ ] Full stage names appear
   - [ ] No clipping or cut-off text

**Expected behavior**:
- ✅ Smooth 250ms transition
- ✅ No layout shift in main content
- ✅ Sidebar stays in view (not clipped)

---

### Test 2: Sidebar Visibility
1. **Expand sidebar to 280px**
2. **Scroll table horizontally** (if needed)
3. **Verify**:
   - [ ] Sidebar stays fully visible
   - [ ] Sidebar doesn't move with scroll
   - [ ] No overlap with table content

**Expected behavior**:
- ✅ Sidebar has `z-index: 50` (above table)
- ✅ Sidebar is sticky (`position: sticky`)
- ✅ No clipping from parent overflow

---

### Test 3: Table Scrolling
1. **Ensure table has many rows** (create test data if needed)
2. **Scroll table vertically**:
   - [ ] Only table content scrolls
   - [ ] Header row stays sticky at top
   - [ ] Page body doesn't scroll
3. **Scroll table horizontally** (if columns wide):
   - [ ] Only table scrolls
   - [ ] Sidebar doesn't move
   - [ ] No horizontal page scroll

**Expected behavior**:
- ✅ Table scrolls inside `.annual-plan-table-wrapper`
- ✅ Scrollbar appears only on table wrapper
- ✅ Page stays fixed

---

### Test 4: Text Handling
**Arabic Text Wrapping**:
1. Find a task with long Arabic title (e.g., "تدقيق النظام المالي والإداري للشركة بما يتوافق مع المعايير الدولية")
2. **Verify**:
   - [ ] Text wraps to multiple lines
   - [ ] No horizontal overflow
   - [ ] Readable line breaks (not mid-word)
   - [ ] Proper line height (not cramped)

**Token Ellipsis**:
1. Find a task code (e.g., "AUDIT-2024-FIN-001-Q1")
2. **Verify**:
   - [ ] Code stays on one line
   - [ ] Ends with "..." if too long
   - [ ] Hover shows full text (if tooltip implemented)

**Expected behavior**:
- ✅ `.cell-text` class applied to title columns
- ✅ `.cell-token` class applied to code columns
- ✅ Text remains readable

---

### Test 5: RTL Mode
1. **Switch to Arabic** (if locale switcher available)
2. **Verify**:
   - [ ] Sidebar appears on right side
   - [ ] Table columns flip (right to left)
   - [ ] Scroll behavior correct
   - [ ] Toggle button in correct position

**Expected behavior**:
- ✅ Logical properties auto-flip layout
- ✅ No manual RTL adjustments needed
- ✅ All text aligned correctly

---

### Test 6: Keyboard Navigation
1. **Tab through sidebar**:
   - [ ] Toggle button focusable
   - [ ] Each stage button focusable
   - [ ] Focus ring visible
2. **Press Enter/Space** on stage button:
   - [ ] Content changes to that stage
   - [ ] Active state updates
3. **Arrow Up/Down** (if in ProcessStepper):
   - [ ] Navigates between stages
   - [ ] Focus follows

**Expected behavior**:
- ✅ All controls keyboard accessible
- ✅ `:focus-visible` styles applied
- ✅ Logical tab order

---

## 📱 Mobile Tests (<1024px)

### Test 7: Responsive Layout
1. **Resize browser to 768px width** (or use DevTools device emulation)
2. **Verify**:
   - [ ] Sidebar disappears
   - [ ] Bottom bar appears (fixed at bottom)
   - [ ] Table takes full width
3. **Resize to 1024px and above**:
   - [ ] Sidebar reappears
   - [ ] Bottom bar disappears

**Expected behavior**:
- ✅ Clean transition at 1024px breakpoint
- ✅ No layout jumps
- ✅ No horizontal scroll

---

### Test 8: Mobile Bottom Bar
1. **On mobile width (<1024px)**:
2. **Verify**:
   - [ ] Bottom bar fixed at screen bottom
   - [ ] Stage chips horizontally scrollable
   - [ ] Active chip highlighted (blue background)
3. **Tap a stage chip**:
   - [ ] Content changes
   - [ ] Chip becomes active (blue)
4. **Scroll stage chips horizontally**:
   - [ ] Smooth scrolling
   - [ ] All stages accessible

**Expected behavior**:
- ✅ Bottom bar has `z-index: 30`
- ✅ Horizontal scroll works smoothly
- ✅ Active state updates correctly

---

### Test 9: Mobile Table Scrolling
1. **On mobile, with table visible**:
2. **Scroll table vertically**:
   - [ ] Table scrolls inside wrapper
   - [ ] Bottom bar stays fixed
   - [ ] No overlap with bottom bar
3. **Check bottom padding**:
   - [ ] Last table row fully visible (not hidden by bar)
   - [ ] 72px padding at bottom of main content

**Expected behavior**:
- ✅ Table max-height: `calc(100vh - 360px)`
- ✅ Main content has `padding-bottom: 72px`
- ✅ No content hidden by bottom bar

---

## ♿ Accessibility Tests

### Test 10: Screen Reader
1. **Enable screen reader** (NVDA, JAWS, or VoiceOver)
2. **Navigate to sidebar**:
   - [ ] Announces "Process Stages Sidebar"
   - [ ] Toggle button announces state (collapsed/expanded)
3. **Navigate to active stage**:
   - [ ] Announces "Current step: [Stage Name]"
4. **Navigate to table**:
   - [ ] Column headers announced
   - [ ] Row data announced correctly

**Expected behavior**:
- ✅ All ARIA labels present
- ✅ State changes announced
- ✅ Semantic HTML structure

---

### Test 11: Color Contrast
1. **Use browser DevTools** > Accessibility > Color Contrast
2. **Check**:
   - [ ] All text meets 4.5:1 minimum
   - [ ] Active states meet 3:1 minimum
   - [ ] Disabled states clearly differentiated

**Expected behavior**:
- ✅ WCAG AA compliance
- ✅ No contrast warnings

---

### Test 12: Keyboard-Only Navigation
1. **Disconnect mouse/trackpad**
2. **Navigate entire page with keyboard only**:
   - [ ] Can reach all controls
   - [ ] Can toggle sidebar
   - [ ] Can navigate stages
   - [ ] Can focus table rows
   - [ ] Can activate buttons

**Expected behavior**:
- ✅ 100% keyboard accessible
- ✅ No keyboard traps
- ✅ Logical focus order

---

## 🎨 Visual Regression Tests

### Test 13: Browser Compatibility
Test in all supported browsers:

**Chrome**:
- [ ] Sidebar animation smooth
- [ ] Table scrolling works
- [ ] All styles render correctly

**Firefox**:
- [ ] Sidebar animation smooth
- [ ] Table scrolling works
- [ ] Custom scrollbar styles work (thin scrollbar)

**Safari**:
- [ ] Sidebar animation smooth
- [ ] Table scrolling works
- [ ] `-webkit-overflow-scrolling: touch` works

**Edge**:
- [ ] Same as Chrome (Chromium-based)

**Expected behavior**:
- ✅ Consistent across all browsers
- ✅ No layout differences
- ✅ All features functional

---

### Test 14: Zoom Levels
Test at different zoom levels:

**100% zoom**:
- [ ] Layout correct
- [ ] No horizontal scroll

**150% zoom**:
- [ ] Layout adapts
- [ ] Text remains readable
- [ ] Sidebar still functional

**200% zoom**:
- [ ] Mobile layout appears (if appropriate)
- [ ] Bottom bar works
- [ ] All content accessible

**Expected behavior**:
- ✅ Responsive at all zoom levels
- ✅ No layout breaks
- ✅ Accessibility maintained

---

## 🐛 Edge Case Tests

### Test 15: Empty State
1. **Navigate to page with no data**:
2. **Verify**:
   - [ ] Empty state message displays
   - [ ] Sidebar still functional
   - [ ] No JavaScript errors
   - [ ] Create button works

**Expected behavior**:
- ✅ Graceful empty state
- ✅ No layout issues
- ✅ Clear call-to-action

---

### Test 16: Very Long Content
1. **Create task with extremely long title** (500+ characters)
2. **Verify**:
   - [ ] Text wraps properly
   - [ ] Cell doesn't overflow
   - [ ] Row height adjusts
   - [ ] Table scrolling still works

**Expected behavior**:
- ✅ `.cell-text` handles long content
- ✅ No horizontal overflow
- ✅ Readable wrapping

---

### Test 17: Very Wide Table
1. **Add many columns to table** (if configurable)
2. **Verify**:
   - [ ] Table scrolls horizontally
   - [ ] Sidebar unaffected
   - [ ] No page-level scroll
   - [ ] All columns accessible

**Expected behavior**:
- ✅ Table wrapper handles overflow
- ✅ `table-layout: fixed` maintains structure
- ✅ Scrollbar appears only on wrapper

---

### Test 18: Rapid Toggling
1. **Click sidebar toggle rapidly** (10+ times)
2. **Verify**:
   - [ ] No animation glitches
   - [ ] State stays in sync
   - [ ] No performance degradation
   - [ ] No JavaScript errors

**Expected behavior**:
- ✅ Smooth transitions
- ✅ State management robust
- ✅ No memory leaks

---

## 📊 Performance Tests

### Test 19: Load Time
1. **Open DevTools > Performance**
2. **Reload page**
3. **Measure**:
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3.0s
   - [ ] No layout shifts (CLS = 0)

**Expected behavior**:
- ✅ Fast initial load
- ✅ No jank or stuttering
- ✅ Smooth 60fps animations

---

### Test 20: Large Dataset
1. **Load table with 500+ rows**
2. **Verify**:
   - [ ] Scrolling remains smooth
   - [ ] No lag when toggling sidebar
   - [ ] Browser memory usage stable

**Expected behavior**:
- ✅ CSS containment prevents reflows
- ✅ GPU acceleration helps performance
- ✅ Consider virtual scrolling if sluggish

---

## ✅ Pass Criteria

### Critical (Must Pass)
- [ ] **Test 1**: Sidebar toggle works
- [ ] **Test 2**: Sidebar never clipped
- [ ] **Test 3**: Table scrolls independently
- [ ] **Test 4**: Text handles correctly (wrapping + ellipsis)
- [ ] **Test 7**: Responsive layout works
- [ ] **Test 12**: Keyboard accessible

### Important (Should Pass)
- [ ] **Test 5**: RTL mode works
- [ ] **Test 8**: Mobile bottom bar works
- [ ] **Test 10**: Screen reader accessible
- [ ] **Test 13**: Cross-browser compatible
- [ ] **Test 19**: Performance acceptable

### Nice to Have (Can Improve Later)
- [ ] **Test 14**: Zoom levels graceful
- [ ] **Test 18**: Rapid toggle smooth
- [ ] **Test 20**: Large dataset performant

---

## 🎯 Success Metrics

After all tests:
- **Critical tests**: 6/6 passed ✅
- **Important tests**: 5/5 passed ✅
- **Nice to have**: 3/3 passed ✅

**Overall Grade**: PASS / FAIL

---

## 📝 Test Results Template

```
Date: _____________
Tester: ___________
Browser: __________
Resolution: _______

Critical Tests:     [X] / 6
Important Tests:    [X] / 5
Nice to Have:       [X] / 3

Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Overall: [ ] PASS  [ ] FAIL (needs fixes)

Notes:
_________________________________________________
_________________________________________________
_________________________________________________
```

---

## 🔧 Quick Fixes for Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Sidebar clipped | Add `overflow: visible` to parent |
| Table too wide | Verify `.annual-plan-main` has `min-width: 0` |
| Horizontal scroll | Check `.annual-plan-container` has `overflow-x: clip` |
| Text doesn't wrap | Apply `.cell-text` class |
| Bottom bar overlaps | Increase main `padding-bottom` to 72px+ |

---

**Test Checklist Version**: 1.0  
**Last Updated**: October 23, 2025  
**For**: Annual Plan Layout Implementation
