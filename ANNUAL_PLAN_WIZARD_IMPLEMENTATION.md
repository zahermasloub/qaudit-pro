# 📋 معالج خطة التدقيق السنوية (RBIA) - دليل التنفيذ

**التاريخ:** 21 أكتوبر 2025  
**الحالة:** 🔄 قيد التنفيذ (المرحلة 1 من 3)  
**Git Commit:** `8991dd2`

---

## ✅ ما تم إنجازه (المرحلة 1)

### 1. Schema قاعدة البيانات ✅
**الملف:** `prisma/migrations/create_annual_plans.sql`

#### الجداول:
- ✅ `core.annual_plans` - الخطط السنوية
- ✅ `core.plan_tasks` - المهام ضمن كل خطة
- ✅ Indexes لتحسين الأداء
- ✅ Triggers للتحديثات التلقائية
- ✅ RLS Policies للأمان
- ✅ View: `vw_plan_overview` للتقارير

### 2. Validation Schemas ✅
**الملف:** `lib/schemas/annual-plan.schema.ts`

#### المزايا:
- ✅ Zod schemas للتحقق من البيانات
- ✅ رسائل خطأ بالعربية واضحة
- ✅ TypeScript types مستخرجة تلقائياً
- ✅ Label maps لعرض القوائم
- ✅ Helper functions

### 3. المكون الرئيسي ✅
**الملف:** `features/annual-plan/AnnualPlanWizard.tsx`

#### المزايا:
- ✅ معالج بمرحلتين مع progress bar
- ✅ حفظ كمسودة تلقائي
- ✅ تحذير عند الإغلاق بدون حفظ
- ✅ RTL support كامل
- ✅ Responsive (960-1040px)

---

## 🔄 المتطلبات الباقية (المرحلة 2)

### 1. نموذج المرحلة الأولى
**الملف المطلوب:** `features/annual-plan/AnnualPlanStep1Form.tsx`

#### الحقول المطلوبة:

```tsx
interface Step1FormProps {
  initialData?: AnnualPlanStep1;
  onComplete: (data: AnnualPlanStep1) => void;
  onSaveDraft: () => void;
  isLoading: boolean;
}

// الحقول الإلزامية:
1. plan_ref (نص) - الرقم المرجعي
   - تحقق: 4-20 حرف، A-Za-z0-9-
   - مثال: ADP-2025
   
2. fiscal_year (رقم) - السنة المالية
   - تحقق: 2000-2100
   - مثال: 2025
   
3. prepared_date (تاريخ) - تاريخ الإعداد
   - تحقق: <= اليوم، ضمن السنة المالية
   - صيغة: YYYY-MM-DD
   
4. approved_by (قائمة) - الجهة المعتمدة
   - خيارات: مجلس الإدارة، اللجنة العليا، إدارة التدقيق...

// الحقول الاختيارية:
5. prepared_by - اسم المعد (auto-fill من المستخدم)
6. standards - معايير الإعداد (textarea)
7. methodology - المنهجية (textarea)
8. objectives - الأهداف (textarea)
9. risk_sources - مصادر تقييم المخاطر (checkboxes متعددة)
```

#### المتطلبات الوظيفية:
- ✅ React Hook Form + Zod validation
- ✅ رسائل خطأ عربية تحت كل حقل
- ✅ تحقق فوري (real-time validation)
- ✅ زر "التالي" معطل حتى استيفاء الحقول الإلزامية
- ✅ زر "حفظ كمسودة" متاح دائماً
- ✅ تنسيق RTL مع labels على اليمين
- ✅ Responsive للموبايل

### 2. نموذج المرحلة الثانية
**الملف المطلوب:** `features/annual-plan/AnnualPlanStep2Form.tsx`

#### الميزات المطلوبة:

```tsx
interface Step2FormProps {
  planId: number;
  initialTasks: PlanTask[];
  onComplete: (tasks: PlanTask[]) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onTasksChange: (tasks: PlanTask[]) => void;
  isLoading: boolean;
}

// جدول/قائمة المهام:
- عرض جدول بجميع المهام المضافة
- أعمدة: الرقم التسلسلي، العنوان، الإدارة، نوع المهمة، 
         الخطورة، الأولوية، الربع، المدة، إجراءات

// أزرار:
1. "إضافة مهمة" - يفتح نموذج إضافة
2. "تعديل" - لكل مهمة
3. "حذف" - لكل مهمة
4. "نسخ" - ينسخ بيانات المهمة لإنشاء جديدة
```

#### نموذج المهمة (Task Form):

```tsx
// الحقول (جميعها إلزامية ماعدا task_ref, assignee, notes):
1. seq_no - الرقم التسلسلي (auto-increment)
2. task_ref - الرقم المرجعي للمهمة (اختياري)
3. dept_id - الإدارة/القسم (select from core.depts)
4. title - اسم المهمة (نص)
5. task_type - نوع المهمة (select)
6. risk_level - درجة الخطورة (select)
7. impact_level - تقييم الأثر (select)
8. priority - الأولوية (select)
9. scheduled_quarter - توقيت التنفيذ (Q1/Q2/Q3/Q4)
10. duration_days - المدة التقديرية (رقم ≥1)
11. assignee - المدقق المسؤول (اختياري)
12. notes - تعليقات (textarea اختياري)
```

#### المتطلبات الوظيفية:
- ✅ إدارة كاملة للمهام (CRUD)
- ✅ Validation لكل حقل
- ✅ Auto-save عند كل تغيير
- ✅ حالة فارغة: "أضف أول مهمة" مع زر كبير
- ✅ تحذير: "يلزم مهمة واحدة على الأقل" عند محاولة الإنهاء
- ✅ زر "السابق" للعودة للمرحلة 1
- ✅ زر "إنهاء وحفظ" (معطل إذا لا توجد مهام)

