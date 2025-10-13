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
    stepIndex: 0,
    actionTaken: '',
    result: 'pass',
    notes: '',
    sampleRef: '',
    executedBy: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = runSchema.parse({
        ...formData,
        evidenceIds: [],
      });

      const response = await fetch('/api/fieldwork/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
      });

      const result = await response.json();

      if (result.ok) {
        alert('Test run saved successfully');
        onSuccess();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Network error');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Execute Test Step</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
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
              className="w-full p-2 border rounded"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Test Run
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
