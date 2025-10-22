/**
 * API Endpoint: Audit Universe Management
 * Manages the complete universe of auditable entities
 *
 * @swagger
 * /api/audit-universe:
 *   get:
 *     summary: Get all audit universe items
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of audit universe items
 *   post:
 *     summary: Create a new audit universe item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               owner:
 *                 type: string
 *               strategy_importance:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               system_refs:
 *                 type: string
 *               last_audit_date:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Audit universe item created
 *       400:
 *         description: Invalid input
 */

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface AuditUniverseItem {
  id?: string;
  name: string;
  category?: string;
  owner?: string;
  strategy_importance?: number;
  system_refs?: string;
  last_audit_date?: string;
  notes?: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    const category = searchParams.get('category');

    let whereClause = '';
    const params: any[] = [];

    if (name) {
      whereClause = 'WHERE LOWER(name) LIKE $1';
      params.push(`%${name.toLowerCase()}%`);
    }

    if (category) {
      whereClause += whereClause
        ? ' AND category = $' + (params.length + 1)
        : 'WHERE category = $1';
      params.push(category);
    }

    const query = `
      SELECT
        id, name, category, owner, strategy_importance,
        system_refs, last_audit_date, notes, created_at, updated_at
      FROM audit."AuditUniverse"
      ${whereClause}
      ORDER BY name ASC
    `;

    const items = await prisma.$queryRawUnsafe(query, ...params);

    return NextResponse.json({
      ok: true,
      data: items,
      count: Array.isArray(items) ? items.length : 0,
    });
  } catch (error: any) {
    console.error('GET /api/audit-universe error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في جلب عناصر الكون' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body: AuditUniverseItem = await req.json();

    // Validation
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ ok: false, error: 'الاسم مطلوب' }, { status: 400 });
    }

    if (body.strategy_importance !== undefined) {
      const importance = Number(body.strategy_importance);
      if (isNaN(importance) || importance < 1 || importance > 5) {
        return NextResponse.json(
          { ok: false, error: 'الأهمية الاستراتيجية يجب أن تكون بين 1 و 5' },
          { status: 400 },
        );
      }
    }

    const query = `
      INSERT INTO audit."AuditUniverse"
        (name, category, owner, strategy_importance, system_refs, last_audit_date, notes)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, category, owner, strategy_importance, system_refs, last_audit_date, notes
    `;

    const result: any = await prisma.$queryRawUnsafe(
      query,
      body.name.trim(),
      body.category || null,
      body.owner || null,
      body.strategy_importance || null,
      body.system_refs || null,
      body.last_audit_date || null,
      body.notes || null,
    );

    const created = Array.isArray(result) ? result[0] : result;

    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/audit-universe error:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { ok: false, error: 'عنصر بنفس الاسم موجود مسبقاً' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { ok: false, error: error.message || 'فشل في إنشاء عنصر الكون' },
      { status: 500 },
    );
  }
}
