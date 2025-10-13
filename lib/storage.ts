import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export function computeSha256(buf: Buffer): string {
  const hash = createHash('sha256');
  hash.update(buf);
  return hash.digest('hex');
}

export async function saveLocal(
  fileName: string,
  content: Buffer,
  baseDir: string = process.env.UPLOAD_DIR || './uploads',
): Promise<{ key: string; full: string }> {
  // Create directory if it doesn't exist
  await fs.mkdir(baseDir, { recursive: true });

  // Generate unique key with timestamp and sanitized filename
  const sanitizedName = fileName.replace(/\s+/g, '_');
  const key = `${Date.now()}_${sanitizedName}`;
  const fullPath = path.join(baseDir, key);

  // Save file
  await fs.writeFile(fullPath, content);

  return { key, full: fullPath };
}
