// S3 Pre-signed URLs Service (AWS SDK v3) - خدمة الروابط المؤقتة الآمنة

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHash } from "crypto";

export interface PresignedUrlResult {
  success: boolean;
  url?: string;
  expiresAt: Date;
  error?: string;
}

export class S3PresignedService {
  private s3Client: S3Client | null = null;
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.S3_ENABLED === "true";

    if (this.enabled) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        } : undefined,
      });

      console.log("✅ S3 service initialized with AWS SDK v3 - تم حل تحذيرات الإصدار القديم");
    }
  }

  async generateEvidenceDownloadUrl(
    evidenceId: string,
    fileName: string,
    userId: string,
    ipAddress: string,
    expires: number = 3600
  ): Promise<PresignedUrlResult> {
    if (!this.enabled || !this.s3Client) {
      return {
        success: false,
        error: "S3 service not available",
        expiresAt: new Date()
      };
    }

    try {
      const bucket = process.env.S3_BUCKET || "qaudit-evidence";
      const timestamp = Date.now();
      const hash = createHash("sha256").update(`${evidenceId}-${fileName}-${userId}-${timestamp}`).digest("hex");
      const secureKey = `evidence/${evidenceId}/${hash.substring(0, 16)}/${fileName}`;

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: secureKey,
        ResponseContentDisposition: `attachment; filename="${fileName}"`
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn: expires });
      const expiresAt = new Date(Date.now() + expires * 1000);

      console.log(`🔗 Generated secure evidence download URL (AWS SDK v3):`, { evidenceId, fileName, userId });

      return { success: true, url, expiresAt };

    } catch (error) {
      console.error("❌ Failed to generate evidence download URL:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        expiresAt: new Date()
      };
    }
  }
}

const s3Service = new S3PresignedService();
export default s3Service;
