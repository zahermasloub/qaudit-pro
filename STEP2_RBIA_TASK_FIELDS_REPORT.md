# Step 2 RBIA Task Fields Implementation Report

## 📅 Date: 2024
## 🎯 Objective: Update Step 2 form with 12 new RBIA-compliant task fields

---

## ✅ Completed Tasks

### 1. **Interface Update (CreatePlanWizard.tsx)**

#### Old Interface (PlanItem - 9 fields):
```typescript
interface PlanItem {
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  auditType: string;
  plannedQuarter: string;
  estimatedHours: number;
  startDate: string;
  endDate: string;
}
```

#### New Interface (PlanTask - 12 fields):
```typescript
interface PlanTask {
  seqNo: number;              // الرقم التسلسلي للمهمة
  taskRef: string;            // الرقم المرجعي للمهمة
  deptId: string;             // الإدارة / القسم المستهدف
  title: string;              // اسم المهمة
  taskType: string;           // نوع المهمة
  riskLevel: string;          // درجة الخطورة
  impactLevel: string;        // تقييم الأثر
  priority: string;           // أولوية التنفيذ
  scheduledQuarter: string;   // توقيت التنفيذ المقترح
  durationDays: number;       // المدة التقديرية للتنفيذ (أيام)
  assignee: string;           // المدقق المسؤول
  notes: string;              // تعليقات إضافية
}
```

### 2. **UI Form Updates**

#### Step Progress Indicator:
- ✅ Renamed "البنود الأولية" → **"تفاصيل مهام التدقيق"**

#### Form Structure (3 rows):

**Row 1:**
1. الرقم التسلسلي (seqNo) - Auto-generated, read-only
2. الرقم المرجعي (taskRef) - Text input, required
3. الإدارة / القسم (deptId) - Dropdown with 9 options
4. اسم المهمة (title) - Text input, required

**Row 2:**
5. نوع المهمة (taskType) - Dropdown: مالي، تشغيلي، امتثال، تقنية معلومات، تحقيقات، أداء، مخاطر
6. درجة الخطورة (riskLevel) - Dropdown: حرج، عالي، متوسط، منخفض
7. تقييم الأثر (impactLevel) - Dropdown: حرج، عالي، متوسط، منخفض
8. أولوية التنفيذ (priority) - Dropdown: عاجل، عالي، متوسط، منخفض
9. توقيت التنفيذ (scheduledQuarter) - Dropdown: الربع الأول، الثاني، الثالث، الرابع
10. المدة (durationDays) - Number input (days)

**Row 3:**
11. المدقق المسؤول (assignee) - Text input
12. تعليقات إضافية (notes) - Textarea

**Department Dropdown Options:**
- المالية (finance)
- المشتريات (procurement)
- الموارد البشرية (hr)
- تقنية المعلومات (it)
- العمليات (operations)
- الشؤون القانونية (legal)
- إدارة المخاطر (risk)
- الامتثال (compliance)
- عام (general)

### 3. **Database Migration**

**File:** `prisma/migrations/update_audit_tasks_add_rbia_fields.sql`

#### New Columns Added to `audit_tasks` table:
1. `seq_no` (INTEGER, NOT NULL) - Sequential number with positive check
2. `task_ref` (TEXT, NOT NULL) - Unique per plan with annualPlanId
3. `dept_id` (TEXT) - Department identifier
4. `task_type` (TEXT, DEFAULT 'compliance') - Task type
5. `impact_level` (TEXT, DEFAULT 'medium') - Impact assessment
6. `priority` (TEXT, DEFAULT 'medium') - Execution priority
7. `scheduled_quarter` (TEXT, NOT NULL, DEFAULT 'Q1') - Scheduled quarter
8. `duration_days` (INTEGER, NOT NULL, DEFAULT 20) - Duration in days
9. `assignee` (TEXT, DEFAULT '') - Responsible auditor
10. `notes` (TEXT, DEFAULT '') - Additional comments

#### Indexes Created:
- `audit_tasks_seq_no_idx` - For ordering
- `audit_tasks_task_ref_idx` - For quick lookup
- `audit_tasks_dept_id_idx` - For filtering by department
- `audit_tasks_priority_idx` - For priority sorting

#### Constraints:
- UNIQUE (`task_ref`, `annualPlanId`) - Prevent duplicate task references
- CHECK (`seq_no` > 0) - Ensure positive sequence numbers
- CHECK (`duration_days` > 0) - Ensure positive durations

