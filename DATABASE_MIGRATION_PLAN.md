# 🔧 خطوات تطبيق Schema الجديد للخطة السنوية

**التاريخ:** 21 أكتوبر 2025  
**الحالة:** ⚠️ معلق - يحتاج تنفيذ يدوي

---

## ⚠️ الوضع الحالي

### ما هو موجود:
- ✅ **SQL Migration:** `prisma/migrations/create_annual_plans.sql` - جاهز
- ✅ **UI Form:** CreatePlanWizard Step 1 - محدّث بجميع الحقول
- ❌ **Database:** لم يتم تطبيق الـ schema الجديد بعد
- ❌ **Prisma Schema:** لا يزال يستخدم الجدول القديم

### الجدول القديم (public.annual_plans):
```prisma
model AnnualPlan {
  id                    String
  title                 String
  fiscalYear            Int
  version               String
  status                AnnualPlanStatus
  // ... الخ
}
```

### الجدول الجديد (core.annual_plans):
```sql
CREATE TABLE core.annual_plans (
  plan_id BIGSERIAL PRIMARY KEY,
  plan_ref TEXT UNIQUE NOT NULL,
  fiscal_year INT NOT NULL,
  prepared_date DATE NOT NULL,
  approved_by TEXT,
  prepared_by BIGINT,
  standards TEXT,
  methodology TEXT,
  objectives TEXT,
  risk_sources TEXT[],
  status TEXT DEFAULT 'draft',
  // ... الخ
)
```

---

## 📋 خطوات التطبيق

### الخيار 1: تطبيق المخطط الجديد (موصى به)

#### 1. تطبيق الـ SQL Migration:
```bash
# الاتصال بقاعدة البيانات
psql -U postgres -d your_database_name

# تطبيق الـ migration
\i prisma/migrations/create_annual_plans.sql
```

أو عبر PowerShell:
```powershell
# قراءة وتطبيق الملف
$sql = Get-Content "prisma\migrations\create_annual_plans.sql" -Raw
# ثم تنفيذه في قاعدة البيانات
```

#### 2. تحديث Prisma Schema:
يجب استبدال model AnnualPlan في `prisma/schema.prisma`:

```prisma
model AnnualPlan {
  planId            BigInt    @id @default(autoincrement()) @map("plan_id")
  
  // Plan Identification
  planRef           String    @unique @map("plan_ref")
  fiscalYear        Int       @map("fiscal_year")
  preparedDate      DateTime  @map("prepared_date") @db.Date
  
  // Approval and Authorship
  approvedBy        String?   @map("approved_by")
  preparedBy        BigInt?   @map("prepared_by")
  
  // Planning Methodology
  standards         String?
  methodology       String?
  objectives        String?
  riskSources       String[]  @map("risk_sources")
  
  // Status
  status            String    @default("draft")
  
  // Audit Trail
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  createdBy         BigInt?   @map("created_by")
  
  // Relations
  tasks             PlanTask[] @relation("PlanToTasks")
  
  @@map("annual_plans")
  @@schema("core")
}

model PlanTask {
  taskId            BigInt    @id @default(autoincrement()) @map("task_id")
  planId            BigInt    @map("plan_id")
  
  seqNo             Int       @map("seq_no")
  taskRef           String?   @map("task_ref")
  deptId            BigInt?   @map("dept_id")
  title             String
  taskType          String    @map("task_type")
  riskLevel         String    @map("risk_level")
  impactLevel       String    @map("impact_level")
  priority          String
  scheduledQuarter  String    @map("scheduled_quarter")
  durationDays      Int       @map("duration_days")
  assignee          String?
  notes             String?
  
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")
  
  // Relations
  plan              AnnualPlan @relation("PlanToTasks", fields: [planId], references: [planId], onDelete: Cascade)
  
  @@unique([planId, seqNo])
  @@map("plan_tasks")
  @@schema("core")
}
```

#### 3. تحديث Prisma Client:
```bash
npx prisma generate
```

#### 4. تحديث API Routes:
يجب تحديث `/api/plan/route.ts` ليتوافق مع الحقول الجديدة:

```typescript
// قبل:
const plan = await prisma.annualPlan.create({
  data: {
    title: `خطة ${year}`,
    fiscalYear: year,
    version,
    // ...
  }
});

// بعد:
const plan = await prisma.annualPlan.create({
  data: {
    planRef,
    fiscalYear: year,
    preparedDate: new Date(preparedDate),
    approvedBy,
    preparedBy,
    standards,
    methodology,
    objectives,
    riskSources,
    // ...
  }
});
```

