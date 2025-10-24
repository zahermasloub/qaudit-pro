/**
 * StagesSidebar - Collapsible sidebar showing process stages
 */

'use client';

import React from 'react';
import { ProcessStep } from './PlanShell';

type StagesSidebarProps = {
  steps: ProcessStep[];
  activeStepId: number | null;
  onStepClick: (stepId: number) => void;
  collapsed: boolean;
  onToggle: () => void;
  locale?: 'ar' | 'en';
};

export function StagesSidebar({
  steps,
  activeStepId,
  onStepClick,
  collapsed,
  onToggle,
  locale = 'ar',
}: StagesSidebarProps) {
  if (collapsed) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Toggle Button */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-2">
          <button
            onClick={onToggle}
            className="w-full p-2 rounded-md hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label={locale === 'ar' ? 'توسيع الشريط الجانبي' : 'Expand Sidebar'}
            title={locale === 'ar' ? 'توسيع' : 'Expand'}
          >
            <svg className="w-5 h-5 text-white mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Icon Rail */}
        <div className="p-2 space-y-1 max-h-[calc(100vh-160px)] overflow-y-auto">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                activeStepId === step.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              title={step.label}
              aria-label={step.label}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mx-auto ${
                  activeStepId === step.id
                    ? 'bg-blue-600 text-white'
                    : step.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {step.id}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden relative">
      <button
        onClick={onToggle}
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={locale === 'ar' ? 'طي الشريط الجانبي' : 'Collapse Sidebar'}
        title={locale === 'ar' ? 'طي' : 'Collapse'}
      >
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-6 py-4 text-white">
        <h3 className="font-bold text-lg">
          {locale === 'ar' ? 'مراحل التدقيق' : 'Audit Stages'}
        </h3>
        <p className="text-sm text-slate-300 mt-1">
          {locale === 'ar' 
            ? `${steps.filter(s => s.status === 'completed').length} من ${steps.length} مكتمل`
            : `${steps.filter(s => s.status === 'completed').length} of ${steps.length} completed`}
        </p>
      </div>

      {/* Steps List */}
      <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {steps.map((step, index) => {
          const isActive = activeStepId === step.id;
          const isCompleted = step.status === 'completed';
          const isLocked = step.status === 'locked';

          return (
            <button
              key={step.id}
              onClick={() => !isLocked && onStepClick(step.id)}
              disabled={isLocked}
              className={`w-full text-right p-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isActive
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : isCompleted
                  ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                  : isLocked
                  ? 'bg-gray-50 border border-gray-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="flex items-center gap-3">
                {/* Step Number/Status Icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 text-white'
                      : isLocked
                      ? 'bg-gray-300 text-gray-500'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : isLocked ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>

                {/* Step Label */}
                <div className="flex-1 text-right">
                  <p
                    className={`font-medium text-sm ${
                      isActive
                        ? 'text-blue-700'
                        : isCompleted
                        ? 'text-green-700'
                        : isLocked
                        ? 'text-gray-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