### 3. API Routes
**الملفات المطلوبة:**

#### `app/api/annual-plans/route.ts`
```tsx
// POST - Create new plan
// GET - List all plans (with filters)
```

#### `app/api/annual-plans/[id]/route.ts`
```tsx
// GET - Get plan by ID with tasks
// PUT - Update plan
// DELETE - Delete plan (draft only)
// PATCH - Update plan status
```

#### `app/api/annual-plans/[id]/tasks/route.ts`
```tsx
// POST - Add task to plan
// GET - List tasks for plan
```

#### `app/api/annual-plans/[id]/tasks/[taskId]/route.ts`
```tsx
// PUT - Update task
// DELETE - Delete task
```

### 4. تكامل مع الصفحة الرئيسية
**تعديل:** `app/(app)/rbia/plan/RbiaPlanView.tsx`

```tsx
// إضافة:
const [showWizard, setShowWizard] = useState(false);

// استبدال زر "إنشاء خطة جديدة":
<Button onClick={() => setShowWizard(true)}>
  <Plus /> إنشاء خطة جديدة
</Button>

// إضافة المعالج:
<AnnualPlanWizard
  open={showWizard}
  onClose={() => setShowWizard(false)}
  onSuccess={(planId) => {
    // Refresh plans list
    loadPlanData();
    // Navigate to plan summary
    toast.success('تم إنشاء الخطة بنجاح!');
  }}
/>
```

---

## 🎯 معايير القبول (Acceptance Criteria)

### وظيفي:
- ⏳ المعالج يظهر عند الضغط "إنشاء خطة جديدة"
- ⏳ لا يمكن الانتقال للمرحلة 2 قبل استكمال الحقول الإلزامية
- ⏳ "حفظ كمسودة" يعمل في أي وقت
- ⏳ يمكن إضافة/تعديل/حذف مهام في المرحلة 2
- ⏳ لا يمكن إنهاء وحفظ بدون مهمة واحدة على الأقل
- ⏳ عند النجاح: انتقال لملخص الخطة + شارة "تم الحفظ"

### تقني:
- ✅ سجلات `annual_plans` و `plan_tasks` تُنشأ بشكل صحيح
- ✅ العلاقات والفهارس موجودة
- ✅ RLS policies تعمل بشكل صحيح
- ⏳ كل حدث يُسجل في `audit_logs`
- ⏳ API endpoints تعمل مع proper error handling

### UI/UX:
- ⏳ RTL support كامل
- ⏳ Responsive: 1440/1280/1024/768/480px
- ⏳ رسائل خطأ عربية واضحة
- ⏳ تحقق فوري (real-time)
- ⏳ حالة فارغة مفهومة
- ⏳ تحذيرات عند محاولة الإغلاق بدون حفظ

---

## 📦 الملفات المطلوبة (To-Do)

### مكونات React:
1. ✅ `AnnualPlanWizard.tsx` - المعالج الرئيسي
2. ⏳ `AnnualPlanStep1Form.tsx` - نموذج المرحلة 1
3. ⏳ `AnnualPlanStep2Form.tsx` - نموذج المرحلة 2
4. ⏳ `TaskForm.tsx` - نموذج المهمة الفرعي
5. ⏳ `TasksList.tsx` - قائمة المهام مع إجراءات

### API Routes:
6. ⏳ `app/api/annual-plans/route.ts`
7. ⏳ `app/api/annual-plans/[id]/route.ts`
8. ⏳ `app/api/annual-plans/[id]/tasks/route.ts`
9. ⏳ `app/api/annual-plans/[id]/tasks/[taskId]/route.ts`

### Schema:
10. ✅ `lib/schemas/annual-plan.schema.ts`
11. ✅ `prisma/migrations/create_annual_plans.sql`

### تكامل:
12. ⏳ تعديل `RbiaPlanView.tsx` لإضافة المعالج
13. ⏳ إنشاء `audit_logs` entries

---

## 🔧 خطوات التنفيذ التالية

### المرحلة 2 (التالية):
1. إنشاء `AnnualPlanStep1Form.tsx` مع جميع الحقول
2. إنشاء `AnnualPlanStep2Form.tsx` مع إدارة المهام
3. إنشاء `TaskForm.tsx` كـ modal/drawer منفصل
4. إنشاء API routes الأساسية

### المرحلة 3 (الأخيرة):
5. تكامل مع `RbiaPlanView.tsx`
6. Audit logging
7. اختبار شامل للتدفق الكامل
8. Responsive testing على جميع الأحجام

---

## 💡 ملاحظات تقنية

### Database:
- استخدام transactions عند إنشاء خطة مع مهام
- Cascade delete: حذف الخطة يحذف مهامها تلقائياً
- RLS: فقط منشئ الخطة يمكنه التعديل/الحذف

### Validation:
- Client-side: Zod schemas
- Server-side: نفس Zod schemas للأمان
- Unique constraint على `plan_ref`

### UX:
- Auto-save كل 30 ثانية أو عند التغيير
- Loading states واضحة
- Error boundaries للأخطاء غير المتوقعة

---

## 📊 التقدم الحالي

**المرحلة 1:** ✅ 100% (Schema + Wizard Shell + Validation)  
**المرحلة 2:** ⏳ 0% (Forms + API)  
**المرحلة 3:** ⏳ 0% (Integration + Testing)

**الإجمالي:** 🔵 33% مكتمل

---

**آخر تحديث:** 21 أكتوبر 2025 - Commit `8991dd2`
