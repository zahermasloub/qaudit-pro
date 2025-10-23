'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Lock, ChevronDown, ChevronUp } from 'lucide-react';

export interface ProcessStep {
  id: number;
  label: string;
  status: 'active' | 'completed' | 'locked' | 'available';
  lockReason?: string;
  dueDate?: string;
  isOverdue?: boolean;
}

interface ProcessStepperProps {
  steps: ProcessStep[];
  activeStepId: number;
  onStepClick: (stepId: number) => void;
  completedCount?: number;
}

export default function ProcessStepper({
  steps,
  activeStepId,
  onStepClick,
  completedCount = 0,
}: ProcessStepperProps) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const totalSteps = steps.length;

  const getStatusIcon = (status: ProcessStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" aria-hidden="true" />;
      case 'active':
        return <Clock className="w-4 h-4 text-blue-600" aria-hidden="true" />;
      case 'locked':
        return <Lock className="w-4 h-4 text-gray-400" aria-hidden="true" />;
      default:
        return null;
    }
  };

  const getAriaLabel = (step: ProcessStep) => {
    const statusLabels = {
      completed: 'مكتملة',
      active: 'جارية',
      locked: 'مقفلة',
      available: 'متاحة',
    };
    return `${step.label}، ${statusLabels[step.status]}`;
  };

  const getStepClasses = (step: ProcessStep) => {
    const baseClasses = 'group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';

    switch (step.status) {
      case 'active':
        // Active: primary/10% background, primary-300 border
        return `${baseClasses} bg-blue-50 border-2 border-blue-300 cursor-pointer focus:ring-blue-500 shadow-sm`;
      case 'completed':
        // Done: success text/border, very light background
        return `${baseClasses} bg-green-50/30 border border-green-300 hover:bg-green-50 cursor-pointer focus:ring-green-500 hover:shadow-sm`;
      case 'locked':
        // Locked: muted gray, not clickable
        return `${baseClasses} bg-gray-100 border border-gray-200 opacity-60 cursor-not-allowed`;
      default:
        // Default: normal surface, hover with light shadow
        return `${baseClasses} bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md cursor-pointer focus:ring-blue-500`;
    }
  };

  const getNumberClasses = (step: ProcessStep) => {
    const baseClasses =
      'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200';

    switch (step.status) {
      case 'active':
        // Active: primary-600 with white text for AA contrast
        return `${baseClasses} bg-blue-600 text-white`;
      case 'completed':
        // Done: success colors with proper contrast
        return `${baseClasses} bg-green-100 text-green-800 border-2 border-green-600`;
      case 'locked':
        // Locked: muted gray
        return `${baseClasses} bg-gray-300 text-gray-600`;
      default:
        // Default: subtle gray with hover
        return `${baseClasses} bg-gray-100 text-gray-700 group-hover:bg-gray-200`;
    }
  };

  const handleStepClick = (step: ProcessStep) => {
    if (step.status === 'locked') {
      return;
    }
    onStepClick(step.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent, step: ProcessStep, index: number) => {
    // Enter or Space to activate step
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleStepClick(step);
      return;
    }

    // Arrow navigation
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const direction = e.key === 'ArrowUp' ? -1 : 1;
      const nextIndex = index + direction;

      if (nextIndex >= 0 && nextIndex < steps.length) {
        const nextStep = steps[nextIndex];
        // Focus on next available step (skip locked ones)
        if (nextStep.status !== 'locked') {
          const stepElement = document.querySelector(
            `[data-step-id="${nextStep.id}"]`,
          ) as HTMLElement;
          stepElement?.focus();
        } else {
          // Try next one
          const furtherIndex = nextIndex + direction;
          if (furtherIndex >= 0 && furtherIndex < steps.length) {
            const furtherStep = steps[furtherIndex];
            if (furtherStep.status !== 'locked') {
              const stepElement = document.querySelector(
                `[data-step-id="${furtherStep.id}"]`,
              ) as HTMLElement;
              stepElement?.focus();
            }
          }
        }
      }
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block w-[300px] xl:w-[300px] flex-shrink-0">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-[88px] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-4 py-4">
            <h3 className="text-base font-semibold mb-1">مراحل العملية</h3>
            <p className="text-xs text-slate-300">
              {completedCount} من {totalSteps} مكتملة
            </p>
          </div>

          {/* Steps List */}
          <div className="p-3 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
            {steps.map((step, index) => (
              <div
                key={step.id}
                data-step-id={step.id}
                className={getStepClasses(step)}
                onClick={() => handleStepClick(step)}
                onKeyDown={e => handleKeyDown(e, step, index)}
                role="button"
                tabIndex={step.status === 'locked' ? -1 : 0}
                aria-current={step.status === 'active' ? 'step' : undefined}
                aria-disabled={step.status === 'locked'}
                aria-label={getAriaLabel(step)}
                title={step.status === 'locked' ? step.lockReason : step.label}
              >
                {/* Number Badge */}
                <div className={getNumberClasses(step)}>{step.id}</div>

                {/* Label */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-semibold truncate ${
                      step.status === 'active'
                        ? 'text-blue-900'
                        : step.status === 'completed'
                          ? 'text-green-900'
                          : step.status === 'locked'
                            ? 'text-gray-600'
                            : 'text-gray-800'
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.isOverdue && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded">
                      متأخر
                    </span>
                  )}
                </div>

                {/* Status Icon */}
                <div className="flex-shrink-0">{getStatusIcon(step.status)}</div>
              </div>
            ))}
          </div>

          {/* Progress Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
              <span>التقدم الكلي</span>
              <span className="font-semibold">
                {Math.round((completedCount / totalSteps) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Stepper - Visible only on mobile */}
      <div className="lg:hidden mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile Header (Collapsible) */}
          <button
            onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-br from-slate-800 to-slate-900 text-white"
          >
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">مراحل العملية</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded text-xs">
                {completedCount}/{totalSteps}
              </span>
            </div>
            {isMobileExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Steps - Accordion Style */}
          {isMobileExpanded && (
            <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  data-step-id={step.id}
                  className={getStepClasses(step)}
                  onClick={() => handleStepClick(step)}
                  onKeyDown={e => handleKeyDown(e, step, index)}
                  role="button"
                  tabIndex={step.status === 'locked' ? -1 : 0}
                  aria-current={step.status === 'active' ? 'step' : undefined}
                  aria-disabled={step.status === 'locked'}
                  aria-label={getAriaLabel(step)}
                  title={step.status === 'locked' ? step.lockReason : step.label}
                >
                  <div className={getNumberClasses(step)}>{step.id}</div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        step.status === 'active'
                          ? 'text-blue-900'
                          : step.status === 'completed'
                            ? 'text-green-900'
                            : 'text-gray-800'
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {getStatusIcon(step.status)}
                </div>
              ))}
            </div>
          )}

          {/* Mobile Progress Bar (Always Visible) */}
          {!isMobileExpanded && (
            <div className="px-4 pb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </>
  );
}
