/**
 * Evidence Files List Component
 * Features: Grid/List view, filters, download, delete
 */

'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

interface EvidenceFile {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileExt: string | null;
  category: string;
  linkedTestId: string | null;
  linkedSampleRef: string | null;
  linkedFindingId: string | null;
  virusScanStatus: 'pending' | 'clean' | 'suspected' | 'blocked';
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl: string;
  // Helper properties
  isImage: boolean;
  isDocument: boolean;
  isSpreadsheet: boolean;
  fileSizeFormatted: string;
}

interface EvidenceFilesProps {
  engagementId: string;
  testId?: string;
  category?: string;
  onFileSelect?: (file: EvidenceFile) => void;
  className?: string;
}

interface FilesResponse {
  success: boolean;
  data: EvidenceFile[];
  pagination: {
    current: number;
    total: number;
    hasNext: boolean;
    hasPrevious: boolean;
    totalItems: number;
    itemsPerPage: number;
  };
  categories: Array<{
    category: string;
    count: number;
  }>;
}

const EvidenceFiles: React.FC<EvidenceFilesProps> = ({
  engagementId,
  testId,
  category,
  onFileSelect,
  className = '',
}) => {
  const [files, setFiles] = useState<EvidenceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // Fetch files
  const fetchFiles = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        engagementId,
        page: page.toString(),
      });

      if (testId) params.append('testId', testId);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/files?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const result: FilesResponse = await response.json();

      setFiles(result.data);
      setPagination(result.pagination);
      setCategories(result.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل الملفات');
    } finally {
      setLoading(false);
    }
  };

  // Load files on mount and when filters change
  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engagementId, testId, selectedCategory, page]);

  // Get file icon
  const getFileIcon = (file: EvidenceFile): string => {
    const type = file.mimeType;
    if (type?.startsWith('image/')) return '🖼️';
    if (type === 'application/pdf') return '📄';
    if (type?.includes('word')) return '📝';
    if (type?.includes('excel') || type?.includes('spreadsheet')) return '📊';
    if (type === 'text/csv') return '📋';
    if (type?.includes('zip') || type?.includes('rar')) return '📦';
    return '📁';
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'clean':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspected':
        return 'bg-orange-100 text-orange-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Download file
  const downloadFile = async (file: EvidenceFile) => {
    try {
      const response = await fetch(file.downloadUrl);

      if (!response.ok) {
        throw new Error('فشل في تحميل الملف');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('فشل في تحميل الملف');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الملفات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600">
          <p className="text-lg font-medium">خطأ في تحميل الملفات</p>
          <p className="text-sm mt-2">{error}</p>
          <Button onClick={() => fetchFiles()} variant="outline" className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium text-gray-900">
            ملفات الأدلة ({pagination?.totalItems || 0})
          </h3>

          {/* Category filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">جميع التصنيفات</option>
              {categories.map(cat => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} ({cat.count})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${
              viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ⊞
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${
              viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            ☰
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <p className="text-gray-600 text-lg">لا توجد ملفات أدلة</p>
          <p className="text-gray-500 text-sm mt-2">
            {selectedCategory
              ? `لا توجد ملفات في تصنيف "${selectedCategory}"`
              : 'ابدأ بإضافة ملفات الأدلة للمهام'}
          </p>
        </div>
      ) : (
        <>
          {/* Files grid/list */}
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }
          >
            {files.map(file => (
              <div
                key={file.id}
                className={`
                  border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer
                  ${viewMode === 'list' ? 'flex items-center justify-between' : 'space-y-3'}
                `}
                onClick={() => onFileSelect?.(file)}
              >
                {viewMode === 'grid' ? (
                  // Grid view
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl">{getFileIcon(file)}</span>
                      <span
                        className={`
                        px-2 py-1 text-xs rounded-full
                        ${getStatusColor(file.virusScanStatus)}
                      `}
                      >
                        {file.virusScanStatus === 'clean' && '✓'}
                        {file.virusScanStatus === 'pending' && '⏳'}
                        {file.virusScanStatus === 'suspected' && '⚠️'}
                        {file.virusScanStatus === 'blocked' && '🚫'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-900 truncate">
                        {file.fileName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.fileSizeFormatted} • {file.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(file.uploadedAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>

                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        downloadFile(file);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      تحميل
                    </Button>
                  </>
                ) : (
                  // List view
                  <>
                    <div className="flex items-center space-x-4 space-x-reverse flex-1 min-w-0">
                      <span className="text-2xl">{getFileIcon(file)}</span>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 truncate">
                          {file.fileName}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {file.fileSizeFormatted} • {file.category} •
                          {new Date(file.uploadedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span
                        className={`
                        px-2 py-1 text-xs rounded-full
                        ${getStatusColor(file.virusScanStatus)}
                      `}
                      >
                        {file.virusScanStatus === 'clean' && '✓ آمن'}
                        {file.virusScanStatus === 'pending' && '⏳ قيد الفحص'}
                        {file.virusScanStatus === 'suspected' && '⚠️ مشبوه'}
                        {file.virusScanStatus === 'blocked' && '🚫 محظور'}
                      </span>

                      <Button
                        onClick={e => {
                          e.stopPropagation();
                          downloadFile(file);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        تحميل
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.total > 1 && (
            <div className="flex items-center justify-between pt-6">
              <div className="text-sm text-gray-600">
                صفحة {pagination.current} من {pagination.total}({pagination.totalItems} ملف إجمالي)
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.hasPrevious}
                  variant="outline"
                  size="sm"
                >
                  السابق
                </Button>
                <Button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  variant="outline"
                  size="sm"
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EvidenceFiles;
