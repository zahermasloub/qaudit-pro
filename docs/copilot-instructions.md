# Copilot Instructions & Migration Tracking

## Database Migrations

This file tracks the status of database migrations for the Audit Application.

### Completed Migrations

- ✔ **0002_rbia.sql** - Risk-Based Internal Audit (RBIA) Schema Implementation
  - Date: 2025-10-20
  - Description: Adds comprehensive RBIA support including:
    - `audit.AuditUniverse` - Master list of auditable entities
    - `audit.RiskCriteria` - Risk assessment criteria and weights
    - `audit.RiskAssessments` - Risk evaluations for audit universe items
    - `audit.AnnualPlans` - Annual audit plans with versioning
    - `audit.AnnualPlanItems` - Individual audit items within plans
    - `audit.ResourceCapacity` - Resource planning and capacity management
    - `audit.PlanApprovals` - Approval workflow audit trail
    - `audit.PlanBaselines` - Immutable snapshots of approved plans
  - Location: `db/migrations/0002_rbia.sql`
  - Status: ✔ Complete

### Pending Migrations

(No pending migrations at this time)

## RBIA Implementation Status

### Part A: API & UI Wiring (✔)

- ✔ **Audit Universe API** (`/api/audit-universe`) - GET/POST endpoints for universe management
- ✔ **Risk Criteria API** (`/api/risk/criteria`) - Manage risk criteria and weights
- ✔ **Risk Assessment API** (`/api/risk/assess`) - Calculate and store risk assessments
- ✔ **Plan Items API** (`/api/plan/items`) - Manage annual plan items
- ✔ **RBIA Plan Page** (`/app/(app)/rbia/plan/page.tsx`) - Complete UI with 5 tabs:
  - Universe tab with CSV import and multi-select
  - Risk tab with heatmap visualization
  - Plan Items tab with generation and editing
  - Resources tab with capacity tracking
  - Approvals tab (placeholder)
- Date: 2025-10-20

### Part B: Workflow & Baseline (✔)

- ✔ **Submit for Review API** (`/api/plan/[id]/submit-review`) - Changes status to 'under_review'
- ✔ **Approve API** (`/api/plan/[id]/approve`) - Changes status to 'approved'
- ✔ **Baseline API** (`/api/plan/[id]/baseline`) - Creates immutable snapshot with SHA256 hash
  - Prevents editing after baseline
  - Validates no duplicate baselined plans for same year
  - Stores snapshot in `PlanBaselines` table
- ✔ **UI Workflow Controls** - Submit/Approve/Baseline buttons with proper state management
  - Baseline badge displays hash and timestamp
  - Edit locking when status is 'baselined'
- Date: 2025-10-20

### Part C: Generate Engagements & PBC (✔)

- ✔ **Generate Engagements API** (`/api/plan/[id]/generate-engagements`)
  - Creates Engagement for each plan item
  - Auto-generates PBC requests based on audit type
  - Supports templates: Procurement, Payroll, Privacy, Financial, IT
  - Prevents duplicate generation
- ✔ **UI Generate Button** - Available only when plan is baselined
  - Shows success message with counts
  - Links to engagements (if route exists)
- Date: 2025-10-20

### Part D: Home Page Annual Plan View (✔) — MODE=embed

- ✔ **Shared Component** (`/app/(app)/rbia/plan/RbiaPlanView.tsx`)
  - Reusable component with `mode?: 'home' | 'plan'` prop
  - Full RTL support with Arabic i18n
  - 4 Summary Cards: Completion %, Total Hours, Planned Tasks, Status Badge
  - 3 Dropdown Filters + Search + CSV Import/Export
  - Plan Items Table with: Code, Title, Department, Risk Badges, Type, Quarter, Hours, Status, Actions (👁️ ✏️ 🗑️)
  - Sidebar Stepper: 11 steps, first step "الخطة السنوية" active
  - LocalStorage persistence for filters
  - useMemo for performance optimization
  - Skeleton loading states
  - ARIA labels for accessibility
