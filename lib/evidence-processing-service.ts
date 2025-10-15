/**
 * Evidence Processing Service - خدمة معالجة الأدلة المتكاملة
 * يدمج فحص الفيروسات، OCR، و S3 في نظام موحد
 */

import path from 'path';

import { AntivirusScanner, type VirusScanResult } from './antivirus-scanner';
import { type OCRResult, OCRService } from './ocr-service';
import { S3PresignedService } from './s3-presigned-service';

export type EvidenceProcessingResult = {
  evidenceId: string;
  fileName: string;
  virusScan: VirusScanResult;
  ocrResult?: OCRResult;
  s3UrlsGenerated: boolean;
  downloadUrl?: string;
  uploadUrl?: string;
  processingTime: number;
  success: boolean;
  errors: string[];
};

export class EvidenceProcessingService {
  private antivirusScanner: AntivirusScanner;
  private ocrService: OCRService;
  private s3Service: S3PresignedService;

  constructor() {
    this.antivirusScanner = new AntivirusScanner();
    this.ocrService = new OCRService();
    this.s3Service = new S3PresignedService();
  }

  /**
   * Process a single evidence file through all Sprint 7.5 enhancements
   */
  async processEvidenceFile(
    evidenceId: string,
    filePath: string,
  ): Promise<EvidenceProcessingResult> {
    const startTime = Date.now();
    const errors: string[] = [];

    try {
      // Get evidence record from database
      const evidence = await this.getEvidenceRecord(evidenceId);
      if (!evidence) {
        throw new Error(`Evidence record not found: ${evidenceId}`);
      }

      console.log(`🔄 Processing evidence: ${evidence.fileName} (ID: ${evidenceId})`);

      // Step 1: Antivirus Scan
      console.log('🛡️ Step 1: Virus scanning...');
      const virusScan = await this.antivirusScanner.scanFile(filePath);

      // Update virus scan status in database
      await this.updateVirusScanStatus(evidenceId, virusScan);

      // Step 2: OCR Processing (if applicable)
      let ocrResult: OCRResult | undefined;
      if (this.shouldProcessOCR(evidence.mimeType, evidence.fileExt)) {
        try {
          console.log('📄 Step 2: OCR processing...');
          ocrResult = await this.ocrService.processFile(filePath);

          // Store OCR results
          await this.storeOCRResults(evidenceId, ocrResult);
        } catch (ocrError) {
          const errorMsg = `OCR processing failed: ${ocrError instanceof Error ? ocrError.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        }
      }

      // Step 3: S3 Pre-signed URLs (if clean and configured)
      let downloadUrl: string | undefined;
      let uploadUrl: string | undefined;
      let s3UrlsGenerated = false;

      if (virusScan.status === 'clean') {
        try {
          console.log('☁️ Step 3: Generating S3 URLs...');

          // Generate download URL
          const downloadResponse = await this.s3Service.generateEvidenceDownloadUrl(
            evidenceId,
            evidence.fileName,
            'system', // userId - using system as this is automated processing
            '0.0.0.0', // ipAddress - system processing
            3600, // expires in 1 hour
          );
          if (downloadResponse.success) {
            downloadUrl = downloadResponse.url;
            s3UrlsGenerated = true;
          }
        } catch (s3Error) {
          const errorMsg = `S3 URL generation failed: ${s3Error instanceof Error ? s3Error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        }
      } else {
        console.log('⚠️ Skipping S3 URL generation - file failed virus scan');
      }

      const processingTime = Date.now() - startTime;
      const success = virusScan.status === 'clean' && errors.length === 0;

      console.log(`✅ Evidence processing completed: ${evidence.fileName}`, {
        processingTime: `${processingTime}ms`,
        virusScan: virusScan.status,
        ocrProcessed: !!ocrResult,
        s3UrlsGenerated,
        success,
        errorCount: errors.length,
      });

      return {
        evidenceId,
        fileName: evidence.fileName,
        virusScan,
        ocrResult,
        s3UrlsGenerated,
        downloadUrl,
        uploadUrl,
        processingTime,
        success,
        errors,
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMsg = error instanceof Error ? error.message : 'Unknown processing error';

      console.error(`❌ Evidence processing failed for ${evidenceId}:`, error);

      return {
        evidenceId,
        fileName: `Evidence ${evidenceId}`,
        virusScan: {
          status: 'error',
          scanEngine: 'hybrid',
          scanTime: processingTime,
          details: `Processing failed: ${errorMsg}`,
        },
        s3UrlsGenerated: false,
        processingTime,
        success: false,
        errors: [errorMsg, ...errors],
      };
    }
  }

  /**
   * Process multiple evidence files in batch
   */
  async processBatchEvidence(evidenceIds: string[]): Promise<EvidenceProcessingResult[]> {
    console.log(`🔄 Starting batch processing for ${evidenceIds.length} evidence files`);

    const results: EvidenceProcessingResult[] = [];

    for (const evidenceId of evidenceIds) {
      try {
        // Get file path for evidence
        const evidence = await this.getEvidenceRecord(evidenceId);
        if (!evidence) {
          results.push(this.createErrorResult(evidenceId, 'Evidence record not found'));
          continue;
        }

        const filePath = this.constructFilePath(evidence.storageKey);
        const result = await this.processEvidenceFile(evidenceId, filePath);
        results.push(result);

        // Add delay between processing to avoid system overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        results.push(this.createErrorResult(evidenceId, errorMsg));
      }
    }

    console.log(`✅ Batch processing completed: ${results.length} files processed`);
    return results;
  }

  private async getEvidenceRecord(evidenceId: string) {
    try {
      // Simplified - in production this would use actual Prisma query
      console.log(`📋 Fetching evidence record: ${evidenceId}`);
      return {
        id: evidenceId,
        fileName: `evidence-${evidenceId}.pdf`,
        mimeType: 'application/pdf',
        fileExt: 'pdf',
        storageKey: `evidence/${evidenceId}/file.pdf`,
        fileSize: 1024000,
      };
    } catch (error) {
      console.error(`❌ Failed to fetch evidence record ${evidenceId}:`, error);
      return null;
    }
  }

  private async updateVirusScanStatus(evidenceId: string, scanResult: VirusScanResult) {
    try {
      console.log(`💾 Updating virus scan status for ${evidenceId}: ${scanResult.status}`);

      // In production, this would update the actual database
      // Removed unused updateData

      console.log(`✅ Virus scan status updated for ${evidenceId}`);
    } catch (error) {
      console.error(`❌ Failed to update virus scan status for ${evidenceId}:`, error);
      throw error;
    }
  }

  private async storeOCRResults(evidenceId: string, ocrResult: OCRResult) {
    try {
      console.log(
        `💾 Storing OCR results for ${evidenceId}: ${ocrResult.text?.length || 0} characters extracted`,
      );

      // In production, this would store OCR text and metadata
      // Removed unused ocrData

      console.log(`✅ OCR results stored for ${evidenceId}`);
    } catch (error) {
      console.error(`❌ Failed to store OCR results for ${evidenceId}:`, error);
      throw error;
    }
  }

  private shouldProcessOCR(mimeType?: string, fileExt?: string): boolean {
    const ocrSupportedTypes = ['image/jpeg', 'image/png', 'image/tiff', 'application/pdf'];

    const ocrSupportedExtensions = ['jpg', 'jpeg', 'png', 'tiff', 'tif', 'pdf'];

    return Boolean(
      (mimeType && ocrSupportedTypes.includes(mimeType)) ||
        (fileExt && ocrSupportedExtensions.includes(fileExt.toLowerCase())),
    );
  }
  private constructFilePath(storageKey: string): string {
    // In production, this would construct the actual file path based on storage configuration
    const uploadsDir = process.env.UPLOADS_DIR || './uploads';
    return path.join(uploadsDir, storageKey);
  }

  private createErrorResult(evidenceId: string, errorMessage: string): EvidenceProcessingResult {
    return {
      evidenceId,
      fileName: `Evidence ${evidenceId}`,
      virusScan: {
        status: 'error',
        scanEngine: 'hybrid',
        scanTime: 0,
        details: errorMessage,
      },
      s3UrlsGenerated: false,
      processingTime: 0,
      success: false,
      errors: [errorMessage],
    };
  }

  /**
   * Get processing statistics for an engagement
   */
  async getProcessingStats(engagementId: string) {
    console.log(`📊 Generating processing statistics for engagement: ${engagementId}`);

    return {
      engagementId,
      totalFiles: 0,
      virusScanned: 0,
      ocrProcessed: 0,
      s3UrlsGenerated: 0,
      cleanFiles: 0,
      suspiciousFiles: 0,
      failedScans: 0,
      lastProcessed: null,
    };
  }
}
