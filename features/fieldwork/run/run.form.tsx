'use client';

import { useState } from 'react';

import { type RunFormValues, runSchema } from './run.schema';

interface RunFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  auditTestId: string;
  onSuccess: () => void;
}

export default function RunForm({
  open,
  onOpenChange,
  engagementId,
  auditTestId,
  onSuccess,
}: RunFormProps) {
  const [formData, setFormData] = useState<Partial<RunFormValues>>({
    engagementId,
    auditTestId,
    stepIndex: 1,
    actionTaken: 'تم فحص العينة وتحليل البيانات وفقاً للإجراءات المحددة',
    result: 'pass',
    notes: 'تم إنجاز الخطوة بنجاح',
    sampleRef: 'SAMPLE-001',
    executedBy: 'crc.qa2222@gmail.com',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = runSchema.parse({
        ...formData,
        evidenceIds: [],
      });

      console.log('Sending run data:', validated);

      const response = await fetch('/api/fieldwork/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Server error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      console.log('API Result:', result);

      if (result.ok) {
        alert('Test run saved successfully');
        onSuccess();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
          alert('Network error: Cannot connect to server. Please check if the server is running.');
        } else if (error.name === 'ZodError') {
          alert('Validation error: Please check all required fields are filled correctly.');
        } else {
          alert(`Error: ${error.message}`);
        }
      } else {
        alert('Unknown error occurred');
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="relative w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 min-h-[40vh] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
  <h2 className="text-lg font-semibold mb-4">تنفيذ خطوة اختبار</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Step Index</label>
              <input
                type="number"
                value={formData.stepIndex || 0}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    stepIndex: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Result</label>
              <select
                value={formData.result || 'pass'}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    result: e.target.value as 'pass' | 'fail' | 'exception',
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
                <option value="exception">Exception</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Action Taken</label>
            <textarea
              value={formData.actionTaken || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  actionTaken: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              value={formData.notes || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Sample Reference</label>
              <input
                type="text"
                value={formData.sampleRef || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    sampleRef: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Executed By</label>
              <input
                type="email"
                value={formData.executedBy || ''}
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    executedBy: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              />
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center justify-end gap-2 sm:gap-3 border-t bg-white px-2 sm:px-6 py-3 sm:py-4 mt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 font-medium transition-colors hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-white font-medium transition-colors hover:bg-blue-700"
            >
              حفظ التنفيذ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
