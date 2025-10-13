import { z } from 'zod';

export const samplingSchema = z.object({
  testId: z.string().min(1, 'Test ID مطلوب'),
  method: z.enum(['random', 'judgment', 'monetary']),
  populationSize: z.number().min(1, 'حجم المجتمع يجب أن يكون أكبر من صفر'),
  sampleSize: z.number().min(1, 'حجم العينة يجب أن يكون أكبر من صفر'),
  confidenceLevel: z.number().min(0).max(1).optional().default(0.95),
  precisionRate: z.number().min(0).max(1).optional().default(0.05),
  criteria: z
    .object({
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      dateFrom: z.string().optional(),
      dateTo: z.string().optional(),
      category: z.string().optional(),
      riskLevel: z.enum(['low', 'medium', 'high']).optional(),
      randomSeed: z.number().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export type SamplingFormValues = z.infer<typeof samplingSchema>;
