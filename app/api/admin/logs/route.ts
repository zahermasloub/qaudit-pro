import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const from = searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined;
    const to = searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined;
    const take = Number(searchParams.get('take') || '100');

    const rows = await prisma.auditLog.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { action: { contains: q } },
                  { actorEmail: { contains: q } },
                  { target: { contains: q } },
                ],
              }
            : {},
          from ? { createdAt: { gte: from } } : {},
          to ? { createdAt: { lte: to } } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}
