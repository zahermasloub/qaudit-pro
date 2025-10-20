import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/plan:
 *   post:
 *     summary: إنشاء خطة سنوية جديدة
 *     description: Creates a new annual audit plan with draft status
 *     tags:
 *       - Annual Plans
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *                 description: السنة المالية
 *                 example: 2025
 *               version:
 *                 type: string
 *                 description: رقم النسخة (افتراضي v1)
 *                 example: "v1"
 *               owner_id:
 *                 type: string
 *                 description: معرّف المالك
 *                 example: "user-123"
 *     responses:
 *       201:
 *         description: تم إنشاء الخطة بنجاح
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 year:
 *                   type: integer
 *                 version:
 *                   type: string
 *                 status:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       400:
 *         description: بيانات غير صحيحة
 *       500:
 *         description: خطأ في الخادم
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, version = 'v1', owner_id } = body;

    // Validation
    if (!year || typeof year !== 'number') {
      return NextResponse.json(
        { error: 'السنة مطلوبة ويجب أن تكون رقماً' },
        { status: 400 }
      );
    }

    // Check if plan already exists for this year/version
    const existing = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id FROM audit.annualplans WHERE fiscal_year = $1 AND version = $2 LIMIT 1`,
      year,
      version
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: `خطة للسنة ${year} بالنسخة ${version} موجودة مسبقاً` },
        { status: 400 }
      );
    }

    // Create plan
    const result = await prisma.$queryRawUnsafe<any[]>(
      `INSERT INTO audit.annualplans (fiscal_year, version, status, owner_id, created_at, updated_at)
       VALUES ($1, $2, 'draft', $3, NOW(), NOW())
       RETURNING id, fiscal_year as year, version, status, owner_id, created_at, updated_at`,
      year,
      version,
      owner_id || null
    );

    return NextResponse.json(result[0], { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating plan:', error);
    return NextResponse.json(
      { error: 'فشل إنشاء الخطة', details: error.message },
      { status: 500 }
    );
  }
}
