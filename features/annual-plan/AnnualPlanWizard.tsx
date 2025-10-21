/**
 * Annual Plan Wizard - Two-step wizard for creating annual plans
 * Step 1: Plan metadata
 * Step 2: Task details (repeatable)
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useI18n, type Locale } from '@/lib/i18n';
import { planDataSchema, taskSchema, type PlanDataFormValues, type TaskFormValues } from './wizard.schema';

interface AnnualPlanWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  locale?: Locale;
  onSuccess?: (planId: string) => void;
}

export function AnnualPlanWizard({
  open,
  onOpenChange,
  locale = 'ar',
  onSuccess,
}: AnnualPlanWizardProps) {
  const t = useI18n(locale);
  const [step, setStep] = useState<1 | 2>(1);
  const [planId, setPlanId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<(TaskFormValues & { id: string })[]>([]);
  const [editingTask, setEditingTask] = useState<(TaskFormValues & { id: string }) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Plan Data Form
  const planForm = useForm<PlanDataFormValues>({
    resolver: zodResolver(planDataSchema),
    defaultValues: {
      planRef: '',
      fiscalYear: new Date().getFullYear() + 1,
      preparedDate: new Date().toISOString().split('T')[0],
      approvedBy: '',
      preparedByName: '',
      standards: '',
      methodology: '',
      objectives: '',
      riskSources: [],
    },
  });

  // Step 2: Task Form
  const taskForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      seqNo: tasks.length + 1,
      taskRef: '',
      deptId: '',
      title: '',
      taskType: 'compliance',
      riskLevel: 'medium',
      impactLevel: 'medium',
      priority: 'medium',
      scheduledQuarter: 'Q1',
      durationDays: 20,
      assignee: '',
      notes: '',
    },
  });

  // Handle save as draft
  const handleSaveAsDraft = async () => {
    setIsLoading(true);
    try {
      const planData = planForm.getValues();
      
      const response = await fetch('/api/annual-plans/wizard/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...planData,
          tasks,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to save draft');
      }

      setPlanId(data.planId);
      toast.success(t.forms.wizard.draftSaved);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await planForm.trigger();
    if (!isValid) {
      toast.error(t.forms.wizard.fillRequiredFields);
      return;
    }

    // If moving to step 2 for the first time, create draft
    if (step === 1 && !planId) {
      await handleSaveAsDraft();
    }

    setStep(2);
  };

  // Handle previous step
  const handlePrevious = () => {
    setStep(1);
  };

  // Handle add/update task
  const handleSaveTask = async (data: TaskFormValues) => {
    if (editingTask) {
      // Update existing task
      setTasks(tasks.map(t => (t.id === editingTask.id ? { ...data, id: editingTask.id } : t)));
      setEditingTask(null);
    } else {
      // Add new task
      const newTask = { ...data, id: Math.random().toString(36).substr(2, 9) };
      setTasks([...tasks, newTask]);
    }

    // Save to backend if plan exists
    if (planId) {
      try {
        const response = await fetch('/api/annual-plans/wizard/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId,
            task: data,
            taskId: editingTask?.id,
          }),
        });

        const result = await response.json();
        if (!response.ok || !result.ok) {
          throw new Error(result.error || 'Failed to save task');
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    }

    taskForm.reset({
      seqNo: tasks.length + 2,
      taskRef: '',
      deptId: '',
      title: '',
      taskType: 'compliance',
      riskLevel: 'medium',
      impactLevel: 'medium',
      priority: 'medium',
      scheduledQuarter: 'Q1',
      durationDays: 20,
      assignee: '',
      notes: '',
    });
  };

  // Handle delete task
  const handleDeleteTask = (taskId: string) => {
    if (confirm(t.forms.wizard.confirmDelete)) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  // Handle finish and save
  const handleFinishAndSave = async () => {
    if (tasks.length === 0) {
      toast.error(t.forms.wizard.atLeastOneTask);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/annual-plans/wizard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to submit plan');
      }

      toast.success(t.forms.wizard.planSubmitted);
      onSuccess?.(planId!);
      onOpenChange(false);
      
      // Reset form
      planForm.reset();
      setTasks([]);
      setPlanId(null);
      setStep(1);
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle risk source management
  const [newRiskSource, setNewRiskSource] = useState('');
  const riskSources = planForm.watch('riskSources') || [];

  const addRiskSource = () => {
    if (newRiskSource.trim()) {
      planForm.setValue('riskSources', [...riskSources, newRiskSource.trim()]);
      setNewRiskSource('');
    }
  };

  const removeRiskSource = (index: number) => {
    planForm.setValue('riskSources', riskSources.filter((_, i) => i !== index));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t.forms.annualPlan.title}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {step === 1 ? t.forms.wizard.step1 : t.forms.wizard.step2}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
              {step === 1 ? '1' : '✓'}
            </div>
            <div className="w-16 h-1 bg-gray-300">
              <div className={`h-full bg-blue-600 transition-all ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
              2
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {step === 1 ? (
            <StepPlanData 
              form={planForm} 
              locale={locale}
              riskSources={riskSources}
              newRiskSource={newRiskSource}
              setNewRiskSource={setNewRiskSource}
              addRiskSource={addRiskSource}
              removeRiskSource={removeRiskSource}
            />
          ) : (
            <StepPlanTasks
              tasks={tasks}
              taskForm={taskForm}
              editingTask={editingTask}
              setEditingTask={setEditingTask}
              onSaveTask={handleSaveTask}
              onDeleteTask={handleDeleteTask}
              locale={locale}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-6 py-4 bg-gray-50">
          <div className="flex gap-2">
            {step === 2 && (
              <button
                type="button"
                onClick={handlePrevious}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {t.forms.wizard.previous}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {t.forms.wizard.saveAsDraft}
            </button>

            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {t.forms.wizard.next}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinishAndSave}
                disabled={isLoading || tasks.length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {t.forms.wizard.finishAndSave}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1 Component
function StepPlanData({ 
  form, 
  locale,
  riskSources,
  newRiskSource,
  setNewRiskSource,
  addRiskSource,
  removeRiskSource,
}: any) {
  const t = useI18n(locale);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.forms.wizard.planRef} <span className="text-red-500">*</span>
          </label>
          <input
            {...form.register('planRef')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="PLAN-2025-001"
          />
          {form.formState.errors.planRef && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.planRef.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.forms.annualPlan.fiscalYear} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            {...form.register('fiscalYear', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {form.formState.errors.fiscalYear && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.fiscalYear.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.forms.wizard.preparedDate} <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...form.register('preparedDate')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {form.formState.errors.preparedDate && (
            <p className="text-sm text-red-600 mt-1">{form.formState.errors.preparedDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.forms.wizard.approvedBy}
          </label>
          <input
            {...form.register('approvedBy')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={locale === 'ar' ? 'اسم المعتمد' : 'Approver name'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.forms.wizard.preparedBy}
          </label>
          <input
            {...form.register('preparedByName')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={locale === 'ar' ? 'اسم المُعِد' : 'Preparer name'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.forms.wizard.standards}
        </label>
        <textarea
          {...form.register('standards')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={locale === 'ar' ? 'المعايير المهنية المتبعة' : 'Professional standards followed'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.forms.wizard.methodology}
        </label>
        <textarea
          {...form.register('methodology')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={locale === 'ar' ? 'المنهجية المستخدمة' : 'Methodology used'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.forms.wizard.objectives}
        </label>
        <textarea
          {...form.register('objectives')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={locale === 'ar' ? 'أهداف الخطة السنوية' : 'Annual plan objectives'}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t.forms.wizard.riskSources}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newRiskSource}
            onChange={(e) => setNewRiskSource(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRiskSource())}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={locale === 'ar' ? 'أضف مصدر خطر' : 'Add risk source'}
          />
          <button
            type="button"
            onClick={addRiskSource}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t.forms.wizard.addRiskSource}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {riskSources.map((source: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
            >
              {source}
              <button
                type="button"
                onClick={() => removeRiskSource(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Step 2 Component
function StepPlanTasks({ tasks, taskForm, editingTask, setEditingTask, onSaveTask, onDeleteTask, locale }: any) {
  const t = useI18n(locale);
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleSubmit = taskForm.handleSubmit((data: TaskFormValues) => {
    onSaveTask(data);
    setShowTaskForm(false);
  });

  const handleEdit = (task: any) => {
    setEditingTask(task);
    taskForm.reset(task);
    setShowTaskForm(true);
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowTaskForm(false);
    taskForm.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{t.forms.wizard.tasksList}</h3>
        <button
          type="button"
          onClick={() => setShowTaskForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + {t.forms.wizard.addTask}
        </button>
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded-lg bg-gray-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.seqNo} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...taskForm.register('seqNo', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.taskRef} <span className="text-red-500">*</span>
              </label>
              <input
                {...taskForm.register('taskRef')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="TSK-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.durationDays} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                {...taskForm.register('durationDays', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.forms.wizard.taskTitle} <span className="text-red-500">*</span>
            </label>
            <input
              {...taskForm.register('title')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder={locale === 'ar' ? 'عنوان المهمة' : 'Task title'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.taskType}
              </label>
              <select
                {...taskForm.register('taskType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="compliance">{locale === 'ar' ? 'الالتزام' : 'Compliance'}</option>
                <option value="financial">{locale === 'ar' ? 'مالي' : 'Financial'}</option>
                <option value="operational">{locale === 'ar' ? 'تشغيلي' : 'Operational'}</option>
                <option value="it_systems">{locale === 'ar' ? 'نظم معلومات' : 'IT Systems'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.riskLevel}
              </label>
              <select
                {...taskForm.register('riskLevel')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">{locale === 'ar' ? 'منخفض' : 'Low'}</option>
                <option value="medium">{locale === 'ar' ? 'متوسط' : 'Medium'}</option>
                <option value="high">{locale === 'ar' ? 'عالي' : 'High'}</option>
                <option value="very_high">{locale === 'ar' ? 'عالي جداً' : 'Very High'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.priority}
              </label>
              <select
                {...taskForm.register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">{locale === 'ar' ? 'منخفضة' : 'Low'}</option>
                <option value="medium">{locale === 'ar' ? 'متوسطة' : 'Medium'}</option>
                <option value="high">{locale === 'ar' ? 'عالية' : 'High'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.forms.wizard.scheduledQuarter}
              </label>
              <select
                {...taskForm.register('scheduledQuarter')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t.forms.wizard.notes}
            </label>
            <textarea
              {...taskForm.register('notes')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t.forms.common.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingTask ? t.forms.common.edit : t.forms.common.add}
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {locale === 'ar' ? 'لا توجد مهام. أضف مهمة للمتابعة.' : 'No tasks yet. Add a task to continue.'}
          </div>
        ) : (
          tasks.map((task: any) => (
            <div key={task.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">#{task.seqNo}</span>
                    <span className="text-sm font-mono text-blue-600">{task.taskRef}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      task.riskLevel === 'very_high' ? 'bg-red-100 text-red-800' :
                      task.riskLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      task.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.riskLevel}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{task.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>{task.taskType}</span>
                    <span>•</span>
                    <span>{task.scheduledQuarter}</span>
                    <span>•</span>
                    <span>{task.durationDays} {locale === 'ar' ? 'يوم' : 'days'}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(task)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {t.forms.common.edit}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    {t.forms.common.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
