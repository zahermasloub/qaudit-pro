# Annual Plan Wizard Implementation

## Overview
A two-step wizard for creating annual plans with draft save functionality, as specified in المرحلة 3 requirements.

## Features
- ✅ Two-step wizard interface (Plan Data → Task Details)
- ✅ Draft save functionality (available at any step)
- ✅ Real-time Arabic validation with concise messages
- ✅ Step 1 validation before proceeding to Step 2
- ✅ Task management (add, edit, delete)
- ✅ Automatic plan creation on first Step 2 transition
- ✅ Submit plan with at least one task requirement
- ✅ Full audit logging for all operations
- ✅ RLS-compliant database access through Prisma

## Database Schema

### AnnualPlan Table
The `annual_plans` table already exists with all required RBIA fields:
- `plan_ref` (unique) - Plan reference number
- `fiscal_year` - Fiscal year
- `prepared_date` - Preparation date
- `approved_by` - Approver name
- `prepared_by_name` - Preparer name (stored separately from user_id)
- `standards` - Professional standards followed
- `methodology` - Methodology description
- `objectives` - Plan objectives
- `risk_sources[]` - Array of risk sources
- `status` - Plan status (draft, **submitted**, under_review, approved, cancelled, completed)
- `created_by` - User email/ID who created the plan

### AuditTask Table
The `audit_tasks` table has all required task fields:
- `seq_no` - Task sequence number
- `task_ref` - Task reference code
- `dept_id` - Department ID
- `title` - Task title (required)
- `task_type` - Type of task (compliance, financial, operational, etc.)
- `risk_level` - Risk level (very_high, high, medium, low)
- `impact_level` - Impact level
- `priority` - Priority level
- `scheduled_quarter` - Scheduled quarter (Q1-Q4)
- `duration_days` - Duration in days
- `assignee` - Assigned person
- `notes` - Additional notes

## API Endpoints

### 1. POST `/api/annual-plans/wizard/draft`
Save or update plan as draft.

**Request Body:**
```json
{
  "planId": "optional-existing-plan-id",
  "planRef": "PLAN-2025-001",
  "fiscalYear": 2025,
  "preparedDate": "2025-01-15",
  "approvedBy": "John Doe",
  "preparedByName": "Jane Smith",
  "standards": "IIA Standards",
  "methodology": "Risk-based approach",
  "objectives": "Assess key risks...",
  "riskSources": ["External audit", "Management concerns"]
}
```

**Response:**
```json
{
  "ok": true,
  "planId": "generated-plan-id"
}
```

### 2. POST `/api/annual-plans/wizard/tasks`
Create or update a task for a plan.

**Request Body:**
```json
{
  "planId": "plan-id",
  "taskId": "optional-task-id-for-update",
  "task": {
    "seqNo": 1,
    "taskRef": "TSK-001",
    "title": "Audit procurement process",
    "taskType": "compliance",
    "riskLevel": "high",
    "impactLevel": "high",
    "priority": "high",
    "scheduledQuarter": "Q1",
    "durationDays": 20,
    "assignee": "Ahmed",
    "notes": "Focus on contract management"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "taskId": "task-id"
}
```

### 3. POST `/api/annual-plans/wizard/submit`
Submit the plan (changes status from draft to submitted).

**Request Body:**
```json
{
  "planId": "plan-id"
}
```

**Response:**
```json
{
  "ok": true,
  "planId": "plan-id"
}
```

**Validation:**
- Plan must exist
- Plan must have at least one task

## Component Usage

### AnnualPlanWizard Component

```tsx
import { AnnualPlanWizard } from '@/features/annual-plan';

function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        إنشاء خطة جديدة
      </button>
      
      <AnnualPlanWizard
        open={open}
        onOpenChange={setOpen}
        locale="ar"
        onSuccess={(planId) => {
          console.log('Plan created:', planId);
          // Navigate to plan view or refresh list
        }}
      />
    </>
  );
}
```

## Workflow

### Step 1: Plan Data
1. User fills in plan metadata (plan_ref, fiscal_year, etc.)
2. User can add risk sources dynamically
3. Validation occurs on field blur
4. User can click "حفظ كمسودة" at any time
5. User clicks "التالي" to proceed to Step 2
   - Form validation runs
   - If first time, creates draft plan in database
   - Navigates to Step 2

