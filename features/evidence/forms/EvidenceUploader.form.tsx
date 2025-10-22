/**
 * Evidence Uploader Form - نموذج رفع الأدلة المتقدم
 * يدعم جميع صيغ الملفات مع السحب والإفلات والتحقق الشامل.
 */

'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  type EvidenceUploadMeta,
  evidenceUploadMetaSchema,
  getCategoryLabel,
} from '@/features/evidence/schemas/evidence-upload.schema';

interface EvidenceUploaderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  defaultLinks?: {
    testId?: string;
    sampleRef?: string;
    findingId?: string;
  };
  onSuccess: (evidenceId: string) => void;
}

interface FileWithPreview extends File {
  preview?: string;
  uploadStatus?: 'pending' | 'uploading' | 'success' | 'error';
  uploadError?: string;
}

const EvidenceUploaderForm: React.FC<EvidenceUploaderFormProps> = ({
  open,
  onOpenChange,
  engagementId,
  defaultLinks,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EvidenceUploadMeta>({
    resolver: zodResolver(evidenceUploadMetaSchema),
    defaultValues: {
      engagementId,
      category: 'other',
      linkedTestId: defaultLinks?.testId || '',
      linkedSampleRef: defaultLinks?.sampleRef || '',
      linkedFindingId: defaultLinks?.findingId || '',
      uploadedBy: 'auditor@example.com', // TODO: الحصول على بيانات المستخدم من الجلسة
      description: '',
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;

      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }

      fileWithPreview.uploadStatus = 'pending';
      return fileWithPreview;
    });

    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 50 * 1024 * 1024,
    multiple: true,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
    },
  });

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSingleFile = async (
    file: FileWithPreview,
    metadata: EvidenceUploadMeta,
  ): Promise<string> => {
    console.log('📤 رفع الملف:', {
      fileName: file.name,
      fileSize: file.size,
      engagementId: metadata.engagementId,
      category: metadata.category,
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('meta', JSON.stringify(metadata));

    const response = await fetch('/api/evidence/batch-upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      console.error('❌ فشل رفع الملف:', result.error);
      throw new Error(result.error || `تعذر رفع ${file.name} (رمز الحالة: ${response.status}).`);
    }

    return result.evidence.id;
  };

  const onSubmit = async (metadata: EvidenceUploadMeta) => {
    if (selectedFiles.length === 0) {
      setSubmitError('الرجاء اختيار ملفات للرفع أولاً.');
      return;
    }

    if (!engagementId || engagementId.trim() === '') {
      setSubmitError('لا يمكن تحديد سجل التدقيق المستهدف. تحقق من هوية التدقيق.');
      return;
    }

    setIsUploading(true);
    setSubmitError(null);

    const results: string[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < selectedFiles.length; i += 1) {
        const file = selectedFiles[i];

        try {
          setSelectedFiles(prev =>
            prev.map((f, idx) => (idx === i ? { ...f, uploadStatus: 'uploading' } : f)),
          );

          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const current = prev[file.name] ?? 0;
              const next = Math.min(current + 5, 90);
              return { ...prev, [file.name]: next };
            });
          }, 200);

          const evidenceId = await uploadSingleFile(file, metadata);

          clearInterval(progressInterval);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          setSelectedFiles(prev =>
            prev.map((f, idx) =>
              idx === i ? { ...f, uploadStatus: 'success', uploadError: undefined } : f,
            ),
          );

          results.push(evidenceId);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'تعذر رفع الملف بسبب خطأ غير متوقع';

          setSelectedFiles(prev =>
            prev.map((f, idx) =>
              idx === i ? { ...f, uploadStatus: 'error', uploadError: errorMessage } : f,
            ),
          );
          errors.push(`${file.name}: ${errorMessage}`);
        }
      }

      if (results.length > 0) {
        reset();
        setSelectedFiles([]);
        setUploadProgress({});
        onSuccess(results[0]);
        onOpenChange(false);
      }

      if (errors.length > 0) {
        setSubmitError(errors.join('\n'));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: FileWithPreview): string => {
    const type = file.type || '';
    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type === 'text/csv') return '📈';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📁';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4" dir="rtl">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl w-full min-h-[40vh] max-h-[90vh]">
          <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-xl font-semibold text-gray-900">نموذج رفع الأدلة</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              disabled={isUploading}
              aria-label="إغلاق"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 sm:px-4 md:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">فئة الدليل</label>
                  <select
                    {...register('category')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="invoice">{getCategoryLabel('invoice')}</option>
                    <option value="contract">{getCategoryLabel('contract')}</option>
                    <option value="screenshot">{getCategoryLabel('screenshot')}</option>
                    <option value="sql_export">{getCategoryLabel('sql_export')}</option>
                    <option value="excel_report">{getCategoryLabel('excel_report')}</option>
                    <option value="email_thread">{getCategoryLabel('email_thread')}</option>
                    <option value="system_log">{getCategoryLabel('system_log')}</option>
                    <option value="policy_document">{getCategoryLabel('policy_document')}</option>
                    <option value="procedure_manual">{getCategoryLabel('procedure_manual')}</option>
                    <option value="audit_trail">{getCategoryLabel('audit_trail')}</option>
                    <option value="financial_statement">
                      {getCategoryLabel('financial_statement')}
                    </option>
                    <option value="bank_statement">{getCategoryLabel('bank_statement')}</option>
                    <option value="other">{getCategoryLabel('other')}</option>
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ربط باختبار (اختياري)
                  </label>
                  <input
                    {...register('linkedTestId')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="TEST-001"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    ربط بعينة (اختياري)
                  </label>
                  <input
                    {...register('linkedSampleRef')}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="SAMPLE-001"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  وصف مختصر (اختياري)
                </label>
                <textarea
                  {...register('description')}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="أدخل وصفًا يسهّل على الفريق التعرف على الدليل."
                />
              </div>

              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              >
                <input {...getInputProps()} />
                <div className="space-y-2">
                  <div className="text-4xl">📁</div>
                  <p className="text-lg font-medium text-gray-700">
                    {isDragActive ? 'أفلت الملفات هنا' : 'اسحب وأفلت الملفات هنا'}
                  </p>
                  <p className="text-sm text-gray-500">
                    أو انقر لاختيار الملفات (حد أقصى 50 ميجابايت لكل ملف)
                  </p>
                  <p className="text-xs text-gray-400">
                    صيغ مدعومة: PDF، Word، Excel، CSV، الصور، الأرشيفات
                  </p>
                </div>
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">الملفات المحددة:</h4>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex flex-1 items-center space-x-3 space-x-reverse">
                          <span className="text-2xl">{getFileIcon(file)}</span>
                          {file.preview && (
                            <div
                              className="h-12 w-12 rounded border bg-cover bg-center"
                              style={{ backgroundImage: `url(${file.preview})` }}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            {file.uploadStatus === 'uploading' && (
                              <div className="mt-1">
                                <div className="h-1 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                                    style={{ width: `${uploadProgress[file.name] || 0}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            {file.uploadStatus === 'success' && (
                              <p className="text-xs text-green-600">✓ تم الرفع بنجاح</p>
                            )}
                            {file.uploadStatus === 'error' && (
                              <p className="text-xs text-red-600">
                                ✗ {file.uploadError || 'تعذر رفع الملف'}
                              </p>
                            )}
                          </div>
                        </div>

                        {!isUploading && file.uploadStatus !== 'success' && (
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-sm text-red-500 transition-colors hover:text-red-700"
                          >
                            إزالة
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4">
                  <p className="whitespace-pre-line text-sm text-red-700">{submitError}</p>
                </div>
              )}
            </div>

            <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isUploading || selectedFiles.length === 0}
              >
                {isUploading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    جاري الرفع...
                  </>
                ) : (
                  `رفع ${selectedFiles.length} ملف`
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploaderForm;
