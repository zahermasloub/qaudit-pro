# ========================================

# QAudit Pro - Light Theme Setup Guide

# ========================================

# تعليمات التشغيل والتفعيل

## 📦 الملفات المُضافة/المُعدّلة

### 1. ملفات جديدة (تم إنشاؤها):

- ✅ `styles/theme-light.css` - نظام الثيم الفاتح الكامل
- ✅ `LIGHT_THEME_A11Y_AUDIT.md` - تقرير فحص إمكانية الوصول

### 2. ملفات محدّثة:

- ✅ `components/ui/ThemeToggle.tsx` - محسّن مع Shift+L وA11y
- ✅ `components/ui/KPICard.tsx` - ألوان Light Theme
- ✅ `app/(app)/admin/dashboard/page.tsx` - تطبيق ألوان Light
- ✅ `app/globals.css` - import theme-light.css
- ✅ `lib/ThemeProvider.tsx` - الوضع الافتراضي = light
- ✅ `tailwind.config.ts` - إضافة aliases للمتغيرات
- ✅ `styles/design-tokens.css` - تحديث comments

---

## 🚀 خطوات التفعيل

### الخطوة 1: تأكد من البناء بدون أخطاء

```bash
# في PowerShell
cd D:\qaudit-pro
pnpm run build
```

✅ **النتيجة المتوقعة**: Build ناجح بدون أخطاء TypeScript/CSS

---

### الخطوة 2: إضافة ThemeToggle في الشريط العلوي

#### في `app/(app)/layout.tsx` أو `components/Header.tsx`:

```tsx
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AppLayout({ children }) {
  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <h1>QAudit Pro</h1>

        {/* أضف ThemeToggle هنا */}
        <div className="flex items-center gap-4">
          {/* ... عناصر أخرى (profile, notifications, etc) ... */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
```

---

### الخطوة 3: تشغيل التطبيق

```bash
pnpm run dev
```

افتح المتصفح على: `http://localhost:3001`

---

## 🎨 استخدام الثيم

### التبديل اليدوي:

1. انقر على أيقونة الثيم (☀️ أو 🌙) في الشريط العلوي
2. اختر من القائمة:
   - **فاتح** - Light Mode
   - **داكن** - Dark Mode
   - **النظام** - يتبع إعدادات نظام التشغيل

### التبديل السريع بلوحة المفاتيح:

- اضغط **`Shift+L`** في أي مكان للتبديل بين الثيمات

### حفظ الإعداد:

- الاختيار يُحفظ تلقائيًا في `localStorage`
- عند العودة للموقع، يتم تطبيق الثيم المحفوظ

---

## 🧩 استخدام الألوان في المكونات الجديدة

### CSS Variables (مُفضّل):

```tsx
// في أي Component
<div
  style={{
    backgroundColor: 'var(--surface)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  }}
>
  محتوى البطاقة
</div>
```

### Tailwind Classes (بديل):

```tsx
<div className="bg-surface border border-ui text-primary">محتوى البطاقة</div>
```

### الألوان المتاحة:

#### خلفيات:

