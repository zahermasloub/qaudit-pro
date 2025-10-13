import { z } from 'zod';

export const engagementSchema = z.object({
  code: z.string().min(3, 'كود المهمة يجب أن يكون 3 أحرف على الأقل'),
  title: z.string().min(3, 'عنوان المهمة يجب أن يكون 3 أحرف على الأقل'),
  objective: z.string().min(5, 'هدف المهمة يجب أن يكون 5 أحرف على الأقل'),
  scope: z.array(z.string()).min(1, 'يجب تحديد نطاق واحد على الأقل'),
  criteria: z.array(z.string()).min(1, 'يجب تحديد معيار واحد على الأقل'),
  constraints: z.array(z.string()).optional().default([]),
  auditeeUnits: z.array(z.string()).min(1, 'يجب تحديد وحدة مُدققة واحدة على الأقل'),
  stakeholders: z.array(z.string()).optional().default([]),
  startDate: z.string().min(10, 'تاريخ البداية مطلوب'),
  endDate: z.string().min(10, 'تاريخ النهاية مطلوب'),
  budgetHours: z.number().int().positive('ساعات الميزانية يجب أن تكون رقم صحيح موجب'),
  independenceDisclosureUrl: z.string().url('رابط غير صحيح').optional(),
  createdBy: z.string().email('البريد الإلكتروني غير صحيح'),
});

export type EngagementFormValues = z.infer<typeof engagementSchema>;
