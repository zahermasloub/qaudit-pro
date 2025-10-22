/**
 * Annual Plan Screen - الخطة السنوية للتدقيق الداخلي
 * Comprehensive annual planning page with KPIs, task management, and filtering
 */

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the AnnualPlanWizard to avoid SSR issues
const AnnualPlanWizard = dynamic(
  () => import('./AnnualPlanWizard').then(m => ({ default: m.AnnualPlanWizard })),
  { ssr: false }
);

import type { Locale } from '@/lib/i18n';

const clsx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

interface AnnualPlan {
  id: string;
  title: string;
  fiscalYear: number;
  version: string;
  status: string;
  introduction?: string;
  totalAvailableHours?: number;
  plannedTaskHours?: number;
  advisoryHours?: number;
  emergencyHours?: number;
  followUpHours?: number;
  trainingHours?: number;
  administrativeHours?: number;
  estimatedBudget?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditTasks?: AuditTask[];
  approvals?: PlanApproval[];
}

interface PlanApproval {
  id: string;
  approverName: string;
  approverRole: string;
  approvalDate: string;
  comments?: string;
}

interface AuditTask {
  id: string;
  annualPlanId: string;
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  auditType: string;
  objectiveAndScope?: string;
  plannedQuarter: string;
  estimatedHours: number;
  leadAuditor?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export function AnnualPlanScreen({ locale }: { locale: Locale }) {
  // State for opening/closing the AnnualPlanForm
  const [openAnnualPlan, setOpenAnnualPlan] = useState(false);
  const isRTL = locale === 'ar';

  const [_plans, setPlans] = useState<AnnualPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AuditTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Initialize from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      const dept = params.get('department');
      const risk = params.get('risk');
      const status = params.get('status');
      const density = params.get('density') as 'comfortable' | 'compact' | 'spacious' | null;

      if (search) setSearchQuery(search);
      if (dept) setFilterDepartment(dept);
      if (risk) setFilterRiskLevel(risk);
      if (status) setFilterStatus(status);
      if (density && ['comfortable', 'compact', 'spacious'].includes(density)) {
        setTableDensity(density);
      }
    }
  }, []);

  // Update URL when filters change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterDepartment) params.set('department', filterDepartment);
      if (filterRiskLevel) params.set('risk', filterRiskLevel);
      if (filterStatus) params.set('status', filterStatus);
      if (tableDensity !== 'comfortable') params.set('density', tableDensity);

      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchQuery, filterDepartment, filterRiskLevel, filterStatus, tableDensity]);

  // Get density classes
  const getDensityClasses = () => {
    switch (tableDensity) {
      case 'compact':
        return 'px-2 py-1';
      case 'spacious':
        return 'px-6 py-4';
      default:
        return 'px-4 py-3';
    }
  };

  // Mock data for demonstration (in a real app, fetch from API)
  useEffect(() => {
    const mockPlan: AnnualPlan = {
      id: '1',
      title: 'الخطة السنوية للتدقيق الداخلي لعام 2025',
      fiscalYear: 2025,
      version: '1.0',
      status: 'approved',
      totalAvailableHours: 5000,
      plannedTaskHours: 4250,
      createdBy: 'manager@gov.qa',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      auditTasks: [],
    };

    const mockTasks: AuditTask[] = [
      {
        id: '1',
        annualPlanId: '1',
        code: 'IA-25-01',
        title: 'مراجعة وتقييم عملية المشتريات والعقود',
        department: 'إدارة المشتريات',
        riskLevel: 'high',
        auditType: 'operational',
        plannedQuarter: 'Q1',
        estimatedHours: 200,
        leadAuditor: 'أحمد محمد',
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        annualPlanId: '1',
        code: 'IA-25-02',
        title: 'مراجعة الالتزام بسياسات التوظيف والتعيين',
        department: 'إدارة الموارد البشرية',
        riskLevel: 'medium',
        auditType: 'compliance',
        plannedQuarter: 'Q1',
        estimatedHours: 150,
        leadAuditor: 'سارة علي',
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        annualPlanId: '1',
        code: 'IA-25-03',
        title: 'مراجعة قيود الإيرادات والمصروفات',
        department: 'الإدارة المالية',
        riskLevel: 'high',
        auditType: 'financial',
        plannedQuarter: 'Q2',
        estimatedHours: 300,
        leadAuditor: 'خالد عبدالله',
        status: 'not_started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        annualPlanId: '1',
        code: 'IA-25-04',
        title: 'تدقيق أمن المعلومات والبنية التحتية',
        department: 'إدارة تقنية المعلومات',
        riskLevel: 'very_high',
        auditType: 'it_systems',
        plannedQuarter: 'Q2',
        estimatedHours: 250,
        leadAuditor: 'محمد حسن',
        status: 'not_started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        annualPlanId: '1',
        code: 'IA-25-05',
        title: 'تقييم أداء المشاريع الاستراتيجية',
        department: 'إدارة التخطيط والتطوير',
        riskLevel: 'medium',
        auditType: 'performance',
        plannedQuarter: 'Q3',
        estimatedHours: 180,
        leadAuditor: 'فاطمة يوسف',
        status: 'not_started',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    mockPlan.auditTasks = mockTasks;
    setPlans([mockPlan]);
    setSelectedPlan(mockPlan);
    setTasks(mockTasks);
    setFilteredTasks(mockTasks);
    setLoading(false);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...tasks];

    if (searchQuery) {
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.department.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterDepartment) {
      result = result.filter(task => task.department === filterDepartment);
    }

    if (filterRiskLevel) {
      result = result.filter(task => task.riskLevel === filterRiskLevel);
    }

    if (filterStatus) {
      result = result.filter(task => task.status === filterStatus);
    }

    setFilteredTasks(result);
  }, [searchQuery, filterDepartment, filterRiskLevel, filterStatus, tasks]);

  // Calculate KPIs
  const totalTasks = tasks.length;
  const totalPlannedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get unique departments for filter
  const departments = Array.from(new Set(tasks.map(task => task.department)));

  // Helper functions for labels
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: locale === 'ar' ? 'مسودة' : 'Draft',
      under_review: locale === 'ar' ? 'قيد المراجعة' : 'Under Review',
      approved: locale === 'ar' ? 'معتمدة' : 'Approved',
      cancelled: locale === 'ar' ? 'ملغاة' : 'Cancelled',
      completed: locale === 'ar' ? 'مكتملة' : 'Completed',
      not_started: locale === 'ar' ? 'لم تبدأ' : 'Not Started',
      in_progress: locale === 'ar' ? 'قيد التنفيذ' : 'In Progress',
    };
    return labels[status] || status;
  };

  const getRiskLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      very_high: locale === 'ar' ? 'عالية جداً' : 'Very High',
      high: locale === 'ar' ? 'عالية' : 'High',
      medium: locale === 'ar' ? 'متوسطة' : 'Medium',
      low: locale === 'ar' ? 'منخفضة' : 'Low',
    };
    return labels[level] || level;
  };

  const getAuditTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      financial: locale === 'ar' ? 'تدقيق مالي' : 'Financial',
      operational: locale === 'ar' ? 'تدقيق تشغيلي' : 'Operational',
      compliance: locale === 'ar' ? 'تدقيق التزام' : 'Compliance',
      it_systems: locale === 'ar' ? 'تدقيق نظم معلومات' : 'IT Systems',
      performance: locale === 'ar' ? 'تدقيق أداء' : 'Performance',
      advisory: locale === 'ar' ? 'مهمة استشارية' : 'Advisory',
    };
    return labels[type] || type;
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      very_high: 'bg-red-600 text-white',
      high: 'bg-red-500 text-white',
      medium: 'bg-orange-500 text-white',
      low: 'bg-green-500 text-white',
    };
    return colors[level] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      not_started: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPlanStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      under_review: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center text-gray-600">
          {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedPlan?.title ||
              (locale === 'ar' ? 'الخطة السنوية للتدقيق الداخلي' : 'Annual Internal Audit Plan')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {locale === 'ar'
              ? `السنة المالية: ${selectedPlan?.fiscalYear}`
              : `Fiscal Year: ${selectedPlan?.fiscalYear}`}
          </p>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          onClick={() => setOpenAnnualPlan(true)}
        >
          + {locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Plan Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-600">
              {locale === 'ar' ? 'حالة الخطة' : 'Plan Status'}
            </h3>
          </div>
          <div
            className={clsx(
              'inline-block px-3 py-1 rounded-full text-sm font-medium',
              getPlanStatusColor(selectedPlan?.status || ''),
            )}
          >
            {getStatusLabel(selectedPlan?.status || '')}
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {locale === 'ar' ? 'المهام المخططة' : 'Planned Tasks'}
          </h3>
          <div className="text-3xl font-bold text-gray-900">{totalTasks}</div>
          <p className="text-xs text-gray-500 mt-1">
            {locale === 'ar' ? 'مهمة تدقيق' : 'audit tasks'}
          </p>
        </div>

        {/* Total Hours */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {locale === 'ar' ? 'إجمالي الساعات' : 'Total Hours'}
          </h3>
          <div className="text-3xl font-bold text-gray-900">
            {totalPlannedHours.toLocaleString()}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {locale === 'ar' ? 'ساعة مخططة' : 'planned hours'}
          </p>
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            {locale === 'ar' ? 'نسبة الإنجاز' : 'Completion Rate'}
          </h3>
          <div className="text-3xl font-bold text-gray-900">{completionRate}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterDepartment}
              onChange={e => setFilterDepartment(e.target.value)}
            >
              <option value="">{locale === 'ar' ? 'جميع الإدارات' : 'All Departments'}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterRiskLevel}
              onChange={e => setFilterRiskLevel(e.target.value)}
            >
              <option value="">{locale === 'ar' ? 'جميع المخاطر' : 'All Risk Levels'}</option>
              <option value="very_high">{getRiskLevelLabel('very_high')}</option>
              <option value="high">{getRiskLevelLabel('high')}</option>
              <option value="medium">{getRiskLevelLabel('medium')}</option>
              <option value="low">{getRiskLevelLabel('low')}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="">{locale === 'ar' ? 'جميع الحالات' : 'All Status'}</option>
              <option value="not_started">{getStatusLabel('not_started')}</option>
              <option value="in_progress">{getStatusLabel('in_progress')}</option>
              <option value="completed">{getStatusLabel('completed')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            {locale === 'ar'
              ? `عرض ${filteredTasks.length} من ${totalTasks} مهمة`
              : `Showing ${filteredTasks.length} of ${totalTasks} tasks`}
          </div>
          <div className="flex items-center gap-2">
            {/* Density Toggle */}
            <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setTableDensity('compact')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  tableDensity === 'compact' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={locale === 'ar' ? 'مضغوط' : 'Compact'}
                aria-label={locale === 'ar' ? 'مضغوط' : 'Compact'}
              >
                {locale === 'ar' ? 'مضغوط' : 'Compact'}
              </button>
              <button
                onClick={() => setTableDensity('comfortable')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  tableDensity === 'comfortable' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={locale === 'ar' ? 'مريح' : 'Comfortable'}
                aria-label={locale === 'ar' ? 'مريح' : 'Comfortable'}
              >
                {locale === 'ar' ? 'مريح' : 'Comfortable'}
              </button>
              <button
                onClick={() => setTableDensity('spacious')}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  tableDensity === 'spacious' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={locale === 'ar' ? 'واسع' : 'Spacious'}
                aria-label={locale === 'ar' ? 'واسع' : 'Spacious'}
              >
                {locale === 'ar' ? 'واسع' : 'Spacious'}
              </button>
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              {locale === 'ar' ? 'تصدير CSV' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'الرمز' : 'Code'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'عنوان المهمة' : 'Task Title'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'الإدارة' : 'Department'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'المخاطر' : 'Risk Level'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'النوع' : 'Type'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'الربع' : 'Quarter'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'الساعات' : 'Hours'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'الحالة' : 'Status'}
                </th>
                <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider bg-gray-50 sticky right-0 ${getDensityClasses()}`}>
                  {locale === 'ar' ? 'إجراءات' : 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                  <td className={`text-sm font-medium text-gray-900 ${getDensityClasses()}`}>{task.code}</td>
                  <td className={`text-sm text-gray-900 ${getDensityClasses()}`}>{task.title}</td>
                  <td className={`text-sm text-gray-600 ${getDensityClasses()}`}>{task.department}</td>
                  <td className={getDensityClasses()}>
                    <span
                      className={clsx(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        getRiskLevelColor(task.riskLevel),
                      )}
                    >
                      {getRiskLevelLabel(task.riskLevel)}
                    </span>
                  </td>
                  <td className={`text-sm text-gray-600 ${getDensityClasses()}`}>
                    {getAuditTypeLabel(task.auditType)}
                  </td>
                  <td className={`text-sm text-gray-600 ${getDensityClasses()}`}>{task.plannedQuarter}</td>
                  <td className={`text-sm text-gray-600 ${getDensityClasses()}`}>{task.estimatedHours}</td>
                  <td className={getDensityClasses()}>
                    <span
                      className={clsx(
                        'inline-block px-2 py-1 rounded text-xs font-medium',
                        getStatusColor(task.status),
                      )}
                    >
                      {getStatusLabel(task.status)}
                    </span>
                  </td>
                  <td className={getDensityClasses()}>
                    <div className="flex items-center gap-2 sticky right-0 bg-white">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title={locale === 'ar' ? 'عرض' : 'View'}
                        aria-label={locale === 'ar' ? 'عرض' : 'View'}
                      >
                        👁️
                      </button>
                      <button
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title={locale === 'ar' ? 'تعديل' : 'Edit'}
                        aria-label={locale === 'ar' ? 'تعديل' : 'Edit'}
                      >
                        ✏️
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title={locale === 'ar' ? 'حذف' : 'Delete'}
                        aria-label={locale === 'ar' ? 'حذف' : 'Delete'}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {locale === 'ar' ? 'لا توجد مهام تدقيق' : 'No audit tasks found'}
          </div>
        )}
      </div>
      {/* Annual Plan Wizard Modal */}
      <AnnualPlanWizard open={openAnnualPlan} onOpenChange={setOpenAnnualPlan} locale={locale} />
    </div>
  );
}