- `--bg` - خلفية الصفحة (#F7F8FA في light)
- `--surface` - خلفية البطاقات (#FFFFFF)
- `--surface-hover` - عند التمرير (#F7F9FC)

#### نصوص:

- `--text` - نص رئيسي (#1F2937)
- `--text-2` - نص ثانوي (#475569)
- `--muted` - نص خفيف (#94A3B8)

#### حدود:

- `--border` - حدود أساسية (#E5E7EB)

#### ألوان العلامة التجارية:

- `--primary` - اللون الأساسي (#2563EB)
- `--primary-hover` - عند التمرير (#1D4ED8)

#### ألوان الحالة:

- `--info` (#0EA5E9) - معلومات/Open
- `--success` (#16A34A) - نجاح/Closed
- `--warning` (#D97706) - تحذير/InProgress
- `--danger` (#DC2626) - خطر/Error

#### Tables:

- `--row-hover` (#F9FAFB) - صف عند التمرير
- `--row-selected` (#E8F1FF) - صف محدد

#### Progress:

- `--progress-track` (#E5E7EB)
- `--progress-fill` (#2563EB)

#### Skeleton:

- `--skeleton-base` (#E5E7EB)
- `--skeleton-shine` (#F3F4F6)

---

## 🧪 الاختبار

### 1. اختبار التبديل:

```
✅ انقر على ThemeToggle → القائمة تفتح
✅ اختر "فاتح" → الصفحة تتحول للون الفاتح
✅ اختر "داكن" → الصفحة تتحول للون الداكن
✅ اختر "النظام" → يتبع إعدادات OS
```

### 2. اختبار لوحة المفاتيح:

```
✅ اضغط Shift+L → الثيم يتبدل
✅ Tab إلى ThemeToggle → Focus ring يظهر
✅ Enter على الزر → القائمة تفتح
✅ Arrow keys → التنقل بين الخيارات
✅ Escape → القائمة تُغلق
```

### 3. اختبار الاستمرارية:

```
✅ اختر "فاتح" → أعد تحميل الصفحة → الثيم لا يزال "فاتح"
✅ أغلق المتصفح وافتحه → الثيم محفوظ
```

### 4. اختبار RTL:

```
✅ النصوص العربية محاذاة لليمين
✅ القوائم تفتح من اليمين
✅ الأيقونات في المكان الصحيح
```

### 5. اختبار التباين (A11y):

```
✅ افتح Chrome DevTools → Lighthouse → Accessibility
✅ يجب أن تحصل على نتيجة ≥90%
```

---

## 🎯 نصائح مهمة للمطورين

### ✅ DO (افعل):

```tsx
// استخدم CSS Variables
<div style={{ color: 'var(--text)' }}>Text</div>

// استخدم Tailwind classes مع المتغيرات
<div className="bg-surface text-primary">Content</div>

// أضف aria-hidden للأيقونات الزينية
<Icon size={20} aria-hidden="true" />

// أضف focus-visible styles
<button className="focus-visible:outline-none focus-visible:ring-2">
```

### ❌ DON'T (لا تفعل):

```tsx
// لا تستخدم ألوان صلبة (hardcoded)
<div style={{ color: '#1F2937' }}>Text</div>  // ❌

// لا تستخدم inline colors بدون متغيرات
<div className="bg-white text-gray-900">Content</div>  // ❌

// لا تنسى aria-label للأزرار بدون نص
<button><Icon /></button>  // ❌ Missing aria-label
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: الثيم لا يتغير

**الحل**:

1. تأكد من وجود `data-theme` في `<html>`:
   ```html
   <html data-theme="light" lang="ar" dir="rtl"></html>
   ```
2. افتح Console وتحقق من وجود أخطاء JavaScript
3. امسح localStorage: `localStorage.removeItem('qaudit-theme')`

### المشكلة: الألوان غير صحيحة

**الحل**:

1. تأكد من import في `globals.css`:
   ```css
   @import '../styles/theme-light.css';
   ```
2. أعد بناء التطبيق: `pnpm run build`
3. امسح cache المتصفح: `Ctrl+Shift+Delete`

### المشكلة: ThemeToggle لا يظهر

**الحل**:

1. تأكد من import:
   ```tsx
   import { ThemeToggle } from '@/components/ui/ThemeToggle';
   ```
2. تأكد من `ThemeProvider` موجود في `layout.tsx`

### المشكلة: Shift+L لا يعمل

**الحل**:

1. تأكد من focus على الصفحة (انقر في أي مكان)
2. تحقق من Console للأخطاء
3. جرب Refresh الصفحة

---

## 📚 موارد إضافية

### أدوات فحص A11y:

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [axe DevTools Extension](https://www.deque.com/axe/devtools/)
- [WAVE Extension](https://wave.webaim.org/extension/)

### توثيق WCAG:

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### CSS Variables في React:

- [CSS Custom Properties در React](https://blog.logrocket.com/how-to-use-css-variables-with-react/)

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. تحقق من هذا الدليل أولاً
2. افتح Chrome DevTools → Console للأخطاء
3. راجع `LIGHT_THEME_A11Y_AUDIT.md` للتفاصيل التقنية

---

## ✅ قائمة التحقق النهائية

قبل نشر Light Theme في Production:

- [ ] ✅ Build ناجح بدون أخطاء
- [ ] ✅ ThemeToggle يظهر في الشريط العلوي
- [ ] ✅ التبديل بين light/dark/system يعمل
- [ ] ✅ Shift+L يبدل الثيم
- [ ] ✅ الثيم يُحفظ بعد Reload
- [ ] ✅ RTL يعمل بشكل صحيح
- [ ] ✅ Focus visible على جميع الأزرار
- [ ] ✅ Lighthouse Accessibility ≥ 90%
- [ ] ✅ اختبار على Chrome, Firefox, Safari
- [ ] ✅ اختبار على Mobile (responsive)

---

**🎉 تهانينا! Light Theme جاهز للاستخدام.**

**الوضع الافتراضي**: Light Mode
**التبديل السريع**: `Shift+L`
**A11y Compliance**: WCAG 2.1 AA ✅
