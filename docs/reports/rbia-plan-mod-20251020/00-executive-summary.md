# تقرير تهيئة تعديلات صفحة الخطة السنوية (RBIA Annual Plan)

## الملخص التنفيذي (Executive Summary)

**تاريخ التقرير:** 20 أكتوبر 2025  
**المشروع:** QAudit Pro - نظام التدقيق الداخلي المبني على المخاطر  
**النطاق:** تعديلات شاملة لصفحة الخطة السنوية للتدقيق الداخلي

---

## 1. نظرة عامة (Overview)

هذا التقرير يقدم خارطة طريق شاملة لتطوير وتعزيز صفحة **الخطة السنوية للتدقيق الداخلي (RBIA Annual Plan)** لتحويلها من واجهة عرض بسيطة إلى منصة تخطيط متكاملة تدعم:

### الوظائف المطلوبة:

1. **تعريف كون التدقيق (Audit Universe Definition)** - تحديد جميع الوحدات والعمليات القابلة للتدقيق
2. **نموذج تقييم المخاطر (Risk Assessment Model)** - تطبيق معايير ومقاييس متعددة الأبعاد
3. **مصفوفة حرارية تفاعلية (Interactive Heatmap)** - تصور المخاطر بصرياً حسب الاحتمالية والتأثير
4. **ترتيب الأولويات الآلي (Auto-Prioritization)** - ترتيب المهام حسب درجة المخاطر والموارد المتاحة
5. **تقدير الموارد والتقويم (Resource Estimation & Calendar)** - توزيع الساعات والميزانية على الأرباع السنوية
6. **سير العمل والاعتماد (Approval Workflow)** - مراحل المراجعة والموافقة من الإدارة التنفيذية ولجنة التدقيق
7. **التوليد التلقائي للمهام (Auto-Generate Engagements)** - إنشاء مهام التدقيق وPBC تلقائياً من الخطة المعتمدة
8. **ربط التحليلات والمؤشرات (KPIs & Analytics Integration)** - لوحات معلومات تفاعلية لتتبع التقدم

---

## 2. الوضع الحالي (Current State)

### نقاط القوة:

- ✅ واجهة أساسية لعرض الخطط السنوية مع جداول التصفية
- ✅ دعم كامل للـ RTL والعربية (i18n)
- ✅ نموذج إدخال بسيط (AnnualPlanForm) مع تبويبات للبيانات الأساسية وموازنة الساعات
- ✅ Zod validation schema قوي للتحقق من البيانات
- ✅ تكامل مع shadcn/ui وTailwind CSS

### الفجوات الرئيسية:

- ❌ **لا يوجد نموذج بيانات لـ Audit Universe** في القاعدة الحالية
- ❌ **لا توجد جداول لتقييم المخاطر (Risk Assessment)** منفصلة عن جدول `risks` العام
- ❌ **لا يوجد نظام حساب درجات المخاطر** (Risk Scoring Engine)
- ❌ **لا توجد مصفوفة حرارية** (Heatmap Visualization)
- ❌ **لا يوجد نظام Baseline/Versioning** للخطط المعتمدة
- ❌ **لا يوجد سير عمل موافقات** (Approval Workflow) مع حالات واضحة
- ❌ **لا توجد آلية لتوليد Engagements** تلقائياً من Plan Items
- ❌ **لا يوجد ربط مع وحدة Analytics** لتتبع التنفيذ الفعلي مقابل المخطط

---

## 3. نقاط القرار الاستراتيجية (Decision Points)

### A. هل نبني محرك تقييم مخاطر كامل أم نستخدم نموذج مبسط؟

**التوصية:** نموذج متوسط التعقيد يدعم:

- معايير مخاطر قابلة للتخصيص (Risk Criteria)
- حساب نقاط متعدد الأبعاد (Impact × Likelihood)
- مصفوفة شهية المخاطر (Risk Appetite Matrix) 5×5
- قابل للتوسع مستقبلاً لإضافة نماذج ML

### B. هل يتم تخزين Heatmap كبيانات أم توليده ديناميكياً؟

**التوصية:** توليد ديناميكي من بيانات Risk Assessment مع caching للأداء

### C. كيف يتم التعامل مع التعديلات بعد الاعتماد (Baseline)?

**التوصية:** نظام Change Request (CR) منفصل:

