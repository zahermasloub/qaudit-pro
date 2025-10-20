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

## Migration Guidelines

When creating new migrations:

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
