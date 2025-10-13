/**
 * OCR Service - خدمة التعرف الضوئي على الأحرف
 * يدعم Tesseract.js للنصوص العربية والإنجليزية مع تحسينات الأداء
 */

import path from 'path';
import type { Worker } from 'tesseract.js';
import { createWorker } from 'tesseract.js';

export type OCRResult = {
  success: boolean;
  text?: string;
  confidence?: number;
  language: string;
  processingTime: number;
  pageCount: number;
  words?: OCRWord[];
  error?: string;
};

export type OCRWord = {
  text: string;
  confidence: number;
  bbox: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
};

export interface OCRConfig {
  enabled: boolean;
  languages: string[]; // e.g., ['ara', 'eng']
  engineMode: number; // Tesseract engine mode
  pageSegMode: number; // Page segmentation mode
  maxFileSize: number; // Maximum file size in bytes
  timeout: number; // Processing timeout in milliseconds
  enhance: boolean; // Enable image enhancement
  outputFormats: ('text' | 'pdf' | 'searchable-pdf')[];
}

class OCRService {
  private config: OCRConfig;
  private worker: Worker | null = null;
  private workerInitialized = false;

  constructor(config: Partial<OCRConfig> = {}) {
    this.config = {
      enabled: process.env.OCR_ENABLED === 'true',
      languages: (process.env.OCR_LANGUAGES || 'ara+eng').split('+'),
      engineMode: parseInt(process.env.OCR_ENGINE_MODE || '1'), // DEFAULT engine
      pageSegMode: parseInt(process.env.OCR_PSM || '6'), // Uniform block of text
      maxFileSize: parseInt(process.env.OCR_MAX_FILE_SIZE || '10485760'), // 10MB
      timeout: parseInt(process.env.OCR_TIMEOUT || '60000'), // 60 seconds
      enhance: process.env.OCR_ENHANCE === 'true',
      outputFormats: ['text'],
      ...config,
    };
  }

  private async initializeWorker(): Promise<void> {
    if (!this.worker) {
      console.log('🔄 Initializing Tesseract.js worker...');

      // Create worker instance with languages
      const languageString = this.config.languages.join('+');
      this.worker = await createWorker(languageString, 1, {
        logger:
          process.env.NODE_ENV === 'development'
            ? (m: any) => console.log(`OCR: ${m.status}`)
            : undefined,
      });

      console.log('✅ Tesseract.js worker initialized successfully');
    }
  }

