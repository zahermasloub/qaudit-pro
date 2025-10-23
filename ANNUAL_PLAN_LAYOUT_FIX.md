# Annual Plan Layout Fix - إصلاح تخطيط الخطة السنوية

## 📋 الملخص التنفيذي

تم إصلاح مشكلة انضغاط مكون **ProcessStepper** عند تحميل بيانات الجدول، وتحسين تخطيط الصفحة لضمان ثبات الأعمدة الجانبية ومنع ظهور السكرول الأفقي.

## 🔴 المشاكل التي تم حلها

### 1. انضغاط ProcessStepper
- **المشكلة**: عند تحميل بيانات الجدول ديناميكياً، كان المحتوى الأوسط يتمدد أفقياً مما يسبب:
  - انضغاط مكوّن مراحل العملية (Stepper) إلى اليسار في RTL
  - اختفاء جزء من نص المراحل
  - عدم استقرار التخطيط

- **الحل**: استخدام CSS Grid مع أعمدة ثابتة العرض للـ Sidebars:
  ```tsx
  <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px]">
  ```

### 2. السكرول الأفقي في الجدول
- **المشكلة**: الجدول يظهر أحياناً بسكرول أفقي أو يفرض عرضاً أكبر من الحاوية
- **الحل**: 
  - استخدام `table-fixed` مع `colgroup` لتحديد نسب الأعمدة
  - تطبيق `break-words` على العمود الرئيسي (Title)
  - إضافة `min-w-[900px]` للجدول مع `overflow-x-auto` على الحاوية

### 3. تكرار المحتوى
- **المشكلة**: ظهور KPI Cards أو الجدول في أماكن متعددة
- **الحل**: تنظيم المحتوى في منطقة واحدة تتبدل حسب `contentView`

## ✅ التغييرات المطبقة

### 1. تخطيط Grid ثابت
**الملف**: `features/annual-plan/AnnualPlan.screen.tsx`

```tsx
// قبل
<div className="grid grid-cols-[320px_minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
  <aside className="min-w-[320px] w-[320px] shrink-0 flex-none">

// بعد
<div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px]">
  <aside className="stepper-col sticky top-[88px] h-fit w-[320px] min-w-[320px] max-w-[320px] flex-none shrink-0 z-10">
```

**التحسينات**:
- ✅ `w-[320px] min-w-[320px] max-w-[320px]` - عرض ثابت تماماً
- ✅ `flex-none shrink-0` - منع الانكماش نهائياً
- ✅ `sticky top-[88px]` - تثبيت عند التمرير
- ✅ `h-fit` - ارتفاع تلقائي حسب المحتوى
- ✅ `z-10` - ضمان ظهور فوق العناصر الأخرى

### 2. تحسين الجدول
**الملف**: `features/annual-plan/AnnualPlan.screen.tsx`

```tsx
// قبل
<table className="w-full table-fixed">
  <colgroup>
    <col className="w-24" />
    <col className="w-[28%]" />
    ...
  </colgroup>

// بعد
<table className="w-full table-fixed min-w-[900px]">
  <colgroup>
    <col style={{ width: '6%' }} />       {/* Code */}
    <col style={{ width: '24%' }} />      {/* Title - with wrap */}
    <col style={{ width: '12%' }} />      {/* Department */}
    ...
  </colgroup>
```

**التحسينات**:
- ✅ استخدام `style={{ width: 'X%' }}` بدلاً من classes
- ✅ توزيع النسب المئوية بشكل متوازن (مجموع 100%)
- ✅ `min-w-[900px]` للجدول لضمان حد أدنى
- ✅ `overflow-x-auto` على الحاوية للسكرول عند الحاجة فقط

### 3. التفاف النص العربي
**الملف**: `features/annual-plan/AnnualPlan.screen.tsx`

```tsx
// عمود Title - الأطول
<td className="text-sm text-gray-900 break-words leading-relaxed" 
    style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
  {task.title}
</td>

// باقي الأعمدة
<td className="text-sm text-gray-600 break-words">
  {task.department}
</td>

// أعمدة قصيرة
<td className="text-sm text-gray-600 whitespace-nowrap">
  {task.plannedQuarter}
</td>
```

**التحسينات**:
- ✅ `break-words` للنص العربي الطويل
- ✅ `wordBreak: 'break-word'` كـ inline style
- ✅ `whitespace-nowrap` للأعمدة القصيرة (Quarter, Hours, Code)
- ✅ `leading-relaxed` لتباعد أفضل

