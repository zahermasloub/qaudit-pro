# 🚀 Migration Checklist - Annual Plan Layout

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] Updated `app/globals.css` with layout classes
- [x] Updated `features/annual-plan/AnnualPlan.screen.tsx` with grid layout
- [x] Added collapsible sidebar logic
- [x] Added mobile bottom bar
- [x] Implemented internal table scrolling
- [x] Applied RTL-safe logical properties

### ✅ Testing Required
- [ ] Desktop sidebar expand/collapse works smoothly
- [ ] Mobile bottom bar appears at correct breakpoint
- [ ] Table scrolls internally (not page-level)
- [ ] Arabic text wraps naturally
- [ ] Token columns ellipsize correctly
- [ ] Keyboard navigation functional
- [ ] RTL layout correct
- [ ] No console errors
- [ ] Performance acceptable (no jank)

### ✅ Browser Testing
- [ ] Chrome/Edge latest
- [ ] Firefox latest
- [ ] Safari desktop
- [ ] Safari iOS
- [ ] Chrome Android

### ✅ Responsive Testing
- [ ] Desktop: 1920px, 1440px, 1280px
- [ ] Tablet: 1024px (breakpoint), 768px
- [ ] Mobile: 414px, 375px, 360px

### ✅ Accessibility Testing
- [ ] Screen reader announces stage changes
- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Contrast ratios pass WCAG AA

## Rollback Plan

If issues arise, revert these files:
1. `app/globals.css` (remove lines 366-518)
2. `features/annual-plan/AnnualPlan.screen.tsx` (revert to previous version)

Git commands:
```bash
# View changes
git diff features/annual-plan/AnnualPlan.screen.tsx
git diff app/globals.css

# Revert if needed
git checkout HEAD -- features/annual-plan/AnnualPlan.screen.tsx
git checkout HEAD -- app/globals.css
```

## Known Safe Fallbacks

If sidebar causes issues, emergency CSS fix:
```css
/* Emergency: Force sidebar to always show full width */
.annual-plan-sidebar {
  inline-size: 280px !important;
}
```

If table scroll breaks, emergency fix:
```css
/* Emergency: Allow page-level scroll */
.annual-plan-table-wrapper {
  max-block-size: none !important;
  overflow: visible !important;
}
```

## Post-Deployment Monitoring

Watch for:
1. User reports of layout shifting
2. Performance issues on lower-end devices
3. Accessibility complaints
4. Mobile usability issues

## Success Metrics

- ✅ No layout shift when toggling sidebar
- ✅ No horizontal page scroll on any device
- ✅ Table loads in <2 seconds with 100+ rows
- ✅ Smooth transitions (60fps)
- ✅ Zero accessibility violations

## Deployment Steps

1. **Merge to staging**
2. **Run full test suite** (see ANNUAL_PLAN_LAYOUT_VISUAL_TEST.md)
3. **QA approval**
4. **Merge to production**
5. **Monitor for 24 hours**
6. **Mark as stable**

---

**Prepared by**: GitHub Copilot  
**Date**: 2025-10-23  
**Status**: Ready for QA
