// Engagement schema
import { z } from 'zod';

export const EngagementStatus = [
  'DRAFT',
  'IN_PROGRESS',
  'COMPLETED',
  'ARCHIVED',
] as const;

export const engagementSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  status: z.enum(EngagementStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});