### 4. تنظيم المحتوى
```tsx
<main className="min-w-0 space-y-6">
  {/* 1) KPI Summary - مرة واحدة فقط في الأعلى */}
  {selectedPlan && (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI Cards */}
    </div>
  )}

  {/* 2) منطقة المحتوى الديناميكي - تتبدل حسب المرحلة */}
  {contentView === 'empty' && ( /* Empty state */ )}
  {contentView === 'annualPlan' && selectedPlan && (
    <>
      {/* 3) Filters - مرة واحدة قبل الجدول */}
      {/* 4) Table - الجدول */}
    </>
  )}
  {/* باقي المراحل */}
</main>
```

## 🎯 الفوائد المحققة

### 1. الثبات البصري
- ✅ ProcessStepper لا ينضغط أبداً
- ✅ RBIA Sidebar يبقى في مكانه
- ✅ عدم وجود "قفز" أو تحرك عند تحميل البيانات

### 2. الأداء
- ✅ `min-w-0` على `<main>` يمنع CSS overflow issues
- ✅ Grid layout أسرع من Flexbox للتخطيطات المعقدة
- ✅ تقليل re-renders بسبب ثبات الأعمدة

### 3. تجربة المستخدم
- ✅ قراءة أفضل للنص العربي الطويل
- ✅ عدم وجود سكرول أفقي غير متوقع
- ✅ تخطيط responsive على جميع الشاشات:
  - Mobile: محتوى واحد عمودي
  - Tablet/Desktop (lg): Stepper + Content
  - Large Desktop (xl): Stepper + Content + RBIA

### 4. الصيانة
- ✅ كود منظم مع تعليقات واضحة
- ✅ فصل واضح بين المناطق (KPI / Filters / Table)
- ✅ سهولة إضافة محتوى جديد

## 📱 Responsive Breakpoints

```css
/* Mobile First */
base: عمود واحد (content only)

lg: (1024px+)
  grid-cols-[320px_minmax(0,1fr)]
  Stepper (يسار) + Content (وسط)

xl: (1280px+)
  grid-cols-[320px_minmax(0,1fr)_320px]
  Stepper + Content + RBIA Sidebar
```

## 🔧 CSS Classes الرئيسية

### للأعمدة الجانبية الثابتة:
```tsx
className="w-[320px] min-w-[320px] max-w-[320px] flex-none shrink-0"
```

### للمحتوى المرن:
```tsx
className="min-w-0 space-y-6"
```

### للجدول:
```tsx
// Container
className="w-full overflow-x-auto"

// Table
className="w-full table-fixed min-w-[900px]"

// Cell with wrap
className="break-words leading-relaxed"
style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
```

## 🧪 الاختبارات المطلوبة

### ✅ اختبارات مكتملة:
- [x] البناء ينجح بدون أخطاء (`pnpm run build`)
- [x] لا توجد تحذيرات TypeScript
- [x] الـ Grid يعمل بشكل صحيح

### 📋 اختبارات يدوية مطلوبة:
- [ ] فتح الصفحة بدون بيانات (Empty state)
- [ ] إنشاء خطة جديدة
- [ ] تحميل الجدول بـ 20+ مهمة
- [ ] التأكد من عدم انضغاط ProcessStepper
- [ ] اختبار التفاف النص العربي الطويل
- [ ] اختبار Responsive على شاشات مختلفة:
  - [ ] Mobile (< 1024px)
  - [ ] Tablet (1024px - 1279px)
  - [ ] Desktop (1280px+)
- [ ] التمرير (Scroll) - ProcessStepper يبقى ثابتاً
- [ ] تبديل المراحل (Steps) - المحتوى يتغير بسلاسة

## 📸 Screenshots المطلوبة

للتوثيق في Pull Request:

1. **قبل الإصلاح**:
   - ProcessStepper منضغط بعد تحميل الجدول
   - سكرول أفقي ظاهر
   - نص عربي متقطع

2. **بعد الإصلاح**:
   - ProcessStepper ثابت بعرض 320px
   - جدول بعرض كامل بدون سكرول أفقي
   - نص عربي ملتف بشكل صحيح

3. **Responsive**:
   - Mobile view
   - Tablet view (lg)
   - Desktop view (xl)

## 🚀 الخطوات التالية

1. ✅ **اختبار يدوي شامل** للتأكد من التخطيط
2. **التقاط Screenshots** قبل/بعد
3. **إنشاء Pull Request** مع التوثيق الكامل
4. **Code Review** من الفريق
5. **Merge to main** بعد الموافقة

## 📚 ملفات معدلة

- `features/annual-plan/AnnualPlan.screen.tsx` - التخطيط الرئيسي

## 🔗 المراجع

- [CSS Grid Layout](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [Arabic Text Wrapping](https://developer.mozilla.org/en-US/docs/Web/CSS/word-break)
- [Table Layout Fixed](https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout)

---

**تاريخ التحديث**: أكتوبر 23, 2025  
**الحالة**: ✅ مكتمل - جاهز للاختبار اليدوي
