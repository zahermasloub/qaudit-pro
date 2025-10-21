import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(2, { message: 'الاسم يجب أن يكون حرفين على الأقل' }),
  email: z.string().email({ message: 'البريد الإلكتروني غير صحيح' }),
  password: z.string().min(8, { message: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' }),
  role: z.enum(['Admin', 'IA_Lead', 'IA_Auditor', 'User'], {
    errorMap: () => ({ message: 'يجب اختيار دور صحيح' }),
  }).default('IA_Auditor'),
  locale: z.enum(['ar', 'en']).default('ar'),
  roleIds: z.array(z.string()).default([]),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .extend({ id: z.string().min(1), password: z.string().min(8).optional() });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
