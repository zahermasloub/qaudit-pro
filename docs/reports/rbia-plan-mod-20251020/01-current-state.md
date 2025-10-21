# الوضع الحالي لصفحة الخطة السنوية

## Current State Analysis

**تاريخ التحليل:** 20 أكتوبر 2025  
**النطاق:** تحليل شامل للوضع الراهن لصفحة الخطة السنوية (Annual Plan Screen)

---

## 1. البنية الحالية للكود (Code Structure)

### 1.1 ملفات الواجهة (Frontend Files)

#### A. المكون الرئيسي

**الملف:** `features/annual-plan/AnnualPlan.screen.tsx`

**الوظائف الحالية:**

- عرض الخطة السنوية مع معلومات أساسية (Title, Fiscal Year, Version, Status)
- جدول تفاعلي لمهام التدقيق (Audit Tasks) مع:
  - أعمدة: Code, Title, Department, Risk Level, Type, Quarter, Hours, Status, Actions
  - تصفية حسب: Department, Risk Level, Status
  - بحث نصي (Search)
- بطاقات KPI (4 cards):
  - Plan Status
  - Total Planned Tasks
  - Total Hours
  - Completion Rate
- زر "إنشاء خطة جديدة" يفتح النموذج

**البيانات الحالية:**

```typescript
interface AnnualPlan {
  id: string;
  title: string;
  fiscalYear: number;
  version: string;
  status: string; // draft | under_review | approved | cancelled | completed
  introduction?: string;
  totalAvailableHours?: number;
  plannedTaskHours?: number;
  advisoryHours?: number;
  emergencyHours?: number;
  followUpHours?: number;
  trainingHours?: number;
  administrativeHours?: number;
  estimatedBudget?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditTasks?: AuditTask[];
  approvals?: PlanApproval[];
}

interface AuditTask {
  id: string;
  annualPlanId: string;
  code: string;
  title: string;
  department: string;
  riskLevel: string; // very_high | high | medium | low
  auditType: string; // financial | operational | compliance | it_systems | performance | advisory
  objectiveAndScope?: string;
  plannedQuarter: string; // Q1 | Q2 | Q3 | Q4
  estimatedHours: number;
  leadAuditor?: string;
  status: string; // not_started | in_progress | completed
  createdAt: string;
  updatedAt: string;
}
```

**القيود الفنية:**

- ❌ البيانات الحالية mock data (لا يوجد اتصال فعلي بـ API)
- ❌ لا يوجد pagination للجداول الكبيرة
- ✅ دعم RTL كامل مع `dir={isRTL ? 'rtl' : 'ltr'}`
- ✅ i18n للنصوص العربية/الإنجليزية
- ✅ Responsive design مع Tailwind breakpoints

#### B. نموذج الإدخال

**الملف:** `features/annual-plan/annual-plan.form.tsx`

**الوظائف الحالية:**

- نموذج إدخال مع تبويبين:
  - **Tab 1: البيانات التعريفية (Meta)**
    - عنوان الخطة، السنة المالية، الإصدار، الحالة
    - المنشأة والقسم (Org/Dept selection)
    - ملخص/مقدمة الخطة
  - **Tab 2: موازنة الساعات (Hours Budget)**
    - إجمالي الساعات المتاحة
    - تقسيم الساعات: Planned Tasks, Advisory, Emergency, Follow-up, Training, Administrative
    - حساب تلقائي للساعات المتبقية/العجز

**التحقق (Validation):**

- ✅ Zod schema قوي في `annual-plan.schema.ts`
- ✅ التحقق من عدم تجاوز الساعات المخصصة
- ✅ رسائل خطأ بالعربية

**القيود:**

- ❌ لا يوجد تبويب لاختيار AU items
- ❌ لا يوجد تبويب لبناء Plan Items
- ❌ لا يوجد تبويب للـ Resource Calendar
- ❌ API endpoint `/api/annual-plans` غير موجود حالياً

#### C. الـ Schema والتحقق

**الملف:** `features/annual-plan/annual-plan.schema.ts`

**الـ Schemas الحالية:**

1. `annualPlanSchema` - للخطة الرئيسية
2. `auditTaskSchema` - لمهام التدقيق
3. `planApprovalSchema` - لموافقات الخطة

**الدوال المساعدة:**

- `sumAlloc(v)` - حساب مجموع ساعات التخصيص

---

## 2. نموذج البيانات الحالي (Database Schema)

### 2.1 الجداول الموجودة في `phase3_schema.sql`

**الجداول ذات الصلة:**

