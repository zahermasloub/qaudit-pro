/**
 * File Upload Component - React Hook Form + Zod validation
 * Features: Drag & drop, multiple files, progress, preview
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
// TODO: Import toast when implemented
// import { toast } from '@/components/ui/toast';

// Temporary toast function
const toast = {
  success: (message: string) => console.log('SUCCESS:', message),
  error: (message: string) => console.log('ERROR:', message),
};

// File upload schema with Zod
const FileUploadSchema = z.object({
  engagementId: z.string().min(1, 'Engagement ID is required'),
  testId: z.string().optional(),
  evidenceCategory: z.string().default('document'),
  description: z.string().default(''),
  files: z.array(z.any()).min(1, 'At least one file is required'),
});

type FileUploadFormData = z.infer<typeof FileUploadSchema>;

interface FileUploadProps {
  engagementId: string;
  testId?: string;
  onUploadSuccess?: (results: any[]) => void;
  onUploadError?: (errors: any[]) => void;
  className?: string;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadProgress?: number;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  engagementId,
  testId,
  onUploadSuccess,
  onUploadError,
  className = '',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FileUploadFormData>({
    resolver: zodResolver(FileUploadSchema),
    defaultValues: {
      engagementId,
      testId: testId || '',
      evidenceCategory: 'document',
      description: '',
      files: [],
    },
  });

  // Dropzone configuration
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const filesWithPreview = acceptedFiles.map(file => {
        const fileWithPreview = file as FileWithPreview;

        // Create preview for images
        if (file.type.startsWith('image/')) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }

        fileWithPreview.uploadStatus = 'pending';
        return fileWithPreview;
      });

      const updatedFiles = [...selectedFiles, ...filesWithPreview];
      setSelectedFiles(updatedFiles);
      setValue('files', updatedFiles);
    },
    [selectedFiles, setValue],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
  });

  // Remove file from list
  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);

    // Revoke object URL for images
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    setSelectedFiles(updatedFiles);
    setValue('files', updatedFiles);
  };

  // Get file icon based on type
  const getFileIcon = (file: FileWithPreview): string => {
    const type = file.type;
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type === 'text/csv') return '📋';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Upload files
  const onSubmit = async (data: FileUploadFormData) => {
    if (!data.files.length) {
      toast.error('الرجاء اختيار ملف أو أكثر للرفع');
      return;
    }

    setIsUploading(true);

    try {
      // Update file status to uploading
      const updatedFiles = selectedFiles.map(file => ({
        ...file,
        uploadStatus: 'uploading' as const,
        uploadProgress: 0,
      }));
      setSelectedFiles(updatedFiles);

      // Prepare form data
      const formData = new FormData();
      formData.append('engagementId', data.engagementId);
      if (data.testId) {
        formData.append('testId', data.testId);
      }
      formData.append('evidenceCategory', data.evidenceCategory);
      formData.append('description', data.description);

      // Add files
      data.files.forEach((file: File) => {
        formData.append('files', file);
      });

      // Upload
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update file status to success
        const successFiles = selectedFiles.map(file => ({
          ...file,
          uploadStatus: 'success' as const,
          uploadProgress: 100,
        }));
        setSelectedFiles(successFiles);

        toast.success(`تم رفع ${result.uploaded} ملف بنجاح من أصل ${result.total}`);

        if (onUploadSuccess) {
          onUploadSuccess(result.results);
        }

        // Reset form after successful upload
        setTimeout(() => {
          setSelectedFiles([]);
          reset();
        }, 2000);
      } else {
        // Handle partial or complete failure
        const errorFiles = selectedFiles.map(file => ({
          ...file,
          uploadStatus: 'error' as const,
          uploadError: 'فشل في الرفع',
        }));
        setSelectedFiles(errorFiles);

        toast.error(result.error || 'فشل في رفع الملفات');

        if (onUploadError && result.errors) {
          onUploadError(result.errors);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);

      const errorFiles = selectedFiles.map(file => ({
        ...file,
        uploadStatus: 'error' as const,
        uploadError: 'خطأ في الشبكة',
      }));
      setSelectedFiles(errorFiles);

      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف الأدلة</label>
          <select
            {...register('evidenceCategory')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="document">مستند</option>
            <option value="screenshot">لقطة شاشة</option>
            <option value="spreadsheet">جدول بيانات</option>
            <option value="csv-export">تصدير CSV</option>
            <option value="archive">أرشيف</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            وصف الأدلة (اختياري)
          </label>
          <textarea
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="اكتب وصفاً للملفات المرفوعة..."
          />
        </div>

        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${isUploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="text-lg font-medium text-gray-700">
              {isDragActive ? 'إفلات الملفات هنا' : 'اسحب وأفلت الملفات هنا'}
            </p>
            <p className="text-sm text-gray-500">
              أو انقر لاختيار الملفات (حد أقصى 50 ميجابايت لكل ملف)
            </p>
            <p className="text-xs text-gray-400">صيغ مدعومة: PDF, Word, Excel, CSV, صور، أرشيف</p>
          </div>
        </div>

        {errors.files && <p className="text-sm text-red-600">{errors.files.message}</p>}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">الملفات المحددة:</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50"
                >
                  <div className="flex items-center space-x-3 space-x-reverse flex-1">
                    <span className="text-2xl">{getFileIcon(file)}</span>

                    {/* File preview for images */}
                    {file.preview && (
                      <div
                        className="w-12 h-12 bg-gray-200 rounded border bg-cover bg-center"
                        style={{ backgroundImage: `url(${file.preview})` }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                      {/* Upload status */}
                      {file.uploadStatus === 'uploading' && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${file.uploadProgress || 0}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {file.uploadStatus === 'success' && (
                        <p className="text-xs text-green-600">✓ تم الرفع بنجاح</p>
                      )}

                      {file.uploadStatus === 'error' && (
                        <p className="text-xs text-red-600">✗ {file.uploadError || 'فشل الرفع'}</p>
                      )}
                    </div>
                  </div>

                  {!isUploading && file.uploadStatus !== 'success' && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      إزالة
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || selectedFiles.length === 0}
            variant="primary"
          >
            {isUploading ? 'جاري الرفع...' : `رفع ${selectedFiles.length} ملف`}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FileUpload;