  async processFile(filePath: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      if (!this.config.enabled) {
        return {
          success: false,
          error: 'OCR service is disabled in configuration',
          language: 'none',
          processingTime: Date.now() - startTime,
          pageCount: 0,
        };
      }

      // Validate file
      const validation = await this.validateFile(filePath);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          language: this.config.languages.join('+'),
          processingTime: Date.now() - startTime,
          pageCount: 0,
        };
      }

      // Initialize worker if needed
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      console.log(`📖 Starting OCR processing for: ${path.basename(filePath)}`);

      // Process the image/document
      const result = await Promise.race([this.performOCR(filePath), this.createTimeoutPromise()]);

      const processingTime = Date.now() - startTime;

      if (result.success) {
        console.log(
          `✅ OCR completed in ${processingTime}ms - extracted ${result.text?.length || 0} characters`,
        );
      }

      return {
        ...result,
        processingTime,
      };
    } catch (error) {
      console.error('❌ OCR processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error',
        language: this.config.languages.join('+'),
        processingTime: Date.now() - startTime,
        pageCount: 0,
      };
    }
  }

  async processBuffer(buffer: Buffer, fileName: string): Promise<OCRResult> {
    const startTime = Date.now();

    try {
      if (!this.config.enabled) {
        return {
          success: false,
          error: 'OCR service is disabled in configuration',
          language: 'none',
          processingTime: Date.now() - startTime,
          pageCount: 0,
        };
      }

      // Validate buffer
      if (buffer.length > this.config.maxFileSize) {
        return {
          success: false,
          error: `File too large: ${buffer.length} bytes (max: ${this.config.maxFileSize})`,
          language: this.config.languages.join('+'),
          processingTime: Date.now() - startTime,
          pageCount: 0,
        };
      }

      // Check if it's an image file
      if (!this.isImageBuffer(buffer)) {
        return {
          success: false,
          error: 'File is not a supported image format',
          language: this.config.languages.join('+'),
          processingTime: Date.now() - startTime,
          pageCount: 0,
        };
      }

      // Initialize worker if needed
      await this.initializeWorker();

      if (!this.worker) {
        throw new Error('OCR worker not initialized');
      }

      console.log(`📖 Starting OCR processing for buffer: ${fileName}`);

      // Process the buffer
      const result = await Promise.race([
        this.performOCROnBuffer(buffer),
        this.createTimeoutPromise(),
      ]);

      const processingTime = Date.now() - startTime;

      if (result.success) {
        console.log(
          `✅ OCR completed in ${processingTime}ms - extracted ${result.text?.length || 0} characters`,
        );
      }

      return {
        ...result,
        processingTime,
      };
    } catch (error) {
      console.error('❌ Buffer OCR processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown OCR error',
        language: this.config.languages.join('+'),
        processingTime: Date.now() - startTime,
        pageCount: 0,
      };
    }
  }

  private async performOCR(filePath: string): Promise<OCRResult> {
    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    const { data } = await this.worker.recognize(filePath);

    return {
      success: true,
      text: data.text,
      confidence: data.confidence,
      language: this.config.languages.join('+'),
      processingTime: 0, // Will be set by caller
      pageCount: 1,
      words: this.extractWords(data),
    };
  }

  private async performOCROnBuffer(buffer: Buffer): Promise<OCRResult> {
    if (!this.worker) {
      throw new Error('OCR worker not available');
    }

    const { data } = await this.worker.recognize(buffer);

    return {
      success: true,
      text: data.text,
      confidence: data.confidence,
      language: this.config.languages.join('+'),
      processingTime: 0, // Will be set by caller
      pageCount: 1,
      words: this.extractWords(data),
    };
  }

  private extractWords(data: any): OCRWord[] {
    if (!data.words) return [];

    return data.words.map((word: any) => ({
      text: word.text,
      confidence: word.confidence,
      bbox: {
        x0: word.bbox.x0,
        y0: word.bbox.y0,
        x1: word.bbox.x1,
        y1: word.bbox.y1,
      },
    }));
  }

  private async createTimeoutPromise(): Promise<OCRResult> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`OCR processing timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  private async validateFile(filePath: string): Promise<{ valid: boolean; error?: string }> {
    try {
      const stats = await this.getFileStats(filePath);

      if (stats.size > this.config.maxFileSize) {
        return {
          valid: false,
          error: `File too large: ${stats.size} bytes (max: ${this.config.maxFileSize})`,
        };
      }

      // Check if it's an image file
      const supportedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff', '.pdf'];
      const extension = path.extname(filePath).toLowerCase();

      if (!supportedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `Unsupported file type: ${extension}. Supported: ${supportedExtensions.join(', ')}`,
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `File validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private isImageBuffer(buffer: Buffer): boolean {
    // Check for common image file signatures
    const signatures = [
      [0x89, 0x50, 0x4e, 0x47], // PNG
      [0xff, 0xd8, 0xff], // JPEG
      [0x47, 0x49, 0x46, 0x38], // GIF
      [0x42, 0x4d], // BMP
      [0x49, 0x49, 0x2a, 0x00], // TIFF (little-endian)
      [0x4d, 0x4d, 0x00, 0x2a], // TIFF (big-endian)
      [0x25, 0x50, 0x44, 0x46], // PDF
    ];

    return signatures.some(signature => {
      if (buffer.length < signature.length) return false;
      return signature.every((byte, index) => buffer[index] === byte);
    });
  }

  private async getFileStats(filePath: string) {
    const fs = await import('fs/promises');
    return await fs.stat(filePath);
  }

  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.workerInitialized = false;
      console.log('🧹 OCR worker terminated');
    }
  }

  // Save OCR results to storage
  async saveOCRResults(evidenceId: string, ocrResult: OCRResult): Promise<string | null> {
    if (!ocrResult.success || !ocrResult.text) {
      return null;
    }

    try {
      // Create OCR results object
      const ocrData = {
        evidenceId,
        extractedText: ocrResult.text,
        confidence: ocrResult.confidence || 0,
        language: ocrResult.language,
        processingTime: ocrResult.processingTime,
        pageCount: ocrResult.pageCount,
        words: ocrResult.words || [],
        processedAt: new Date().toISOString(),
      };

      // In production, you would save this to your storage system
      const ocrFileName = `ocr-${evidenceId}-${Date.now()}.json`;

      console.log(`💾 Saving OCR results for evidence ${evidenceId}:`, {
        textLength: ocrResult.text.length,
        confidence: ocrResult.confidence,
        fileName: ocrFileName,
      });

      // TODO: Implement actual file saving to your storage system
      // const ocrUrl = await storageManager.saveOCRResults(ocrFileName, ocrData);

      return `ocr-results/${ocrFileName}`; // Return path/URL to saved OCR results
    } catch (error) {
      console.error('❌ Failed to save OCR results:', error);
      return null;
    }
  }

  // Search within OCR text
  searchInOCRText(
    ocrResult: OCRResult,
    searchTerm: string,
  ): { found: boolean; matches: number; contexts: string[] } {
    if (!ocrResult.success || !ocrResult.text) {
      return { found: false, matches: 0, contexts: [] };
    }

    const text = ocrResult.text.toLowerCase();
    const term = searchTerm.toLowerCase();
    const matches = (text.match(new RegExp(term, 'g')) || []).length;

    if (matches === 0) {
      return { found: false, matches: 0, contexts: [] };
    }

    // Extract context around matches
    const contexts: string[] = [];
    const words = ocrResult.text.split(/\s+/);
    const termWords = term.split(/\s+/);

    for (let i = 0; i <= words.length - termWords.length; i++) {
      const slice = words.slice(i, i + termWords.length);
      if (slice.join(' ').toLowerCase().includes(term)) {
        const start = Math.max(0, i - 5);
        const end = Math.min(words.length, i + termWords.length + 5);
        const context = words.slice(start, end).join(' ');
        contexts.push(context);
      }
    }

    return {
      found: true,
      matches,
      contexts: contexts.slice(0, 5), // Limit to 5 contexts
    };
  }
}

// Export singleton instance
export const ocrService = new OCRService();

// Export class for custom configurations
export { OCRService };

// Helper function for quick OCR processing
export async function extractTextFromFile(filePath: string): Promise<OCRResult> {
  return ocrService.processFile(filePath);
}

// Helper function for buffer OCR
export async function extractTextFromBuffer(buffer: Buffer, fileName: string): Promise<OCRResult> {
  return ocrService.processBuffer(buffer, fileName);
}
