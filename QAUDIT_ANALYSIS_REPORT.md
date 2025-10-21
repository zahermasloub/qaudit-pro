# QAUDIT_ANALYSIS_REPORT.md

## 1) Project Snapshot

- **Repo root:** d:/AUDITOR-PRO/qaudit-pro
- **Node/NPM/Next.js/Prisma/TypeScript versions:**
  - Node: (راجع البيئة المحلية)
  - NPM: (راجع البيئة المحلية)
  - Next.js: 14.2.5
  - Prisma: 5.19.0
  - TypeScript: 5.4.2
- **Scripts في package.json:**
  - dev, build, start, prepare, lint, fix, cc:scan, cc:refactor, cc:report, cc:all, audit:s7, db:setup, db:push, db:migrate, db:generate, db:reset, db:studio, seed, test:s7, prisma:studio, prisma:generate
- **Env files detected:**
  - .env, .env.production, .env.example
  - المتغيرات المستخدمة: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_APP_VERSION

---

## 2) Inventory (جرد سريع)

- **Routes (App Router):**
  - dashboard: app/(app)/dashboard/page.tsx
  - admin: app/(app)/admin/dashboard/page.tsx, app/(app)/admin/users/page.tsx, app/(app)/admin/roles/page.tsx, app/(app)/admin/settings/page.tsx, app/(app)/admin/logs/page.tsx, app/(app)/admin/backups/page.tsx
  - shell: app/(app)/shell/page.tsx
  - auth: app/(app)/auth/login/page.tsx, app/(app)/auth/register/page.tsx
  - لا يوجد صفحات مباشرة لـ: plan, engagements, pbc, rcm, program, tests, samples, evidence, findings, reports, follow-up, qaip (موجودة كـ API فقط)
- **Prisma Schema (نماذج وعلاقات):**
  - Engagement, Plan, PBCRequest, AuditTest, Sample, TestRun, Evidence, AnnualPlan, AuditTask, PlanApproval, User, Role, Permission, UserRole, SystemSetting, AuditLog, BackupJob, BackupSchedule
  - علاقات أساسية: Engagement ↔ Plan/PBCRequest/AuditTest/Evidence, AuditTest ↔ Sample/TestRun/Evidence, Evidence ↔ AuditTest/Engagement
- **API Handlers:**
  - أمثلة: POST /api/tests → app/api/tests/route.ts, POST /api/pbc → app/api/pbc/route.ts, POST /api/samples → app/api/samples/route.ts, POST /api/evidence/upload → app/api/evidence/upload/route.ts
- **UI Components المشتركة:**
  - SidebarDrawer: components/shell/SidebarDrawer.tsx
  - PbcTable: components/pbc/PbcTable.tsx
  - لا يوجد ملفات مباشرة لـ Breadcrumbs, Topbar, Drawer, table-wrap, container-shell, StatusBadge, RelatedPanel
- **Auth/RBAC:**
  - فحص الجلسة والصلاحيات: middleware.ts (withAuth من next-auth)، lib/rbac.ts (hasPerm, ADMIN_MENU_PERMS)، lib/auth-mock.ts (session mock)

---

## 3) Health Check

- **Type/Lint status:**
  - build: أخطاء في JSX (Parsing error: Unexpected token `div` في DashboardView وPbcTable)
  - tsc: لم يتم التعرف على الأمر (راجع إعدادات البيئة)
  - eslint: 4 أخطاء، 29 تحذير (أخطاء parsing وmerge conflict في evidence/[id]/route.ts)
- **DB Migrations:**
  - يوجد مجلد prisma/migrations (لا يوجد سوى README.md، راجع حالة migrations)
- **Known Errors (أعلى 10):**
  1. app/(app)/shell/DashboardView.tsx: Unexpected token `div` (JSX)
  2. components/pbc/PbcTable.tsx: Unexpected token `div` (JSX)
  3. app/api/evidence/[id]/route.ts: Merge conflict marker encountered
  4. app/layout.tsx: Run autofix to sort these imports
  5. app/api/files/upload/route.ts: Module not found: Can't resolve 'bcryptjs'
  6. features/evidence/forms/EvidenceUploader.form.tsx: unused vars
  7. features/planning/engagement/engagement.service-v2.ts: unused args
  8. features/planning/pbc/pbc.service-v2.ts: unused args
  9. features/program/sampling/Sampling.form-v2.tsx: unused vars
  10. lib/antivirus-scanner.ts: unused vars

---

## 4) Coverage of Audit Lifecycle

| المرحلة       | التغطية | رابط/ملف                                                                            |
| ------------- | ------- | ----------------------------------------------------------------------------------- |
| Plan          | ❌      | -                                                                                   |
| PBC           | ⚠️      | app/api/pbc/route.ts, features/planning/pbc/Pbc.form-v2.tsx                         |
| RCM           | ❌      | -                                                                                   |
| Program/Tests | ⚠️      | app/api/tests/route.ts, features/program/tests/Test.form-v2.tsx                     |
| Samples       | ⚠️      | app/api/samples/route.ts, features/program/sampling/Sampling.form-v2.tsx            |
| Evidence      | ⚠️      | app/api/evidence/upload/route.ts, features/evidence/forms/EvidenceUploader.form.tsx |
| Findings      | ❌      | -                                                                                   |
| Reports       | ❌      | -                                                                                   |
| Follow-up     | ❌      | -                                                                                   |
| QAIP          | ❌      | -                                                                                   |