```sql
-- جدول المخاطر (عام)
CREATE TABLE risks (
  risk_id BIGSERIAL PRIMARY KEY,
  org_id INT REFERENCES orgs(org_id),
  dept_id INT REFERENCES depts(dept_id),
  title TEXT NOT NULL,
  description TEXT,
  inherent_score SMALLINT CHECK(inherent_score BETWEEN 1 AND 25),
  residual_score SMALLINT CHECK(residual_score BETWEEN 1 AND 25),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول الضوابط
CREATE TABLE controls (
  control_id BIGSERIAL PRIMARY KEY,
  org_id INT,
  dept_id INT,
  title TEXT NOT NULL,
  description TEXT,
  control_type TEXT CHECK(control_type IN ('preventive','detective','corrective')),
  frequency TEXT,
  owner TEXT,
  created_at TIMESTAMPTZ
);

-- جداول موجودة لكن غير مرتبطة بالخطة السنوية:
- audits (للتدقيق العام)
- engagements (للمهام)
- scopes, test_procedures, samples (للعمل الميداني)
- findings, recommendations, actions (للنتائج)
```

**الجداول المفقودة:**

- ❌ `audit_universe` - كون التدقيق
- ❌ `risk_criteria` - معايير تقييم المخاطر
- ❌ `risk_assessments` - تقييمات المخاطر لكل AU item
- ❌ `annual_plans` - الخطة السنوية (البيانات الأساسية)
- ❌ `annual_plan_items` - عناصر الخطة (Plan Items)
- ❌ `resource_capacity` - سعة الموارد
- ❌ `plan_approvals` - موافقات الخطة
- ❌ `plan_baselines` - نقاط Baseline
- ❌ `change_requests` - طلبات التعديل

---

## 3. نقاط API (API Endpoints)

### 3.1 الوضع الحالي

**لا يوجد أي endpoint للخطة السنوية حالياً!**

المتوقع من الكود الموجود:

```typescript
// في annual-plan.form.tsx
const r = await fetch('/api/annual-plans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(v),
});
```

لكن:

- ❌ لا يوجد ملف `/api/annual-plans/route.ts`
- ❌ لا يوجد `/api/audit-universe/*`
- ❌ لا يوجد `/api/risk/*`
- ❌ لا يوجد `/api/plan/*`

---

## 4. التهيئة والمكتبات (Configuration & Libraries)

### 4.1 التقنيات المستخدمة

**Frontend Stack:**

- ⚛️ Next.js 14.2.5 (App Router)
- ⚛️ React 18.2.0
- 🎨 Tailwind CSS 3.4.10 + tailwindcss-rtl
- 🎨 shadcn/ui components (مخصص)
- 📝 React Hook Form 7.52.0
- ✅ Zod 3.23.8 للتحقق
- 📊 Recharts 3.3.0 (للرسوم البيانية)
- 📅 date-fns 4.1.0

**Backend/Database:**

- 🗄️ PostgreSQL (version 18 مفترض من `install_pg18.ps1`)
- 🔧 Prisma 5.19.0 (لكن لا يوجد schema واضح للخطة السنوية)

**قيود الأسلوب (Linting & Formatting):**

- ESLint 9.38.0 مع config custom
- Prettier 3.6.2
- TypeScript 5.4.2 (strict mode)

### 4.2 ملف التهيئة `tailwind.config.ts`

**الألوان المخصصة:**

- Primary: Blue (افتراضي)
- دعم Dark Mode (class-based)
- RTL plugin مفعّل

**الخطوط:**

- `@fontsource/tajawal` للعربية (مستخدم في globals.css)

---

## 5. التكامل الحالي مع الوحدات الأخرى

### 5.1 التكامل مع AppShell

**الملف:** `app/(app)/shell/AppShell.tsx`

```typescript
// تسجيل المسار
{ key: 'annualPlan', icon: ClipboardList },

// الصلاحيات
annualPlan: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],

// الإجراءات
annualPlan: [
  { action: 'createAnnualPlan', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' },
],

// الرندر
{route === 'annualPlan' && <AnnualPlanScreen locale={locale} />}
```

✅ **الصفحة مُدمجة بالكامل في AppShell**

### 5.2 ربط محتمل مع وحدات أخرى

**الوحدات التي يجب الربط معها:**

1. **Dashboard** (`app/(app)/dashboard`)
   - عرض KPIs من الخطة السنوية
   - عرض نسبة تنفيذ الخطة

2. **Fieldwork/Engagements** (`app/(app)/fieldwork`)
   - توليد Engagements من Plan Items
   - ربط الـ Engagement بـ AU_ID و Risk_Score

3. **Admin** (`app/(app)/admin`)
   - إدارة Audit Universe من Admin Panel
   - إدارة Risk Criteria Templates
   - إعدادات Approval Workflow

4. **Analytics** (غير موجود حالياً)
   - تحليلات متقدمة لتنفيذ الخطة
   - مقارنة الخطط السنوية عبر السنوات

---

## 6. نقاط القوة (Strengths)

### 6.1 الواجهة (UI/UX)

