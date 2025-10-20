'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Settings, Activity } from 'lucide-react';
import { KPICard, KPICardGrid } from '@/components/ui/KPICard';
import { ChartWidget, ChartDataPoint } from '@/components/ui/ChartWidget';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { toast } from 'sonner';

interface KPIData {
  summary: {
    users: { value: number; label: string; change: number; trend: 'up' | 'down' | 'neutral' };
    roles: { value: number; label: string; change: number; trend: 'up' | 'down' | 'neutral' };
    completionRate: { value: number; label: string; change: number; trend: 'up' | 'down' | 'neutral' };
    recentLogs: { value: number; label: string; change: number; trend: 'up' | 'down' | 'neutral' };
  };
  recentLogs: Array<{
    id: string;
    action: string;
    actorEmail: string;
    createdAt: string;
    target: string | null;
  }>;
  trends: {
    dailyActivity: ChartDataPoint[];
  };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', current: true },
  ];

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/admin/kpis');

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('غير مصرح لك بالوصول');
          } else if (response.status === 403) {
            throw new Error('ليس لديك صلاحيات الأدمن');
          } else {
            throw new Error('فشل في جلب البيانات');
          }
        }

        const json = await response.json();
        setData(json);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ غير متوقع');
        toast.error(err.message || 'فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} showHome={false} />
        <EmptyState
          variant="error"
          title="فشل في تحميل البيانات"
          message={error}
          actionLabel="إعادة المحاولة"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      {/* KPI Cards */}
      <KPICardGrid>
        <KPICard
          title={data?.summary.users.label || 'المستخدمون'}
          value={data?.summary.users.value || 0}
          change={data?.summary.users.change}
          trend={data?.summary.users.trend}
          description="إجمالي المستخدمين"
          icon={Users}
          loading={loading}
        />
        <KPICard
          title={data?.summary.roles.label || 'الأدوار'}
          value={data?.summary.roles.value || 0}
          change={data?.summary.roles.change}
          trend={data?.summary.roles.trend}
          description="الأدوار المتاحة"
          icon={Shield}
          loading={loading}
        />
        <KPICard
          title={data?.summary.completionRate.label || 'نسبة الإنجاز'}
          value={`${data?.summary.completionRate.value || 0}%`}
          change={data?.summary.completionRate.change}
          trend={data?.summary.completionRate.trend}
          description="التوصيات المغلقة"
          icon={Activity}
          loading={loading}
        />
        <KPICard
          title={data?.summary.recentLogs.label || 'آخر 24 ساعة'}
          value={data?.summary.recentLogs.value || 0}
          change={data?.summary.recentLogs.change}
          trend={data?.summary.recentLogs.trend}
          description="السجلات الجديدة"
          icon={Settings}
          loading={loading}
        />
      </KPICardGrid>

      {/* Charts & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        {loading ? (
          <SkeletonCard />
        ) : data?.trends.dailyActivity && data.trends.dailyActivity.length > 0 ? (
          <ChartWidget
            title="النشاط اليومي"
            type="line"
            data={data.trends.dailyActivity}
            color="#3b82f6"
          />
        ) : (
          <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
            <h3 className="text-sm font-semibold text-text-primary mb-4">النشاط اليومي</h3>
            <EmptyState
              title="لا توجد بيانات"
              message="لم يتم تسجيل نشاط هذا الشهر"
            />
          </div>
        )}

        {/* Recent Logs */}
        <div className="p-6 rounded-xl border border-border-base bg-bg-elevated">
          <h3 className="text-sm font-semibold text-text-primary mb-4">أحدث السجلات</h3>
          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
            </div>
          ) : data?.recentLogs && data.recentLogs.length > 0 ? (
            <div className="space-y-3">
              {data.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-bg-muted hover:bg-bg-subtle transition-fast"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">{log.action}</p>
                    <p className="text-xs text-text-tertiary mt-1">
                      بواسطة {log.actorEmail}
                      {log.target && ` • ${log.target}`}
                    </p>
                  </div>
                  <time className="text-xs text-text-tertiary">
                    {new Date(log.createdAt).toLocaleString('ar-EG', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="لا توجد سجلات"
              message="لم يتم تسجيل أي نشاط مؤخراً"
            />
          )}
        </div>
      </div>
    </div>
  );
}
