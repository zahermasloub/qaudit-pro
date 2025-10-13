import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { runSchema } from '@/features/fieldwork/run/run.schema';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = runSchema.parse(body);

    const testRun = await prisma.testRun.create({
      data: validatedData,
    });

    return NextResponse.json({ ok: true, id: testRun.id }, { status: 201 });
  } catch (error) {
    console.error('TestRun creation error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