### Step 2: Task Details
1. User can view existing tasks (if any)
2. User clicks "+ إضافة مهمة" to add a task
3. Task form appears with all required fields
4. User fills task details with real-time validation
5. User clicks "إضافة" to save task (or "تعديل" for updates)
6. Task is saved to database immediately
7. User can edit or delete tasks
8. User clicks "حفظ كمسودة" to save current state
9. User clicks "إنهاء وحفظ" to submit plan
   - Validation: At least one task required
   - Changes plan status to "submitted"
   - Logs action in audit_logs
   - Calls onSuccess callback
   - Closes wizard

## Validation Rules

### Step 1 (Plan Data)
- `planRef`: Required, minimum 3 characters
- `fiscalYear`: Required, must be between 2020-2100
- `preparedDate`: Required

### Step 2 (Tasks)
- `seqNo`: Required, must be positive integer
- `taskRef`: Required, minimum 2 characters
- `title`: Required, minimum 3 characters
- `durationDays`: Required, must be positive integer
- At least one task must be added before submission

## Audit Logging

All operations are logged to the `audit_logs` table:
- `annual_plan_draft_created` - When a new draft is created
- `annual_plan_draft_updated` - When a draft is updated
- `annual_plan_task_created` - When a task is created
- `annual_plan_task_updated` - When a task is updated
- `annual_plan_submitted` - When a plan is submitted

Each log entry includes:
- `actorId` / `actorEmail` - Who performed the action
- `action` - Type of action
- `target` - Target entity (plan ID or task ID)
- `payload` - Additional context (plan_ref, fiscal_year, etc.)
- `createdAt` - Timestamp

## Internationalization (i18n)

All text labels support both Arabic and English:
- `t.forms.wizard.step1` - "الخطوة 1: بيانات الخطة"
- `t.forms.wizard.step2` - "الخطوة 2: تفاصيل المهام"
- And many more...

See `lib/i18n.ts` for full translation keys.

## Database Migration

To apply the database migration for the 'submitted' status:

```bash
# Apply via PostgreSQL
psql -U postgres -d your_database -f db/migrations/0003_annual_plan_submitted_status.sql

# Or via Prisma (after regenerating)
npx prisma generate
npx prisma db push
```

## Security Considerations

1. **Authentication**: All API endpoints require authentication via NextAuth
2. **Authorization**: Operations are scoped to the logged-in user
3. **RLS Compliance**: All queries use Prisma, which respects RLS policies
4. **Input Validation**: Zod schemas validate all inputs
5. **SQL Injection**: Prevented by using Prisma ORM
6. **Audit Trail**: All operations are logged

## Testing

To test the wizard:
1. Log in to the application
2. Navigate to "الخطة السنوية" (Annual Plan)
3. Click "إنشاء خطة جديدة" (Create New Plan)
4. Fill in Step 1 fields and click "التالي"
5. Add at least one task in Step 2
6. Click "إنهاء وحفظ" to submit

## Files Modified/Created

### Created
- `features/annual-plan/AnnualPlanWizard.tsx` - Main wizard component
- `features/annual-plan/wizard.schema.ts` - Validation schemas
- `app/api/annual-plans/wizard/draft/route.ts` - Draft save endpoint
- `app/api/annual-plans/wizard/tasks/route.ts` - Task management endpoint
- `app/api/annual-plans/wizard/submit/route.ts` - Plan submission endpoint
- `db/migrations/0003_annual_plan_submitted_status.sql` - Database migration

### Modified
- `features/annual-plan/AnnualPlan.screen.tsx` - Integrated wizard
- `features/annual-plan/index.ts` - Export wizard
- `lib/i18n.ts` - Added wizard translations
- `prisma/schema.prisma` - Added 'submitted' to AnnualPlanStatus enum

## Future Enhancements

1. **Departments API**: Add endpoint to fetch departments for dept_id field
2. **Draft Resume**: Allow users to resume editing draft plans
3. **Validation Summary**: Show all validation errors at once
4. **Auto-save**: Implement auto-save for draft plans
5. **Task Templates**: Provide predefined task templates
6. **Bulk Task Import**: Allow CSV import of tasks
7. **Plan Cloning**: Clone previous year's plan
8. **Approval Workflow**: Integrate with plan approval process

## Support

For issues or questions, please contact the development team or refer to the main project documentation.
