import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get("engagementId") || "";
    const status = searchParams.get("status") || "";     // optional filter
    const q = searchParams.get("q") || "";               // search by fileName/category

    const where:any = {};
    if (engagementId) where.engagementId = engagementId;
    if (status) where.virusScanStatus = status;          // pending/clean/suspected/blocked
    if (q) where.OR = [
      { fileName: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } }
    ];

    const data = await prisma.evidence.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take: 200,
      select: {
        id: true, engagementId: true, category: true,
        fileName: true, mimeType: true, fileSize: true,
        status: true, virusScanStatus: true, ocrTextUrl: true,
        uploadedAt: true, storage: true
      }
    });
    return Response.json({ ok: true, data });
  } catch (e:any) {
    return Response.json({ ok: false, error: e?.message || "list_failed" }, { status: 400 });
  }
}
