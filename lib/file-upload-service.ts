/**
 * File Upload Service - Handles local and S3 storage
 * Features: Multi-format support, virus scanning status, metadata extraction
 */

import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Import Prisma enums
type StorageProvider = 'local' | 's3';

export interface UploadConfig {
  provider: StorageProvider;
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  uploadDir: string;
  // S3 config (if provider is 's3')
  s3Bucket?: string;
  s3Region?: string;
}

export interface UploadResult {
  success: boolean;
  storageKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  fileExt?: string;
  bucket?: string;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

// Default configuration
const DEFAULT_CONFIG: UploadConfig = {
  provider: (process.env.STORAGE_PROVIDER as StorageProvider) || 'local',
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedMimeTypes: [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'text/plain',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp',
    'image/svg+xml',
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/gzip',
    // Other
    'application/json',
    'application/xml',
  ],
  uploadDir: './uploads',
};

class FileUploadService {
  private config: UploadConfig;

  constructor(config?: Partial<UploadConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate SHA256 hash for file content
   */
  private generateFileHash(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Generate unique storage key
   */
  private generateStorageKey(fileName: string, engagementId: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const sanitizedBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');

    return `${engagementId}/${timestamp}_${sanitizedBaseName}_${randomSuffix}${ext}`;
  }

  /**
   * Validate file before upload
   */
  private validateFile(metadata: FileMetadata): { valid: boolean; error?: string } {
    // Check file size
    if (metadata.size > this.config.maxFileSize) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.config.maxFileSize / 1024 / 1024}MB`,
      };
    }

    // Check MIME type
    if (!this.config.allowedMimeTypes.includes(metadata.type)) {
      return {
        valid: false,
        error: `File type '${metadata.type}' is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload file to local storage
   */
  private async uploadToLocal(metadata: FileMetadata, storageKey: string): Promise<UploadResult> {
    try {
      const fullPath = path.join(this.config.uploadDir, storageKey);
      const directory = path.dirname(fullPath);

      // Ensure directory exists
      if (!existsSync(directory)) {
        await mkdir(directory, { recursive: true });
      }

      // Write file
      await writeFile(fullPath, metadata.buffer);

      return {
        success: true,
        storageKey,
        fileName: metadata.name,
        fileSize: metadata.size,
        mimeType: metadata.type,
        fileHash: this.generateFileHash(metadata.buffer),
        fileExt: path.extname(metadata.name).toLowerCase(),
      };
    } catch (error) {
      return {
        success: false,
        storageKey: '',
        fileName: metadata.name,
        fileSize: metadata.size,
        mimeType: metadata.type,
        fileHash: '',
        error: `Failed to upload to local storage: ${error}`,
      };
    }
  }

  /**
   * Upload file to S3 (placeholder - requires AWS SDK)
   */
  private async uploadToS3(metadata: FileMetadata, _storageKey: string): Promise<UploadResult> {
    // TODO: Implement S3 upload when AWS SDK is added
    // For now, return error
    return {
      success: false,
      storageKey: '',
      fileName: metadata.name,
      fileSize: metadata.size,
      mimeType: metadata.type,
      fileHash: '',
      error: 'S3 upload not yet implemented. Please use local storage.',
    };
  }

  /**
   * Main upload method
   */
  async upload(metadata: FileMetadata, engagementId: string): Promise<UploadResult> {
    // Validate file
    const validation = this.validateFile(metadata);
    if (!validation.valid) {
      return {
        success: false,
        storageKey: '',
        fileName: metadata.name,
        fileSize: metadata.size,
        mimeType: metadata.type,
        fileHash: '',
        error: validation.error,
      };
    }

    // Generate storage key
    const storageKey = this.generateStorageKey(metadata.name, engagementId);

    // Upload based on provider
    switch (this.config.provider) {
      case 'local':
        return await this.uploadToLocal(metadata, storageKey);
      case 's3':
        return await this.uploadToS3(metadata, storageKey);
      default:
        return {
          success: false,
          storageKey: '',
          fileName: metadata.name,
          fileSize: metadata.size,
          mimeType: metadata.type,
          fileHash: '',
          error: `Unsupported storage provider: ${this.config.provider}`,
        };
    }
  }

  /**
   * Get file categories based on MIME type
   */
  static getFileCategory(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'screenshot';
    if (mimeType === 'application/pdf') return 'document';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'spreadsheet';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType === 'text/csv') return 'csv-export';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
    return 'other';
  }

  /**
   * Generate file download URL
   */
  static getDownloadUrl(storageKey: string, provider: StorageProvider = 'local'): string {
    if (provider === 'local') {
      return `/api/files/download/${encodeURIComponent(storageKey)}`;
    }
    // For S3, would return signed URL
    return '';
  }
}

export default FileUploadService;
