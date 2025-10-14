import { z } from 'zod';

export const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  locale: z.enum(['ar', 'en']).default('ar'),
  roleIds: z.array(z.string()).default([]),
});

export const userUpdateSchema = userCreateSchema
  .partial()
  .extend({ id: z.string().min(1), password: z.string().min(8).optional() });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
