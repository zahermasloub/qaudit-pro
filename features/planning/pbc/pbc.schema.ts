// PBC schema
import { z } from 'zod';

export const PBCStatus = [
  'OPEN',
  'CLOSED',
  'REVIEWED',
] as const;

export const pbcSchema = z.object({
  id: z.string(),
  code: z.string(),
  status: z.enum(PBCStatus),
  engagementId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
