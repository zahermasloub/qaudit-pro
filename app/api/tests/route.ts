import { testSchema } from '@/features/program/tests/test.schema';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const v = testSchema.parse(body);

    const created = await prisma.auditTest.create({
      data: {
        engagementId: v.engagementId,
        code: v.code,
        title: v.title,
        objective: v.objective,
        controlId: v.controlId || null,
        riskId: v.riskId || null,
        testStepsJson: v.testSteps, // Array of steps
        expectedResults: v.expectedResults,
        actualResults: v.actualResults || null,
        conclusion: v.conclusion || null,
        status: v.status,
        assignedTo: v.assignedTo || null,
        plannedHours: v.plannedHours || null,
        actualHours: v.actualHours || null,
      },
    });

    return Response.json({ ok: true, id: created.id, code: created.code }, { status: 200 });
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message || e?.message || 'Invalid';
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }
}
