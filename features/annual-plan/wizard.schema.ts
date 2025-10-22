/**
 * Annual Plan Wizard - Zod validation schemas
 * Two-step wizard for creating annual plans with draft save
 */

import { z } from 'zod';

// Step 1: Plan Data Schema
export const planDataSchema = z.object({
  planRef: z.string().min(3, 'رقم مرجع الخطة مطلوب (3 أحرف على الأقل)'),
  fiscalYear: z.number().int().min(2020).max(2100, 'السنة المالية غير صحيحة'),
  preparedDate: z.string().min(1, 'تاريخ الإعداد مطلوب'),
  approvedBy: z.string().optional(),
  preparedByName: z.string().optional(),
  standards: z.string().optional(),
  methodology: z.string().optional(),
  objectives: z.string().optional(),
  riskSources: z.array(z.string()).default([]),
});

export type PlanDataFormValues = z.infer<typeof planDataSchema>;

// Step 2: Task Schema
export const taskSchema = z.object({
  seqNo: z.number().int().positive('التسلسل يجب أن يكون أكبر من صفر'),
  taskRef: z.string().min(2, 'رمز المهمة مطلوب'),
  deptId: z.string().optional(),
  title: z.string().min(3, 'عنوان المهمة مطلوب'),
  taskType: z.string().default('compliance'),
  riskLevel: z.enum(['very_high', 'high', 'medium', 'low']).default('medium'),
  impactLevel: z.string().default('medium'),
  priority: z.string().default('medium'),
  scheduledQuarter: z.string().default('Q1'),
  durationDays: z.number().int().positive('المدة يجب أن تكون أكبر من صفر').default(20),
  assignee: z.string().optional(),
  notes: z.string().optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// Combined wizard data (for draft save)
export const wizardDataSchema = z.object({
  // Step 1 fields
  planRef: z.string().min(3),
  fiscalYear: z.number().int(),
  preparedDate: z.string().optional(),
  approvedBy: z.string().optional(),
  preparedByName: z.string().optional(),
  standards: z.string().optional(),
  methodology: z.string().optional(),
  objectives: z.string().optional(),
  riskSources: z.array(z.string()).default([]),
  
  // Step 2 fields
  tasks: z.array(taskSchema).default([]),
  
  // Status
  status: z.enum(['draft', 'submitted']).default('draft'),
});

export type WizardDataValues = z.infer<typeof wizardDataSchema>;
