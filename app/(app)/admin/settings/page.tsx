'use client';

import { useCallback, useEffect, useState } from 'react';
import { Settings, Save, RefreshCw, Database, Flag, Shield, Bell, Globe } from 'lucide-react';
import { toast } from 'sonner';

import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { EmptyState } from '@/components/ui/EmptyState';

interface SystemSetting {
  id: string;
  key: string;
  value: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
}

type TabId = 'general' | 'features' | 'maintenance' | 'notifications';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', href: '/admin/dashboard' },
    { label: 'إعدادات النظام', current: true },
  ];

  const tabs: Tab[] = [
    { id: 'general', label: 'إعدادات عامة', icon: Settings },
    { id: 'features', label: 'Feature Flags', icon: Flag },
    { id: 'maintenance', label: 'صيانة النظام', icon: Database },
    { id: 'notifications', label: 'الإشعارات', icon: Bell },
  ];

  // جلب الإعدادات
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/settings');
      const data = await response.json();

      if (data.ok) {
        setSettings(data.items);
      } else {
        toast.error('فشل في جلب الإعدادات');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // حفظ إعداد
  async function handleSave(key: string, value: string, type: string) {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value, type }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        toast.success('تم حفظ الإعداد بنجاح');
        fetchSettings();
        setEditingKey(null);
      } else {
        toast.error(data.error || 'فشل في حفظ الإعداد');
      }
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('حدث خطأ أثناء الحفظ');
    }
  }

  // بدء التعديل
  function startEdit(setting: SystemSetting) {
    setEditingKey(setting.key);
    setEditValue(setting.value || '');
  }

  // إلغاء التعديل
  function cancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  // فلترة الإعدادات حسب التاب
  const filteredSettings = settings.filter(s => {
    if (activeTab === 'general') {
      return s.key.startsWith('org.') || s.key.startsWith('system.') || s.key.startsWith('app.');
    }
    if (activeTab === 'features') {
      return s.key.startsWith('feature.');
    }
    if (activeTab === 'maintenance') {
      return s.key.startsWith('maintenance.') || s.key.startsWith('backup.');
    }
    if (activeTab === 'notifications') {
      return s.key.startsWith('notification.') || s.key.startsWith('email.');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">إعدادات النظام</h1>
          <p className="text-sm text-text-tertiary mt-1">إدارة إعدادات التطبيق والنظام</p>
        </div>
        <button
          type="button"
          onClick={fetchSettings}
          disabled={loading}
          className="
            px-4 py-2 rounded-lg
            border border-border-base bg-bg-elevated text-text-secondary
            hover:bg-bg-muted transition-fast
            focus-ring
            flex items-center gap-2
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border-base">
        <div className="flex gap-1 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 rounded-t-lg font-medium text-sm
                  flex items-center gap-2 whitespace-nowrap
                  transition-fast focus-ring
                  ${
                    isActive
                      ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50 dark:bg-brand-900/20'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-muted'
                  }
                `}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
          <EmptyState title="جارٍ التحميل..." message="يرجى الانتظار..." />
        </div>
      ) : filteredSettings.length === 0 ? (
        <EmptyState
          title="لا توجد إعدادات"
          message={`لا توجد إعدادات في قسم "${tabs.find(t => t.id === activeTab)?.label}"`}
        />
      ) : (
        <div className="grid gap-4">
          {filteredSettings.map(setting => {
            const isEditing = editingKey === setting.key;

            return (
              <div
                key={setting.id}
                className="p-4 rounded-xl border border-border-base bg-bg-elevated hover:border-brand-300 transition-fast"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary font-mono text-sm">
                        {setting.key}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {setting.type}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        {setting.type === 'boolean' ? (
                          <select
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="
                              px-3 py-2 rounded-lg
                              border border-border-base bg-bg-base
                              text-text-primary
                              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                              transition-fast
                            "
                          >
                            <option value="true">true</option>
                            <option value="false">false</option>
                          </select>
                        ) : setting.type === 'number' ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="
                              flex-1 px-3 py-2 rounded-lg
                              border border-border-base bg-bg-base
                              text-text-primary
                              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                              transition-fast
                            "
                          />
                        ) : (
                          <input
                            type="text"
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            className="
                              flex-1 px-3 py-2 rounded-lg
                              border border-border-base bg-bg-base
                              text-text-primary
                              focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20
                              transition-fast
                            "
                          />
                        )}

                        <button
                          type="button"
                          onClick={() => handleSave(setting.key, editValue, setting.type)}
                          className="
                            px-3 py-2 rounded-lg
                            bg-brand-600 text-white
                            hover:bg-brand-700
                            flex items-center gap-2
                            transition-fast focus-ring
                          "
                        >
                          <Save size={16} />
                          <span>حفظ</span>
                        </button>

                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="
                            px-3 py-2 rounded-lg
                            border border-border-base bg-bg-base text-text-secondary
                            hover:bg-bg-muted
                            transition-fast focus-ring
                          "
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="mt-1">
                        <span className="text-text-secondary">
                          {setting.value || (
                            <span className="text-text-tertiary italic">غير محدد</span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-text-tertiary">
                      آخر تحديث: {new Date(setting.updatedAt).toLocaleString('ar-EG')}
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => startEdit(setting)}
                      className="
                        px-3 py-1.5 rounded-lg
                        text-sm font-medium
                        border border-border-base bg-bg-base text-text-secondary
                        hover:bg-bg-muted hover:text-brand-600
                        transition-fast focus-ring
                      "
                    >
                      تعديل
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">ملاحظة مهمة</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              التعديل على إعدادات النظام قد يؤثر على سلوك التطبيق. يرجى الحذر عند إجراء التغييرات.
              جميع التعديلات يتم تسجيلها في سجل النظام.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
