'use client';

import { ChevronLeft, ChevronRight, ClipboardList } from 'lucide-react';

import { usePlanStore } from '@/src/state/plan.store';

export function StagesSidebar() {
  const { sidebarCollapsed, set } = usePlanStore();

  return (
    <div className="relative h-full">
      <button
        onClick={() => set({ sidebarCollapsed: !sidebarCollapsed })}
        className="absolute -end-3 top-3 w-7 h-7 rounded-full shadow bg-white grid place-items-center z-40"
        aria-label="طي/فتح القائمة"
      >
        {sidebarCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <nav className="p-3 space-y-1">
        <a className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50">
          <ClipboardList size={18} />
          <span className={sidebarCollapsed ? 'sr-only' : ''}>جميع المراحل</span>
        </a>
      </nav>
    </div>
  );
}