- Baseline يُقفل الخطة الأصلية مع hash/checksum
- أي تعديلات بعد Baseline تُسجل كـ CR مع سير موافقة مستقل
- يتم إنشاء version جديدة للخطة عند الموافقة على CR

### D. متى يتم توليد Engagements من الخطة؟

**التوصية:** عند تحول الخطة إلى حالة `Approved` + زر يدوي "Generate Engagements"

- يُنشئ Engagement لكل Plan Item مع ربط AU_ID و Risk_Score
- يُنشئ PBC requests أولية حسب audit type
- يُعيّن Lead Auditor والفريق تلقائياً

---

## 4. خطة التنفيذ الموصى بها (Recommended Implementation Plan)

### **المرحلة 1 - البنية التحتية (Week 1: 5 أيام)**

**الأولوية:** عاجلة | **الجهد:** Large (L)

- إنشاء جداول قاعدة البيانات الجديدة:
  - `audit.audit_universe` (AU)
  - `audit.risk_criteria` (معايير التقييم)
  - `audit.risk_assessments` (تقييمات المخاطر لكل AU item)
  - `audit.annual_plan_items` (عناصر الخطة مع ربط AU + Risk)
  - `audit.resource_capacity` (سعة الموارد الشهرية/الربعية)
  - `audit.plan_approvals` (سجل الموافقات)
  - `audit.plan_baselines` (snapshots للخطط المعتمدة)
  - `audit.change_requests` (طلبات التعديل)

- تحديث `annual_plans` table لإضافة:
  - `baseline_hash`, `baseline_date`, `baseline_by`
  - `approval_status` ENUM
  - `version_number`

- إنشاء API endpoints أساسية:
  - `/api/audit-universe` (CRUD)
  - `/api/risk/criteria` (CRUD)
  - `/api/risk/assess` (POST/PUT)
  - `/api/plan/items` (CRUD مع ربط AU + Risk)

### **المرحلة 2 - واجهة تعريف كون التدقيق (Week 1: 3 أيام)**

**الأولوية:** عالية | **الجهد:** Medium (M)

- بناء `AuditUniverseManager` component:
  - جدول تفاعلي مع إضافة/تعديل/حذف
  - حقول: Code, Name, Department, Process Owner, Description, Status
  - دعم استيراد Excel/CSV
  - Export to Excel

- ربط AU بـ org/dept hierarchy الحالية

### **المرحلة 3 - محرك تقييم المخاطر (Week 2: 4 أيام)**

**الأولوية:** عالية | **الجهد:** Large (L)

- بناء `RiskAssessmentEngine`:
  - نموذج إدخال معايير المخاطر (Financial, Operational, Compliance, etc.)
  - حساب Impact Score (1-5) و Likelihood Score (1-5)
  - حساب Risk Score النهائي (Impact × Likelihood = 1-25)
  - تصنيف تلقائي (Low: 1-6, Medium: 7-12, High: 13-16, Very High: 17-25)

- بناء `RiskCriteriaLibrary` component:
  - مكتبة معايير قابلة للتخصيص
  - أوزان قابلة للتعديل لكل معيار
  - Templates جاهزة (Financial Institution, Government Entity, Manufacturing, etc.)

### **المرحلة 4 - مصفوفة حرارية تفاعلية (Week 2: 3 أيام)**

**الأولوية:** متوسطة | **الجهد:** Medium (M)

- بناء `RiskHeatmap` component باستخدام Recharts:
  - محاور X: Likelihood (1-5), Y: Impact (1-5)
  - نقاط بيانات: AU items مع risk scores
  - ألوان حسب Risk Appetite Matrix
  - Tooltip يعرض تفاصيل AU item + score breakdown
  - Drill-down: Click on bubble → يعرض AU details

### **المرحلة 5 - بناء الخطة السنوية المتقدمة (Week 3: 5 أيام)**

**الأولوية:** عاجلة | **الجهد:** Large (L)

