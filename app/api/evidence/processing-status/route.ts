import { NextRequest, NextResponse } from 'next/server';
import { EvidenceProcessingService } from '@/lib/evidence-processing-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const engagementId = searchParams.get('engagementId');

    if (!engagementId) {
      return NextResponse.json(
        { error: 'Engagement ID is required' },
        { status: 400 }
      );
    }

    // Initialize processing service to get stats
    const processingService = new EvidenceProcessingService();
    const stats = await processingService.getProcessingStats(engagementId);

    return NextResponse.json({
      engagementId,
      sprint75Status: 'ready',
      services: {
        antivirusScanning: {
          available: true,
          description: 'ClamAV and VirusTotal integration'
        },
        ocrProcessing: {
          available: true,
          description: 'Arabic/English text extraction with Tesseract.js'
        },
        s3PresignedUrls: {
          available: true,
          description: 'Secure file access with AWS S3'
        }
      },
      stats,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Evidence processing status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error fetching processing status' },
      { status: 500 }
    );
  }
}
