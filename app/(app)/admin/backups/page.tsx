'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

import type { BackupRunInput, BackupScheduleInput } from '@/features/admin/backups/backup.schema';

type BackupJob = {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  status: string;
  storage: string;
  location: string | null;
  sizeBytes: number | null;
  message: string | null;
};

type BackupSchedule = {
  id: string;
  cronExpr: string;
  enabled: boolean;
  storage: string;
  lastRunAt: string | null;
  createdAt: string;
};

export default function AdminBackups() {
  const [jobs, setJobs] = useState<BackupJob[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register: registerRun,
    handleSubmit: handleSubmitRun,
    reset: resetRun,
  } = useForm<BackupRunInput>();
  const {
    register: registerSchedule,
    handleSubmit: handleSubmitSchedule,
    reset: resetSchedule,
  } = useForm<BackupScheduleInput>();

  useEffect(() => {
    fetchBackups();
    fetchSchedules();
  }, []);

  async function fetchBackups() {
    try {
      const res = await fetch('/api/admin/backups');
      const data = await res.json();
      if (data.ok) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  }

  async function fetchSchedules() {
    try {
      const res = await fetch('/api/admin/backups/schedule');
      const data = await res.json();
      if (data.ok) {
        setSchedules(data.rows);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  }

  async function onRunSubmit(data: BackupRunInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok) {
        resetRun();
        setShowRunDialog(false);
        fetchBackups();
      }
    } catch (error) {
      console.error('Error running backup:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onScheduleSubmit(data: BackupScheduleInput) {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/backups/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.ok) {
        resetSchedule();
        setShowScheduleDialog(false);
        fetchSchedules();
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-shell">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">النسخ الاحتياطية</h1>
        <p className="text-gray-600">إدارة النسخ الاحتياطية وجدولتها</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setShowRunDialog(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          تشغيل نسخ احتياطي الآن
        </button>
        <button
          onClick={() => setShowScheduleDialog(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة جدولة
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Jobs */}
        <div>
          <h2 className="text-lg font-semibold mb-3">سجل النسخ الاحتياطية</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    التاريخ
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    الحالة
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                    التخزين
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(job.startedAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          job.status === 'success'
                            ? 'bg-green-50 text-green-700'
                            : job.status === 'failed'
                              ? 'bg-red-50 text-red-700'
                              : job.status === 'running'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{job.storage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedules */}
        <div>
          <h2 className="text-lg font-semibold mb-3">الجدولة المبرمجة</h2>
          <div className="space-y-3">
            {schedules.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {schedule.cronExpr}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      schedule.enabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                    }`}
                  >
                    {schedule.enabled ? 'نشط' : 'معطل'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">التخزين: {schedule.storage}</div>
                {schedule.lastRunAt && (
                  <div className="text-xs text-gray-500 mt-1">
                    آخر تشغيل: {format(new Date(schedule.lastRunAt), 'yyyy-MM-dd HH:mm')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Run Backup Dialog */}
      {showRunDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowRunDialog(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">تشغيل نسخ احتياطي</h3>
              <button className="text-gray-500" onClick={() => setShowRunDialog(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRun(onRunSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موقع التخزين</label>
                <select
                  {...registerRun('mode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="local">محلي (Local)</option>
                  <option value="s3">S3</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRunDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'جارٍ التشغيل...' : 'تشغيل الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Dialog */}
      {showScheduleDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowScheduleDialog(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">إضافة جدولة</h3>
              <button className="text-gray-500" onClick={() => setShowScheduleDialog(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule(onScheduleSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تعبير Cron</label>
                <input
                  {...registerSchedule('cronExpr', { required: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                  placeholder="0 3 * * 1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  مثال: 0 3 * * 1 (الساعة 3 صباحًا كل اثنين)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">موقع التخزين</label>
                <select
                  {...registerSchedule('storage')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="local">محلي (Local)</option>
                  <option value="s3">S3</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...registerSchedule('enabled')}
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">تفعيل الجدولة</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowScheduleDialog(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