- تحديث `AnnualPlanForm` لإضافة تبويب جديد:
  - **Tab 1: Meta** (موجود)
  - **Tab 2: Hours Budget** (موجود)
  - **Tab 3: Audit Universe Selection** (جديد)
    - Multi-select AU items من الجدول
    - عرض Risk Score لكل item
  - **Tab 4: Plan Items & Prioritization** (جديد)
    - جدول تفاعلي للـ Plan Items
    - ترتيب تلقائي حسب risk score
    - تعيين Quarter, Hours, Lead Auditor
    - Drag-and-drop لإعادة الترتيب اليدوي
  - **Tab 5: Resource Allocation** (جديد)
    - Calendar view للأرباع
    - توزيع الساعات على الأشهر
    - تحذير عند تجاوز السعة

### **المرحلة 6 - سير الموافقات والـ Baseline (Week 3: 3 أيام)**

**الأولوية:** عالية | **الجهد:** Medium (M)

- بناء `ApprovalWorkflow` component:
  - State machine: Draft → Under_Review → Submitted_to_Executive → Submitted_to_AuditCommittee → Approved
  - أزرار إجراءات حسب الحالة والصلاحيات
  - نموذج Comments للمراجعين
  - إشعارات للمعنيين (Notification Integration)

- بناء `BaselineManager`:
  - زر "Create Baseline" (يظهر فقط عند Approved)
  - حساب hash/checksum للخطة
  - تخزين snapshot كـ JSON في `plan_baselines`
  - قفل الخطة من التعديل

- بناء `ChangeRequestForm`:
  - يفتح تلقائياً عند محاولة تعديل خطة Baselined
  - يسجل التغييرات المطلوبة
  - سير موافقة مستقل للـ CR

### **المرحلة 7 - توليد Engagements تلقائياً (Week 4: 3 أيام)**

**الأولوية:** عالية | **الجهد:** Medium (M)

- بناء `EngagementGenerator`:
  - زر "Generate Engagements" (يظهر بعد Baseline)
  - API endpoint: `POST /api/plan/{id}/generate-engagements`
  - يُنشئ:
    - Engagement لكل Plan Item
    - ينسخ AU_ID, Risk_Score, Title, Department
    - يُعيّن Planned Quarter → Start/End dates
    - يُعيّن Lead Auditor والفريق
    - يُنشئ PBC requests أولية حسب audit type من Template Library
  - رسالة تأكيد مع عدد الـ Engagements المُنشأة

### **المرحلة 8 - التحليلات والمؤشرات (Week 4: 2 أيام)**

**الأولوية:** متوسطة | **الجهد:** Small (S)

- بناء `PlanAnalyticsDashboard`:
  - KPI Cards:
    - Total AU Items vs Planned Items (Coverage %)
    - High Risk Coverage %
    - Resource Utilization %
    - Budget vs Actual
  - Charts:
    - Risk Distribution (Pie Chart)
    - Quarterly Workload (Bar Chart)
    - Department Coverage (Horizontal Bar)
  - Integration مع `/api/analytics` endpoints

### **المرحلة 9 - الاختبار والتوثيق (Week 4-5: 3 أيام)**

**الأولوية:** عاجلة | **الجهد:** Medium (M)

- اختبار وحدات (Unit Tests) لـ Risk Scoring Engine
- اختبار تكامل (Integration Tests) للـ Approval Workflow
- اختبار واجهة (UI Tests) للـ Heatmap و Plan Builder
- اختبار أداء (Performance Tests) للـ Generate Engagements
- اختبار نفاذية (Accessibility Tests) WCAG 2.2 AA
- كتابة دليل المستخدم العربي
- تحديث API Documentation (OpenAPI/Swagger)

---

## 5. التقديرات (Estimates)

### الجهد الإجمالي:

- **Frontend:** ~12 أيام عمل (96 ساعة)
- **Backend API:** ~8 أيام عمل (64 ساعة)
- **Database:** ~3 أيام عمل (24 ساعة)
- **Testing & QA:** ~3 أيام عمل (24 ساعة)
- **Documentation:** ~2 أيام عمل (16 ساعة)

**المجموع:** 28 يوم عمل (~224 ساعة)

### الجدول الزمني:

- **مع فريق واحد (1 FE + 1 BE):** 4-5 أسابيع
- **مع فريق موازٍ (2 FE + 2 BE):** 2-3 أسابيع

---

## 6. المخاطر الرئيسية (Key Risks)