- ✔ **Home Page Integration** (`/app/page.tsx`) - Displays annual plan with MODE=home
- ✔ **Plan Page Refactored** (`/app/(app)/rbia/plan/page.tsx`) - Uses RbiaPlanView with MODE=plan
- Date: 2025-10-20

### Part E: Home Page Fix & Sidebar Integration (✔) — MODE=navigation

**Problem:** During RBIA plan integration, home page was completely replaced with RbiaPlanView, removing original redirect to `/shell` and navigation structure.

**Solution:** (October 20, 2025)

- ✔ **Restored Home Page** (`/app/page.tsx`) - Reverted to `redirect('/shell')` pattern
- ✔ **Added Sidebar Navigation** - Integrated `rbiaplan` route in AppShell:
  - Added `rbiaplan` to Route type union
  - Added RBAC permissions: `['IA_Manager', 'IA_Lead', 'IA_Auditor']`
  - Added menu item in MENU_SPEC with FileText icon
  - Added rendering case: `{route === 'rbiaplan' && <RbiaPlanView mode="plan" />}`
- ✔ **Updated i18n** (`/lib/i18n.ts`) - Added translations:
  - Arabic: `rbiaplan: 'الخطة السنوية RBIA'`
  - English: `rbiaplan: 'RBIA Annual Plan'`
- ✔ **Access Paths:**
  1. `/` → redirects to `/shell` (Dashboard)
  2. From Sidebar → Click "الخطة السنوية RBIA" → Shows RbiaPlanView
  3. Direct access: `/rbia/plan` (standalone page)
- ✔ **Benefits:**
  - Maintains original architecture (AppShell as main hub)
  - Consistent navigation experience
  - Clear RBAC enforcement
  - Professional user flow
- Date: 2025-10-20

### Part F: M9C Create Plan Wizard (✔)

**Feature:** Two-step wizard for creating annual audit plans with UI integration in Dashboard and RBIA Plan page.

**Implementation:** (October 20, 2025)

- ✔ **API Endpoints:**
  - `POST /api/plan` - Create new plan with {year, version?, owner_id?}, defaults to status='draft' and version='v1'
  - `GET /api/plan/:id` - Retrieve plan details by ID
  - `PUT /api/plan/:id` - Update plan owner/version, returns 403 if status='baselined' (prevents editing approved plans)
  - `GET /api/plan/:id/capacity` - Get resource capacity or return default values (2080 total hours, 1500 audit, 300 advisory, 180 training, 100 admin)
- ✔ **CreatePlanWizard Component** (`/app/(app)/rbia/plan/CreatePlanWizard.tsx`):
  - **Step 1 (Plan Data):** Year dropdown (current + 5 years), version input (default 'v1'), owner_id field, "إنشاء الخطة" button → POST /api/plan → saves plan_id
  - **Step 2 (Initial Items):** Dynamic table with quick entry for items:
    - Fields: au_id, type (audit/advisory/investigation), priority (high/medium/low), effort hours, period_start/end (Q1-Q4), deliverable_type
    - "+ إضافة بند" button to add rows, remove button for each row (minimum 1 item)
    - "حفظ البنود والانتقال" → POST /api/plan/items → navigates to /rbia/plan?plan_id=<id>
  - Progress indicator with 2 circles and connecting line
  - Full RTL support with Arabic labels
  - Loading states, error handling with toast notifications
  - Back navigation between steps
- ✔ **Dashboard Integration** (`/app/(app)/shell/DashboardView.tsx`):
  - Added "+ إنشاء خطة سنوية" button (green, in filters section)
  - Opens CreatePlanWizard in modal dialog overlay
  - State management with useState hook
- ✔ **Plan Page Integration** (`/app/(app)/rbia/plan/page.tsx`):
  - Added support for `?new=1` query parameter
  - Shows CreatePlanWizard inline when ?new=1 is present
  - After wizard completion, removes ?new=1 and shows normal RbiaPlanView
  - Uses useSearchParams and useRouter hooks
