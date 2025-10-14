import { Prisma } from '@prisma/client';

import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: Prisma.AuditLogWhereInput = {};

    if (q) {
      where.action = { contains: q, mode: 'insensitive' };
    }

    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const items = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        action: true,
        actorEmail: true,
        createdAt: true,
        targetType: true,
      },
    });

    return Response.json({ items });
  } catch (error) {
    console.error('Error fetching logs', error);
    return Response.json({ items: [] }, { status: 500 });
  }
}
