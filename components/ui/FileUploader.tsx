'use client';

import { File, Upload, X } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

export interface UploadedFile {
  /**
   * اسم الملف
   */
  name: string;

  /**
   * حجم الملف (bytes)
   */
  size: number;

  /**
   * نوع الملف
   */
  type: string;

  /**
   * كائن File
   */
  file: File;
}

interface FileUploaderProps {
  /**
   * دالة عند رفع الملفات
   */
  onUpload: (files: UploadedFile[]) => void;

  /**
   * دالة عند حذف ملف
   */
  onRemove?: (index: number) => void;

  /**
   * أنواع الملفات المقبولة
   */
  accept?: string;

  /**
   * الحد الأقصى لحجم الملف (MB)
   */
  maxSize?: number;

  /**
   * الحد الأقصى لعدد الملفات
   */
  maxFiles?: number;

  /**
   * رفع ملفات متعددة
   */
  multiple?: boolean;

  /**
   * الملفات المرفوعة حاليًا
   */
  files?: UploadedFile[];

  /**
   * حالة التحميل
   */
  loading?: boolean;

  /**
   * رسالة خطأ
   */
  error?: string;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

/**
 * FileUploader Component
 * مكون لرفع الملفات مع drag-and-drop
 *
 * @example
 * ```tsx
 * const [files, setFiles] = useState<UploadedFile[]>([]);
 *
 * <FileUploader
 *   onUpload={(newFiles) => setFiles([...files, ...newFiles])}
 *   onRemove={(index) => setFiles(files.filter((_, i) => i !== index))}
 *   files={files}
 *   accept="image/*,.pdf"
 *   maxSize={5}
 *   multiple
 * />
 * ```
 */
export function FileUploader({
  onUpload,
  onRemove,
  accept,
  maxSize = 10,
  maxFiles = 5,
  multiple = true,
  files = [],
  loading = false,
  error,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const errorMessage = error || localError;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setLocalError('');

    const newFiles: UploadedFile[] = [];
    const filesToProcess = Array.from(fileList);

    // Check max files limit
    if (files.length + filesToProcess.length > maxFiles) {
      setLocalError(`لا يمكن رفع أكثر من ${maxFiles} ملف`);
      return;
    }

    for (const file of filesToProcess) {
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxSize) {
        setLocalError(`حجم الملف ${file.name} يتجاوز ${maxSize} ميجابايت`);
        continue;
      }

      newFiles.push({
        name: file.name,
        size: file.size,
        type: file.type,
        file,
      });
    }

    if (newFiles.length > 0) {
      onUpload(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow re-uploading same file
    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Upload Area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 transition-fast',
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
            : 'border-border-base bg-bg-elevated hover:border-brand-300',
          loading && 'opacity-50 pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="sr-only"
          aria-label="رفع ملفات"
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="p-4 rounded-full bg-brand-50 dark:bg-brand-950">
            <Upload size={32} className="text-brand-600" />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-text-primary">
              اسحب الملفات هنا أو{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-brand-600 hover:text-brand-700 underline focus-ring"
              >
                تصفح
              </button>
            </p>
            <p className="text-xs text-text-tertiary">
              حجم أقصى: {maxSize} ميجابايت • عدد أقصى: {maxFiles} ملف
              {accept && ` • أنواع مقبولة: ${accept}`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          className="px-4 py-3 rounded-lg bg-error-50 dark:bg-error-950 text-error-700 dark:text-error-300 text-sm"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">
            الملفات المرفوعة ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="
                  flex items-center gap-3 p-3 rounded-lg
                  border border-border-base bg-bg-elevated
                "
              >
                <div className="p-2 rounded-lg bg-bg-muted">
                  <File size={20} className="text-text-tertiary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="
                      p-1.5 rounded-lg
                      text-text-tertiary hover:text-error-600 hover:bg-error-50
                      transition-fast focus-ring
                    "
                    aria-label={`حذف ${file.name}`}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
