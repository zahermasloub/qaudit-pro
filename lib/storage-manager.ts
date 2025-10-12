/**
 * Storage Manager - مدير التخزين الموحد للملفات (محلي و S3)
 * يدعم تخزين متعدد المزودين مع إدارة آمنة للملفات
 */

import { promises as fs } from "fs";
import path from "path";
import { computeFileHashes, generateUniqueFileName } from "./file-hash-manager";

export type StorageProvider = "local" | "s3";

export interface StorageConfig {
  provider: StorageProvider;
  uploadDir?: string; // للتخزين المحلي
  maxFileSize?: number; // بالبايت
  allowedMimeTypes?: string[];
}

export interface StorageResult {
  success: boolean;
  storageKey: string;
  provider: StorageProvider;
  bucket?: string;
  fileHash: string;
  fileSize: number;
  error?: string;
}

export class StorageManager {
  private config: StorageConfig;

  constructor(config: Partial<StorageConfig> = {}) {
    this.config = {
      provider: (process.env.STORAGE_PROVIDER as StorageProvider) || "local",
      uploadDir: process.env.UPLOAD_DIR || "./uploads",
      maxFileSize: Number(process.env.UPLOAD_MAX_BYTES) || 50 * 1024 * 1024,
      allowedMimeTypes: [], // Empty = allow all
      ...config,
    };
  }

  async saveFile(
    fileName: string,
    buffer: Buffer,
    userId?: string
  ): Promise<StorageResult> {
    try {
      // حساب التوقيع الرقمي
      const hashResult = await computeFileHashes(buffer);

      // التحقق من الحجم
      if (buffer.byteLength > this.config.maxFileSize!) {
        return {
          success: false,
          storageKey: "",
          provider: this.config.provider,
          fileHash: hashResult.sha256,
          fileSize: buffer.byteLength,
          error: `File size ${buffer.byteLength} exceeds limit ${this.config.maxFileSize}`,
        };
      }

      // توليد اسم ملف فريد
      const uniqueFileName = generateUniqueFileName(fileName, userId);

      if (this.config.provider === "local") {
        return await this.saveToLocal(uniqueFileName, buffer, hashResult.sha256);
      } else if (this.config.provider === "s3") {
        return await this.saveToS3(uniqueFileName, buffer, hashResult.sha256);
      }

      throw new Error(`Unsupported storage provider: ${this.config.provider}`);
    } catch (error) {
      return {
        success: false,
        storageKey: "",
        provider: this.config.provider,
        fileHash: "",
        fileSize: buffer.byteLength,
        error: `Storage error: ${error}`,
      };
    }
  }

  private async saveToLocal(
    fileName: string,
    buffer: Buffer,
    fileHash: string
  ): Promise<StorageResult> {
    const dir = path.resolve(this.config.uploadDir!);
    await fs.mkdir(dir, { recursive: true });

    const filePath = path.join(dir, fileName);
    await fs.writeFile(filePath, buffer);

    return {
      success: true,
      storageKey: fileName,
      provider: "local",
      fileHash,
      fileSize: buffer.byteLength,
    };
  }

  private async saveToS3(
    fileName: string,
    buffer: Buffer,
    fileHash: string
  ): Promise<StorageResult> {
    // TODO: Implement S3 upload using AWS SDK v3
    // For now, return placeholder
    return {
      success: false,
      storageKey: fileName,
      provider: "s3",
      bucket: process.env.S3_BUCKET,
      fileHash,
      fileSize: buffer.byteLength,
      error: "S3 storage not implemented yet",
    };
  }

  async getFile(storageKey: string): Promise<Buffer | null> {
    if (this.config.provider === "local") {
      try {
        const dir = path.resolve(this.config.uploadDir!);
        const filePath = path.join(dir, storageKey);
        return await fs.readFile(filePath);
      } catch {
        return null;
      }
    } else if (this.config.provider === "s3") {
      // TODO: Implement S3 download
      return null;
    }
    return null;
  }

  async deleteFile(storageKey: string): Promise<boolean> {
    if (this.config.provider === "local") {
      try {
        const dir = path.resolve(this.config.uploadDir!);
        const filePath = path.join(dir, storageKey);
        await fs.unlink(filePath);
        return true;
      } catch {
        return false;
      }
    } else if (this.config.provider === "s3") {
      // TODO: Implement S3 delete
      return false;
    }
    return false;
  }

  async fileExists(storageKey: string): Promise<boolean> {
    if (this.config.provider === "local") {
      try {
        const dir = path.resolve(this.config.uploadDir!);
        const filePath = path.join(dir, storageKey);
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Singleton instance
export const storageManager = new StorageManager();
