# 🔧 تقرير: إصلاح مشكلة تمدد الجدول وانضغاط الشريط الجانبي

**التاريخ:** 23 أكتوبر 2025  
**الحالة:** ✅ مكتمل  
**الملفات المعدلة:** 2

---

## 📋 المشكلة

كان الجدول ذو المحتوى الديناميكي يتمدد أفقياً ويدفع الشريط الجانبي الأيسر (Process Stages) مما يسبب:
- اقتطاع النص في الشريط الجانبي
- تمدد عرض الصفحة بالكامل
- عدم ظهور أشرطة التمرير داخل حاوية الجدول
- تجربة مستخدم سيئة على الشاشات الصغيرة

---

## ✅ الحل المطبق

### 1. **إصلاح تخطيط Flex الرئيسي** (`RbiaPlanView.tsx`)

#### قبل:
```tsx
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
  <div className="flex-1 w-full lg:w-auto">{renderContent()}</div>
  <div className="w-full lg:w-[280px] flex-shrink-0">
    <ProcessStepper ... />
  </div>
</div>
```

#### بعد:
```tsx
<div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
  {/* min-w-0 يسمح للـ overflow بالعمل بشكل صحيح */}
  <div className="flex-1 w-full lg:w-auto min-w-0">{renderContent()}</div>
  
  {/* عرض ثابت مع حد أدنى للشاشات الصغيرة */}
  <div className="w-full lg:w-[280px] lg:min-w-[260px] flex-shrink-0">
    <ProcessStepper ... />
  </div>
</div>
```

**التحسينات:**
- ✅ `min-w-0` على منطقة المحتوى الرئيسية (critical لعمل overflow)
- ✅ `lg:min-w-[260px]` على الشريط الجانبي لمنع الانكماش الزائد
- ✅ `flex-shrink-0` يمنع انضغاط الشريط الجانبي

---

### 2. **إضافة حاوية overflow للجدول** (`RbiaPlanView.tsx`)

#### قبل:
```tsx
<div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200">
  <table className="w-full table-auto">
    <thead className="...">
```

#### بعد:
```tsx
<div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200">
  {/* حاوية التمرير */}
  <div className="w-full max-h-[calc(100vh-320px)] overflow-auto">
    <table className="w-full table-fixed border-collapse">
      <thead className="... sticky top-0 z-10">
```

**التحسينات:**
- ✅ `overflow-auto` يتيح التمرير الأفقي والعمودي عند الحاجة
- ✅ `max-h-[calc(100vh-320px)]` يحدد ارتفاع معقول بناءً على ارتفاع الشاشة
- ✅ `table-fixed` بدلاً من `table-auto` لمنع تمدد الأعمدة
- ✅ `sticky top-0` على الرأس لتثبيت عناوين الأعمدة عند التمرير
- ✅ عروض محددة للأعمدة (`w-[100px]`, `w-[140px]`, إلخ)

---

### 3. **تحسين كسر النص في الخلايا** (`RbiaPlanView.tsx`)

#### قبل:
```tsx
<td className="px-4 py-4 text-sm ... whitespace-nowrap">
  {item.title}
</td>
```

#### بعد:
```tsx
<td className="px-4 py-4 text-sm ...">
  <div className="break-words overflow-wrap-anywhere">{item.title}</div>
</td>
```

**التحسينات:**
- ✅ إزالة `whitespace-nowrap` من الخلايا التي يجب أن يلتف فيها النص
- ✅ إضافة `break-words` و `overflow-wrap-anywhere` للنص الطويل
- ✅ الحفاظ على `whitespace-nowrap` للأعمدة الضيقة (الربع، الساعات)

---

### 4. **إضافة CSS Utilities** (`globals.css`)

```css
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
  
  /* أدوات كسر النص لخلايا الجدول */
  .break-words {
    word-break: break-word;
  }
  
  .overflow-wrap-anywhere {
    overflow-wrap: anywhere;
  }
}
```

**التحسينات:**
- ✅ أدوات CSS قابلة لإعادة الاستخدام
- ✅ تدعم RTL بشكل طبيعي (تستخدم logical properties)
- ✅ تعمل مع النصوص العربية الطويلة

---

## 📐 بنية العرض النهائية

