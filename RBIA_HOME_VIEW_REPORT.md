# ✅ تقرير تنفيذ واجهة الخطة السنوية على الصفحة الرئيسية
**التاريخ:** 2025-10-20  
**الوضع:** MODE=embed (عرض مُدمج)  
**الحالة:** ✅ مكتمل بنجاح

---

## 📊 نظرة عامة

تم إنشاء مكون مشترك قابل لإعادة الاستخدام (`RbiaPlanView`) يعرض الخطة السنوية بتصميم موحد على:
1. الصفحة الرئيسية `/`
2. صفحة الخطة المخصصة `/rbia/plan`

---

## ✅ المكونات المُنفذة

### 1. المكون المشترك: `RbiaPlanView.tsx`

**الموقع:** `app/(app)/rbia/plan/RbiaPlanView.tsx`

**الميزات الرئيسية:**

#### 🎴 بطاقات الملخص (4 بطاقات)
```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  20%            │ │  1,080          │ │  5              │ │  معتمدة ✓       │
│  نسبة الإنجاز   │ │  إجمالي الساعات │ │  المهام المخططة │ │  حالة الخطة     │
└─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────────┘
```

#### 🔍 الفلاتر والبحث
- **البحث:** حقل بحث بأيقونة (Search icon)
- **فلتر الإدارات:** قائمة منسدلة (كل الإدارات / المشتريات / الموارد البشرية...)
- **فلتر المخاطر:** قائمة منسدلة (كل المخاطر / عالية / متوسطة / منخفضة)
- **فلتر الحالات:** قائمة منسدلة (كل الحالات / مخطط / قيد التنفيذ / مكتمل / متأخر)
- **زر استيراد CSV:** مع أيقونة Upload
- **زر تصدير CSV:** مع أيقونة Download

#### 📋 الجدول الرئيسي (9 أعمدة)

| الرمز | العنوان | الإدارة | المخاطر | النوع | الربع | الساعات | الحالة | إجراءات |
|------|---------|---------|---------|------|------|--------|--------|---------|
| RBIA-2025-001 | مراجعة نظام المشتريات | المشتريات | `عالية` 🔴 | مراجعة داخلية | Q1 | 120 | `قيد التنفيذ` 🟣 | 👁️ ✏️ 🗑️ |
| RBIA-2025-002 | تدقيق الرواتب | الموارد البشرية | `عالية` 🔴 | مراجعة مالية | Q1 | 80 | `مخطط` 🔵 | 👁️ ✏️ 🗑️ |

**Badges ملونة:**
- المخاطر: 🔴 عالية / 🟡 متوسطة / 🟢 منخفضة
- الحالة: 🔵 مخطط / 🟣 قيد التنفيذ / 🟢 مكتمل / 🔴 متأخر

#### 📌 الشريط الجانبي (Stepper)

```
┌─────────────────────────┐
│  مراحل العملية          │
├─────────────────────────┤
│ ① الخطة السنوية ●       │ ← نشط
│   ▓▓▓░░░░░░ 30%        │
├─────────────────────────┤
│ ② تحديد الأولويات ○     │
│ ③ تخصيص الموارد ○       │
│ ④ الجدول الزمني ○       │
│ ⑤ اعتماد الخطة ○        │
│ ⑥ تنفيذ المهام ○        │
│ ⑦ المتابعة والرقابة ○   │
│ ⑧ إعداد التقارير ○      │
│ ⑨ المراجعة والتقييم ○   │
│ ⑩ التوصيات ○            │
│ ⑪ الإغلاق والأرشفة ○    │
└─────────────────────────┘
```

#### 🎨 التصميم (Tailwind + shadcn/ui)

**شريط علوي:**
```css
bg-slate-900 text-white rounded-b-2xl py-3 px-6 sticky top-0 z-50 shadow-lg
```

**البطاقات:**
```css
bg-white rounded-xl shadow-sm p-5 border border-gray-100
```

**الجدول:**
```css
bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden
hover:bg-gray-50 (على الصفوف)
```

---

## 📁 الملفات المُنشأة/المُعدّلة

### 1. المكون الجديد
```
✅ app/(app)/rbia/plan/RbiaPlanView.tsx (770 lines)
```

### 2. الصفحات المُعدّلة
```
✅ app/page.tsx
   قبل: redirect('/shell')
   بعد: <RbiaPlanView mode="home" />

✅ app/(app)/rbia/plan/page.tsx
   قبل: 1,083 lines (standalone)
   بعد: <RbiaPlanView mode="plan" />
```

### 3. التوثيق
```
✅ docs/copilot-instructions.md
   أضيف: Part D: Home Page Annual Plan View (✔) — MODE=embed
```

---

## 🎯 الميزات التقنية

### ✨ الأداء والتحسين
- ✅ **useMemo** للبيانات المُصفّاة (filteredItems)
- ✅ **useMemo** للإحصائيات (stats)
- ✅ **useMemo** لقوائم الفلاتر
- ✅ **Loading states** مع Skeleton
- ✅ **Error handling** شامل

### 💾 التخزين المحلي
- ✅ حفظ الفلاتر في `localStorage` (rbia_filters)
- ✅ استرجاع الفلاتر عند التحميل
- ✅ تحديث تلقائي عند التغيير

