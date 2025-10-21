'use client';

import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AnnualPlanStep1, PlanTask } from '@/lib/schemas/annual-plan.schema';
import AnnualPlanStep1Form from './AnnualPlanStep1Form';
import AnnualPlanStep2Form from './AnnualPlanStep2Form';

interface AnnualPlanWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (planId: number) => void;
}

type Step = 1 | 2;

export default function AnnualPlanWizard({ open, onClose, onSuccess }: AnnualPlanWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [planData, setPlanData] = useState<AnnualPlanStep1 | null>(null);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [planId, setPlanId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'لديك تغييرات غير محفوظة. هل تريد حفظ مسودة قبل الإغلاق؟'
      );
      if (confirmed) {
        handleSaveDraft();
      }
    }
    onClose();
    // Reset state
    setCurrentStep(1);
    setPlanData(null);
    setTasks([]);
    setPlanId(null);
    setHasUnsavedChanges(false);
  };

  const handleSaveDraft = async () => {
    if (!planData) {
      toast.error('لا توجد بيانات للحفظ');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/annual-plans', {
        method: planId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(planId && { plan_id: planId }),
          ...planData,
          status: 'draft',
          tasks: tasks.length > 0 ? tasks : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل حفظ المسودة');
      }

      if (!planId) {
        setPlanId(result.data.plan_id);
      }

      setHasUnsavedChanges(false);
      toast.success('✅ تم حفظ المسودة بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء حفظ المسودة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep1Complete = async (data: AnnualPlanStep1) => {
    setPlanData(data);
    setHasUnsavedChanges(true);

    // Create draft plan and get plan_id
    setIsLoading(true);
    try {
      const response = await fetch('/api/annual-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          status: 'draft',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل إنشاء الخطة');
      }

      setPlanId(result.data.plan_id);
      setCurrentStep(2);
      toast.success('✅ تم حفظ بيانات الخطة، يمكنك الآن إضافة المهام');
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إنشاء الخطة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Complete = async (tasksList: PlanTask[]) => {
    if (!planId) {
      toast.error('لم يتم إنشاء الخطة بعد');
      return;
    }

    if (tasksList.length === 0) {
      toast.error('يجب إضافة مهمة واحدة على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      // Update plan status to submitted
      const response = await fetch(`/api/annual-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'submitted',
          tasks: tasksList,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل حفظ الخطة');
      }

      setHasUnsavedChanges(false);
      toast.success('🎉 تم حفظ الخطة السنوية بنجاح');

      // Call success callback
      if (onSuccess) {
        onSuccess(planId);
      }

      // Close wizard after short delay
      setTimeout(() => {
        onClose();
        // Reset state
        setCurrentStep(1);
        setPlanData(null);
        setTasks([]);
        setPlanId(null);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء حفظ الخطة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" dir="rtl">
      <div className="relative w-full max-w-[1040px] h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">
              خطة التدقيق السنوية (RBIA) — {planId ? 'مسودة' : 'جديدة'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Stepper */}
          <div className="flex items-center gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  currentStep >= 1
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500/30 text-white/70'
                }`}
              >
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`text-sm font-medium ${currentStep === 1 ? 'text-white' : 'text-blue-100'}`}>
                خطة التدقيق السنوية
              </span>
            </div>

            {/* Arrow */}
            <div className="flex-1 h-0.5 bg-blue-400/50 max-w-[100px]" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                  currentStep >= 2
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-500/30 text-white/70'
                }`}
              >
                2
              </div>
              <span className={`text-sm font-medium ${currentStep === 2 ? 'text-white' : 'text-blue-100'}`}>
                تفاصيل المهام
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 1 && (
            <AnnualPlanStep1Form
              initialData={planData || undefined}
              onComplete={handleStep1Complete}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
            />
          )}

          {currentStep === 2 && planId && (
            <AnnualPlanStep2Form
              planId={planId}
              initialTasks={tasks}
              onComplete={handleStep2Complete}
              onBack={handleBackToStep1}
              onSaveDraft={handleSaveDraft}
              isLoading={isLoading}
              onTasksChange={(newTasks) => {
                setTasks(newTasks);
                setHasUnsavedChanges(true);
              }}
            />
          )}
        </div>

        {/* Info Footer */}
        {hasUnsavedChanges && (
          <div className="flex-shrink-0 bg-amber-50 border-t border-amber-200 px-6 py-3">
            <div className="flex items-center gap-2 text-amber-800 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>لديك تغييرات غير محفوظة. استخدم زر "حفظ كمسودة" للحفظ.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
