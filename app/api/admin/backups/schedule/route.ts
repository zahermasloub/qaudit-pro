import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { backupScheduleSchema } from '@/features/admin/backups/backup.schema';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rows = await prisma.backupSchedule.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, rows });
  } catch (error) {
    console.error('Error fetching backup schedules:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch backup schedules' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = backupScheduleSchema.parse(body);
    const row = await prisma.backupSchedule.create({
      data: { cronExpr: v.cronExpr, storage: v.storage, enabled: v.enabled },
    });
    return NextResponse.json({ ok: true, id: row.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating backup schedule:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create backup schedule' },
      { status: 500 },
    );
  }
}
