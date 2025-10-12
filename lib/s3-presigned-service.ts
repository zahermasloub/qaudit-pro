/**
 * S3 Pre-signed URLs Service - خدمة الروابط المؤقتة الآمنة
 * يوفر وصول محدود المدة للملفات المخزنة في Amazon S3
 */

import AWS from 'aws-sdk';
import { createHash } from 'crypto';

export type PresignedUrlType = 'getObject' | 'putObject' | 'deleteObject';

export interface PresignedUrlOptions {
  bucket: string;
  key: string;
  expires: number; // Expiration time in seconds
  operation: PresignedUrlType;
  contentType?: string;
  metadata?: Record<string, string>;
  conditions?: Array<any>;
  userId?: string;
  ipAddress?: string;
}

export interface PresignedUrlResult {
  success: boolean;
  url?: string;
  uploadId?: string;
  fields?: Record<string, string>;
  expiresAt: Date;
  error?: string;
}

export interface S3Config {
  enabled: boolean;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucket: string;
  defaultExpiration: number; // Default expiration in seconds
  maxExpiration: number; // Maximum allowed expiration
  allowedIPs?: string[];
  encryptionKey?: string;
}

class S3PresignedService {
  private s3: AWS.S3 | null = null;
  private config: S3Config;

  constructor(config: Partial<S3Config> = {}) {
    this.config = {
      enabled: process.env.S3_ENABLED === 'true',
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET || '',
      defaultExpiration: parseInt(process.env.S3_DEFAULT_EXPIRATION || '3600'), // 1 hour
      maxExpiration: parseInt(process.env.S3_MAX_EXPIRATION || '86400'), // 24 hours
      allowedIPs: process.env.S3_ALLOWED_IPS?.split(','),
      encryptionKey: process.env.S3_ENCRYPTION_KEY,
      ...config
    };

    if (this.config.enabled) {
      this.initializeS3();
    }
  }

  private initializeS3(): void {
    try {
      // Configure AWS
      AWS.config.update({
        region: this.config.region,
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      });

      // Create S3 instance
      this.s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        signatureVersion: 'v4',
        region: this.config.region,
      });

