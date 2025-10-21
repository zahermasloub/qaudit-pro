import { z } from 'zod';

// ============================================================================
// Annual Plan Types and Schemas
// ============================================================================

// Risk Sources Checklist
export const RISK_SOURCES = [
  'previous_reports',
  'interviews',
  'financial_analysis',
  'risk_register',
  'external_audit',
  'compliance_review',
  'management_input',
] as const;

export const APPROVED_BY_OPTIONS = [
  'board_of_directors',
  'audit_committee',
  'executive_management',
  'internal_audit_dept',
] as const;

export const TASK_TYPES = [
  'operational',
  'financial',
  'compliance',
  'follow_up',
  'it_systems',
  'performance',
  'advisory',
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const IMPACT_LEVELS = ['low', 'medium', 'high'] as const;
export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export const PLAN_STATUSES = ['draft', 'submitted', 'approved', 'archived'] as const;

// ============================================================================
// Step 1: Annual Plan Schema
// ============================================================================

export const annualPlanStep1Schema = z.object({
  plan_ref: z
    .string()
    .min(4, 'الرقم المرجعي يجب أن يكون 4 أحرف على الأقل')
    .max(20, 'الرقم المرجعي يجب ألا يتجاوز 20 حرفاً')
    .regex(/^[A-Za-z0-9\-]+$/, 'يُسمح فقط بالحروف والأرقام والشرطات'),

  fiscal_year: z
    .number()
    .min(2000, 'السنة المالية يجب أن تكون من 2000 فما فوق')
    .max(2100, 'السنة المالية يجب أن تكون قبل 2100')
    .int('السنة المالية يجب أن تكون رقماً صحيحاً'),

  prepared_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ يجب أن يكون بصيغة YYYY-MM-DD')
    .refine((date) => new Date(date) <= new Date(), {
      message: 'تاريخ الإعداد يجب أن يكون اليوم أو قبله',
    })
    .refine(
      (date) => {
        const year = new Date(date).getFullYear();
        return year >= 2000 && year <= 2100;
      },
      { message: 'تاريخ الإعداد يجب أن يكون ضمن نطاق السنة المالية' },
    ),

  approved_by: z.enum(APPROVED_BY_OPTIONS, {
    errorMap: () => ({ message: 'يرجى اختيار الجهة المعتمدة' }),
  }),

  prepared_by: z.string().optional(),

  standards: z.string().optional(),

  methodology: z.string().optional(),

  objectives: z.string().optional(),

  risk_sources: z.array(z.enum(RISK_SOURCES)).default([]),
});

// ============================================================================
// Step 2: Plan Task Schema
// ============================================================================

export const planTaskSchema = z.object({
  task_id: z.number().optional(), // For editing existing tasks
  seq_no: z.number().int().positive('الرقم التسلسلي يجب أن يكون موجباً'),
  task_ref: z.string().optional(),
  dept_id: z.number().int().positive('يرجى اختيار الإدارة').optional(),
  title: z.string().min(3, 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل'),
  task_type: z.enum(TASK_TYPES, {
    errorMap: () => ({ message: 'يرجى اختيار نوع المهمة' }),
  }),
  risk_level: z.enum(RISK_LEVELS, {
    errorMap: () => ({ message: 'يرجى اختيار درجة الخطورة' }),
  }),
  impact_level: z.enum(IMPACT_LEVELS, {
    errorMap: () => ({ message: 'يرجى اختيار تقييم الأثر' }),
  }),
  priority: z.enum(PRIORITIES, {
    errorMap: () => ({ message: 'يرجى اختيار الأولوية' }),
  }),
  scheduled_quarter: z.enum(QUARTERS, {
    errorMap: () => ({ message: 'يرجى اختيار ربع السنة' }),
  }),
  duration_days: z.number().int().positive('المدة يجب أن تكون يوماً واحداً على الأقل'),
  assignee: z.string().optional(),
  notes: z.string().optional(),
});

// ============================================================================
// Complete Annual Plan Schema (for final submission)
// ============================================================================

export const completeAnnualPlanSchema = z.object({
  plan: annualPlanStep1Schema,
  tasks: z.array(planTaskSchema).min(1, 'يجب إضافة مهمة واحدة على الأقل'),
});

// ============================================================================
// TypeScript Types
// ============================================================================

export type AnnualPlanStep1 = z.infer<typeof annualPlanStep1Schema>;
export type PlanTask = z.infer<typeof planTaskSchema>;
export type CompleteAnnualPlan = z.infer<typeof completeAnnualPlanSchema>;

export type RiskSource = (typeof RISK_SOURCES)[number];
export type ApprovedBy = (typeof APPROVED_BY_OPTIONS)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type RiskLevel = (typeof RISK_LEVELS)[number];
export type ImpactLevel = (typeof IMPACT_LEVELS)[number];
export type Priority = (typeof PRIORITIES)[number];
export type Quarter = (typeof QUARTERS)[number];
export type PlanStatus = (typeof PLAN_STATUSES)[number];

// ============================================================================
// Label Maps (for UI display)
// ============================================================================

export const APPROVED_BY_LABELS: Record<ApprovedBy, string> = {
  board_of_directors: 'مجلس الإدارة',
  audit_committee: 'لجنة التدقيق',
  executive_management: 'الإدارة التنفيذية',
  internal_audit_dept: 'إدارة التدقيق الداخلي',
};

export const RISK_SOURCE_LABELS: Record<RiskSource, string> = {
  previous_reports: 'تقارير التدقيق السابقة',
  interviews: 'مقابلات مع الإدارة',
  financial_analysis: 'التحليل المالي',
  risk_register: 'سجل المخاطر',
  external_audit: 'تقارير التدقيق الخارجي',
  compliance_review: 'مراجعة الالتزام',
  management_input: 'مدخلات الإدارة',
};

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  operational: 'تدقيق تشغيلي',
  financial: 'تدقيق مالي',
  compliance: 'تدقيق التزام',
  follow_up: 'متابعة التوصيات',
  it_systems: 'تدقيق نظم معلومات',
  performance: 'تدقيق أداء',
  advisory: 'مهمة استشارية',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالٍ',
  critical: 'حرج',
};

export const IMPACT_LEVEL_LABELS: Record<ImpactLevel, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالٍ',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالٍ',
  urgent: 'عاجل',
};

export const PLAN_STATUS_LABELS: Record<PlanStatus, string> = {
  draft: 'مسودة',
  submitted: 'مقدمة',
  approved: 'معتمدة',
  archived: 'مؤرشفة',
};

// ============================================================================
// Helper Functions
// ============================================================================

export function getNextSeqNo(tasks: PlanTask[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map((t) => t.seq_no)) + 1;
}

export function validatePlanRefUnique(planRef: string, existingRefs: string[]): boolean {
  return !existingRefs.includes(planRef);
}

export function getFiscalYearFromDate(date: string): number {
  return new Date(date).getFullYear();
}