| المخاطرة                                     | التأثير | الاحتمالية | التخفيف                               |
| -------------------------------------------- | ------- | ---------- | ------------------------------------- |
| تعقيد محرك المخاطر يؤخر التسليم              | عالي    | متوسط      | استخدام نموذج مبسط في V1، توسيع في V2 |
| عدم وضوح متطلبات Approval Workflow           | عالي    | عالي       | Workshop مع stakeholders قبل البدء    |
| أداء بطيء عند توليد Engagements لخطط كبيرة   | متوسط   | متوسط      | Background job + progress indicator   |
| عدم توافق البيانات القديمة مع النموذج الجديد | عالي    | منخفض      | Migration script + Rollback plan      |
| مقاومة المستخدمين للنظام المعقد              | متوسط   | متوسط      | Training sessions + In-app tutorials  |

---

## 7. نقاط النجاح (Success Criteria)

### متطلبات إلزامية (Must-Have):

- ✅ نموذج Audit Universe كامل مع CRUD
- ✅ محرك تقييم مخاطر يعمل بصحة
- ✅ بناء خطة سنوية مع Plan Items مرتبطة بـ AU + Risk
- ✅ سير موافقات واضح مع Baseline
- ✅ توليد Engagements تلقائياً بنجاح
- ✅ دعم كامل للـ RTL والعربية في جميع الواجهات

### مرغوب فيه (Nice-to-Have):

- 🎯 Heatmap تفاعلية مع Drill-down
- 🎯 Resource Calendar visualization
- 🎯 CR workflow للتعديلات بعد Baseline
- 🎯 Analytics Dashboard متكامل
- 🎯 Excel Import/Export لـ AU items

### مؤشرات أداء (Performance Metrics):

- صفحة الخطة تُحمّل خلال ≤ 2 ثانية للخطة بـ 100 item
- Generate Engagements ينتهي خلال ≤ 5 ثوان لـ 50 item
- Risk Score calculation خلال ≤ 100ms لكل item
- A11y Score ≥ 95/100 (Lighthouse)

---

## 8. التوصيات النهائية (Final Recommendations)

### الأولوية "الآن" (Now):

1. ابدأ بـ **المرحلة 1 (البنية التحتية)** فوراً - critical path
2. عقد workshop مع stakeholders لتوضيح Approval Workflow
3. تحضير migration plan لنقل البيانات الموجودة (إن وجدت)

### الأولوية "التالية" (Next):

4. تنفيذ المراحل 2-3 (AU + Risk Engine) بالتوازي
5. بناء Heatmap في المرحلة 4 كـ MVP بسيط
6. توسيع الـ AnnualPlanForm في المرحلة 5

### الأولوية "لاحقاً" (Later):

7. CR Workflow يمكن تأجيله للإصدار v1.1
8. Advanced Analytics في v1.2
9. ML-based Risk Prediction في v2.0

---

## 9. الملفات المرفقة (Attached Documents)

هذا التقرير جزء من حزمة شاملة تتضمن:

- `01-current-state.md` - تحليل تفصيلي للوضع الحالي
- `02-gap-analysis-vs-requirements.md` - جدول الفجوات
- `03-ux-ui-plan.md` - تصاميم واجهات المستخدم المقترحة
- `04-data-model-delta.sql` - تغييرات قاعدة البيانات
- `05-api-delta-spec.md` - مواصفات API الجديدة
- `06-validation-and-business-rules.md` - قواعد العمل والتحقق
- `07-workflow-and-approvals.md` - مخططات سير العمل
- `08-integration-points.md` - نقاط التكامل مع الوحدات الأخرى
- `09-test-strategy-and-cases.md` - استراتيجية الاختبار
- `10-migration-and-seeding.md` - خطة الترحيل والبيانات الأولية
- `11-risk-and-mitigation.md` - RAID Log
- `12-timeline-raci-wbs.md` - الجدول الزمني ومصفوفة المسؤوليات
- `13-acceptance-criteria-checklist.md` - قائمة القبول النهائية
- `14-rtm-update.csv` - تحديث مصفوفة تتبع المتطلبات
- `15-dev-tasks-kanban.csv` - مهام التطوير للـ Kanban board
- `16-wireflows-and-diagrams.md` - الرسومات التوضيحية
- `17-readme-how-to-execute.md` - دليل التنفيذ

---

**تمت المراجعة والموافقة من قبل:** GitHub Copilot  
**التاريخ:** 20 أكتوبر 2025  
**النسخة:** 1.0
