'use client';

import { usePlanStore } from '@/src/state/plan.store';

import { PlanTable } from '../table/PlanTable';
import { Toolbar } from '../table/Toolbar';

import { StageDrawer } from './StageDrawer';
import { StagesBottomBar } from './StagesBottomBar';
import { StagesSidebar } from './StagesSidebar';

const DEFAULT_PLAN_ID = 'sample-plan-2025';

export default function PlanShell() {
  const { sidebarCollapsed } = usePlanStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[auto_minmax(0,1fr)_360px] gap-4 w-full" dir="rtl">
      <aside
        className={[
          'bg-white rounded-2xl shadow-sm sticky top-0 z-30 h-[calc(100vh-16px)] overflow-visible transition-[width] duration-200 hidden lg:block',
          sidebarCollapsed ? 'w-[72px]' : 'w-[280px]',
        ].join(' ')}
      >
        <StagesSidebar />
      </aside>

      <section className="min-w-0 flex flex-col">
        <Toolbar />
        <div className="w-full max-h-[calc(100vh-260px)] overflow-auto [contain:content]">
          <PlanTable planId={DEFAULT_PLAN_ID} />
        </div>
      </section>

      <aside className="hidden lg:block w-[360px] sticky top-0 z-20 h-[calc(100vh-16px)]" />

      <StagesBottomBar />
      <StageDrawer />
    </div>
  );
}
