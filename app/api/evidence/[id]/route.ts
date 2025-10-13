import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import * as path from "path";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const ev = await prisma.evidence.findUnique({ where: { id: params.id } });
    if (!ev) return Response.json({ ok: false, error: "Not Found" }, { status: 404 });

    // حذف الملف فعليًا لو التخزين محلي
    if (ev.storage === "local") {
      const baseDir = process.env.UPLOAD_DIR || "./uploads";
      const full = path.resolve(baseDir, ev.storageKey);
      try { await fs.unlink(full); } catch { /* لو مش موجود على القرص نتجاهل */ }
    }

    // حذف السجل (Hard delete). إن كان لديك status='deleted' يمكنك عمل update بدل delete.
    await prisma.evidence.delete({ where: { id: ev.id } });

    return Response.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "delete_failed" }, { status: 400 });
  }
}
