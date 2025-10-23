/**
 * PlanShell - Main container for the annual plan interface
 * Provides the layout structure with sidebar and main content area
 */

'use client';

import React, { useState } from 'react';
import { StagesSidebar } from './StagesSidebar';
import { StagesBottomBar } from './StagesBottomBar';
import { usePlanStore } from '@/src/state/plan.store';
import { motion, AnimatePresence } from 'framer-motion';

export type ProcessStep = {
  id: number;
  label: string;
  status: 'completed' | 'available' | 'locked';
};

type PlanShellProps = {
  children: React.ReactNode;
  steps: ProcessStep[];
  activeStepId: number | null;
  onStepClick: (stepId: number) => void;
  locale?: 'ar' | 'en';
  dir?: 'rtl' | 'ltr';
};

export function PlanShell({
  children,
  steps,
  activeStepId,
  onStepClick,
  locale = 'ar',
  dir = 'rtl',
}: PlanShellProps) {
  const { sidebarCollapsed, toggleSidebar } = usePlanStore();

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="annual-plan-container container mx-auto px-3 sm:px-4 lg:px-6 max-w-[1440px]">
        <div className="annual-plan-shell">
          {/* Desktop Sidebar */}
          <aside
            className={`annual-plan-sidebar hidden lg:block ${
              !sidebarCollapsed ? 'is-open' : ''
            }`}
            aria-expanded={!sidebarCollapsed}
            aria-label={locale === 'ar' ? 'شريط المراحل الجانبي' : 'Process Stages Sidebar'}
          >
            <div className="annual-plan-sidebar-inner">
              <StagesSidebar
                steps={steps}
                activeStepId={activeStepId}
                onStepClick={onStepClick}
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                locale={locale}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="annual-plan-main space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <StagesBottomBar
        steps={steps}
        activeStepId={activeStepId}
        onStepClick={onStepClick}
        locale={locale}
      />
    </div>
  );
}
