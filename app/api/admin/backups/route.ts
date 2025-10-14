import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { backupRunSchema } from '@/features/admin/backups/backup.schema';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const jobs = await prisma.backupJob.findMany({
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
    return NextResponse.json({ ok: true, jobs });
  } catch (error) {
    console.error('Error fetching backup jobs:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch backup jobs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = backupRunSchema.parse(body);
    const job = await prisma.backupJob.create({
      data: { status: 'pending', storage: v.mode, message: 'queued' },
    });
    // TODO: استدعاء worker/child_process للنسخ الفعلي وتحديث السجل (success/failed)
    return NextResponse.json({ ok: true, id: job.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating backup job:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create backup job' }, { status: 500 });
  }
}
