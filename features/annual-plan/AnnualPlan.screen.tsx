/**
 * Annual Plan Screen - الخطة السنوية للتدقيق الداخلي
 * Comprehensive annual planning page with KPIs, task management, and filtering
 */

'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Import ProcessStepper
import ProcessStepper, { type ProcessStep } from '@/app/(app)/rbia/plan/ProcessStepper';

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

// Content view types for different process stages
type ContentView =
  | 'empty'
  | 'annualPlan'
  | 'prioritization'
  | 'resources'
  | 'timeline'
  | 'approval'
  | 'execution'
  | 'followup'
  | 'reporting'
  | 'recommendations'
  | 'closure'
  | 'qa';

export function AnnualPlanScreen({ locale }: { locale: Locale }) {
  // State for opening/closing the AnnualPlanForm
  const [openAnnualPlan, setOpenAnnualPlan] = useState(false);
  const isRTL = locale === 'ar';

  // Dynamic content state
  const [contentView, setContentView] = useState<ContentView>('empty');
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

  const [_plans, setPlans] = useState<AnnualPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<AuditTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact' | 'spacious'>('comfortable');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Load plan by ID
  const loadPlanById = async (planId: string) => {
    setLoadingPlan(true);
    try {
      const response = await fetch(`/api/annual-plans/${planId}`);
      const data = await response.json();

      if (data.ok && data.plan) {
        setSelectedPlan(data.plan);
        setTasks(data.plan.auditTasks || []);
        setFilteredTasks(data.plan.auditTasks || []);
        setCurrentPlanId(planId);
      } else {
        console.error('Failed to load plan:', data.error);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Handle wizard success - load the new plan
  const handleWizardSuccess = (planId: string) => {
    setCurrentPlanId(planId);
    loadPlanById(planId);
    setContentView('annualPlan');
    setActiveStepId(1);
  };

  // Define process steps (complete 11-stage RBIA)
  const processSteps: ProcessStep[] = [
    { id: 1, label: locale === 'ar' ? 'الخطة السنوية' : 'Annual Plan', status: (currentPlanId && tasks.length > 0) ? 'completed' : 'available' },
    { id: 2, label: locale === 'ar' ? 'التخطيط' : 'Planning', status: 'available' },
    { id: 3, label: locale === 'ar' ? 'فهم العملية والمخاطر' : 'Process & Risk Understanding', status: 'available' },
    { id: 4, label: locale === 'ar' ? 'برنامج العمل والعينات' : 'Work Program & Sampling', status: 'available' },
    { id: 5, label: locale === 'ar' ? 'الأعمال الميدانية والأدلة' : 'Fieldwork & Evidence', status: 'available' },
    { id: 6, label: locale === 'ar' ? 'المسودات الأولية' : 'Initial Drafts', status: 'available' },
    { id: 7, label: locale === 'ar' ? 'النتائج والتوصيات' : 'Findings & Recommendations', status: 'available' },
    { id: 8, label: locale === 'ar' ? 'التقرير النهائي' : 'Final Report', status: 'available' },
    { id: 9, label: locale === 'ar' ? 'المتابعة' : 'Follow-up', status: 'available' },
    { id: 10, label: locale === 'ar' ? 'الإقفال' : 'Closure', status: 'available' },
    { id: 11, label: locale === 'ar' ? 'ضمان الجودة' : 'Quality Assurance', status: 'available' },
  ];

  // Handle step click
  const handleStepClick = (stepId: number) => {
    setActiveStepId(stepId);

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Map step to content view
    if (stepId === 1) {
      if (currentPlanId) {
        setContentView('annualPlan');
      } else {
        setContentView('empty');
      }
    } else if (stepId === 2) {
      setContentView('prioritization');
    } else if (stepId === 3) {
      setContentView('resources');
    } else if (stepId === 4) {
      setContentView('timeline');
    } else if (stepId === 5) {
      setContentView('approval');
    } else if (stepId === 6) {
      setContentView('execution');
    } else if (stepId === 7) {
      setContentView('followup');
    } else if (stepId === 8) {
      setContentView('reporting');
    } else if (stepId === 9) {
      setContentView('recommendations');
    } else if (stepId === 10) {
      setContentView('closure');
    } else if (stepId === 11) {
      setContentView('qa');
    }
  };

  // Initialize from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      const dept = params.get('department');
      const risk = params.get('risk');
      const status = params.get('status');
      const density = params.get('density') as 'comfortable' | 'compact' | 'spacious' | null;
      const step = params.get('step') as ContentView | null;

      if (search) setSearchQuery(search);
      if (dept) setFilterDepartment(dept);
      if (risk) setFilterRiskLevel(risk);
      if (status) setFilterStatus(status);
      if (density && ['comfortable', 'compact', 'spacious'].includes(density)) {
        setTableDensity(density);
      }

      // Deep-link to specific step
      if (step && step !== 'empty') {
        setContentView(step);
        // Map content view to step ID
        const stepMapping: Record<ContentView, number> = {
          empty: 0,
          annualPlan: 1,
          prioritization: 2,
          resources: 3,
          timeline: 4,
          approval: 5,
          execution: 6,
          followup: 7,
          reporting: 8,
          recommendations: 9,
          closure: 10,
          qa: 11,
        };
        setActiveStepId(stepMapping[step] || null);
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
      if (contentView !== 'empty') params.set('step', contentView);

      const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchQuery, filterDepartment, filterRiskLevel, filterStatus, tableDensity, contentView]);

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

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (!currentPlanId) return;

    const confirmDelete = window.confirm(
      locale === 'ar'
        ? 'هل أنت متأكد من حذف هذه المهمة؟'
        : 'Are you sure you want to delete this task?'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/annual-plans/${currentPlanId}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.ok) {
        // Reload plan to get updated tasks
        await loadPlanById(currentPlanId);
      } else {
        console.error('Failed to delete task:', data.error);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="container mx-auto max-w-[1440px]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {locale === 'ar' ? 'الخطة السنوية للتدقيق الداخلي' : 'Annual Internal Audit Plan'}
              </h1>
              {selectedPlan && (
                <p className="text-sm text-gray-600 mt-1">
                  {locale === 'ar'
                    ? `السنة المالية: ${selectedPlan.fiscalYear} - ${selectedPlan.title}`
                    : `Fiscal Year: ${selectedPlan.fiscalYear} - ${selectedPlan.title}`}
                </p>
              )}
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setOpenAnnualPlan(true)}
              aria-label={locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            >
              + {locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Fixed Grid Layout */}
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-[1440px]" dir="rtl">
        {/* Grid: يسار 320px | وسط مرن | يمين 320px (يظهر من XL) */}
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_320px] isolate">
          {/* Stepper يسار - ثابت 320px لا ينكمش أبداً */}
          <aside className="stepper-col w-[320px] min-w-[320px] max-w-[320px] flex-none shrink-0 overflow-hidden">
            <div className="sticky top-[88px] z-10">
              <ProcessStepper
                steps={processSteps}
                activeStepId={activeStepId || 1}
                onStepClick={handleStepClick}
                completedCount={processSteps.filter(s => s.status === 'completed').length}
              />
            </div>
          </aside>

          {/* المحتوى الأوسط - الوحيد المسموح له بالتمدد */}
          <main className="min-w-0 space-y-6">
            {/* 1) KPI Summary - مرة واحدة فقط في الأعلى */}
            {selectedPlan && (
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
            )}

            {/* 2) منطقة المحتوى الديناميكي - تتبدل حسب المرحلة */}
            {/* محتوى واحد فقط يظهر حسب contentView */}
            {contentView === 'empty' && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'ar' ? 'لم يتم إنشاء خطة بعد' : 'No Plan Created Yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {locale === 'ar'
                      ? 'ابدأ بإنشاء خطة سنوية جديدة للتدقيق الداخلي'
                      : 'Start by creating a new annual internal audit plan'}
                  </p>
                  <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setOpenAnnualPlan(true)}
                  >
                    + {locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
                  </button>
                </div>
              </div>
            )}

            {contentView === 'annualPlan' && selectedPlan && (
              <>
                {/* 3) Filters - مرة واحدة قبل الجدول */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                      <input
                        type="text"
                        placeholder={locale === 'ar' ? 'بحث...' : 'Search...'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Department Filter */}
                    <div>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            tableDensity === 'compact' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={locale === 'ar' ? 'مضغوط' : 'Compact'}
                          aria-label={locale === 'ar' ? 'مضغوط' : 'Compact'}
                        >
                          {locale === 'ar' ? 'مضغوط' : 'Compact'}
                        </button>
                        <button
                          onClick={() => setTableDensity('comfortable')}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            tableDensity === 'comfortable' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={locale === 'ar' ? 'مريح' : 'Comfortable'}
                          aria-label={locale === 'ar' ? 'مريح' : 'Comfortable'}
                        >
                          {locale === 'ar' ? 'مريح' : 'Comfortable'}
                        </button>
                        <button
                          onClick={() => setTableDensity('spacious')}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            tableDensity === 'spacious' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                          }`}
                          title={locale === 'ar' ? 'واسع' : 'Spacious'}
                          aria-label={locale === 'ar' ? 'واسع' : 'Spacious'}
                        >
                          {locale === 'ar' ? 'واسع' : 'Spacious'}
                        </button>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        {locale === 'ar' ? 'تصدير CSV' : 'Export CSV'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tasks Table - Full width without horizontal scroll */}
                {loadingPlan ? (
                  <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <div className="text-gray-600">
                      {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full table-fixed">
                        <colgroup>
                          <col style={{ width: '7%' }} />       {/* Code */}
                          <col style={{ width: '26%' }} />      {/* Title - with wrap */}
                          <col style={{ width: '12%' }} />      {/* Department */}
                          <col style={{ width: '10%' }} />      {/* Risk */}
                          <col style={{ width: '12%' }} />      {/* Type */}
                          <col style={{ width: '8%' }} />       {/* Quarter */}
                          <col style={{ width: '8%' }} />       {/* Hours */}
                          <col style={{ width: '10%' }} />      {/* Status */}
                          <col style={{ width: '10%' }} />      {/* Actions */}
                        </colgroup>
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'الرمز' : 'Code'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'عنوان المهمة' : 'Task Title'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'الإدارة' : 'Department'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'المخاطر' : 'Risk'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'النوع' : 'Type'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'الربع' : 'Quarter'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'الساعات' : 'Hours'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'الحالة' : 'Status'}
                            </th>
                            <th className={`text-start text-xs font-medium text-gray-600 uppercase tracking-wider ${getDensityClasses()}`}>
                              {locale === 'ar' ? 'إجراءات' : 'Actions'}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {filteredTasks.map(task => (
                            <tr key={task.id} className="hover:bg-gray-50 transition-colors align-top">
                              <td className={`text-sm font-medium text-gray-900 whitespace-nowrap ${getDensityClasses()}`}>{task.code}</td>
                              <td className={`text-sm text-gray-900 break-words leading-relaxed ${getDensityClasses()}`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{task.title}</td>
                              <td className={`text-sm text-gray-600 break-words ${getDensityClasses()}`}>{task.department}</td>
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
                              <td className={`text-sm text-gray-600 break-words ${getDensityClasses()}`}>
                                {getAuditTypeLabel(task.auditType)}
                              </td>
                              <td className={`text-sm text-gray-600 whitespace-nowrap ${getDensityClasses()}`}>{task.plannedQuarter}</td>
                              <td className={`text-sm text-gray-600 whitespace-nowrap ${getDensityClasses()}`}>{task.estimatedHours}</td>
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
                                <div className="flex items-center gap-2">
                                  <button
                                    className="text-green-600 hover:text-green-800 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
                                    title={locale === 'ar' ? 'تعديل' : 'Edit'}
                                    aria-label={`${locale === 'ar' ? 'تعديل' : 'Edit'} ${task.title}`}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    className="text-red-600 hover:text-red-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                                    title={locale === 'ar' ? 'حذف' : 'Delete'}
                                    aria-label={`${locale === 'ar' ? 'حذف' : 'Delete'} ${task.title}`}
                                    onClick={() => handleDeleteTask(task.id)}
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
                )}
              </>
            )}

            {/* Other content views - Placeholders */}
            {contentView !== 'empty' && contentView !== 'annualPlan' && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="text-6xl mb-4">🚧</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {locale === 'ar' ? 'قيد التطوير' : 'Under Development'}
                  </h3>
                  <p className="text-gray-600">
                    {locale === 'ar'
                      ? `محتوى ${processSteps.find(s => s.id === activeStepId)?.label} سيكون متاحًا قريبًا`
                      : `${processSteps.find(s => s.id === activeStepId)?.label} content coming soon`}
                  </p>
                </div>
              </div>
            )}
          </main>

          {/* RBIA يمين - ثابت، يظهر من XL */}
          <aside className="hidden xl:block w-[320px] min-w-[320px] max-w-[320px] flex-none shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-[88px]">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {locale === 'ar' ? 'معلومات RBIA' : 'RBIA Information'}
              </h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {locale === 'ar' ? 'نهج التدقيق القائم على المخاطر' : 'Risk-Based Internal Audit'}
                  </h4>
                  <p className="leading-relaxed">
                    {locale === 'ar'
                      ? 'منهجية منظمة لتحديد وتقييم المخاطر وتطوير خطة تدقيق شاملة.'
                      : 'A systematic approach to identify, assess risks, and develop comprehensive audit plans.'}
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    {locale === 'ar' ? 'المراحل الأساسية' : 'Key Phases'}
                  </h4>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>{locale === 'ar' ? 'التخطيط السنوي' : 'Annual Planning'}</li>
                    <li>{locale === 'ar' ? 'تقييم المخاطر' : 'Risk Assessment'}</li>
                    <li>{locale === 'ar' ? 'الأعمال الميدانية' : 'Fieldwork'}</li>
                    <li>{locale === 'ar' ? 'إعداد التقارير' : 'Reporting'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Annual Plan Wizard Modal */}
      <AnnualPlanWizard
        open={openAnnualPlan}
        onOpenChange={setOpenAnnualPlan}
        locale={locale}
        onSuccess={handleWizardSuccess}
      />
    </div>
  );
}
