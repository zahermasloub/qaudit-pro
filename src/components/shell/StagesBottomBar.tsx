/**
 * StagesBottomBar - Mobile bottom navigation for process stages
 */

'use client';

import React from 'react';
import { ProcessStep } from './PlanShell';

type StagesBottomBarProps = {
  steps: ProcessStep[];
  activeStepId: number | null;
  onStepClick: (stepId: number) => void;
  locale?: 'ar' | 'en';
};

export function StagesBottomBar({
  steps,
  activeStepId,
  onStepClick,
  locale = 'ar',
}: StagesBottomBarProps) {
  return (
    <div className="annual-plan-bottom-bar lg:hidden">
      <div className="stage-rail">
        {steps.map((step) => (
          <button
            key={step.id}
            onClick={() => onStepClick(step.id)}
            className={`stage-chip ${activeStepId === step.id ? 'active' : ''}`}
            aria-current={activeStepId === step.id ? 'step' : undefined}
            title={step.label}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                  activeStepId === step.id
                    ? 'bg-white text-blue-600'
                    : step.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.status === 'completed' ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.id
                )}
              </span>
              <span className="text-sm">{step.label}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
