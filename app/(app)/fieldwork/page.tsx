/**
 * Fieldwork Dashboard Page - صفحة لوحة تحكم العمل الميداني
 * تعرض قائمة تشغيلات الاختبارات والأدلة مع إحصائيات شاملة
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface TestRun {
  id: string;
  engagementId: string;
  auditTestId: string;
  auditTestTitle?: string;
  stepIndex: number;
  actionTaken: string;
  result: 'pass' | 'fail' | 'exception' | 'n_a';
  resultDetails?: string;
  evidenceIds?: string[];
  notes?: string;
  executedBy: string;
  executedAt: string;
}

interface EvidenceItem {
  id: string;
  engagementId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  category: string;
  linkedTestId?: string;
  linkedSampleRef?: string;
  linkedFindingId?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  fileHash: string;
  virusStatus: 'clean' | 'infected' | 'scanning' | 'pending';
}

interface FieldworkStats {
  totalTestRuns: number;
  completedTests: number;
  failedTests: number;
  totalEvidence: number;
  evidenceByCategory: Record<string, number>;
  recentActivity: Array<{
    type: 'test' | 'evidence';
    id: string;
    title: string;
    timestamp: string;
    status: string;
  }>;
}

export default function FieldworkDashboardPage() {
  const params = useParams();
  const engagementId = params.id as string;

  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [stats, setStats] = useState<FieldworkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'tests' | 'evidence'>('overview');

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!engagementId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch test runs
        const testRunsResponse = await fetch(`/api/fieldwork/test-runs?engagementId=${engagementId}`);
        if (!testRunsResponse.ok) {
          throw new Error('فشل في جلب بيانات تشغيل الاختبارات');
        }
        const testRunsData = await testRunsResponse.json();
        setTestRuns(testRunsData.runs || []);

        // Fetch evidence
        const evidenceResponse = await fetch(`/api/evidence?engagementId=${engagementId}`);
        let evidenceList: EvidenceItem[] = [];
        if (evidenceResponse.ok) {
          const evidenceData = await evidenceResponse.json();
          evidenceList = evidenceData.evidence || [];
          setEvidence(evidenceList);
        } else {
          setEvidence([]);
        }

        // Calculate stats
        calculateStats(testRunsData.runs || [], evidenceList);

      } catch (err) {
        console.error('Error fetching fieldwork data:', err);
        setError(err instanceof Error ? err.message : 'خطأ في جلب البيانات');
        // Set demo data for testing
        // Set demo data inline
        const demoTestRuns: TestRun[] = [
          {
            id: 'run-1',
            engagementId: engagementId || 'DEMO',
            auditTestId: 'TEST-001',
            auditTestTitle: 'اختبار تحقق من صحة البيانات المالية',
            stepIndex: 1,
            actionTaken: 'فحص القوائم المالية للربع الأول',
            result: 'pass',
            resultDetails: 'تم التحقق من صحة جميع القيود',
            evidenceIds: ['EV-001', 'EV-002'],
            executedBy: 'auditor@example.com',
            executedAt: new Date().toISOString(),
          },
          {
            id: 'run-2',
            engagementId: engagementId || 'DEMO',
            auditTestId: 'TEST-002',
            auditTestTitle: 'اختبار ضوابط الوصول للنظام',
            stepIndex: 1,
            actionTaken: 'مراجعة صلاحيات المستخدمين',
            result: 'fail',
            resultDetails: 'وجود مستخدمين بصلاحيات غير مناسبة',
            notes: 'يجب مراجعة هذه الصلاحيات مع IT',
            executedBy: 'auditor@example.com',
            executedAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ];

        const demoEvidence: EvidenceItem[] = [
          {
            id: 'EV-001',
            engagementId: engagementId || 'DEMO',
            fileName: 'financial-statements-q1-2024.pdf',
            originalName: 'القوائم المالية Q1 2024.pdf',
            fileSize: 2560000,
            mimeType: 'application/pdf',
            category: 'financial_statement',
            linkedTestId: 'TEST-001',
            description: 'القوائم المالية للربع الأول 2024',
            uploadedBy: 'auditor@example.com',
            uploadedAt: new Date().toISOString(),
            fileHash: 'sha256:abc123...',
            virusStatus: 'clean',
          },
          {
            id: 'EV-002',
            engagementId: engagementId || 'DEMO',
            fileName: 'access-control-report.xlsx',
            originalName: 'تقرير ضوابط الوصول.xlsx',
            fileSize: 1024000,
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            category: 'system_log',
            linkedTestId: 'TEST-002',
            uploadedBy: 'auditor@example.com',
            uploadedAt: new Date(Date.now() - 3600000).toISOString(),
            fileHash: 'sha256:def456...',
            virusStatus: 'clean',
          }
        ];

        setTestRuns(demoTestRuns);
        setEvidence(demoEvidence);
        calculateStats(demoTestRuns, demoEvidence);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [engagementId]);

  const calculateStats = (runs: TestRun[], evidenceList: EvidenceItem[]) => {
    const totalTestRuns = runs.length;
    const completedTests = runs.filter(r => r.result === 'pass').length;
    const failedTests = runs.filter(r => r.result === 'fail').length;
    const totalEvidence = evidenceList.length;

    // Count evidence by category
    const evidenceByCategory: Record<string, number> = {};
    evidenceList.forEach(ev => {
      evidenceByCategory[ev.category] = (evidenceByCategory[ev.category] || 0) + 1;
    });

    // Recent activity (last 10 items)
    const recentActivity = [
      ...runs.map(run => ({
        type: 'test' as const,
        id: run.id,
        title: run.auditTestTitle || run.auditTestId,
        timestamp: run.executedAt,
        status: run.result,
      })),
      ...evidenceList.map(ev => ({
        type: 'evidence' as const,
        id: ev.id,
        title: ev.originalName,
        timestamp: ev.uploadedAt,
        status: ev.virusStatus,
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    setStats({
      totalTestRuns,
      completedTests,
      failedTests,
      totalEvidence,
      evidenceByCategory,
      recentActivity,
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass':
        return 'text-green-600 bg-green-50';
      case 'fail':
        return 'text-red-600 bg-red-50';
      case 'exception':
        return 'text-yellow-600 bg-yellow-50';
      case 'n_a':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getResultLabel = (result: string) => {
    switch (result) {
      case 'pass':
        return 'نجح';
      case 'fail':
        return 'فشل';
      case 'exception':
        return 'استثناء';
      case 'n_a':
        return 'غير مطبق';
      default:
        return result;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      invoice: 'فاتورة',
      contract: 'عقد',
      screenshot: 'لقطة شاشة',
      sql_export: 'تصدير SQL',
      excel_report: 'تقرير Excel',
      email_thread: 'سلسلة إيميلات',
      system_log: 'سجل نظام',
      policy_document: 'وثيقة سياسة',
      procedure_manual: 'دليل إجراءات',
      audit_trail: 'مسار التدقيق',
      financial_statement: 'قائمة مالية',
      bank_statement: 'كشف حساب',
      other: 'أخرى',
    };
    return labels[category] || category;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جارِ تحميل بيانات العمل الميداني...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          لوحة تحكم العمل الميداني
        </h1>
        <p className="text-gray-600">
          مراقبة وإدارة تنفيذ الاختبارات ورفع الأدلة للمهمة: {engagementId}
        </p>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-xs text-red-600 mt-1">يتم عرض بيانات تجريبية للمراجعة</p>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" dir="rtl">
            {[
              { key: 'overview', label: 'نظرة عامة' },
              { key: 'tests', label: 'تشغيلات الاختبارات' },
              { key: 'evidence', label: 'الأدلة المرفوعة' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedView(tab.key as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedView === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {selectedView === 'overview' && stats && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">🧪</span>
                      </div>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-blue-600">إجمالي التشغيلات</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalTestRuns}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">✅</span>
                      </div>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-green-600">اختبارات ناجحة</p>
                      <p className="text-2xl font-bold text-green-900">{stats.completedTests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">❌</span>
                      </div>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-red-600">اختبارات فاشلة</p>
                      <p className="text-2xl font-bold text-red-900">{stats.failedTests}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg">📁</span>
                      </div>
                    </div>
                    <div className="mr-3">
                      <p className="text-sm font-medium text-purple-600">إجمالي الأدلة</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalEvidence}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">النشاط الأخير</h3>
                <div className="space-y-2">
                  {stats.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded border">
                      <div className="flex items-center">
                        <span className="text-2xl ml-3">
                          {activity.type === 'test' ? '🧪' : '📄'}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {activity.type === 'test' ? 'تشغيل اختبار' : 'رفع دليل'}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(activity.status)}`}>
                          {activity.type === 'test' ? getResultLabel(activity.status) : activity.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Test Runs Tab */}
          {selectedView === 'tests' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">تشغيلات الاختبارات</h3>
              {testRuns.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">لا توجد تشغيلات اختبارات حتى الآن</p>
                  <p className="text-sm">ابدأ بتنفيذ اختبار من شريط الأدوات أعلاه</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الاختبار
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الإجراء
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          النتيجة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          المنفذ
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testRuns.map((run) => (
                        <tr key={run.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {run.auditTestTitle || run.auditTestId}
                              </div>
                              <div className="text-sm text-gray-500">خطوة رقم {run.stepIndex}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {run.actionTaken}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(run.result)}`}>
                              {getResultLabel(run.result)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {run.executedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(run.executedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Evidence Tab */}
          {selectedView === 'evidence' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">الأدلة المرفوعة</h3>
              {evidence.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">لا توجد أدلة مرفوعة حتى الآن</p>
                  <p className="text-sm">ابدأ برفع أدلة من شريط الأدوات أعلاه</p>
                </div>
              ) : (
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الملف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التصنيف
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحجم
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          الحالة
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          التاريخ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {evidence.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {item.originalName}
                              </div>
                              <div className="text-sm text-gray-500">{item.id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              {getCategoryLabel(item.category)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatFileSize(item.fileSize)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.virusStatus === 'clean' ? 'bg-green-100 text-green-800' :
                              item.virusStatus === 'scanning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.virusStatus === 'clean' ? 'آمن' :
                               item.virusStatus === 'scanning' ? 'جاري الفحص' : 'مشبوه'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(item.uploadedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
