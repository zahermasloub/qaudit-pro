/**
 * Enhanced Annual Plan Screen - Example Usage
 * Demonstrates integration of new modular components
 */

'use client';

import React, { useEffect, useState } from 'react';
import { PlanShell, ProcessStep } from '@/src/components/shell/PlanShell';
import { PlanTable } from '@/src/components/table/PlanTable';
import { Toolbar } from '@/src/components/table/Toolbar';
import { StageDrawer } from '@/src/components/shell/StageDrawer';
import { fetchPlan, fetchTasks, deleteTask, AuditTask, AnnualPlan } from '@/src/lib/api';
import { usePlanStore } from '@/src/state/plan.store';
import type { Locale } from '@/lib/i18n';

type ContentView = 'empty' | 'annualPlan' | 'planning' | 'other';

export function EnhancedAnnualPlanScreen({ locale }: { locale: Locale }) {
  const isRTL = locale === 'ar';
  const [contentView, setContentView] = useState<ContentView>('empty');
  const [activeStepId, setActiveStepId] = useState<number | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<AnnualPlan | null>(null);
  const [tasks, setTasks] = useState<AuditTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<AuditTask | null>(null);

  // Define process steps (11-stage RBIA)
  const processSteps: ProcessStep[] = [
    { 
      id: 1, 
      label: locale === 'ar' ? 'الخطة السنوية' : 'Annual Plan', 
      status: currentPlanId && tasks.length > 0 ? 'completed' : 'available' 
    },
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

  // Load plan by ID
  const loadPlanById = async (planId: string) => {
    setLoading(true);
    try {
      const plan = await fetchPlan(planId);
      if (plan) {
        setSelectedPlan(plan);
        setTasks(plan.auditTasks || []);
        setCurrentPlanId(planId);
        setContentView('annualPlan');
        setActiveStepId(1);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle step click
  const handleStepClick = (stepId: number) => {
    setActiveStepId(stepId);
    
    if (stepId === 1) {
      if (currentPlanId) {
        setContentView('annualPlan');
      } else {
        setContentView('empty');
      }
    } else {
      setContentView('planning');
    }
  };

  // Handle task actions
  const handleRowClick = (task: AuditTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleEdit = (task: AuditTask) => {
    setSelectedTask(task);
    setDrawerOpen(true);
  };

  const handleDelete = async (task: AuditTask) => {
    if (!currentPlanId) return;

    const confirmDelete = window.confirm(
      locale === 'ar'
        ? 'هل أنت متأكد من حذف هذه المهمة؟'
        : 'Are you sure you want to delete this task?'
    );

    if (confirmDelete) {
      const success = await deleteTask(currentPlanId, task.id);
      if (success && currentPlanId) {
        await loadPlanById(currentPlanId);
      }
    }
  };

  const handleExport = () => {
    // Export to CSV implementation
    console.log('Exporting to CSV...');
  };

  // Calculate KPIs
  const totalTasks = tasks.length;
  const totalPlannedHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get unique departments
  const departments = Array.from(new Set(tasks.map(task => task.department)));

  // Helper functions for labels
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: locale === 'ar' ? 'مسودة' : 'Draft',
      under_review: locale === 'ar' ? 'قيد المراجعة' : 'Under Review',
      approved: locale === 'ar' ? 'معتمدة' : 'Approved',
    };
    return labels[status] || status;
  };

  const getPlanStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      under_review: 'bg-orange-100 text-orange-800',
      approved: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
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
              onClick={() => console.log('Open wizard')}
              aria-label={locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            >
              + {locale === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout with Shell */}
      <PlanShell
        steps={processSteps}
        activeStepId={activeStepId}
        onStepClick={handleStepClick}
        locale={locale}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* KPI Cards */}
        {selectedPlan && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Plan Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                {locale === 'ar' ? 'حالة الخطة' : 'Plan Status'}
              </h3>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getPlanStatusColor(selectedPlan?.status || '')}`}>
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

        {/* Content Views */}
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
            </div>
          </div>
        )}

        {contentView === 'annualPlan' && selectedPlan && (
          <>
            {/* Toolbar */}
            <Toolbar
              locale={locale}
              departments={departments}
              onExport={handleExport}
              totalTasks={totalTasks}
              filteredTasks={tasks.length}
            />

            {/* Table */}
            {loading ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="text-gray-600">
                  {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                </div>
              </div>
            ) : (
              <PlanTable
                data={tasks}
                locale={locale}
                onRowClick={handleRowClick}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}

        {contentView === 'planning' && (
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
      </PlanShell>

      {/* Task Details Drawer */}
      <StageDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        title={selectedTask?.title || ''}
        locale={locale}
      >
        {selectedTask && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الرمز' : 'Code'}
              </label>
              <p className="text-gray-900">{selectedTask.code}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الإدارة' : 'Department'}
              </label>
              <p className="text-gray-900">{selectedTask.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الساعات المقدرة' : 'Estimated Hours'}
              </label>
              <p className="text-gray-900">{selectedTask.estimatedHours}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {locale === 'ar' ? 'الهدف والنطاق' : 'Objective & Scope'}
              </label>
              <p className="text-gray-900">{selectedTask.objectiveAndScope || 'N/A'}</p>
            </div>
          </div>
        )}
      </StageDrawer>
    </div>
  );
}
