/**
 * Files List API Endpoint
 * GET /api/files - Get list of evidence files for an engagement
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import FileUploadService from '@/lib/file-upload-service';
import prisma from '@/lib/prisma';

// Mock auth options for now
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

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login first.' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const engagementId = searchParams.get('engagementId');
    const testId = searchParams.get('testId');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

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

    // Build where clause
    const whereClause: any = {
      engagementId: engagementId,
      status: 'active',
    };

    if (testId) {
      whereClause.linkedTestId = testId;
    }

    if (category) {
      whereClause.category = category;
    }

    // Get evidence files with pagination
    const [evidenceFiles, totalCount] = await Promise.all([
      prisma.evidence.findMany({
        where: whereClause,
        orderBy: { uploadedAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          category: true,
          linkedTestId: true,
          linkedSampleRef: true,
          linkedFindingId: true,
          storage: true,
          storageKey: true,
          fileName: true,
          fileExt: true,
          mimeType: true,
          fileSize: true,
          virusScanStatus: true,
          uploadedBy: true,
          uploadedAt: true,
        },
      }),
      prisma.evidence.count({ where: whereClause }),
    ]);

    // Format results
    const formattedFiles = evidenceFiles.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      fileExt: file.fileExt,
      category: file.category,
      linkedTestId: file.linkedTestId,
      linkedSampleRef: file.linkedSampleRef,
      linkedFindingId: file.linkedFindingId,
      virusScanStatus: file.virusScanStatus,
      uploadedBy: file.uploadedBy,
      uploadedAt: file.uploadedAt,
      downloadUrl: FileUploadService.getDownloadUrl(file.storageKey, file.storage),
      // Helper properties
      isImage: file.mimeType?.startsWith('image/') || false,
      isDocument: ['application/pdf', 'application/msword'].includes(file.mimeType || ''),
      isSpreadsheet:
        file.mimeType?.includes('excel') || file.mimeType?.includes('spreadsheet') || false,
      fileSizeFormatted: formatFileSize(file.fileSize),
    }));

    // Get category statistics
    const categoryStats = await prisma.evidence.groupBy({
      by: ['category'],
      where: {
        engagementId: engagementId,
        status: 'active',
      },
      _count: {
        id: true,
      },
    });

    const categories = categoryStats.map(stat => ({
      category: stat.category,
      count: stat._count.id,
    }));

    // Pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      success: true,
      data: formattedFiles,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: hasNextPage,
        hasPrevious: hasPreviousPage,
        totalItems: totalCount,
        itemsPerPage: limit,
      },
      categories,
      filters: {
        engagementId,
        testId,
        category,
      },
    });
  } catch (error) {
    console.error('Files list error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error while fetching files',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
