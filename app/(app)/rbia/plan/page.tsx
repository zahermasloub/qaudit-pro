'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { toast } from 'sonner';
import RbiaPlanView from './RbiaPlanView';
import CreatePlanWizard from './CreatePlanWizard';
import EngagementPlanningView from './EngagementPlanningView';

type TabType = 'view' | 'create' | 'planning';

function PlanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('view');
  const [userRole, setUserRole] = useState<string>('');
  const [hasPlan, setHasPlan] = useState(false);

  useEffect(() => {
    // Check user role (mock - replace with actual auth)
    const role = localStorage.getItem('userRole') || 'auditor';
    setUserRole(role);

    // Check if there's an existing plan
    checkForExistingPlan();

    // Handle tab from URL params
    const tab = searchParams.get('tab') as TabType;
    if (tab && ['view', 'create', 'planning'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const checkForExistingPlan = async () => {
    try {
      const response = await fetch('/api/plan/latest');
      if (response.ok) {
        const data = await response.json();
        setHasPlan(!!data?.id);
      }
    } catch (error) {
      console.error('Error checking for plan:', error);
    }
  };

  const handleTabChange = (tab: TabType) => {
    // Check permissions for create tab
    if (tab === 'create' && !['ia_manager', 'cae'].includes(userRole.toLowerCase())) {
      toast.error('لا تملك صلاحية إنشاء خطة. الرجاء التواصل مع IA_Manager/CAE.');
      return;
    }

    // Check if plan exists before showing planning tab
    if (tab === 'planning' && !hasPlan) {
      toast.error('يجب إنشاء خطة أولاً قبل الوصول إلى تخطيط المهمات');
      return;
    }

    setActiveTab(tab);
    router.push(`/rbia/plan?tab=${tab}`, { scroll: false });
  };

  const canCreatePlan = ['ia_manager', 'cae'].includes(userRole.toLowerCase());

  return (
    <div className="w-full min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            الخطة السنوية (RBIA)
          </h1>
          <p className="text-gray-600">
            إدارة الخطة السنوية للتدقيق الداخلي المبني على المخاطر
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
          <div className="flex flex-wrap gap-2 p-2">
            {/* View Tab */}
            <button
              onClick={() => handleTabChange('view')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">R</span>
              عرض الخطة
            </button>

            {/* Create Tab - Only for authorized roles */}
            {canCreatePlan && (
              <button
                onClick={() => handleTabChange('create')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">A</span>
                إنشاء خطة
              </button>
            )}

            {/* Planning Tab - Only if plan exists */}
            {hasPlan && (
              <button
                onClick={() => handleTabChange('planning')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'planning'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-bold bg-white/20 px-1.5 py-0.5 rounded">A/R</span>
                تخطيط المهمات
              </button>
            )}
          </div>

          {/* RACI Legend */}
          <div className="px-4 pb-3 pt-1 border-t border-gray-100">
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span><strong>A</strong> = Accountable (مسؤول)</span>
              <span><strong>R</strong> = Responsible (منفذ)</span>
              <span><strong>C</strong> = Consulted (مستشار)</span>
              <span><strong>I</strong> = Informed (مُبلّغ)</span>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          {activeTab === 'view' && <RbiaPlanView mode="plan" />}

          {activeTab === 'create' && (
            <div className="max-w-4xl mx-auto">
              <CreatePlanWizard
                onClose={() => {
                  checkForExistingPlan();
                  handleTabChange('view');
                }}
              />
            </div>
          )}

          {activeTab === 'planning' && <EngagementPlanningView />}
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    }>
      <PlanPageContent />
    </Suspense>
  );
}