---

## 5) Gaps & Risks (الفجوات والمخاطر)

- فجوات الربط: Evidence ↔ Test/Control ↔ Finding ↔ ActionPlan ↔ Report ↔ Follow-up (العلاقات جزئية أو غير منفذة)
- نقص حالات الحياة (State Machines) والأحداث (Domain Events): لا يوجد ملفات events/domain واضحة
- ثغرات RBAC/Scope: RBAC جزئي (lib/rbac.ts)، لا يوجد تحقق دقيق لكل API
- UX Responsiveness: SidebarDrawer موجود، لا يوجد container-shell/table-wrap/contrast واضح
- بحث موحّد/وسوم/إشعارات: غير منفذ

---

## 6) Minimal Data Flow Maps (مختصر)

```mermaid
%% Data Flow
Evidence Upload
  ↓
OCR Service
  ↓
Evidence Link (to Test/Sample)
  ↓
Finding (غير منفذ)
  ↓
Report (غير منفذ)
  ↓
Follow-up (غير منفذ)
```

---

## 7) Proposed Implementation Plan (Sprints)

### Sprint 1: UI Wiring

- **Goals:**
  1. تحسين SidebarDrawer
  2. إضافة container-shell وtable-wrap
  3. تحسين التباين في Topbar
  4. إضافة Breadcrumbs وRelatedPanel
  5. إصلاح أخطاء JSX

- **Key Patches:** components/shell/SidebarDrawer.tsx, app/(app)/shell/AppShell.tsx, app/layout.tsx

- **Acceptance Criteria:**
  - جميع الصفحات الأساسية تعرض بشكل متجاوب
  - لا يوجد أخطاء JSX
  - وجود Breadcrumbs وRelatedPanel

- **Risks & Mitigations:**
  - خطر تعارضات JSX (حل عبر lint/fix)

### Sprint 2: Domain Events + State Machines + APIs

**Goals:**

1. إضافة ملفات events/domain
2. تحسين ربط الكيانات (Evidence ↔ Test/Finding)
3. تحسين RBAC لكل API
4. إضافة إشعارات
5. إصلاح أخطاء merge/conflict

**Key Patches:** lib/rbac.ts, app/api/evidence/[id]/route.ts, features/evidence/

**Acceptance Criteria:**

- وجود event handlers
- تحقق RBAC لكل API
- لا يوجد أخطاء merge/conflict

**Risks & Mitigations:**

- خطر فقدان العلاقات (حل عبر مراجعة schema)

### Sprint 3: Unified Search/Tags + KPIs Dashboard + Follow-up flow

**Goals:**

1. إضافة بحث موحّد
2. إضافة وسوم
3. لوحة مؤشرات KPIs
4. تدفق متابعة (Follow-up)
5. تحسين التقارير

**Key Patches:** features/search/, features/kpi/, features/followup/

**Acceptance Criteria:**

- وجود بحث ووسوم
- لوحة KPIs تعرض بيانات حية
- تدفق متابعة مكتمل

**Risks & Mitigations:**

- خطر نقص البيانات (حل عبر تحسين API)

---

## 8) File-Level TODOs

1. [P1][API] app/api/evidence/[id]/route.ts: إصلاح merge conflict + parsing
2. [P1][UI] app/(app)/shell/DashboardView.tsx: إصلاح أخطاء JSX
3. [P1][UI] components/pbc/PbcTable.tsx: إصلاح أخطاء JSX
4. [P1][API] app/api/files/upload/route.ts: إضافة دعم bcryptjs
5. [P2][RBAC] lib/rbac.ts: تحسين تحقق الصلاحيات لكل API
6. [P2][UI] app/layout.tsx: ترتيب وتحسين الاستيرادات
7. [P2][UX] إضافة container-shell وtable-wrap
8. [P2][UI] إضافة Breadcrumbs وRelatedPanel
9. [P2][Domain] إضافة ملفات events/domain
10. [P2][API] تحسين ربط Evidence ↔ Test/Finding
11. [P2][API] إضافة إشعارات
12. [P3][Search] إضافة بحث موحّد
13. [P3][Tags] إضافة وسوم
14. [P3][KPI] لوحة مؤشرات KPIs
15. [P3][Follow-up] تدفق متابعة كامل

---

## 9) Final Summary (TL;DR)

- أصلح أخطاء JSX وmerge conflict في الملفات الحرجة
- أضف وتحسن مكونات UI المشتركة (SidebarDrawer, Breadcrumbs, RelatedPanel)
- عزز RBAC وتحقق الصلاحيات لكل API
- أضف ملفات events/domain وربط الكيانات الأساسية
- نفذ بحث موحّد ولوحة KPIs وتدفق متابعة

---

> **Next Steps:**
>
> 1. معالجة أخطاء build/lint أولاً
> 2. تحسين مكونات UI الأساسية
> 3. تعزيز RBAC وربط الكيانات
> 4. إضافة الأحداث والبحث ولوحة KPIs
> 5. مراجعة وتحديث خطة السبرنتات حسب التقدم
