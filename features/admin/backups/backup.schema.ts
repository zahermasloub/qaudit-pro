import { z } from 'zod';

export const backupRunSchema = z.object({
  mode: z.enum(['local', 's3']).default('local'),
});

export const backupScheduleSchema = z.object({
  cronExpr: z.string().min(5),
  storage: z.enum(['local', 's3']).default('local'),
  enabled: z.boolean().default(true),
});

export type BackupRunInput = z.infer<typeof backupRunSchema>;
export type BackupScheduleInput = z.infer<typeof backupScheduleSchema>;
