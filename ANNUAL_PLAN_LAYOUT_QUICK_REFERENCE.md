# Annual Plan Layout - Quick Reference Card

## 🎯 Quick Start

### HTML Structure
```tsx
<div className="annual-plan-container">
  <div className="annual-plan-shell">
    {/* Sidebar */}
    <aside className={clsx('annual-plan-sidebar', isOpen && 'is-open')} aria-expanded={isOpen}>
      <div className="annual-plan-sidebar-inner">
        {/* Sidebar content */}
      </div>
    </aside>
    
    {/* Main */}
    <main className="annual-plan-main">
      <div className="annual-plan-table-wrapper">
        <table>
          <colgroup>
            <col className="col-code" />
            <col className="col-title" />
          </colgroup>
          <tbody>
            <tr>
              <td className="cell-token">{code}</td>
              <td className="cell-text">{title}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</div>
```

---

## 📏 CSS Classes Reference

### Layout
| Class | Usage | Width/Behavior |
|-------|-------|----------------|
| `.annual-plan-container` | Page wrapper | Prevents horizontal scroll |
| `.annual-plan-shell` | Grid container | `auto minmax(0, 1fr)` |
| `.annual-plan-sidebar` | Collapsible sidebar | 72px default |
| `.annual-plan-sidebar.is-open` | Expanded sidebar | 280px |
| `.annual-plan-main` | Main content | Flexible, `min-width: 0` |

### Table
| Class | Usage | Behavior |
|-------|-------|----------|
| `.annual-plan-table-wrapper` | Scroll container | `overflow: auto`, max-height |
| `.cell-text` | Arabic wrapping | `white-space: normal`, breaks |
| `.cell-token` | ID/code | `nowrap`, ellipsis |

### Columns
| Class | Width | Use For |
|-------|-------|---------|
| `.col-code` | 100px | Audit codes |
| `.col-title` | 260px+ | Task titles (wraps) |
| `.col-department` | 140px | Department names |
| `.col-risk` | 120px | Risk badges |
| `.col-hours` | 100px | Numeric hours |
| `.col-status` | 120px | Status badges |
| `.col-actions` | 100px | Action buttons |

### Mobile
| Class | Usage | Display |
|-------|-------|---------|
| `.annual-plan-bottom-bar` | Mobile nav | `<1024px` only |
| `.stage-rail` | Horizontal scroll | Flex container |
| `.stage-chip` | Stage button | No wrap, flex-shrink-0 |
| `.stage-chip.active` | Active stage | Blue background |

---

## 🎨 Z-Index Stack

```
100 → Tooltips
 50 → Sidebar (always on top)
 30 → Bottom bar (mobile)
 20 → Table header (sticky)
 10 → Main content
  5 → Table body
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Sidebar | Bottom Bar | Layout |
|------------|---------|------------|--------|
| **≥1024px** | Visible, collapsible | Hidden | Two-column grid |
| **<1024px** | Hidden | Visible, fixed bottom | Single column |

---

## 🔧 React State

```tsx
const [sidebarOpen, setSidebarOpen] = useState(true);

// Toggle function
const toggle = () => setSidebarOpen(!sidebarOpen);

// Apply class
className={clsx('annual-plan-sidebar', sidebarOpen && 'is-open')}

// ARIA
aria-expanded={sidebarOpen}
```

---

## 🌍 RTL Support

Automatic via logical properties:
- `inline-size` instead of `width`
- `inset-inline-start` instead of `left`
- `padding-inline` instead of `padding-left/right`

No manual RTL handling needed!

---

## ♿ Accessibility Checklist

- [ ] `aria-expanded` on sidebar
- [ ] `aria-label` on sidebar and toggle
- [ ] `aria-current="step"` on active stage
- [ ] `title` attribute on truncated text
- [ ] Keyboard support (Tab, Enter, Space)
- [ ] `:focus-visible` styles
- [ ] Color contrast ≥4.5:1

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| Sidebar clipped | Ensure ancestors use `overflow: visible` |
| Table too wide | Add `min-width: 0` to `.annual-plan-main` |
| Horizontal scroll | Use `overflow-x: clip` on container |
| Text doesn't wrap | Apply `.cell-text` class |
| Header not sticky | Ensure wrapper has `position: relative` |

---

## 📊 Performance Tips

```css
/* CSS Containment */
contain: layout;

/* Will-change hint */
will-change: width;

/* iOS smooth scroll */
-webkit-overflow-scrolling: touch;

/* GPU acceleration */
transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 🧪 Testing Commands

```bash
# Run all tests
npm run test:all

# Visual regression
npm run test:visual

# Accessibility
npm run test:accessibility

# Lighthouse
npm run test:lighthouse
```

---

## 📝 Quick Edits

### Change sidebar width
```css
/* globals.css */
.annual-plan-sidebar { width: 60px; }
.annual-plan-sidebar.is-open { width: 300px; }
```

### Change table max height
```css
.annual-plan-table-wrapper {
  max-height: calc(100vh - 400px); /* Adjust offset */
}
```

### Change mobile breakpoint
```css
@media (max-width: 1200px) { /* Was 1024px */
  .annual-plan-sidebar { display: none; }
}
```

---

## 🎓 Best Practices

1. ✅ Always use `.cell-text` for Arabic content
2. ✅ Always use `.cell-token` for codes/IDs
3. ✅ Add `aria-expanded` when toggling
4. ✅ Use `clsx()` for conditional classes
5. ✅ Test in RTL mode (`dir="rtl"`)
6. ✅ Check keyboard navigation
7. ✅ Verify no horizontal scroll at 100% zoom

---

## 📞 Support

- **Full docs**: `ANNUAL_PLAN_LAYOUT_FINAL_IMPLEMENTATION.md`
- **Code**: `features/annual-plan/AnnualPlan.screen.tsx`
- **Styles**: `app/globals.css` (search "Annual Plan Layout")

---

**Last Updated**: October 23, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