### ♿ الوصولية (Accessibility)
- ✅ `aria-label` على جميع الأزرار
- ✅ `dir="rtl"` على العناصر
- ✅ Focus states للتنقل بالكيبورد
- ✅ Semantic HTML

### 🌐 RTL & i18n
- ✅ دعم كامل للـ RTL
- ✅ جميع النصوص بالعربية
- ✅ الأيقونات في المواضع الصحيحة
- ✅ الفلاتر تعمل مع النصوص العربية

---

## 🔌 ربط البيانات

### API Integration
```typescript
// جلب الخطط
GET /api/annual-plans?fiscalYear=2025

// جلب بنود الخطة
GET /api/plan/items?plan_id={id}
```

### Sample Data (عند عدم وجود بيانات)
```typescript
generateSampleData(): 5 items
  - مراجعة نظام المشتريات
  - تدقيق الرواتب والأجور
  - مراجعة أمن المعلومات
  - فحص الامتثال التنظيمي
  - تقييم إدارة المخاطر
```

---

## 🎬 الإجراءات (Actions)

### 👁️ عرض (View)
- يفتح Modal/Sheet جانبي
- يعرض كل تفاصيل البند
- وضع القراءة فقط

### ✏️ تعديل (Edit)
- يفتح نفس Modal بوضع التحرير
- حقول قابلة للتعديل
- زر حفظ + إلغاء

### 🗑️ حذف (Delete)
- Dialog تأكيد
- حذف محلي من state
- Toast notification

### 📥 استيراد CSV
```typescript
handleImportCSV()
  - يقرأ الملف
  - يحلل الصفوف
  - يضيف للجدول
  - Toast: "تم استيراد X بند"
```

### 📤 تصدير CSV
```typescript
handleExportCSV()
  - يحول الصفوف لـ CSV
  - يُنزّل الملف
  - اسم الملف: annual_plan_YYYY-MM-DD.csv
```

---

## 📊 الإحصائيات المحسوبة

```typescript
stats = {
  completionRate: 20%,      // من completed items
  totalHours: 1,080,        // مجموع الساعات
  totalTasks: 5,            // عدد البنود
  status: 'معتمدة'          // حالة الخطة
}
```

---

## 🎨 نظام الألوان

### البطاقات
```
Progress:    bg-blue-100 text-blue-600
Total Hours: bg-green-100 text-green-600
Tasks:       bg-purple-100 text-purple-600
Status:      bg-emerald-100 text-emerald-600
```

### Badges - المخاطر
```
High:   bg-red-100 text-red-800 border-red-200
Medium: bg-yellow-100 text-yellow-800 border-yellow-200
Low:    bg-green-100 text-green-800 border-green-200
```

### Badges - الحالة
```
Planned:     bg-blue-100 text-blue-800 border-blue-200
In-Progress: bg-purple-100 text-purple-800 border-purple-200
Completed:   bg-green-100 text-green-800 border-green-200
Delayed:     bg-red-100 text-red-800 border-red-200
```

---

## 🧪 السلوك المتوقع

### الفلترة
1. البحث يعمل على: الرمز، العنوان، الإدارة
2. الفلاتر تتراكم (AND logic)
3. الفلاتر محفوظة في localStorage
4. العداد يتحدث: "عرض X من Y بند"

### التصدير/الاستيراد
1. CSV Export: جميع الأعمدة بالعربية
2. CSV Import: يضيف للجدول بدون استبدال
3. Toast notifications للنجاح/الفشل

### الإجراءات
1. View: Modal read-only
2. Edit: Modal editable مع Save/Cancel
3. Delete: تأكيد → حذف → toast
4. جميع الإجراءات محلية (لا تحتاج API حالياً)

---

## 🚀 التشغيل

```bash
# السيرفر يعمل
http://localhost:3001

# الصفحة الرئيسية (الآن تعرض الخطة)
http://localhost:3001/

# صفحة الخطة المخصصة (نفس المحتوى)
http://localhost:3001/rbia/plan
```

---

## 📋 الملخص النهائي

| المكون | الحالة |
|--------|--------|
| **Summary Cards** | ✅ 4 بطاقات |
| **Table Rows** | ✅ 5 صفوف (sample) |
| **Filters** | ✅ 3 dropdowns + search |
| **CSV** | ✅ Import + Export |
| **Actions** | ✅ View + Edit + Delete |
| **Sidebar Steps** | ✅ 11 مراحل |
| **RTL** | ✅ كامل |
| **i18n** | ✅ عربي 100% |
| **Performance** | ✅ useMemo |
| **Accessibility** | ✅ ARIA labels |
| **LocalStorage** | ✅ Filters |

---

## 🎯 النتيجة

```json
{
  "cards": 4,
  "rows": 5,
  "steps": 11,
  "mode": "embed",
  "rtl": true,
  "i18n": "ar",
  "status": "✅ Complete"
}
```

---

**✅ تم التنفيذ بنجاح! الخطة السنوية الآن معروضة على الصفحة الرئيسية والصفحة المخصصة بنفس التصميم.**