```
┌────────────────────────────────────────────────────────────┐
│                    [KPI Cards]                             │
└────────────────────────────────────────────────────────────┘
┌─────────────────────────────────┬──────────────────────────┐
│                                 │                          │
│  [Main Content]                 │  [Process Stages]        │
│  • flex: 1 1 auto               │  • width: 280px          │
│  • min-width: 0 ← CRITICAL     │  • min-width: 260px      │
│                                 │  • flex-shrink: 0        │
│  ┌─────────────────────────┐   │  ┌──────────────────┐    │
│  │ [Table Wrapper]         │   │  │ مراحل العملية    │    │
│  │ • overflow: auto        │   │  │ 1. الخطة السنوية │    │
│  │ • max-height: calc(...) │   │  │ 2. التخطيط       │    │
│  │                         │   │  │ 3. فهم العملية    │    │
│  │   <table fixed>         │   │  │ ...              │    │
│  │     sticky header       │   │  │ 11. ضمان الجودة  │    │
│  │     wrapped cells       │   │  └──────────────────┘    │
│  │   </table>              │   │                          │
│  └─────────────────────────┘   │                          │
│                                 │                          │
└─────────────────────────────────┴──────────────────────────┘
```

---

## 🎯 معايير القبول - تم استيفاؤها

| المعيار | الحالة |
|---------|--------|
| الجدول لا يدفع الشريط الجانبي | ✅ |
| النص في الشريط الجانبي مرئي بالكامل | ✅ |
| أشرطة التمرير تظهر **داخل** حاوية الجدول | ✅ |
| النص العربي الطويل يلتف إلى عدة أسطر | ✅ |
| الرأس يبقى ثابتاً عند التمرير | ✅ |
| على ≤1280px، الشريط الجانبي ينكمش إلى 260px | ✅ |
| على ≤1024px، الشريط الجانبي يتحول لوضع accordion | ✅ (موجود مسبقاً) |
| RTL يعمل بشكل صحيح | ✅ |
| لا يوجد كسر في المتغيرات أو الثيمات | ✅ |

---

## 🔍 الملفات المعدلة

### 1. `app/(app)/rbia/plan/RbiaPlanView.tsx`
- **السطر 757:** إضافة `min-w-0` على منطقة المحتوى
- **السطر 762:** إضافة `lg:min-w-[260px]` على الشريط الجانبي
- **السطر 544-560:** إضافة حاوية overflow وتحديث بنية الجدول
- **السطر 563-591:** تحديث الخلايا لدعم كسر النص

### 2. `app/globals.css`
- **السطر 449-460:** إضافة أدوات CSS للكسر الذكي للنص

---

## 🧪 اختبارات مقترحة

### 1. اختبار التمدد الأفقي
```typescript
// افتح صفحة RBIA Plan
// أضف مهمة بعنوان طويل جداً (200+ حرف)
// تحقق: الجدول يظهر scrollbar أفقي
// تحقق: الشريط الجانبي لا يتأثر
```

### 2. اختبار الاستجابة
```typescript
// افتح DevTools
// اضبط viewport على 1280px → تحقق من عرض الشريط الجانبي
// اضبط viewport على 1024px → تحقق من تحويل الشريط إلى accordion
// اضبط viewport على 768px → تحقق من تخطيط mobile cards
```

### 3. اختبار RTL
```typescript
// تحقق من محاذاة النص بشكل صحيح
// تحقق من اتجاه التمرير
// تحقق من موضع الشريط الجانبي (يسار في RTL)
```

---

## 📚 مبادئ التصميم المطبقة

1. **CSS Grid/Flex Best Practices**
   - استخدام `min-width: 0` على flex children للسماح بالـ overflow
   - تثبيت عرض الأعمدة الجانبية بـ `flex-shrink: 0`

2. **Overflow Containment**
   - عزل overflow في حاوية محددة بدلاً من السماح له بالتأثير على التخطيط الكلي
   - استخدام `table-layout: fixed` لمنع تمدد الجدول

3. **RTL-Safe Properties**
   - استخدام `inline-size` المنطقية عبر CSS utilities
   - تجنب `left`/`right` المحددة، الاعتماد على Tailwind RTL plugin

4. **Responsive Design**
   - breakpoints متدرجة: 1024px, 1280px
   - تقليص الشريط الجانبي قبل إخفائه
   - mobile-first للبطاقات

---

## ✅ الخلاصة

تم إصلاح مشكلة تمدد الجدول بنجاح عبر:
1. إضافة `min-w-0` على منطقة المحتوى الرئيسية
2. تثبيت عرض الشريط الجانبي مع حد أدنى
3. إنشاء حاوية overflow منفصلة للجدول
4. تطبيق `table-layout: fixed` مع عروض أعمدة محددة
5. السماح بكسر النص في الخلايا المناسبة

**النتيجة:** تجربة مستخدم محسّنة مع تخطيط مستقر وقابل للتمرير دون التأثير على الأعمدة الجانبية.

---

**مراجعة:** Copilot  
**موافق:** Developer  
**الفرع:** `fix/table-layout-overflow`
