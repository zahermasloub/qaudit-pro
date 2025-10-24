'use client';

import { usePlanStore } from '@/src/state/plan.store';

import { PlanTable } from '../table/PlanTable';
import { Toolbar } from '../table/Toolbar';

import { StageDrawer } from './StageDrawer';
import { StagesBottomBar } from './StagesBottomBar';
import { StagesSidebar } from './StagesSidebar';

const DEFAULT_PLAN_ID = 'sample-plan-2025';

interface PlanShellProps {
  planIdFromRoute?: string;
}

export default function PlanShell({ planIdFromRoute }: PlanShellProps) {
  const { sidebarCollapsed } = usePlanStore();
  const planId = planIdFromRoute || DEFAULT_PLAN_ID;

  return (
    <div dir="rtl" className="px-6 py-4 min-h-screen bg-slate-50">
      {/* نفس الـ padding العام للنظام القديم */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)] gap-4">
        {/* Sidebar - مراحل التدقيق */}
        <aside
          className={[
            'hidden lg:block transition-[width] duration-200',
            sidebarCollapsed ? 'w-[72px]' : 'w-[280px]',
          ].join(' ')}
        >
          <div className="sticky top-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <StagesSidebar />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <section className="min-w-0">
          {/* Toolbar */}
          <div className="mb-3">
            <Toolbar />
          </div>

          {/* Table Container - نفس تنسيق المشروع القديم */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <PlanTable planId={planId} />
          </div>
        </section>
      </div>

      {/* Bottom Bar للموبايل */}
      <StagesBottomBar />
      <StageDrawer />
    </div>
  );
}
