import { promises as fs } from 'fs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';

import prisma from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'Evidence not found' }, { status: 404 });
    }

    if (evidence.storage !== 'local') {
      return NextResponse.json({ error: 'Use S3 pre-signed URL for S3 storage' }, { status: 400 });
    }

    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, evidence.storageKey);

    try {
      const fileBuffer = await fs.readFile(filePath);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': evidence.mimeType || 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${evidence.fileName}"`,
          'Content-Length': evidence.fileSize.toString(),
        },
      });
    } catch (fileError) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 410 });
    }
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
