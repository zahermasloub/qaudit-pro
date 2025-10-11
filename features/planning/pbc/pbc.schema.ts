import { z } from "zod";

export const pbcSchema = z.object({
  engagementId: z.string().min(1, "مطلوب"),
  code: z.string().min(2, "الرمز قصير"),
  description: z.string().min(3, "الوصف قصير"),
  ownerId: z.string().min(2, "المسؤول مطلوب"),
  dueDate: z.string().min(10, "صيغة التاريخ غير صحيحة"), // YYYY-MM-DD
  status: z.enum(["open","partial","complete"]).default("open"),
  attachments: z.array(z.string().url("رابط غير صالح")).optional().default([]),
  notes: z.string().optional(),
});

export type PBCFormValues = z.infer<typeof pbcSchema>;