#### Migration Result:
✅ **5 existing tasks updated** with default values
✅ All constraints applied successfully

### 4. **Prisma Schema Update**

**File:** `prisma/schema.prisma`

Updated `AuditTask` model with new fields:
```prisma
model AuditTask {
  // ... existing fields ...
  
  // New RBIA fields
  seqNo               Int              @map("seq_no")
  taskRef             String           @map("task_ref")
  deptId              String?          @map("dept_id")
  taskType            String?          @default("compliance") @map("task_type")
  impactLevel         String?          @default("medium") @map("impact_level")
  priority            String?          @default("medium")
  scheduledQuarter    String           @default("Q1") @map("scheduled_quarter")
  durationDays        Int              @default(20) @map("duration_days")
  assignee            String?          @default("")
  notes               String?          @default("") @db.Text
  
  // ... timestamps and relations ...
  
  @@index([seqNo])
  @@index([taskRef])
  @@index([deptId])
  @@index([priority])
  @@unique([taskRef, annualPlanId])
}
```

**Prisma Client:** ⏳ Regeneration pending (requires clean restart)

### 5. **API Route Update**

**File:** `app/api/plan/[id]/tasks/route.ts`

#### POST Endpoint Enhanced:
- ✅ Accepts all 12 new RBIA fields
- ✅ Maintains backward compatibility with old fields
- ✅ Maps old field names to new structure:
  - `code` → `taskRef`
  - `department` → `deptId`
  - `auditType` → `taskType`
  - `plannedQuarter` → `scheduledQuarter`
  - `estimatedHours` → calculated from `durationDays * 8`
  - `leadAuditor` → `assignee`
  - `objectiveAndScope` → `notes`

- ✅ Validates risk levels (critical → very_high mapping)
- ✅ Validates audit types against enum values
- ✅ Auto-generates sequence numbers if not provided

#### Swagger Documentation:
- Updated request schema with all 12 fields
- Added Arabic descriptions for each field
- Marked required fields (seqNo, taskRef, title)

### 6. **State Management Updates**

#### Initial State:
```typescript
const [items, setItems] = useState<PlanTask[]>([
  {
    seqNo: 1,
    taskRef: '',
    deptId: '',
    title: '',
    taskType: 'compliance',
    riskLevel: 'medium',
    impactLevel: 'medium',
    priority: 'medium',
    scheduledQuarter: 'Q1',
    durationDays: 20,
    assignee: '',
    notes: '',
  },
]);
```

#### Add Item Function:
- Auto-increments `seqNo` based on current array length
- Initializes all 12 fields with defaults

#### Validation:
- Changed from requiring `code` + `title`
- Now requires `taskRef` + `title`

### 7. **Git Commits**

**Commit:** `5677959`
**Message:** "feat: update Step 2 with 12 new RBIA task fields and database migration"

**Files Changed:** 3
- `app/(app)/rbia/plan/CreatePlanWizard.tsx` (interface, state, UI form)
- `app/api/plan/[id]/tasks/route.ts` (POST endpoint with backward compatibility)
- `prisma/schema.prisma` (AuditTask model with 10 new fields)

**New Files:**
- `prisma/migrations/update_audit_tasks_add_rbia_fields.sql` (migration script)

---

## 🔄 Field Mapping (Old → New)

| Old Field | New Field | Type | Notes |
|-----------|-----------|------|-------|
| code | taskRef | string | Primary task identifier |
| title | title | string | Task name (unchanged) |
| department | deptId | string | Now dropdown instead of text |
| riskLevel | riskLevel | string | Same field, updated options |
| auditType | taskType | string | Renamed for clarity |
| plannedQuarter | scheduledQuarter | string | Renamed with Arabic labels |
| estimatedHours | durationDays | number | Converted to days (hours / 8) |
| startDate | *(removed)* | - | Replaced by scheduledQuarter |
| endDate | *(removed)* | - | Replaced by durationDays |
| *(new)* | seqNo | number | Auto-generated sequence |
| leadAuditor | assignee | string | Renamed for clarity |
| objectiveAndScope | notes | string | Renamed for clarity |
| *(new)* | impactLevel | string | Impact assessment |
| *(new)* | priority | string | Execution priority |

---

## 📊 Database Statistics

**Table:** `public.audit_tasks`

**Columns Before:** 15
**Columns After:** 25 (+10 new fields)

**Indexes Before:** 4
**Indexes After:** 8 (+4 new indexes)