---

### الخيار 2: تحديث الجدول الحالي (أسرع)

إذا كنت تريد الاحتفاظ بالبيانات الموجودة:

```sql
-- إضافة الأعمدة الجديدة
ALTER TABLE public.annual_plans 
ADD COLUMN plan_ref TEXT UNIQUE,
ADD COLUMN prepared_date DATE,
ADD COLUMN approved_by TEXT,
ADD COLUMN prepared_by TEXT,
ADD COLUMN standards TEXT,
ADD COLUMN methodology TEXT,
ADD COLUMN objectives TEXT,
ADD COLUMN risk_sources TEXT[];

-- تحديث البيانات الموجودة
UPDATE public.annual_plans
SET plan_ref = 'ADP-' || fiscal_year || '-' || id,
    prepared_date = CURRENT_DATE
WHERE plan_ref IS NULL;

-- إضافة constraint
ALTER TABLE public.annual_plans
ALTER COLUMN plan_ref SET NOT NULL;
```

ثم تحديث Prisma schema:
```prisma
model AnnualPlan {
  // ... الحقول الموجودة
  
  // الحقول الجديدة
  planRef           String?   @map("plan_ref")
  preparedDate      DateTime? @map("prepared_date") @db.Date
  approvedBy        String?   @map("approved_by")
  preparedBy        String?   @map("prepared_by")
  standards         String?
  methodology       String?
  objectives        String?
  riskSources       String[]  @default([]) @map("risk_sources")
  
  // ... باقي الحقول
}
```

---

## 🧪 الاختبار

بعد التطبيق، تحقق من:

### 1. قاعدة البيانات:
```sql
-- فحص الجدول
\d core.annual_plans

-- فحص البيانات
SELECT plan_ref, fiscal_year, prepared_date, approved_by 
FROM core.annual_plans 
LIMIT 5;
```

### 2. Prisma:
```bash
npx prisma studio
# افتح model AnnualPlan وتأكد من ظهور الحقول الجديدة
```

### 3. API:
```bash
# اختبار إنشاء خطة جديدة
curl -X POST http://localhost:3001/api/plan \
  -H "Content-Type: application/json" \
  -d '{
    "plan_ref": "ADP-2025",
    "year": 2025,
    "prepared_date": "2025-10-21",
    "approved_by": "board",
    "standards": "IIA 2017",
    "methodology": "Risk-based approach",
    "objectives": "Enhance controls"
  }'
```

### 4. UI:
```
1. افتح http://localhost:3001/rbia/plan
2. اضغط "إنشاء خطة جديدة"
3. املأ جميع الحقول الجديدة
4. اضغط "إنشاء الخطة"
5. تحقق من حفظ البيانات في قاعدة البيانات
```

---

## ⚠️ تحذيرات

1. **Backup أولاً:**
   ```bash
   pg_dump -U postgres your_db > backup_$(date +%Y%m%d).sql
   ```

2. **البيانات الموجودة:**
   - الخيار 1 (core.annual_plans): ستفقد البيانات القديمة
   - الخيار 2 (تحديث public.annual_plans): ستحتفظ بالبيانات

3. **الـ Relations:**
   - تأكد من تحديث العلاقات في Prisma schema
   - تأكد من تحديث API routes

---

## 📊 ملخص الحالة

| العنصر | الحالة | الإجراء المطلوب |
|--------|---------|-----------------|
| SQL Migration | ✅ جاهز | تطبيق على قاعدة البيانات |
| Prisma Schema | ❌ قديم | تحديث model AnnualPlan |
| API Routes | ❌ قديم | تحديث POST /api/plan |
| UI Form | ✅ محدّث | لا شيء |
| Database | ❌ قديم | تطبيق migration |

---

## 🚀 الخطوة التالية

**اختر أحد الخيارين وطبقه:**

1. **للتطوير السريع:** استخدم الخيار 2 (تحديث الجدول الحالي)
2. **للإنتاج:** استخدم الخيار 1 (مخطط جديد مع core.annual_plans)

بعد التطبيق، قم بتحديث API routes لاستخدام الحقول الجديدة.

---

**التحديث الأخير:** 21 أكتوبر 2025 - في انتظار التنفيذ
