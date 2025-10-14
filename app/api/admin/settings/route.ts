import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { settingSchema } from '@/features/admin/settings/setting.schema';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const items = await prisma.systemSetting.findMany();
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = settingSchema.parse(body);
    const up = await prisma.systemSetting.upsert({
      where: { key: v.key },
      update: { value: v.value, type: v.type },
      create: { key: v.key, value: v.value, type: v.type },
    });
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system',
        action: 'setting.upsert',
        target: `setting:${v.key}`,
        payload: v,
      },
    });
    return NextResponse.json({ ok: true, key: up.key });
  } catch (error) {
    console.error('Error upserting setting:', error);
    return NextResponse.json({ ok: false, error: 'Failed to upsert setting' }, { status: 500 });
  }
}
