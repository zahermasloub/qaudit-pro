import { z } from 'zod';

export const roleSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  permissionKeys: z.array(z.string()).default([]),
});

export type RoleInput = z.infer<typeof roleSchema>;
