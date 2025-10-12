/**
 * Fieldwork & Evidence Management Page
 * Sprint 7 Implementation - Complete file management system
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FileUpload from '@/components/evidence/file-upload';
import EvidenceFiles from '@/components/evidence/evidence-files';

interface FieldworkPageProps {
  params: {
    engagementId: string;
  };
}

const FieldworkPage: React.FC<FieldworkPageProps> = ({ params }) => {
  const { engagementId } = params;
  const [activeTab, setActiveTab] = useState<'upload' | 'files' | 'tests'>('files');
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [refreshFiles, setRefreshFiles] = useState(0);

  // Handle successful upload
  const handleUploadSuccess = (results: any[]) => {
    console.log('Upload successful:', results);
    // Refresh files list
    setRefreshFiles(prev => prev + 1);
    // Switch to files tab to see uploaded files
    setActiveTab('files');
  };

  // Handle upload errors
  const handleUploadError = (errors: any[]) => {
    console.error('Upload errors:', errors);
  };

  // Handle file selection
  const handleFileSelect = (file: any) => {
    console.log('File selected:', file);
    // TODO: Open file preview/details modal
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          العمل الميداني والأدلة
        </h1>
        <p className="text-gray-600 mt-2">
          إدارة تنفيذ الاختبارات، رفع الأدلة، وتوثيق النتائج
        </p>

        {/* Breadcrumb */}
        <nav className="mt-4 text-sm text-gray-500">
          <span>لوحة التحكم</span>
          <span className="mx-2">/</span>
          <span>المشاريع</span>
          <span className="mx-2">/</span>
          <span className="text-blue-600">العمل الميداني</span>
        </nav>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          <button
            onClick={() => setActiveTab('files')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'files'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            📁 ملفات الأدلة
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'upload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            ⬆️ رفع ملفات
          </button>

          <button
            onClick={() => setActiveTab('tests')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${activeTab === 'tests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            🧪 تنفيذ الاختبارات
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {activeTab === 'files' && (
          <div className="space-y-6">
            {/* Quick actions */}
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium text-gray-900">
                مكتبة الأدلة
              </div>
              <Button
                onClick={() => setActiveTab('upload')}
                variant="primary"
              >
                + إضافة ملفات جديدة
              </Button>
            </div>

            {/* Files list component */}
            <EvidenceFiles
              engagementId={engagementId}
              testId={selectedTestId || undefined}
              onFileSelect={handleFileSelect}
              key={refreshFiles} // Force refresh when files are uploaded
            />
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div className="text-lg font-medium text-gray-900">
              رفع ملفات أدلة جديدة
            </div>

            {/* Test selection (optional) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ربط بالاختبار (اختياري)
              </label>
              <select
                value={selectedTestId || ''}
                onChange={(e) => setSelectedTestId(e.target.value || null)}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">بدون ربط بالاختبار</option>
                {/* TODO: Load actual tests from API */}
                <option value="test-1">اختبار الضوابط الداخلية</option>
                <option value="test-2">اختبار تقييم المخاطر</option>
                <option value="test-3">اختبار العمليات المالية</option>
              </select>
            </div>

            {/* File upload component */}
            <FileUpload
              engagementId={engagementId}
              testId={selectedTestId || undefined}
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6">
            <div className="text-lg font-medium text-gray-900">
              تنفيذ الاختبارات
            </div>

            {/* Tests execution interface - placeholder */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🧪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                واجهة تنفيذ الاختبارات
              </h3>
              <p className="text-gray-600 mb-4">
                ستتم إضافة واجهة تفصيلية لتنفيذ الاختبارات خطوة بخطوة مع ربط الأدلة
              </p>

              {/* Sample test cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {[
                  { id: '1', title: 'اختبار الضوابط الداخلية', status: 'planned' },
                  { id: '2', title: 'اختبار تقييم المخاطر', status: 'in_progress' },
                  { id: '3', title: 'اختبار العمليات المالية', status: 'completed' },
                ].map((test) => (
                  <div key={test.id} className="bg-white p-4 rounded-lg border border-gray-200 text-right">
                    <h4 className="font-medium text-gray-900">{test.title}</h4>
                    <p className={`text-xs mt-2 px-2 py-1 rounded inline-block ${
                      test.status === 'planned' ? 'bg-yellow-100 text-yellow-800' :
                      test.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {test.status === 'planned' && 'مخطط'}
                      {test.status === 'in_progress' && 'قيد التنفيذ'}
                      {test.status === 'completed' && 'مكتمل'}
                    </p>
                    <div className="mt-3">
                      <Button
                        variant={test.status === 'completed' ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => {
                          setSelectedTestId(test.id);
                          setActiveTab('upload');
                        }}
                      >
                        {test.status === 'completed' ? 'عرض الأدلة' : 'بدء التنفيذ'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-blue-600">📁</div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">إجمالي الملفات</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-green-600">✅</div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">اختبارات مكتملة</p>
              <p className="text-2xl font-semibold text-gray-900">1</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="text-3xl text-orange-600">⏳</div>
            <div className="mr-4">
              <p className="text-sm font-medium text-gray-600">قيد المراجعة</p>
              <p className="text-2xl font-semibold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldworkPage;
