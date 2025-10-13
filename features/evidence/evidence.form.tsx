'use client';

import { useState } from 'react';

import { type EvidenceUploadMeta, evidenceUploadMetaSchema } from './evidence.schema';

interface EvidenceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  engagementId: string;
  defaultLinks?: {
    testId?: string;
    sampleRef?: string;
  };
  onSuccess: (evidenceId: string) => void;
}

export default function EvidenceForm({
  open,
  onOpenChange,
  engagementId,
  defaultLinks = {},
  onSuccess,
}: EvidenceFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [metaData, setMetaData] = useState<Partial<EvidenceUploadMeta>>({
    engagementId,
    category: 'audit-evidence',
    linkedTestId: defaultLinks.testId || '',
    linkedSampleRef: defaultLinks.sampleRef || '',
    linkedFindingId: '',
    uploadedBy: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file');
      return;
    }

    try {
      const validated = evidenceUploadMetaSchema.parse(metaData);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('meta', JSON.stringify(validated));

      const response = await fetch('/api/evidence/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.ok) {
        alert('Evidence uploaded successfully');
        onSuccess(result.id);
        setFile(null);
        setMetaData({
          engagementId,
          category: 'audit-evidence',
          linkedTestId: '',
          linkedSampleRef: '',
          linkedFindingId: '',
          uploadedBy: '',
        });
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Add Evidence</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">File</label>
            <input
              type="file"
              accept="*/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded"
              required
            />
            {file && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {file.name} ({Math.round(file.size / 1024)}KB)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              value={metaData.category || ''}
              onChange={e =>
                setMetaData(prev => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              placeholder="e.g., audit-evidence, supporting-docs"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Linked Test ID (Optional)</label>
            <input
              type="text"
              value={metaData.linkedTestId || ''}
              onChange={e =>
                setMetaData(prev => ({
                  ...prev,
                  linkedTestId: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sample Reference (Optional)</label>
            <input
              type="text"
              value={metaData.linkedSampleRef || ''}
              onChange={e =>
                setMetaData(prev => ({
                  ...prev,
                  linkedSampleRef: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Uploaded By</label>
            <input
              type="email"
              value={metaData.uploadedBy || ''}
              onChange={e =>
                setMetaData(prev => ({
                  ...prev,
                  uploadedBy: e.target.value,
                }))
              }
              className="w-full p-2 border rounded"
              required
            />
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
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Upload Evidence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
