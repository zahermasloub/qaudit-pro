/**
 * File Upload API Endpoint
 * POST /api/files/upload - Upload single or multiple files
 */

import { StorageProvider } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import type { FileMetadata } from '@/lib/file-upload-service';
import FileUploadService from '@/lib/file-upload-service';
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

export const runtime = 'nodejs';

interface UploadRequest {
  engagementId: string;
  testId?: string;
  evidenceCategory?: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();

    // Get metadata from form
    const engagementId = formData.get('engagementId') as string;
    const testId = formData.get('testId') as string;
    const evidenceCategory = (formData.get('evidenceCategory') as string) || 'document';
    const description = (formData.get('description') as string) || '';

    if (!engagementId) {
      return NextResponse.json({ error: 'Engagement ID is required' }, { status: 400 });
    }

    // Verify engagement exists and user has access
    const engagement = await prisma.engagement.findFirst({
      where: {
        id: engagementId,
        createdBy: session.user.id,
      },
    });

    if (!engagement) {
      return NextResponse.json({ error: 'Engagement not found or access denied' }, { status: 404 });
    }

    // Get uploaded files
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    // Initialize upload service
    const uploadService = new FileUploadService();

    // Process each file
    const uploadResults = [];
    const errors = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        // Convert File to FileMetadata
        const buffer = Buffer.from(await file.arrayBuffer());
        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          buffer,
        };

        // Upload file
        const uploadResult = await uploadService.upload(metadata, engagementId);

        if (uploadResult.success) {
          // Save evidence record to database
          const evidence = await prisma.evidence.create({
            data: {
              engagementId: engagementId,
              category: FileUploadService.getFileCategory(uploadResult.mimeType),
              status: 'active',
              linkedTestId: testId || null,
              storage: StorageProvider.local,
              storageKey: uploadResult.storageKey,
              bucket: uploadResult.bucket || null,
              fileName: uploadResult.fileName,
              fileExt: uploadResult.fileExt || null,
              mimeType: uploadResult.mimeType,
              fileSize: uploadResult.fileSize,
              fileHash: uploadResult.fileHash || null,
              virusScanStatus: 'pending',
              uploadedBy: session.user.id,
            },
          });

          uploadResults.push({
            id: evidence.id,
            fileName: evidence.fileName,
            fileSize: evidence.fileSize,
            mimeType: evidence.mimeType,
            category: evidence.category,
            uploadedAt: evidence.uploadedAt,
            downloadUrl: FileUploadService.getDownloadUrl(evidence.storageKey),
          });
        } else {
          errors.push({
            fileName: file.name,
            error: uploadResult.error,
          });
        }
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: `Processing failed: ${error}`,
        });
      }
    }

    // Return results
    const response = {
      success: uploadResults.length > 0,
      uploaded: uploadResults.length,
      total: files.length,
      results: uploadResults,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response, {
      status: response.success ? 201 : 400,
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error during file upload',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}
