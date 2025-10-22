/**
 * API Endpoint: Risk Assessment
 * Calculates and stores risk assessments for audit universe items
 *
 * @swagger
 * /api/risk/assess:
 *   post:
 *     summary: Assess risk for an audit universe item
 *     description: Calculates risk score as likelihood × impact × (weight/100)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - au_id
 *               - likelihood
 *               - impact
 *               - weight
 *             properties:
 *               au_id:
 *                 type: string
 *                 format: uuid
 *               likelihood:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               impact:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               residual_score:
 *                 type: number
 *               evidence:
 *                 type: string
 *     responses:
 *       201:
 *         description: Risk assessment created
 *       400:
 *         description: Invalid input
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RiskAssessment {
  au_id: string;
  likelihood: number;
  impact: number;
  weight: number;
  residual_score?: number;
  evidence?: string;
}

export async function POST(req: Request) {
  try {
    const body: RiskAssessment = await req.json();

    // Validation
    if (!body.au_id) {
      return NextResponse.json({ ok: false, error: 'معرّف عنصر الكون مطلوب' }, { status: 400 });
    }

    const likelihood = Number(body.likelihood);
    const impact = Number(body.impact);
    const weight = Number(body.weight);

    if (isNaN(likelihood) || likelihood < 1 || likelihood > 5) {
      return NextResponse.json(
        { ok: false, error: 'الاحتمالية يجب أن تكون بين 1 و 5' },
        { status: 400 },
      );
    }

    if (isNaN(impact) || impact < 1 || impact > 5) {
      return NextResponse.json(
        { ok: false, error: 'التأثير يجب أن يكون بين 1 و 5' },
        { status: 400 },
      );
    }

    if (isNaN(weight) || weight < 0 || weight > 100) {
      return NextResponse.json(
        { ok: false, error: 'الوزن يجب أن يكون بين 0 و 100' },
        { status: 400 },
      );
    }

    // Calculate risk score: likelihood × impact × (weight/100)
    const score = likelihood * impact * (weight / 100);

    // Check if AU exists
    const auCheck: any = await prisma.$queryRawUnsafe(
      'SELECT id FROM audit."AuditUniverse" WHERE id = $1',
      body.au_id,
    );

    if (!auCheck || auCheck.length === 0) {
      return NextResponse.json({ ok: false, error: 'عنصر الكون غير موجود' }, { status: 404 });
    }

    const query = `
      INSERT INTO audit."RiskAssessments"
        (au_id, likelihood, impact, weight, score, residual_score, evidence)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, au_id, likelihood, impact, weight, score, residual_score, evidence, created_at
    `;

    const result: any = await prisma.$queryRawUnsafe(
      query,
      body.au_id,
      likelihood,
      impact,
      weight,
      score,
      body.residual_score || null,
      body.evidence || null,
    );

    const created = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({ ok: true, data: created, score }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/risk/assess error:', error);

    // Handle foreign key constraint violation
    if (error.code === '23503') {
      return NextResponse.json({ ok: false, error: 'عنصر الكون غير موجود' }, { status: 404 });
    }

    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في إنشاء تقييم المخاطر' },
      { status: 500 },
    );
  }
}
