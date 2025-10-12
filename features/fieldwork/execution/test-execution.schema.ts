/**
 * Test Run Schema - تحقق من بيانات تنفيذ خطوات الاختبار
 * يدعم جميع أنواع نتائج الاختبارات مع ربط الأدلة والعينات
 */

import { z } from "zod";

export const testExecutionSchema = z.object({
  engagementId: z.string().min(1, "معرف المهمة مطلوب"),
  auditTestId: z.string().min(1, "معرف الاختبار مطلوب"),
  stepIndex: z.number().int().min(0, "رقم الخطوة يجب أن يكون موجب"),
  actionTaken: z.string().min(3, "وصف الإجراء يجب أن يكون 3 أحرف على الأقل"),
  result: z.enum(["pass", "fail", "exception"], {
    errorMap: () => ({ message: "النتيجة يجب أن تكون: نجح، فشل، أو استثناء" })
  }),
  notes: z.string().optional(),
  sampleRef: z.string().optional(),
  evidenceIds: z.array(z.string()).optional().default([]),
  executedBy: z.string().email("بريد إلكتروني صحيح مطلوب للمنفذ"),
});

export const testRunBatchSchema = z.object({
  runs: z.array(testExecutionSchema).min(1, "يجب تنفيذ خطوة واحدة على الأقل"),
  batchNotes: z.string().optional(),
});

export type TestExecutionFormValues = z.infer<typeof testExecutionSchema>;
export type TestRunBatchFormValues = z.infer<typeof testRunBatchSchema>;

// Helper function لتحويل النتائج للعربية
export function getResultLabel(result: string): string {
  const labels = {
    pass: "نجح",
    fail: "فشل",
    exception: "استثناء"
  };
  return labels[result as keyof typeof labels] || result;
}
