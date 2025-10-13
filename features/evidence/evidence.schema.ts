import { z } from 'zod';

export const evidenceUploadMetaSchema = z.object({
  engagementId: z.string().min(1, 'Engagement ID is required'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  linkedTestId: z.string().optional(),
  linkedSampleRef: z.string().optional(),
  linkedFindingId: z.string().optional(),
  uploadedBy: z.string().email('Valid email is required'),
});

export type EvidenceUploadMeta = z.infer<typeof evidenceUploadMetaSchema>;
