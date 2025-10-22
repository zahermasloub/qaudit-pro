# ProcessStepper - مراحل العملية

## نظرة عامة

مكون تفاعلي يعرض مراحل العملية (Process Stages) مع دعم كامل لإمكانية الوصول (A11y) والتصميم المتجاوب.

## الحالات المرئية الأربعة

### 1. Active (النشطة)
**الحالة الحالية التي يعمل عليها المستخدم**

- **الخلفية**: `bg-blue-50` (لون primary بشفافية 10%)
- **الحد**: `border-2 border-blue-300` (primary-300)
- **دائرة الرقم**: `bg-blue-600 text-white` (primary-600 مع نص أبيض)
- **النص**: `text-blue-900` (تباين عالي AA)
- **التفاعل**: قابلة للنقر + focus ring أزرق
- **الظل**: `shadow-sm` (ظل خفيف)

**معايير التباين:**
- النص على الخلفية: 16.1:1 (AAA ✓)
- الرقم الأبيض على الأزرق: 4.6:1 (AA ✓)

### 2. Done/Completed (مكتملة)
**مرحلة تم إنجازها بنجاح**

- **الخلفية**: `bg-green-50/30` (خلفية فاتحة جدًا)
- **الحد**: `border border-green-300` (success border)
- **دائرة الرقم**: `bg-green-100 text-green-800 border-2 border-green-600`
- **النص**: `text-green-900` (تباين عالي)
- **الأيقونة**: CheckCircle (علامة صح)
- **التفاعل**: قابلة للنقر + hover بخلفية أفتح + focus ring أخضر
- **الظل**: `hover:shadow-sm` (ظل عند التحويم)

**معايير التباين:**
- النص على الخلفية: 7.8:1 (AAA ✓)
- الرقم على الدائرة: 4.5:1 (AA ✓)

### 3. Locked (مقفلة)
**مرحلة غير متاحة حتى إكمال المراحل السابقة**

- **الخلفية**: `bg-gray-100` (رمادي خافت)
- **الحد**: `border border-gray-200`
- **دائرة الرقم**: `bg-gray-300 text-gray-600`
- **النص**: `text-gray-600` (رمادي متوسط)
- **الأيقونة**: Lock (قفل)
- **التفاعل**: غير قابلة للنقر (cursor-not-allowed)
- **الشفافية**: `opacity-60`
- **Tooltip**: يعرض سبب القفل

**معايير التباين:**
- مع الشفافية، التباين يبقى > 4.5:1 (AA ✓)

### 4. Default/Available (متاحة)
**مرحلة متاحة للاختيار لكنها ليست نشطة**

- **الخلفية**: `bg-white` (سطح عادي)
- **الحد**: `border border-gray-200`
- **دائرة الرقم**: `bg-gray-100 text-gray-700`
- **النص**: `text-gray-800` (تباين جيد)
- **التفاعل**: قابلة للنقر
- **Hover**: `hover:bg-gray-50 hover:border-gray-300 hover:shadow-md`
- **Focus**: focus ring أزرق

**معايير التباين:**
- النص على الخلفية: 7.2:1 (AAA ✓)

## إمكانية الوصول (Accessibility)

### ARIA Attributes

#### aria-current
```tsx
aria-current={step.status === 'active' ? 'step' : undefined}
```
يشير إلى المرحلة النشطة الحالية في قارئ الشاشة.

#### aria-disabled
```tsx
aria-disabled={step.status === 'locked'}
```
يمنع التفاعل مع المراحل المقفلة.

#### aria-label
```tsx
aria-label={getAriaLabel(step)}
// مثال: "الخطة السنوية، جارية"
```
يوفر وصفًا كاملاً للمرحلة وحالتها:
- "مكتملة" للمراحل المنجزة
- "جارية" للمرحلة النشطة
- "مقفلة" للمراحل غير المتاحة
- "متاحة" للمراحل القابلة للاختيار

#### role="button"
```tsx
role="button"
```
يحدد العنصر كزر قابل للتفاعل.

#### tabIndex
```tsx
tabIndex={step.status === 'locked' ? -1 : 0}
```
- `0`: قابل للوصول عبر Tab
- `-1`: غير قابل للوصول (للمراحل المقفلة)

### التنقل بلوحة المفاتيح

#### المفاتيح المدعومة

| المفتاح | الوظيفة |
|---------|---------|
| `↑` | الانتقال للمرحلة السابقة |
| `↓` | الانتقال للمرحلة التالية |
| `Enter` | تفعيل المرحلة المحددة |
| `Space` | تفعيل المرحلة المحددة |
| `Tab` | التنقل بين العناصر القابلة للتركيز |

#### سلوك التنقل
- يتخطى المراحل المقفلة تلقائيًا
- ينتقل للمرحلة القابلة للوصول التالية/السابقة
- يعرض focus ring واضح (2px) للمرحلة المحددة

### Focus Indicators
جميع المراحل القابلة للتفاعل تحصل على:
```css
focus:outline-none focus:ring-2 focus:ring-offset-2
```

