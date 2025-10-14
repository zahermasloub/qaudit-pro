/**
 * Annual Plan - Zod validation schemas
 */

import { z } from 'zod';

export const annualPlanStatus = z.enum([
  'draft',
  'under_review',
  'approved',
  'cancelled',
  'completed',
]);

export const annualPlanSchema = z.object({
  title: z.string().min(5, 'أدخل عنواناً واضحاً'),
  fiscalYear: z.number().int().min(2020).max(2100),
  version: z.string().regex(/^\d+\.\d+$/, 'صيغة الإصدار مثل 1.0'),
  status: annualPlanStatus.default('draft'),
  introduction: z.string().optional(),

  orgUnitId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),

  totalAvailableHours: z.number().int().min(0),
  plannedTaskHours: z.number().int().min(0),
  advisoryHours: z.number().int().min(0),
  emergencyHours: z.number().int().min(0),
  followUpHours: z.number().int().min(0),
  trainingHours: z.number().int().min(0),
  administrativeHours: z.number().int().min(0),

  estimatedBudget: z.number().nonnegative().optional(),
  createdBy: z.string().default('session-user@placeholder'),
});

export type AnnualPlanFormValues = z.infer<typeof annualPlanSchema>;

export function sumAlloc(v: AnnualPlanFormValues) {
  return (
    v.plannedTaskHours +
    v.advisoryHours +
    v.emergencyHours +
    v.followUpHours +
    v.trainingHours +
    v.administrativeHours
  );
}

export const auditTaskSchema = z.object({
  annualPlanId: z.string().min(1, 'مطلوب'),
  code: z.string().min(2, 'الرمز قصير'),
  title: z.string().min(3, 'العنوان قصير'),
  department: z.string().min(2, 'اسم الإدارة مطلوب'),
  riskLevel: z.enum(['very_high', 'high', 'medium', 'low']),
  auditType: z.enum([
    'financial',
    'operational',
    'compliance',
    'it_systems',
    'performance',
    'advisory',
  ]),
  objectiveAndScope: z.string().optional(),
  plannedQuarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
  estimatedHours: z.number().int().positive('الساعات يجب أن تكون أكبر من صفر'),
  leadAuditor: z.string().optional(),
  attachmentsJson: z.array(z.any()).default([]),
  status: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
});

export type AuditTaskInput = z.infer<typeof auditTaskSchema>;

export const planApprovalSchema = z.object({
  annualPlanId: z.string().min(1, 'مطلوب'),
  approverName: z.string().min(2, 'الاسم مطلوب'),
  approverRole: z.string().min(2, 'الدور مطلوب'),
  comments: z.string().optional(),
});

export type PlanApprovalInput = z.infer<typeof planApprovalSchema>;
