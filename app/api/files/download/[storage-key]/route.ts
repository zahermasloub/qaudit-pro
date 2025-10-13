/**
 * File Download API Endpoint
 * GET /api/files/download/[storageKey] - Download file by storage key
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import prisma from '@/lib/prisma';

// Mock auth options for now - will be replaced when NextAuth is properly configured
const authOptions = {
  session: { strategy: 'jwt' as const },
  callbacks: {
    session: ({ session, token }: any) => ({
      ...session,
      user: { ...session.user, id: token.sub },
    }),
    jwt: ({ token, user }: any) => ({ ...token, ...user }),
  },
};

interface RouteParams {
  params: {
    storageKey: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    const { storageKey } = params;

    if (!storageKey) {
      return NextResponse.json({ error: 'Storage key is required' }, { status: 400 });
    }

    // Decode storage key (it was encoded in the URL)
    const decodedStorageKey = decodeURIComponent(storageKey);

    // Find evidence record
    const evidence = await prisma.evidence.findFirst({
      where: {
        storageKey: decodedStorageKey,
        status: 'active',
      },
      include: {
        // Get engagement to verify access
        engagement: {
          select: {
            id: true,
            createdBy: true,
          },
        },
      },
    });

    if (!evidence) {
      return NextResponse.json({ error: 'File not found or access denied' }, { status: 404 });
    }

    // Check if user has access to this engagement
    if (evidence.engagement?.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Access denied. You do not have permission to download this file.' },
        { status: 403 },
      );
    }

    // Handle different storage providers
    if (evidence.storage === 'local') {
      // Local file system
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const filePath = path.join(uploadDir, decodedStorageKey);

      if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found on storage' }, { status: 404 });
      }

      try {
        const fileBuffer = await readFile(filePath);

        // Set appropriate headers
        const headers = new Headers();
        headers.set('Content-Type', evidence.mimeType || 'application/octet-stream');
        headers.set('Content-Length', evidence.fileSize.toString());
        headers.set('Content-Disposition', `attachment; filename="${evidence.fileName}"`);
        headers.set('Cache-Control', 'private, no-cache');

        return new NextResponse(fileBuffer as any, {
          status: 200,
          headers,
        });
      } catch (fileError) {
        console.error('File read error:', fileError);
        return NextResponse.json({ error: 'Failed to read file from storage' }, { status: 500 });
      }
    } else if (evidence.storage === 's3') {
      // TODO: Implement S3 download when AWS SDK is available
      return NextResponse.json({ error: 'S3 download not yet implemented' }, { status: 501 });
    } else {
      return NextResponse.json({ error: 'Unsupported storage provider' }, { status: 400 });
    }
  } catch (error) {
    console.error('File download error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during file download',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
