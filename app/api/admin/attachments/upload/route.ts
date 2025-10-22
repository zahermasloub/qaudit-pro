import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// POST /api/admin/attachments/upload - رفع ملفات
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ ok: false, error: 'No files provided' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');

    // التأكد من وجود المجلد
    try {
      await fs.access(uploadsDir);
    } catch {
      await fs.mkdir(uploadsDir, { recursive: true });
    }

    // رفع الملفات
    const uploadedFiles = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = path.join(uploadsDir, filename);

      await fs.writeFile(filepath, buffer);
      uploadedFiles.push({
        name: file.name,
        path: filename,
        size: file.size,
        type: file.type,
      });
    }

    return NextResponse.json({
      ok: true,
      files: uploadedFiles,
      message: `${files.length} files uploaded successfully`,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json({ ok: false, error: 'Failed to upload files' }, { status: 500 });
  }
}
