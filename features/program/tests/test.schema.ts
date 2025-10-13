import { z } from 'zod';

export const testSchema = z.object({
  engagementId: z.string().min(1, 'مطلوب'),
  code: z.string().min(2, 'الرمز قصير'),
  title: z.string().min(3, 'العنوان قصير'),
  objective: z.string().min(5, 'الهدف مطلوب'),
  controlId: z.string().optional(),
  riskId: z.string().optional(),
  testSteps: z.array(z.string().min(1)).min(1, 'خطوة واحدة على الأقل'),
  expectedResults: z.string().min(3, 'النتائج المتوقعة مطلوبة'),
  status: z.enum(['planned', 'in_progress', 'completed', 'blocked']).default('planned'),
  assignedTo: z.string().optional(),
  plannedHours: z.number().min(1).optional(),
  actualResults: z.string().optional(),
  conclusion: z.string().optional(),
  actualHours: z.number().min(0).optional(),
});

export type TestFormValues = z.infer<typeof testSchema>;