      console.log(`✅ S3 service initialized for region: ${this.config.region}`);
    } catch (error) {
      console.error('❌ Failed to initialize S3:', error);
      throw new Error(`S3 initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePresignedUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    try {
      if (!this.config.enabled) {
        return {
          success: false,
          error: 'S3 service is disabled in configuration',
          expiresAt: new Date()
        };
      }

      if (!this.s3) {
        throw new Error('S3 service not initialized');
      }

      // Validate options
      const validation = this.validateOptions(options);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          expiresAt: new Date()
        };
      }

      // Generate the presigned URL based on operation
      switch (options.operation) {
        case 'getObject':
          return await this.generateDownloadUrl(options);
        case 'putObject':
          return await this.generateUploadUrl(options);
        case 'deleteObject':
          return await this.generateDeleteUrl(options);
        default:
          return {
            success: false,
            error: `Unsupported operation: ${options.operation}`,
            expiresAt: new Date()
          };
      }

    } catch (error) {
      console.error('❌ Failed to generate presigned URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        expiresAt: new Date()
      };
    }
  }

  private async generateDownloadUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    if (!this.s3) throw new Error('S3 not initialized');

    const expires = Math.min(options.expires, this.config.maxExpiration);
    const expiresAt = new Date(Date.now() + expires * 1000);

    const params = {
      Bucket: options.bucket || this.config.bucket,
      Key: options.key,
      Expires: expires,
      ResponseContentDisposition: `attachment; filename="${this.sanitizeFilename(options.key)}"`,
    };

    // Add IP restrictions if configured
    if (this.config.allowedIPs && options.ipAddress) {
      if (!this.config.allowedIPs.includes(options.ipAddress)) {
        return {
          success: false,
          error: 'IP address not allowed',
          expiresAt
        };
      }
    }

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);

      console.log(`🔗 Generated download URL for: ${options.key} (expires: ${expiresAt.toISOString()})`);

      return {
        success: true,
        url,
        expiresAt
      };

    } catch (error) {
      throw new Error(`Failed to generate download URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateUploadUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    if (!this.s3) throw new Error('S3 not initialized');

    const expires = Math.min(options.expires, this.config.maxExpiration);
    const expiresAt = new Date(Date.now() + expires * 1000);

    const params: any = {
      Bucket: options.bucket || this.config.bucket,
      Key: options.key,
      Expires: expires,
      ContentType: options.contentType || 'application/octet-stream',
    };

    // Add server-side encryption if configured
    if (this.config.encryptionKey) {
      params.ServerSideEncryption = 'AES256';
    }

    // Add metadata if provided
    if (options.metadata) {
      params.Metadata = options.metadata;
    }

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', params);

      console.log(`⬆️ Generated upload URL for: ${options.key} (expires: ${expiresAt.toISOString()})`);

      return {
        success: true,
        url,
        expiresAt
      };

    } catch (error) {
      throw new Error(`Failed to generate upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateDeleteUrl(options: PresignedUrlOptions): Promise<PresignedUrlResult> {
    if (!this.s3) throw new Error('S3 not initialized');

    const expires = Math.min(options.expires, this.config.maxExpiration);
    const expiresAt = new Date(Date.now() + expires * 1000);

    const params = {
      Bucket: options.bucket || this.config.bucket,
      Key: options.key,
      Expires: expires,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('deleteObject', params);

      console.log(`🗑️ Generated delete URL for: ${options.key} (expires: ${expiresAt.toISOString()})`);

      return {
        success: true,
        url,
        expiresAt
      };

    } catch (error) {
      throw new Error(`Failed to generate delete URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateMultipartUploadUrl(
    key: string,
    contentType: string,
    fileSize: number,
    metadata?: Record<string, string>
  ): Promise<PresignedUrlResult> {
    if (!this.s3) throw new Error('S3 not initialized');

    try {
      const params: any = {
        Bucket: this.config.bucket,
        Key: key,
        ContentType: contentType,
      };

      if (metadata) {
        params.Metadata = metadata;
      }

      if (this.config.encryptionKey) {
        params.ServerSideEncryption = 'AES256';
      }

      const result = await this.s3.createMultipartUpload(params).promise();

      console.log(`📦 Initiated multipart upload for: ${key} (UploadId: ${result.UploadId})`);

      return {
        success: true,
        uploadId: result.UploadId,
        expiresAt: new Date(Date.now() + this.config.defaultExpiration * 1000)
      };

    } catch (error) {
      throw new Error(`Failed to initiate multipart upload: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePartUploadUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    expires: number = this.config.defaultExpiration
  ): Promise<PresignedUrlResult> {
    if (!this.s3) throw new Error('S3 not initialized');

    const expiresAt = new Date(Date.now() + expires * 1000);

    const params = {
      Bucket: this.config.bucket,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Expires: Math.min(expires, this.config.maxExpiration),
    };

    try {
      const url = await this.s3.getSignedUrlPromise('uploadPart', params);

      return {
        success: true,
        url,
        expiresAt
      };

    } catch (error) {
      throw new Error(`Failed to generate part upload URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateOptions(options: PresignedUrlOptions): { valid: boolean; error?: string } {
    if (!options.key || options.key.trim() === '') {
      return { valid: false, error: 'Object key is required' };
    }

    if (options.expires <= 0) {
      return { valid: false, error: 'Expiration time must be positive' };
    }

    if (options.expires > this.config.maxExpiration) {
      return {
        valid: false,
        error: `Expiration time exceeds maximum allowed (${this.config.maxExpiration} seconds)`
      };
    }

    const bucket = options.bucket || this.config.bucket;
    if (!bucket || bucket.trim() === '') {
      return { valid: false, error: 'S3 bucket is required' };
    }

    return { valid: true };
  }

  private sanitizeFilename(filename: string): string {
    // Remove path traversal attempts and dangerous characters
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
      .replace(/^\.+/, '')
      .substring(0, 255);
  }

  // Generate secure evidence download URL with audit logging
  async generateEvidenceDownloadUrl(
    evidenceId: string,
    fileName: string,
    userId: string,
    ipAddress: string,
    expires: number = 3600
  ): Promise<PresignedUrlResult> {
    try {
      // Create secure key with evidence ID and hash
      const timestamp = Date.now();
      const secureKey = this.generateSecureKey(evidenceId, fileName, userId, timestamp);

      const result = await this.generatePresignedUrl({
        bucket: this.config.bucket,
        key: `evidence/${secureKey}`,
        expires,
        operation: 'getObject',
        userId,
        ipAddress
      });

      if (result.success) {
        // Log the access request for audit trail
        await this.logAccess('download', evidenceId, userId, ipAddress, result.expiresAt);
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to generate evidence download URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        expiresAt: new Date()
      };
    }
  }

  // Generate secure evidence upload URL
  async generateEvidenceUploadUrl(
    engagementId: string,
    fileName: string,
    contentType: string,
    userId: string,
    metadata?: Record<string, string>
  ): Promise<PresignedUrlResult> {
    try {
      const timestamp = Date.now();
      const secureKey = `evidence/${engagementId}/${timestamp}-${this.sanitizeFilename(fileName)}`;

      const uploadMetadata = {
        'uploaded-by': userId,
        'upload-timestamp': timestamp.toString(),
        'original-filename': fileName,
        'engagement-id': engagementId,
        ...metadata
      };

      const result = await this.generatePresignedUrl({
        bucket: this.config.bucket,
        key: secureKey,
        expires: 3600, // 1 hour for uploads
        operation: 'putObject',
        contentType,
        metadata: uploadMetadata,
        userId
      });

      if (result.success) {
        console.log(`🔐 Generated secure upload URL for evidence: ${fileName}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Failed to generate evidence upload URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        expiresAt: new Date()
      };
    }
  }

  private generateSecureKey(evidenceId: string, fileName: string, userId: string, timestamp: number): string {
    const data = `${evidenceId}-${fileName}-${userId}-${timestamp}`;
    const hash = createHash('sha256').update(data).digest('hex').substring(0, 16);
    return `${evidenceId}-${hash}-${this.sanitizeFilename(fileName)}`;
  }

  private async logAccess(
    operation: string,
    evidenceId: string,
    userId: string,
    ipAddress: string,
    expiresAt: Date
  ): Promise<void> {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        operation,
        evidenceId,
        userId,
        ipAddress,
        expiresAt: expiresAt.toISOString(),
        service: 'S3PresignedService'
      };

      console.log('📋 Access log:', logEntry);

      // TODO: Implement actual audit logging to your system
      // await auditLogger.log(logEntry);

    } catch (error) {
      console.error('❌ Failed to log access:', error);
    }
  }

  // Check if a presigned URL is still valid
  isUrlValid(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }

  // Get remaining validity time in seconds
  getRemainingTime(expiresAt: Date): number {
    const now = new Date().getTime();
    const expires = expiresAt.getTime();
    return Math.max(0, Math.floor((expires - now) / 1000));
  }
}

// Export singleton instance
export const s3PresignedService = new S3PresignedService();

// Export class for custom configurations
export { S3PresignedService };

// Helper functions for common operations
export async function generateSecureDownloadUrl(
  evidenceId: string,
  fileName: string,
  userId: string,
  ipAddress: string,
  expires: number = 3600
): Promise<PresignedUrlResult> {
  return s3PresignedService.generateEvidenceDownloadUrl(evidenceId, fileName, userId, ipAddress, expires);
}

export async function generateSecureUploadUrl(
  engagementId: string,
  fileName: string,
  contentType: string,
  userId: string,
  metadata?: Record<string, string>
): Promise<PresignedUrlResult> {
  return s3PresignedService.generateEvidenceUploadUrl(engagementId, fileName, contentType, userId, metadata);
}