- ✅ **تصميم نظيف واحترافي** مع Tailwind
- ✅ **دعم RTL كامل** للعربية
- ✅ **i18n متكامل** مع دوال getLabel() للترجمة
- ✅ **Responsive** لجميع الأجهزة
- ✅ **KPI cards واضحة** لعرض الإحصائيات
- ✅ **جداول تفاعلية** مع تصفية وبحث
- ✅ **نموذج إدخال منظم** مع tabs

### 6.2 البنية الأساسية (Architecture)

- ✅ **فصل واضح** بين Screen/Form/Schema
- ✅ **TypeScript strict** مع types واضحة
- ✅ **Zod validation** قوي
- ✅ **React Hook Form** للأداء الأفضل
- ✅ **Dynamic import** للنموذج (تحسين SSR)

### 6.3 التوافق مع المعايير (Standards)

- ✅ **Accessibility basics** (aria-label, semantic HTML)
- ✅ **SEO-friendly** (Next.js App Router)
- ✅ **Code style consistency** (ESLint + Prettier)

---

## 7. نقاط الضعف والفجوات (Weaknesses & Gaps)

### 7.1 فجوات البيانات (Data Gaps)

- ❌ **لا يوجد Audit Universe model** في القاعدة
- ❌ **لا يوجد Risk Assessment model** منفصل
- ❌ **لا يوجد جدول للـ annual_plans** في القاعدة
- ❌ **لا يوجد ربط بين Plan Items و AU**
- ❌ **لا يوجد نموذج Baseline/Versioning**
- ❌ **لا يوجد Change Request model**

### 7.2 فجوات الوظائف (Functional Gaps)

- ❌ **لا يوجد محرك لحساب Risk Scores**
- ❌ **لا يوجد Heatmap visualization**
- ❌ **لا يوجد Auto-prioritization** للمهام حسب المخاطر
- ❌ **لا يوجد Resource Calendar** لتوزيع الساعات
- ❌ **لا يوجد Approval Workflow** مع حالات واضحة
- ❌ **لا يوجد Baseline mechanism** لقفل الخطة
- ❌ **لا يوجد Generate Engagements** تلقائياً

### 7.3 فجوات التكامل (Integration Gaps)

- ❌ **لا API endpoints** للخطة السنوية
- ❌ **لا ربط مع Engagements** عند التوليد
- ❌ **لا ربط مع Analytics** لتتبع التنفيذ
- ❌ **لا ربط مع Admin** لإدارة AU/Criteria

### 7.4 فجوات الأداء (Performance Gaps)

- ⚠️ **لا pagination** للجداول الكبيرة
- ⚠️ **لا lazy loading** للبيانات
- ⚠️ **لا caching** للـ Heatmap data
- ⚠️ **لا background jobs** للعمليات الثقيلة (Generate Engagements)

---

## 8. افتراضات فنية (Technical Assumptions)

### 8.1 البيئة (Environment)

- ✅ PostgreSQL 18+ مع schema `core`
- ✅ Next.js deployment على Node.js 20+
- ✅ متصفحات حديثة (Chrome 100+, Safari 15+, Edge 100+)

### 8.2 الأمان (Security)

- ✅ NextAuth.js مُفعّل للـ Authentication
- ✅ Role-based access control (RBAC) موجود في AppShell
- ⚠️ API endpoints يجب حمايتها بـ middleware

### 8.3 الأداء (Performance)

- ⚠️ الهدف: P95 ≤ 300ms لتحميل الصفحة
- ⚠️ الهدف: ≤ 5 ثوان لتوليد Engagements من 50 item

---

## 9. الأخطاء الظاهرة (Visible Issues)

### 9.1 أخطاء وقت التشغيل (Runtime Errors)

- ⚠️ **404 Error** عند محاولة حفظ الخطة (API endpoint غير موجود)
- ⚠️ **Console Warning** من Dynamic import (suppressHydrationWarning قد يكون مطلوب)

### 9.2 أخطاء Linting (حُلّت جزئياً)

- ✅ ESLint يمر بنجاح على ملفات الـ Annual Plan
- ✅ Prettier formatting صحيح

---

## 10. الخلاصة (Summary)

### نقاط القوة الرئيسية:

1. ✅ واجهة مستخدم احترافية وجاهزة للاستخدام
2. ✅ دعم كامل للعربية وRTL
3. ✅ بنية كود نظيفة ومنظمة
4. ✅ تكامل ممتاز مع AppShell

### الفجوات الحرجة:

1. ❌ **لا يوجد نموذج بيانات كامل** في القاعدة
2. ❌ **لا يوجد API layer** للتفاعل مع البيانات
3. ❌ **لا يوجد محرك تقييم مخاطر**
4. ❌ **لا يوجد سير عمل موافقات**

### الخطوات التالية:

➡️ **انتقل إلى:** `02-gap-analysis-vs-requirements.md` لتحليل تفصيلي للفجوات مقابل المتطلبات المطلوبة.

---

**تم المراجعة:** 20 أكتوبر 2025  
**المحلل:** GitHub Copilot  
**النسخة:** 1.0
