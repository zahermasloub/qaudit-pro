import { z } from 'zod';

export const runSchema = z.object({
  engagementId: z.string().min(1, 'Engagement ID is required'),
  auditTestId: z.string().min(1, 'Audit Test ID is required'),
  stepIndex: z.number().int().min(0, 'Step index must be >= 0'),
  actionTaken: z.string().min(3, 'Action taken must be at least 3 characters'),
  result: z.enum(['pass', 'fail', 'exception'], {
    required_error: 'Result is required',
  }),
  notes: z.string().optional(),
  sampleRef: z.string().optional(),
  evidenceIds: z.array(z.string()).default([]),
  executedBy: z.string().email('Valid email is required'),
});

export type RunFormValues = z.infer<typeof runSchema>;
