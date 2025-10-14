import { z } from 'zod';

export const settingSchema = z.object({
  key: z.string().min(2),
  type: z.enum(['string', 'number', 'boolean', 'json']).default('string'),
  value: z.string().optional(),
});

export type SettingInput = z.infer<typeof settingSchema>;
