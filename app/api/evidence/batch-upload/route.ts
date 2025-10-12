/**
 * Evidence Upload API - رفع الأدلة المتقدم
 * يدعم جميع صيغ الملفات مع معالجة آمنة ومعلومات شاملة
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { evidenceUploadMetaSchema, detectFileCategory } from "@/features/evidence/schemas/evidence-upload.schema";
import { storageManager } from "@/lib/storage-manager";
import { detectMimeTypeByExtension } from "@/lib/file-hash-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const metaRaw = formData.get("meta") as string | null;

    if (!file || !metaRaw) {
      return Response.json({
        ok: false,
        error: "الملف و الميتاداتا مطلوبان"
      }, { status: 400 });
    }

    // تحليل الميتاداتا وتحقق من صحتها
    const meta = evidenceUploadMetaSchema.parse(JSON.parse(metaRaw));

    // التحقق من وجود المهمة
    const engagement = await prisma.engagement.findFirst({
      where: { id: meta.engagementId },
      select: { id: true, title: true, status: true }
    });

    if (!engagement) {
      return Response.json({
        ok: false,
        error: "المهمة المحددة غير موجودة"
      }, { status: 404 });
    }

    // التحقق من الاختبار إذا كان محدداً
    if (meta.linkedTestId) {
      const auditTest = await prisma.auditTest.findFirst({
        where: {
          id: meta.linkedTestId,
          engagementId: meta.engagementId,
        },
        select: { id: true }
      });

      if (!auditTest) {
        return Response.json({
          ok: false,
          error: "الاختبار المحدد غير موجود أو لا ينتمي للمهمة"
        }, { status: 404 });
      }
    }

    // تحويل الملف إلى Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = file.name || "upload.bin";
    const fileMimeType = file.type || detectMimeTypeByExtension(fileName);

    // حفظ الملف باستخدام Storage Manager
    const storageResult = await storageManager.saveFile(fileName, buffer, meta.uploadedBy);

    if (!storageResult.success) {
      return Response.json({
        ok: false,
        error: storageResult.error || "فشل في حفظ الملف"
      }, { status: 500 });
    }

    // تحديد التصنيف تلقائياً إذا لم يكن محدداً
    const category = meta.category || detectFileCategory(fileMimeType, fileName);
    const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : null;

    // إنشاء سجل الدليل في قاعدة البيانات
    const evidence = await prisma.evidence.create({
      data: {
        engagementId: meta.engagementId,
        category,
        linkedTestId: meta.linkedTestId || null,
        linkedSampleRef: meta.linkedSampleRef || null,
        linkedFindingId: meta.linkedFindingId || null,
        storage: storageResult.provider,
        storageKey: storageResult.storageKey,
        bucket: storageResult.bucket || null,
        fileName,
        fileExt: fileExtension,
        mimeType: fileMimeType,
        fileSize: storageResult.fileSize,
        fileHash: storageResult.fileHash,
        virusScanStatus: "pending",
        ocrTextUrl: null,
        status: "active",
        uploadedBy: meta.uploadedBy,
      },
      select: {
        id: true,
        category: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        storage: true,
        storageKey: true,
        virusScanStatus: true,
        uploadedAt: true,
        linkedTestId: true,
        linkedSampleRef: true,
      }
    });

    return Response.json({
      ok: true,
      message: "تم رفع الدليل بنجاح",
      evidence: {
        ...evidence,
        downloadUrl: `/api/evidence/${evidence.id}/download`,
        fileSizeFormatted: formatFileSize(evidence.fileSize),
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Evidence upload error:', error);

    // معالجة أخطاء Zod
    if (error?.errors) {
      const firstError = error.errors[0];
      return Response.json({
        ok: false,
        error: `خطأ في البيانات: ${firstError.message}`,
        field: firstError.path?.join('.'),
        details: error.errors
      }, { status: 400 });
    }

    // معالجة أخطاء حجم الملف
    if (error?.message?.includes('File size')) {
      return Response.json({
        ok: false,
        error: "حجم الملف كبير جداً"
      }, { status: 413 });
    }

    return Response.json({
      ok: false,
      error: error?.message || "خطأ في رفع الدليل",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');
    const category = searchParams.get('category');
    const linkedTestId = searchParams.get('linkedTestId');
    const virusScanStatus = searchParams.get('virusScanStatus') as "pending" | "clean" | "suspected" | "blocked" | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!engagementId) {
      return Response.json({
        ok: false,
        error: "معرف المهمة مطلوب"
      }, { status: 400 });
    }

    const whereClause: any = {
      engagementId,
      status: 'active' // عرض الأدلة النشطة فقط
    };

    if (category) whereClause.category = category;
    if (linkedTestId) whereClause.linkedTestId = linkedTestId;
    if (virusScanStatus) whereClause.virusScanStatus = virusScanStatus;

    const [evidences, totalCount, categoryStats] = await Promise.all([
      prisma.evidence.findMany({
        where: whereClause,
        select: {
          id: true,
          category: true,
          fileName: true,
          fileSize: true,
          mimeType: true,
          fileExt: true,
          storage: true,
          storageKey: true,
          virusScanStatus: true,
          uploadedBy: true,
          uploadedAt: true,
          linkedTestId: true,
          linkedSampleRef: true,
          linkedFindingId: true,
          linkedTest: {
            select: {
              id: true,
              title: true,
              code: true,
            }
          }
        },
        orderBy: { uploadedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.evidence.count({ where: whereClause }),
      prisma.evidence.groupBy({
        by: ['category'],
        where: {
          engagementId,
          status: 'active'
        },
        _count: { id: true }
      })
    ]);

    const formattedEvidences = evidences.map(evidence => ({
      ...evidence,
      downloadUrl: `/api/evidence/${evidence.id}/download`,
      fileSizeFormatted: formatFileSize(evidence.fileSize),
      isImage: evidence.mimeType?.startsWith('image/') || false,
      isDocument: ['application/pdf', 'application/msword'].includes(evidence.mimeType || ''),
    }));

    return Response.json({
      ok: true,
      evidences: formattedEvidences,
      pagination: {
        page,
        limit,
        total: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrevious: page > 1,
      },
      categories: categoryStats.map(stat => ({
        category: stat.category,
        count: stat._count.id,
      }))
    });

  } catch (error: any) {
    console.error('Evidence fetch error:', error);
    return Response.json({
      ok: false,
      error: "خطأ في جلب بيانات الأدلة"
    }, { status: 500 });
  }
}

// Helper function لتنسيق حجم الملف
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