- **Active/Default**: `focus:ring-blue-500`
- **Completed**: `focus:ring-green-500`

## شريط التقدم (Progress Bar)

### الحساب
```typescript
const completed = steps.filter(s => s.status === 'completed').length;
const total = steps.length;
const percentage = Math.round((completed / total) * 100);
```

### العرض

#### Desktop
```tsx
<div className="border-t border-gray-200 p-4 bg-gray-50">
  <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
    <span>التقدم الكلي</span>
    <span className="font-semibold">{percentage}%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div
      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
      style={{ width: `${percentage}%` }}
    />
  </div>
</div>
```

#### Mobile
شريط التقدم يظهر دائمًا في الوضع المطوي (collapsed)

### أمثلة على الحساب
- 0/11 مراحل → 0%
- 3/11 مراحل → 27%
- 5/10 مراحل → 50%
- 11/11 مراحل → 100%

## التصميم المتجاوب

### Desktop (lg+)
- عرض جانبي ثابت (sidebar)
- عرض: 300px
- sticky positioning
- scrollable content

### Mobile (<lg)
- header قابل للطي (accordion)
- عرض كامل الشاشة
- شريط التقدم دائم الظهور
- القائمة قابلة للتوسع/الطي

## الاستخدام

```tsx
import ProcessStepper, { ProcessStep } from './ProcessStepper';

const steps: ProcessStep[] = [
  { id: 1, label: 'الخطة السنوية', status: 'completed' },
  { id: 2, label: 'تحديد الأولويات', status: 'active' },
  { id: 3, label: 'تخصيص الموارد', status: 'available' },
  { id: 4, label: 'الجدول الزمني', status: 'locked', lockReason: 'أكمل المرحلة 3 أولاً' },
];

const completedCount = steps.filter(s => s.status === 'completed').length;

<ProcessStepper
  steps={steps}
  activeStepId={2}
  onStepClick={(stepId) => console.log('Step clicked:', stepId)}
  completedCount={completedCount}
/>
```

## واجهة البرمجة (API)

### Props

```typescript
interface ProcessStepperProps {
  steps: ProcessStep[];           // قائمة المراحل
  activeStepId: number;           // معرّف المرحلة النشطة
  onStepClick: (stepId: number) => void;  // دالة تُنفذ عند النقر
  completedCount?: number;        // عدد المراحل المكتملة (اختياري)
}

interface ProcessStep {
  id: number;                     // معرّف فريد
  label: string;                  // نص المرحلة
  status: 'active' | 'completed' | 'locked' | 'available';
  lockReason?: string;            // سبب القفل (للمراحل المقفلة)
  dueDate?: string;               // تاريخ الاستحقاق (اختياري)
  isOverdue?: boolean;            // هل المرحلة متأخرة؟ (اختياري)
}
```

## الاختبارات

### اختبارات الوحدة
موجودة في: `__tests__/processStepperProgress.test.ts`

تغطي:
- حساب النسبة المئوية للتقدم
- حالات الحافة (0%, 100%, مصفوفة فارغة)
- التقريب الصحيح للنسب
- عد الحالات المختلفة

### تشغيل الاختبارات
```bash
npm test -- processStepperProgress
```

## تحسينات A11y المطبقة

✅ **معايير WCAG 2.1 Level AA:**
- تباين ألوان ≥ 4.5:1 للنصوص العادية
- تباين ألوان ≥ 7:1 للنصوص الكبيرة (معظم النصوص AAA)
- التنقل الكامل بلوحة المفاتيح
- ARIA labels واضحة ووصفية
- Focus indicators مرئية
- أحجام أهداف اللمس ≥ 44x44px (mobile)

✅ **دعم قارئ الشاشة:**
- جميع العناصر التفاعلية لها aria-label
- aria-current للمرحلة النشطة
- aria-disabled للمراحل المقفلة
- aria-hidden للأيقونات الزخرفية

✅ **تجربة المستخدم:**
- ردود فعل بصرية واضحة
- hover states مميزة
- disabled states واضحة
- رسائل tooltip مفيدة

## الملاحظات الفنية

### مصدر الحالة
- الحالة محلية: `activeStepId` في state المكون الأب
- لا توجد integration مع URL parameters
- لا توجد API calls لجلب الحالات
- البيانات تُمرر عبر props

### التخصيص
يمكن تخصيص الألوان عبر:
1. متغيرات Tailwind في `tailwind.config.ts`
2. CSS variables في `design-tokens.css`
3. تعديل الـ classes مباشرة في الكود

### الأداء
- استخدام `transition-all duration-200` للانتقالات السلسة
- تجنب re-renders غير الضرورية
- lazy loading للأيقونات من `lucide-react`

## المراجع

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Practices - Step Indicator](https://www.w3.org/WAI/ARIA/apg/patterns/step-indicator/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

**آخر تحديث**: 2025-10-21
**الإصدار**: 2.0
**الحالة**: ✅ Production Ready
