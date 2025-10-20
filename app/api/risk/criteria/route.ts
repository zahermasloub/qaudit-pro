/**
 * API Endpoint: Risk Criteria Management
 * Manages risk assessment criteria and their weights
 *
 * @swagger
 * /api/risk/criteria:
 *   get:
 *     summary: Get all risk criteria
 *     responses:
 *       200:
 *         description: List of risk criteria with weights
 *   post:
 *     summary: Create or update risk criteria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - weight
 *             properties:
 *               name:
 *                 type: string
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk criteria created
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RiskCriteria {
  name: string;
  weight: number;
  description?: string;
}

export async function GET() {
  try {
    const query = `
      SELECT
        id, name, weight, description, created_at, updated_at
      FROM audit."RiskCriteria"
      ORDER BY weight DESC
    `;

    const criteria = await prisma.$queryRawUnsafe(query);

    return NextResponse.json({
      ok: true,
      data: criteria,
      count: Array.isArray(criteria) ? criteria.length : 0
    });
  } catch (error: any) {
    console.error('GET /api/risk/criteria error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في جلب معايير المخاطر' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: RiskCriteria = await req.json();

    // Validation
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: 'الاسم مطلوب' },
        { status: 400 }
      );
    }

    if (body.weight === undefined || body.weight === null) {
      return NextResponse.json(
        { ok: false, error: 'الوزن مطلوب' },
        { status: 400 }
      );
    }

    const weight = Number(body.weight);
    if (isNaN(weight) || weight < 0 || weight > 100) {
      return NextResponse.json(
        { ok: false, error: 'الوزن يجب أن يكون بين 0 و 100' },
        { status: 400 }
      );
    }

    const query = `
      INSERT INTO audit."RiskCriteria"
        (name, weight, description)
      VALUES
        ($1, $2, $3)
      RETURNING id, name, weight, description
    `;

    const result: any = await prisma.$queryRawUnsafe(
      query,
      body.name.trim(),
      weight,
      body.description || null
    );

    const created = Array.isArray(result) ? result[0] : result;

    return NextResponse.json(
      { ok: true, data: created },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/risk/criteria error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في إنشاء معيار المخاطر' },
      { status: 500 }
    );
  }
}
