'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Upload,
  File,
  FileText,
  Image,
  Download,
  Trash2,
  Eye,
  Search,
  X,
  RefreshCw,
  Folder,
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';

import { DataTable } from '@/components/ui/DataTable';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FileUploader } from '@/components/ui/FileUploader';

interface FileItem {
  name: string;
  path: string;
  size: number;
  type: string;
  lastModified: string;
}

export default function AdminAttachmentsPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteFile, setDeleteFile] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dashboard' },
    { label: 'إدارة المرفقات', current: true },
  ];

  // جلب قائمة الملفات
  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/attachments');
      const data = await response.json();

      if (data.ok && Array.isArray(data.files)) {
        setFiles(data.files);
      } else {
        toast.error('فشل في جلب الملفات');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // رفع ملف
  async function handleUpload(uploadedFiles: { file: File; name: string; size: number; type: string }[]) {
    try {
      const formData = new FormData();
      uploadedFiles.forEach((item) => {
        formData.append('files', item.file);
      });

      const response = await fetch('/api/admin/attachments/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success(`تم رفع ${uploadedFiles.length} ملف بنجاح`);
        fetchFiles();
        setShowUploader(false);
      } else {
        toast.error(data.error || 'فشل في رفع الملفات');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('حدث خطأ أثناء الرفع');
    }
  }

  // حذف ملف
  async function handleDelete(path: string) {
    try {
      const response = await fetch('/api/admin/attachments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success('تم حذف الملف بنجاح');
        fetchFiles();
      } else {
        toast.error(data.error || 'فشل في حذف الملف');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('حدث خطأ أثناء الحذف');
    } finally {
      setDeleteFile(null);
    }
  }

  // حذف متعدد
  async function handleBulkDelete() {
    if (selectedFiles.size === 0) return;

    try {
      const paths = Array.from(selectedFiles);
      const response = await fetch('/api/admin/attachments/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success(`تم حذف ${paths.length} ملف بنجاح`);
        setSelectedFiles(new Set());
        fetchFiles();
      } else {
        toast.error(data.error || 'فشل في حذف الملفات');
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  }

  // تنزيل ملف
  function handleDownload(path: string, name: string) {
    const link = document.createElement('a');
    link.href = `/uploads/${path}`;
    link.download = name;
    link.click();
  }

  // تحديد/إلغاء تحديد ملف
  function toggleSelect(path: string) {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  }

  // تحديد/إلغاء تحديد الكل
  function toggleSelectAll() {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map((f) => f.path)));
    }
  }

  // تحديد نوع الأيقونة
  function getFileIcon(type: string) {
    if (type.startsWith('image/')) return Image;
    if (type.includes('pdf')) return FileText;
    return File;
  }

  // تنسيق حجم الملف
  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // تعريف الأعمدة
  const columns: ColumnDef<FileItem>[] = [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={
            filteredFiles.length > 0 && selectedFiles.size === filteredFiles.length
          }
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-border-base"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedFiles.has(row.original.path)}
          onChange={() => toggleSelect(row.original.path)}
          className="w-4 h-4 rounded border-border-base"
        />
      ),
    },
    {
      accessorKey: 'name',
      header: 'اسم الملف',
      cell: ({ row }) => {
        const Icon = getFileIcon(row.original.type);
        return (
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-brand-600" />
            <div className="min-w-0">
              <div className="font-medium text-text-primary truncate">
                {row.original.name}
              </div>
              <div className="text-xs text-text-tertiary">{row.original.type}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'size',
      header: 'الحجم',
      cell: ({ row }) => (
        <span className="text-text-secondary text-sm">
          {formatSize(row.original.size)}
        </span>
      ),
    },
    {
      accessorKey: 'lastModified',
      header: 'تاريخ التعديل',
      cell: ({ row }) => (
        <time className="text-text-tertiary text-sm">
          {new Date(row.original.lastModified).toLocaleString('ar-EG')}
        </time>
      ),
    },
    {
      id: 'actions',
      header: 'الإجراءات',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {row.original.type.startsWith('image/') && (
            <button
              type="button"
              onClick={() => setPreviewFile(row.original)}
              className="p-2 rounded-lg text-text-secondary hover:text-brand-600 hover:bg-brand-50 transition-fast focus-ring"
              aria-label="معاينة"
            >
              <Eye size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDownload(row.original.path, row.original.name)}
            className="p-2 rounded-lg text-text-secondary hover:text-green-600 hover:bg-green-50 transition-fast focus-ring"
            aria-label="تنزيل"
          >
            <Download size={18} />
          </button>
          <button
            type="button"
            onClick={() => setDeleteFile(row.original.path)}
            className="p-2 rounded-lg text-text-secondary hover:text-red-600 hover:bg-red-50 transition-fast focus-ring"
            aria-label="حذف"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  // فلترة الملفات بالبحث
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إدارة المرفقات</h1>
          <p className="text-sm text-text-tertiary mt-1">
            إدارة الملفات والمرفقات في النظام
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchFiles}
            disabled={loading}
            className="
              px-4 py-2 rounded-lg
              border border-border-base bg-bg-elevated text-text-secondary
              hover:bg-bg-muted transition-fast
              focus-ring
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>تحديث</span>
          </button>
          <button
            type="button"
            onClick={() => setShowUploader(true)}
            className="
              px-4 py-2 rounded-lg
              bg-brand-600 text-white font-medium
              hover:bg-brand-700 transition-fast
              focus-ring
              flex items-center gap-2
            "
          >
            <Upload size={18} />
            <span>رفع ملفات</span>
          </button>
        </div>
      </div>

      {/* Stats & Search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Folder size={20} />
            <span className="text-sm">
              {files.length} ملف • {formatSize(files.reduce((sum, f) => sum + f.size, 0))}
            </span>
          </div>
          {selectedFiles.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="
                px-3 py-1.5 rounded-lg text-sm
                bg-red-600 text-white font-medium
                hover:bg-red-700 transition-fast
                focus-ring
                flex items-center gap-2
              "
            >
              <Trash2 size={16} />
              <span>حذف ({selectedFiles.size})</span>
            </button>
          )}
        </div>

        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في الملفات..."
            className="
              w-full pr-10 pl-4 py-2 rounded-lg
              border border-border-base bg-bg-base
              text-text-primary placeholder:text-text-tertiary
              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
              transition-fast
            "
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                text-text-tertiary hover:text-text-primary
              "
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
          <EmptyState title="جارٍ التحميل..." message="يرجى الانتظار..." />
        </div>
      ) : filteredFiles.length === 0 ? (
        <EmptyState
          title="لا توجد ملفات"
          message={
            searchQuery
              ? 'لم يتم العثور على ملفات مطابقة للبحث'
              : 'ابدأ برفع ملفات جديدة'
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredFiles} pagination pageSize={20} />
      )}

      {/* Upload Modal */}
      {showUploader && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowUploader(false)}
        >
          <div
            className="bg-bg-elevated rounded-xl border border-border-base max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-primary">رفع ملفات</h2>
              <button
                onClick={() => setShowUploader(false)}
                className="p-2 hover:bg-bg-muted rounded-lg transition-fast"
              >
                <X size={20} />
              </button>
            </div>
            <FileUploader
              onUpload={handleUpload}
              maxFiles={10}
              maxSize={10}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">{previewFile.name}</h2>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-fast"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
            <img
              src={`/uploads/${previewFile.path}`}
              alt={previewFile.name}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteFile && (
        <ConfirmDialog
          open={!!deleteFile}
          onClose={() => setDeleteFile(null)}
          title="تأكيد الحذف"
          message="هل أنت متأكد من حذف هذا الملف؟ هذا الإجراء لا يمكن التراجع عنه."
          confirmLabel="حذف"
          cancelLabel="إلغاء"
          type="danger"
          onConfirm={() => handleDelete(deleteFile)}
        />
      )}
    </div>
  );
}
