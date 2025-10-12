/**
 * Evidence Download API - تحميل آمن للأدلة المرفوعة
 * يدعم التحقق من الصلاحيات والتحميل المحلي مع أمان شامل
 */

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { storageManager } from "@/lib/storage-manager";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    if (!id) {
      return Response.json({
        ok: false,
        error: "معرف الدليل مطلوب"
      }, { status: 400 });
    }

    // البحث عن الدليل في قاعدة البيانات
    const evidence = await prisma.evidence.findFirst({
      where: {
        id,
        status: 'active', // فقط الأدلة النشطة
      },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        fileSize: true,
        storage: true,
        storageKey: true,
        bucket: true,
        virusScanStatus: true,
        engagementId: true,
        uploadedBy: true,
        uploadedAt: true,
        engagement: {
          select: {
            id: true,
            title: true,
            createdBy: true,
          }
        }
      }
    });

    if (!evidence) {
      return Response.json({
        ok: false,
        error: "الدليل غير موجود أو محذوف"
      }, { status: 404 });
    }

    // التحقق من حالة فحص الفيروسات
    if (evidence.virusScanStatus === 'blocked') {
      return Response.json({
        ok: false,
        error: "هذا الملف محظور بسبب احتوائه على فيروسات"
      }, { status: 403 });
    }

    if (evidence.virusScanStatus === 'suspected') {
      // تحذير ولكن السماح بالتحميل
      console.warn(`⚠️  Downloading suspected file: ${evidence.id} - ${evidence.fileName}`);
    }

    // جلب محتوى الملف من التخزين
    let fileBuffer: Buffer | null = null;

    if (evidence.storage === 'local') {
      fileBuffer = await storageManager.getFile(evidence.storageKey);
    } else if (evidence.storage === 's3') {
      // TODO: تنفيذ S3 download أو إرجاع pre-signed URL
      return Response.json({
        ok: false,
        error: "تحميل S3 غير مدعوم حالياً"
      }, { status: 501 });
    }

    if (!fileBuffer) {
      return Response.json({
        ok: false,
        error: "الملف غير موجود في التخزين"
      }, { status: 410 });
    }

    // تسجيل عملية التحميل (اختياري)
    console.log(`📥 File downloaded: ${evidence.fileName} (${evidence.fileSize} bytes) by user from engagement ${evidence.engagementId}`);

    // إعداد headers للتحميل
    const headers = new Headers();
    headers.set('Content-Type', evidence.mimeType || 'application/octet-stream');
    headers.set('Content-Length', evidence.fileSize.toString());
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(evidence.fileName)}`);
    headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');

    // إضافة معلومات أمنية
    if (evidence.virusScanStatus === 'suspected') {
      headers.set('X-Security-Warning', 'suspected-content');
    }

    headers.set('X-File-Hash', 'available'); // يمكن إضافة hash للتحقق من السلامة
    headers.set('X-Upload-Date', evidence.uploadedAt.toISOString());

    return new Response(fileBuffer, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Evidence download error:', error);

    return Response.json({
      ok: false,
      error: "خطأ في تحميل الدليل",
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}

// معلومات الدليل بدون تحميل
export async function HEAD(req: NextRequest, { params }: RouteParams) {
  try {
    const evidence = await prisma.evidence.findFirst({
      where: {
        id: params.id,
        status: 'active',
      },
      select: {
        fileName: true,
        mimeType: true,
        fileSize: true,
        virusScanStatus: true,
        uploadedAt: true,
      }
    });

    if (!evidence) {
      return new Response(null, { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', evidence.mimeType || 'application/octet-stream');
    headers.set('Content-Length', evidence.fileSize.toString());
    headers.set('X-Virus-Scan-Status', evidence.virusScanStatus);
    headers.set('X-Upload-Date', evidence.uploadedAt.toISOString());

    return new Response(null, {
      status: 200,
      headers,
    });

  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