- ✔ **Features:**
  - Duplicate year+version validation in POST /api/plan
  - Baseline protection in PUT /api/plan/:id
  - Capacity fallback values in GET /api/plan/:id/capacity
  - Minimum 1 item validation in Step 2
  - All items must have au_id before saving
  - Smooth navigation flow: Dashboard → Wizard → Plan View
- Date: 2025-10-20

### Part G: Home KPIs Dashboard (✔)

**Feature:** KPI metrics dashboard displaying key performance indicators for annual audit plans on the home page.

**Implementation:** (October 20, 2025)

- ✔ **Library Module** (`lib/plan-metrics.ts`):
  - `getPlanItems(planId)` - Fetches all AuditTasks for a given annual plan using Prisma
  - `calcKpis(items)` - Calculates metrics from plan items:
    - `completionPct` - Percentage of completed tasks (0-100)
    - `totalHours` - Sum of estimatedHours for all tasks
    - `itemsCount` - Total number of tasks in plan
    - `status` - Overall plan status (draft/in_progress/nearly_complete/completed)
  - `getPlanKpis(planId)` - Convenience function combining fetch and calculation
  - Uses Prisma ORM to query `AuditTask` model
- ✔ **API Endpoints:**
  - `GET /api/plan/latest` - Returns the most recent annual plan (ordered by fiscalYear DESC, createdAt DESC)
  - `GET /api/plan/:id/kpis` - Returns KPI metrics for a specific plan
- ✔ **KpiCards Component** (`app/(components)/KpiCards.tsx`):
  - 4 Responsive Cards displayed in grid layout (1 col mobile → 4 cols desktop):
    1. **نسبة الإنجاز** - Completion percentage with progress bar
    2. **إجمالي الساعات** - Total estimated hours with formatted numbers (ar-SA locale)
    3. **عدد المهام** - Total task count
    4. **حالة الخطة** - Status badge with color coding (green=completed, blue=nearly_complete, yellow=in_progress, gray=draft)
  - Auto-fetches latest plan if no planId provided
  - Loading skeleton states (4 animated cards)
  - Error handling with red alert banner
  - RTL support with dir="rtl"
  - Hover effects (shadow transition)
  - Status descriptions in Arabic
- ✔ **Dashboard Integration** (`app/(app)/shell/DashboardView.tsx`):
  - Added `<KpiCards />` at top of dashboard
  - Component automatically fetches latest annual plan
  - Displays metrics above existing dashboard content (filters, KPIs, charts, table)
- ✔ **Features:**
  - Automatic latest plan detection (no manual planId required)
  - Responsive grid layout (sm:grid-cols-2 lg:grid-cols-4)
  - Arabic number formatting with toLocaleString('ar-SA')
  - Color-coded status badges
  - Progress bar visualization for completion %
  - Graceful error handling (404 if no plans exist)
- Date: 2025-10-20

## Migration GuidelinesWhen creating new migrations:

1. Use sequential numbering: `000X_description.sql`
2. Always use `IF NOT EXISTS` for CREATE statements
3. Use `ADD COLUMN IF NOT EXISTS` for ALTER TABLE statements
4. Include proper indexes for foreign keys and frequently queried columns
5. Add CHECK constraints for data validation
6. Include timestamps (created_at, updated_at) on all tables
7. Document the migration purpose and changes at the top of the file
8. Update this tracking file after creating the migration

## Copilot Development Notes

### Code Standards

- Follow TypeScript best practices
- Use functional components with hooks for React
- Implement proper error handling
- Add comprehensive JSDoc comments
- Follow the patterns established in existing code

### Database Patterns

- Use UUID for primary keys
- Include audit timestamps on all tables
- Implement soft deletes where appropriate
- Use JSONB for flexible data structures
- Create appropriate indexes for performance

### API Development

- Use Next.js API routes
- Implement proper authentication/authorization
- Return consistent error responses
- Include request validation
- Add rate limiting where appropriate
