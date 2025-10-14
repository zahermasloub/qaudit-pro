import { StorageProvider } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import path from 'path';

import { evidenceUploadMetaSchema } from '@/features/evidence/evidence.schema';
import prisma from '@/lib/prisma';
import { computeSha256, saveLocal } from '@/lib/storage';
import { putToS3 } from '@/lib/storage-s3';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_SIZE = Number(process.env.UPLOAD_MAX_BYTES) || 25 * 1024 * 1024; // 25MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const metaStr = formData.get('meta') as string;

    if (!file || !metaStr) {
      return NextResponse.json({ ok: false, error: 'File and meta are required' }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: `File too large. Max size: ${MAX_SIZE} bytes` },
        { status: 400 },
      );
    }

    // Parse and validate metadata
    const meta = JSON.parse(metaStr);
    const validatedMeta = evidenceUploadMetaSchema.parse(meta);

    // Verify engagement exists
    const engagement = await prisma.engagement.findUnique({
      where: { id: validatedMeta.engagementId },
      select: { id: true },
    });

    if (!engagement) {
      return NextResponse.json(
        { ok: false, error: `Engagement with ID '${validatedMeta.engagementId}' not found` },
        { status: 404 },
      );
    }

    // Process file
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeSha256(buffer);
    const fileExt = path.extname(file.name);
    const mimeType = file.type || 'application/octet-stream';

    let storageKey: string;

    // Define storage provider as typed enum
    const provider: StorageProvider =
      process.env.STORAGE_PROVIDER?.toLowerCase() === 's3'
        ? StorageProvider.s3
        : StorageProvider.local;

    // Store file
    if (provider === StorageProvider.s3) {
      const bucketName = process.env.S3_BUCKET || 'qaudit-evidence';
      storageKey = `${validatedMeta.engagementId}/${Date.now()}_${file.name}`;
      await putToS3(bucketName, storageKey, buffer, mimeType);
    } else {
      const localResult = await saveLocal(file.name, buffer);
      storageKey = localResult.key;
    }

    // Create evidence record
    const evidence = await prisma.evidence.create({
      data: {
        engagementId: validatedMeta.engagementId,
        category: validatedMeta.category,
        linkedTestId: validatedMeta.linkedTestId || null,
        linkedSampleRef: validatedMeta.linkedSampleRef || null,
        linkedFindingId: validatedMeta.linkedFindingId || null,
        uploadedBy: validatedMeta.uploadedBy,
        storage: provider,
        bucket: provider === StorageProvider.s3 ? process.env.S3_BUCKET || null : null,
        storageKey,
        fileName: file.name,
        fileExt,
        mimeType,
        fileSize: file.size,
        fileHash,
        virusScanStatus: 'pending',
        ocrTextUrl: null,
        status: 'active',
      },
    });

    return NextResponse.json({ ok: true, id: evidence.id }, { status: 201 });
  } catch (error) {
    console.error('Evidence upload error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { ok: false, error: 'Validation failed', details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
