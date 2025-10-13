/**
 * Fieldwork Runs API - تنفيذ خطوات الاختبارات الميدانية
 * يدعم تسجيل تفصيلي لجميع خطوات التنفيذ مع ربط الأدلة
 */

import type { NextRequest } from 'next/server';

import {
  testExecutionSchema,
  testRunBatchSchema,
} from '@/features/fieldwork/execution/test-execution.schema';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // تحديد نوع الطلب: تنفيذ مفرد أم مجموعة
    if (body.runs && Array.isArray(body.runs)) {
      // تنفيذ مجموعة من الخطوات
      const batchData = testRunBatchSchema.parse(body);
      const results = [];

      for (const runData of batchData.runs) {
        const created = await prisma.testRun.create({
          data: {
            engagementId: runData.engagementId,
            auditTestId: runData.auditTestId,
            stepIndex: runData.stepIndex,
            actionTaken: runData.actionTaken,
            result: runData.result,
            notes: runData.notes || null,
            sampleRef: runData.sampleRef || null,
            evidenceIds: runData.evidenceIds || [],
            executedBy: runData.executedBy,
          },
          select: {
            id: true,
            stepIndex: true,
            result: true,
            executedAt: true,
          },
        });
        results.push(created);
      }

      return Response.json(
        {
          ok: true,
          message: `تم تنفيذ ${results.length} خطوة بنجاح`,
          runs: results,
          batchNotes: batchData.batchNotes,
        },
        { status: 201 },
      );
    } else {
      // تنفيذ خطوة واحدة
      const runData = testExecutionSchema.parse(body);

      // التحقق من وجود الاختبار والمهمة
      const auditTest = await prisma.auditTest.findFirst({
        where: {
          id: runData.auditTestId,
          engagementId: runData.engagementId,
        },
        select: { id: true, title: true, status: true },
      });

      if (!auditTest) {
        return Response.json(
          {
            ok: false,
            error: 'الاختبار المحدد غير موجود أو لا ينتمي للمهمة',
          },
          { status: 404 },
        );
      }

      const created = await prisma.testRun.create({
        data: {
          engagementId: runData.engagementId,
          auditTestId: runData.auditTestId,
          stepIndex: runData.stepIndex,
          actionTaken: runData.actionTaken,
          result: runData.result,
          notes: runData.notes || null,
          sampleRef: runData.sampleRef || null,
          evidenceIds: runData.evidenceIds || [],
          executedBy: runData.executedBy,
        },
        select: {
          id: true,
          stepIndex: true,
          actionTaken: true,
          result: true,
          notes: true,
          sampleRef: true,
          evidenceIds: true,
          executedBy: true,
          executedAt: true,
          auditTest: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });

      // تحديث حالة الاختبار إذا لزم الأمر
      if (auditTest.status === 'planned') {
        await prisma.auditTest.update({
          where: { id: runData.auditTestId },
          data: { status: 'in_progress' },
        });
      }

      return Response.json(
        {
          ok: true,
          message: 'تم تنفيذ الخطوة بنجاح',
          run: created,
        },
        { status: 201 },
      );
    }
  } catch (error: any) {
    console.error('Test run execution error:', error);

    // معالجة أخطاء Zod
    if (error?.errors) {
      const firstError = error.errors[0];
      return Response.json(
        {
          ok: false,
          error: `خطأ في البيانات: ${firstError.message}`,
          field: firstError.path?.join('.'),
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        ok: false,
        error: error?.message || 'خطأ في تنفيذ خطوة الاختبار',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');
    const auditTestId = searchParams.get('auditTestId');
    const result = searchParams.get('result') as 'pass' | 'fail' | 'exception' | null;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!engagementId) {
      return Response.json(
        {
          ok: false,
          error: 'معرف المهمة مطلوب',
        },
        { status: 400 },
      );
    }

    const whereClause: any = { engagementId };
    if (auditTestId) whereClause.auditTestId = auditTestId;
    if (result) whereClause.result = result;

    const [runs, totalCount] = await Promise.all([
      prisma.testRun.findMany({
        where: whereClause,
        include: {
          auditTest: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
        orderBy: { executedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.testRun.count({ where: whereClause }),
    ]);

    return Response.json({
      ok: true,
      runs,
      pagination: {
        page,
        limit,
        total: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        hasNext: page * limit < totalCount,
        hasPrevious: page > 1,
      },
    });
  } catch (error: any) {
    console.error('Test runs fetch error:', error);
    return Response.json(
      {
        ok: false,
        error: 'خطأ في جلب بيانات التنفيذ',
      },
      { status: 500 },
    );
  }
}
