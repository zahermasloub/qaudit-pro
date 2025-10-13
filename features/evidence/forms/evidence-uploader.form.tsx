/**
 * Evidence Uploader Form - نموذج رفع الأدلة المتقدم
 * يدعم جميع صيغ الملفات مع drag & drop وتحقق شامل
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDropzone } from 'react-dropzone';
import { evidenceUploadMetaSchema, getCategoryLabel, type EvidenceUploadMeta } from '@/features/evidence/schemas/evidence-upload.schema';
import { Button } from '@/components/ui/button';

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
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EvidenceUploadMeta>({
    resolver: zodResolver(evidenceUploadMetaSchema),
    defaultValues: {
      engagementId,
      category: 'other',
      linkedTestId: defaultLinks?.testId || '',
      linkedSampleRef: defaultLinks?.sampleRef || '',
      linkedFindingId: defaultLinks?.findingId || '',
      uploadedBy: 'auditor@example.com', // TODO: Get from auth session
      description: '',
    },
  });

  // Dropzone للسحب والإفلات
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => {
      const fileWithPreview = file as FileWithPreview;

      // إنشاء معاينة للصور
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
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    accept: {
      // Documents
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],

      // Images
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],

      // Archives
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],

      // Other
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

  const uploadSingleFile = async (file: FileWithPreview, metadata: EvidenceUploadMeta): Promise<string> => {
    console.log('📤 رفع الملف:', {
      fileName: file.name,
      fileSize: file.size,
      engagementId: metadata.engagementId,
      category: metadata.category
    });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('meta', JSON.stringify(metadata));

    const response = await fetch('/api/evidence/batch-upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ خطأ في الاستجابة:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error
      });

      // رسائل خطأ محسنة حسب نوع المشكلة
      if (response.status === 404 && result.error?.includes('المهمة')) {
        throw new Error(`المهمة غير موجودة (معرف: ${metadata.engagementId}). يرجى التأكد من صحة اختيار المهمة.`);
      }

      throw new Error(result.error || `فشل في رفع ${file.name} (كود الخطأ: ${response.status})`);
    }

    if (!result.ok) {
      console.error('❌ خطأ في المعالجة:', result.error);
      throw new Error(result.error || `خطأ في معالجة ${file.name}`);
    }

    console.log('✅ تم رفع الملف بنجاح:', file.name, '- معرف الدليل:', result.evidence.id);
    return result.evidence.id;
  };

  const onSubmit = async (metadata: EvidenceUploadMeta) => {
    if (selectedFiles.length === 0) {
      setSubmitError('يرجى اختيار ملف واحد على الأقل');
      return;
    }

    // التحقق من وجود معرف المهمة
    if (!engagementId || engagementId.trim() === '') {
      setSubmitError('معرف المهمة مطلوب لرفع الأدلة. يرجى التأكد من اختيار المهمة الصحيحة.');
      return;
    }

    console.log('🔄 بدء رفع الملفات للمهمة:', engagementId);

    setIsUploading(true);
    setSubmitError(null);

    const results: string[] = [];
    const errors: string[] = [];

    try {
      // رفع الملفات واحد تلو الآخر
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        try {
          // تحديث حالة الملف
          setSelectedFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, uploadStatus: 'uploading' } : f
          ));

          // محاكاة تقدم الرفع
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => ({
              ...prev,
              [file.name]: Math.min(90, (prev[file.name] || 0) + 10)
            }));
          }, 200);

          // رفع الملف
          const evidenceId = await uploadSingleFile(file, metadata);

          clearInterval(progressInterval);

          // تحديث التقدم إلى 100%
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));

          // تحديث حالة الملف للنجاح
          setSelectedFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, uploadStatus: 'success' } : f
          ));

          results.push(evidenceId);

        } catch (error) {
          console.error('❌ فشل في رفع الملف:', file.name, error);

          // تحديث حالة الملف للخطأ
          const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
          setSelectedFiles(prev => prev.map((f, idx) =>
            idx === i ? { ...f, uploadStatus: 'error', uploadError: errorMessage } : f
          ));

          errors.push(`${file.name}: ${errorMessage}`);
        }
      }

      if (results.length > 0) {
        console.log(`✅ تم رفع ${results.length} ملف بنجاح:`, results);

        // TODO: Add toast notification
        alert(`تم رفع ${results.length} ملف بنجاح!`);

        // إشعار بنجاح رفع أول ملف (للتوافق مع الواجهة)
        onSuccess(results[0]);

        // إعادة تعيين النموذج بعد تأخير قصير للسماح للمستخدم برؤية النتائج
        setTimeout(() => {
          reset();
          setSelectedFiles([]);
          setUploadProgress({});
          onOpenChange(false);
        }, 2000);
      }

      if (errors.length > 0) {
        console.error('📋 ملخص الأخطاء:', errors);
        setSubmitError(`فشل في رفع ${errors.length} من ${selectedFiles.length} ملف:\n${errors.join('\n')}\n\nنصائح لحل المشكلة:\n• تأكد من صحة اختيار المهمة\n• تحقق من اتصال الإنترنت\n• جرب رفع الملفات مرة أخرى`);
      }

    } catch (error) {
      console.error('❌ خطأ عام في رفع الملفات:', error);
      setSubmitError(error instanceof Error ? error.message : 'خطأ عام في رفع الملفات. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: FileWithPreview): string => {
    const type = file.type || '';

    // فحص أمان: في حالة عدم وجود نوع محدد للملف
    if (!type) return '📁';

    if (type.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type.includes('word')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type === 'text/csv') return '📋';
    if (type.includes('zip') || type.includes('rar')) return '📦';
    return '📁';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            رفع أدلة جديدة
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            disabled={isUploading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* معلومات الربط */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تصنيف الدليل
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <option value="financial_statement">{getCategoryLabel('financial_statement')}</option>
                <option value="bank_statement">{getCategoryLabel('bank_statement')}</option>
                <option value="other">{getCategoryLabel('other')}</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                معرف الاختبار (اختياري)
              </label>
              <input
                {...register('linkedTestId')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TEST-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                مرجع العينة (اختياري)
              </label>
              <input
                {...register('linkedSampleRef')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SAMPLE-001"
              />
            </div>
          </div>

          {/* وصف الأدلة */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الأدلة (اختياري)
            </label>
            <textarea
              {...register('description')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب وصفاً موجزاً للأدلة المرفوعة..."
              maxLength={500}
            />
          </div>

          {/* منطقة السحب والإفلات */}
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
              }
              ${isUploading ? 'pointer-events-none opacity-50' : ''}
            `}
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
                صيغ مدعومة: PDF, Word, Excel, CSV, الصور، الأرشيف
              </p>
            </div>
          </div>

          {/* قائمة الملفات المحددة */}
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

                      {/* معاينة الصور */}
                      {file.preview && (
                        <div
                          className="w-12 h-12 bg-gray-200 rounded border bg-cover bg-center"
                          style={{ backgroundImage: `url(${file.preview})` }}
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>

                        {/* شريط التقدم */}
                        {file.uploadStatus === 'uploading' && (
                          <div className="mt-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress[file.name] || 0}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* حالة الرفع */}
                        {file.uploadStatus === 'success' && (
                          <p className="text-xs text-green-600">✓ تم الرفع بنجاح</p>
                        )}

                        {file.uploadStatus === 'error' && (
                          <p className="text-xs text-red-600">
                            ✗ {file.uploadError || 'فشل الرفع'}
                          </p>
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

          {/* رسالة الخطأ */}
          {submitError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700 whitespace-pre-line">{submitError}</p>
            </div>
          )}

          {/* أزرار التحكم */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
  );
};

export default EvidenceUploaderForm;