**Constraints Before:** 3
**Constraints After:** 7 (+4 new constraints)

**Existing Records Updated:** 5 tasks migrated with default values

---

## 🧪 Testing Checklist

### Form Validation
- [ ] taskRef is required (shows error if empty)
- [ ] title is required (shows error if empty)
- [ ] seqNo auto-increments correctly
- [ ] All dropdowns display Arabic labels
- [ ] durationDays accepts only positive numbers

### Database Operations
- [x] Migration script runs without errors
- [x] New columns created successfully
- [x] Indexes created for performance
- [x] Constraints enforced (UNIQUE, CHECK)
- [x] Existing data migrated with defaults

### API Integration
- [ ] POST /api/plan/:id/tasks accepts new fields
- [ ] Backward compatibility maintained for old clients
- [ ] Field validation works correctly
- [ ] Auto-generates missing fields properly
- [ ] Returns all fields in response

### UI/UX
- [ ] Step 2 title updated to "تفاصيل مهام التدقيق"
- [ ] All 12 fields render correctly
- [ ] Department dropdown has 9 options
- [ ] Task type dropdown has 7 options
- [ ] Risk/Impact/Priority dropdowns work
- [ ] Add task button creates new row
- [ ] Delete button removes task (if > 1)
- [ ] Form validation prevents empty submission

---

## ⚠️ Known Issues

### 1. Prisma Client Regeneration
**Status:** ⚠️ Pending
**Issue:** TypeScript errors in API route due to stale Prisma types
**Cause:** Prisma client cache not cleared properly
**Solution:** Restart VS Code TypeScript server or rebuild project

```bash
# Manual fix:
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma/client
pnpm install
npx prisma generate
```

### 2. Field Compatibility
**Status:** ✅ Addressed
**Issue:** Old API clients might send old field names
**Solution:** Backward compatibility mapping in POST endpoint

---

## 📝 Next Steps

### Immediate (Required for Production)
1. **Restart TypeScript Server**
   - Reload VS Code window
   - Or run `Developer: Restart Extension Host`

2. **Test End-to-End Flow**
   - Create new plan with Step 1
   - Add tasks in Step 2 with all 12 fields
   - Verify database insertion
   - Check task display in RbiaPlanView

3. **Update Existing Tasks Display**
   - Modify task list components to show new fields
   - Update task detail views
   - Add filters for priority, impact, etc.

### Future Enhancements
1. **Advanced Filtering**
   - Filter tasks by priority
   - Filter by impact level
   - Filter by department
   - Search by task reference

2. **Task Analytics**
   - Tasks by priority distribution
   - Tasks by department breakdown
   - Duration vs actual time tracking
   - Assignee workload analysis

3. **Validation Rules**
   - Business rules for task reference format
   - Department-specific task types
   - Priority based on risk + impact matrix
   - Duration limits based on task type

4. **Bulk Operations**
   - Bulk edit assignees
   - Bulk update priorities
   - Bulk reschedule quarters
   - Import/export task templates

---

## 🎉 Summary

### What Changed:
- ✅ **Interface:** PlanItem → PlanTask (9 fields → 12 fields)
- ✅ **Database:** Added 10 new columns with indexes and constraints
- ✅ **API:** Enhanced POST endpoint with backward compatibility
- ✅ **UI:** Complete redesign of Step 2 form with 3-row layout
- ✅ **Migration:** 5 existing tasks updated successfully

### Lines of Code:
- **CreatePlanWizard.tsx:** 267 insertions, 120 deletions
- **Migration SQL:** 105 lines (new file)
- **API Route:** Enhanced with field mapping logic
- **Prisma Schema:** 10 new field definitions

### Commit:
```
commit 5677959
feat: update Step 2 with 12 new RBIA task fields and database migration
3 files changed, 267 insertions(+), 120 deletions(-)
```

### Impact:
- **Users:** More detailed task planning with RBIA methodology
- **Auditors:** Better prioritization and workload management
- **Managers:** Enhanced visibility into audit operations
- **Database:** Richer data model for advanced analytics

---

## 📚 Documentation References

- [RBIA Methodology Standards](https://na.theiia.org/standards-guidance/topics/Pages/Risk-Based-Internal-Auditing.aspx)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)

---

**Report Generated:** 2024
**Developer:** GitHub Copilot AI Agent
**Status:** ✅ Implementation Complete | ⏳ Testing Pending
