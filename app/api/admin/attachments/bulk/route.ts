import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// DELETE /api/admin/attachments/bulk - حذف ملفات متعددة
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { paths } = body;

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'File paths array is required' },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    const results = {
      deleted: 0,
      failed: 0,
      errors: [] as string[],
    };

    // حذف كل ملف
    for (const filePath of paths) {
      // التحقق من أن المسار آمن
      if (filePath.includes('..') || filePath.includes('/') || filePath.includes('\\')) {
        results.failed++;
        results.errors.push(`Invalid path: ${filePath}`);
        continue;
      }

      const fullPath = path.join(uploadsDir, filePath);

      try {
        await fs.access(fullPath);
        await fs.unlink(fullPath);
        results.deleted++;
      } catch {
        results.failed++;
        results.errors.push(`Failed to delete: ${filePath}`);
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Deleted ${results.deleted} files, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Error bulk deleting files:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete files' },
      { status: 500 }
    );
  }
}
