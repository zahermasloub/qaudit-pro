/**
 * File Hash Manager - مدير حساب التوقيعات الرقمية للملفات
 * يدعم SHA256 وMD5 لضمان سلامة الملفات المرفوعة
 */

import { createHash } from "crypto";

export interface FileHashResult {
  sha256: string;
  md5: string;
  size: number;
}

export async function computeFileHashes(buffer: Buffer): Promise<FileHashResult> {
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const md5 = createHash("md5").update(buffer).digest("hex");

  return {
    sha256,
    md5,
    size: buffer.byteLength,
  };
}

export async function verifyFileIntegrity(buffer: Buffer, expectedSha256: string): Promise<boolean> {
  const computed = await computeFileHashes(buffer);
  return computed.sha256 === expectedSha256;
}

export function generateUniqueFileName(originalName: string, userId?: string): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const userPrefix = userId ? userId.substring(0, 8) : 'anon';
  const ext = originalName.includes('.') ? originalName.split('.').pop() : 'bin';
  const baseName = originalName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, '_');

  return `${userPrefix}_${timestamp}_${baseName}_${randomSuffix}.${ext}`;
}

export function validateFileSize(buffer: Buffer, maxBytes: number = 50 * 1024 * 1024): boolean {
  return buffer.byteLength <= maxBytes;
}

export function detectMimeTypeByExtension(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    txt: 'text/plain',
    csv: 'text/csv',

    // Images
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    bmp: 'image/bmp',
    webp: 'image/webp',
    svg: 'image/svg+xml',

    // Archives
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    '7z': 'application/x-7z-compressed',
    gz: 'application/gzip',
    tar: 'application/x-tar',

    // Other
    json: 'application/json',
    xml: 'application/xml',
    html: 'text/html',
  };

  return mimeTypes[ext] || 'application/octet-stream';
}
