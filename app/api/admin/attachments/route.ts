import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// GET /api/admin/attachments - جلب قائمة الملفات
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');

    // التأكد من وجود المجلد
    try {
      await fs.access(uploadsDir);
    } catch {
      return NextResponse.json({ ok: true, files: [] });
    }

    // قراءة الملفات
    const entries = await fs.readdir(uploadsDir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(uploadsDir, entry.name);
          const stats = await fs.stat(filePath);

          // تحديد نوع الملف بناءً على الامتداد
          const ext = path.extname(entry.name).toLowerCase();
          let type = 'application/octet-stream';
          if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            type = `image/${ext.slice(1)}`;
          } else if (ext === '.pdf') {
            type = 'application/pdf';
          } else if (['.doc', '.docx'].includes(ext)) {
            type = 'application/msword';
          } else if (['.xls', '.xlsx'].includes(ext)) {
            type = 'application/vnd.ms-excel';
          }

          return {
            name: entry.name,
            path: entry.name,
            size: stats.size,
            type,
            lastModified: stats.mtime.toISOString(),
          };
        })
    );

    // ترتيب حسب آخر تعديل
    files.sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime());

    return NextResponse.json({ ok: true, files });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/attachments - حذف ملف
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { path: filePath } = body;

    if (!filePath) {
      return NextResponse.json(
        { ok: false, error: 'File path is required' },
        { status: 400 }
      );
    }

    // التحقق من أن المسار آمن (لا يحتوي على .. أو /)
    if (filePath.includes('..') || filePath.includes('/') || filePath.includes('\\')) {
      return NextResponse.json(
        { ok: false, error: 'Invalid file path' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const fullPath = path.join(uploadsDir, filePath);

    // التحقق من وجود الملف
    try {
      await fs.access(fullPath);
    } catch {
      return NextResponse.json(
        { ok: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // حذف الملف
    await fs.unlink(fullPath);

    return NextResponse.json({
      ok: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
