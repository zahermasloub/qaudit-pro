import prisma from "@/lib/prisma";
import { pbcSchema } from "@/features/planning/pbc/pbc.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const v = pbcSchema.parse(body);

    const created = await prisma.pBCRequest.create({
      data: {
        engagementId: v.engagementId,
        code: v.code,
        description: v.description,
        ownerId: v.ownerId,
        dueDate: new Date(v.dueDate),
        status: v.status.toUpperCase() as "OPEN" | "CLOSED" | "REVIEWED", // Map to Prisma enum
        attachmentsJson: v.attachments ?? [],
        notes: v.notes ?? null,
      },
    });

    return Response.json({ ok: true, id: created.id }, { status: 200 });
  } catch (e: any) {
    const msg = e?.errors?.[0]?.message || e?.message || "Invalid";
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }
}
