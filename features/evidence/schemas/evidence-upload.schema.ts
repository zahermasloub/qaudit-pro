/**
 * Evidence Upload Schema - تحقق من بيانات رفع الأدلة
 * يدعم كافة صيغ الملفات مع ميتاداتا شاملة للربط والتصنيف
 */

import { z } from "zod";

// نموذج ميتاداتا رفع الأدلة (FormData: file + meta JSON)
export const evidenceUploadMetaSchema = z.object({
  engagementId: z.string().min(1, "معرف المهمة مطلوب"),
  category: z.string().min(2, "التصنيف يجب أن يكون حرفين على الأقل"),
  linkedTestId: z.string().optional(),
  linkedSampleRef: z.string().optional(),
  linkedFindingId: z.string().optional(),
  uploadedBy: z.string().email("بريد إلكتروني صحيح مطلوب للرافع"),
  description: z.string().max(500, "الوصف لا يجب أن يتجاوز 500 حرف").optional(),
});

// نموذج تصنيف الأدلة المتقدم
export const evidenceCategorySchema = z.enum([
  "invoice",           // فاتورة
  "contract",          // عقد
  "screenshot",        // لقطة شاشة
  "sql_export",        // تصدير SQL
  "excel_report",      // تقرير Excel
  "email_thread",      // سلسلة بريد إلكتروني
  "system_log",        // سجل النظام
  "policy_document",   // وثيقة سياسة
  "procedure_manual",  // دليل إجراءات
  "audit_trail",       // مسار التدقيق
  "financial_statement", // بيان مالي
  "bank_statement",    // كشف حساب بنكي
  "other"             // أخرى
], {
  errorMap: () => ({ message: "تصنيف الدليل غير مدعوم" })
});

// نموذج البحث في الأدلة
export const evidenceSearchSchema = z.object({
  engagementId: z.string().min(1),
  category: evidenceCategorySchema.optional(),
  linkedTestId: z.string().optional(),
  virusScanStatus: z.enum(["pending", "clean", "suspected", "blocked"]).optional(),
  uploadedBy: z.string().optional(),
  dateFrom: z.string().optional(), // ISO date string
  dateTo: z.string().optional(),   // ISO date string
  fileType: z.string().optional(), // MIME type filter
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type EvidenceUploadMeta = z.infer<typeof evidenceUploadMetaSchema>;
export type EvidenceCategory = z.infer<typeof evidenceCategorySchema>;
export type EvidenceSearchParams = z.infer<typeof evidenceSearchSchema>;

// Helper functions للتصنيفات
export function getCategoryLabel(category: string): string {
  const labels = {
    invoice: "فاتورة",
    contract: "عقد",
    screenshot: "لقطة شاشة",
    sql_export: "تصدير SQL",
    excel_report: "تقرير Excel",
    email_thread: "سلسلة بريد إلكتروني",
    system_log: "سجل النظام",
    policy_document: "وثيقة سياسة",
    procedure_manual: "دليل إجراءات",
    audit_trail: "مسار التدقيق",
    financial_statement: "بيان مالي",
    bank_statement: "كشف حساب بنكي",
    other: "أخرى"
  };
  return labels[category as keyof typeof labels] || category;
}

export function detectFileCategory(mimeType: string, fileName: string): EvidenceCategory {
  const lower = fileName.toLowerCase();

  if (mimeType.startsWith('image/')) return 'screenshot';
  if (mimeType === 'application/pdf') {
    if (lower.includes('invoice') || lower.includes('فاتورة')) return 'invoice';
    if (lower.includes('contract') || lower.includes('عقد')) return 'contract';
    if (lower.includes('statement') || lower.includes('كشف')) return 'bank_statement';
    return 'policy_document';
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'excel_report';
  if (mimeType === 'text/csv') return 'sql_export';
  if (mimeType.includes('word')) return 'procedure_manual';

  return 'other';
}
