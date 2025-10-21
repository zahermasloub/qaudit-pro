'use client';

import { useEffect, useState } from 'react';
import { Users, Shield, Settings, Activity, RefreshCw } from 'lucide-react';
import { KPICard, KPICardGrid } from '@/components/ui/KPICard';
import { ChartWidget, ChartDataPoint } from '@/components/ui/ChartWidget';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Breadcrumbs, BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import { FiltersBar, FilterOption } from '@/components/ui/FiltersBar';
import { toast } from 'sonner';
import './admin-dashboard.responsive.css';

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

  // State for FiltersBar (التي ستصبح الشريط الرئيسي)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'لوحة التحكم', current: true },
  ];

  // تعريف خيارات الفلاتر للشريط
  const filters: FilterOption[] = [
    {
      id: 'period',
      label: 'الفترة الزمنية',
      type: 'select',
      options: [
        { value: '7', label: 'آخر 7 أيام' },
        { value: '30', label: 'آخر 30 يوم' },
        { value: '90', label: 'آخر 3 أشهر' },
      ],
    },
    {
      id: 'metric',
      label: 'المؤشر',
      type: 'select',
      options: [
        { value: 'all', label: 'جميع المؤشرات' },
        { value: 'users', label: 'المستخدمون' },
        { value: 'activity', label: 'النشاط' },
      ],
    },
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
        console.log('📊 KPI Data received:', json);
        console.log('📋 Recent Logs:', json.recentLogs);
        console.log('📈 Daily Activity:', json.trends?.dailyActivity);
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

  // دالة إعادة التحميل (تُستخدم من FiltersBar)
  const handleRefresh = () => {
    window.location.reload();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={breadcrumbItems} showHome={false} />
        <EmptyState
          variant="error"
          title="فشل في تحميل البيانات"
          message={error}
          action={{
            label: "إعادة المحاولة",
            onClick: handleRefresh
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 admin-dashboard-container" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} showHome={false} />

      {/* 🔴 الشريط العلوي الأسود القديم - تم حذفه/إخفاؤه حسب المتطلبات */}
      {/*
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">لوحة التحكم</h1>
          <p className="text-sm text-text-tertiary mt-1">
            عرض الإحصائيات والمؤشرات الرئيسية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 rounded-lg bg-brand-600 text-white">
            إنشاء مهمة
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border">
            تصدير CSV
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border">
            <RefreshCw size={18} />
            تحديث
          </button>
        </div>
      </div>
      */}

      {/* ✅ الشريط الثانوي أصبح الرئيسي (FiltersBar) - sticky في الأعلى */}
      <div className="admin-toolbar-primary sticky top-0 z-20 bg-surface/95 backdrop-blur-sm border-b border-border-base pb-4">
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="بحث في لوحة التحكم..."
          filters={filters}
          filterValues={filterValues}
          onFilterChange={(id, value) =>
            setFilterValues((prev) => ({ ...prev, [id]: value }))
          }
          onClearFilters={() => {
            setSearchQuery('');
            setFilterValues({});
          }}
        />
        {/*
        ❌ تم حذف الأزرار التالية حسب المتطلبات:

        <div className="flex items-center gap-2 mt-4">
          <button className="px-4 py-2 rounded-lg bg-brand-600 text-white">
            إنشاء مهمة
          </button>
          <button className="px-4 py-2 rounded-lg border">
            تصدير CSV
          </button>
          <button className="px-4 py-2 rounded-lg border">
            <RefreshCw size={18} />
            تحديث
          </button>
        </div>

        يمكن إعادة الأزرار لاحقاً عن طريق إلغاء التعليق أعلاه
        */}
      </div>

      {/* KPI Cards - مع دعم responsive */}
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

      {/* Charts & Logs - responsive grid */}
      <div className="admin-charts-grid grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Daily Activity Chart */}
        {loading ? (
          <SkeletonCard />
        ) : data?.trends.dailyActivity && data.trends.dailyActivity.length > 0 ? (
          <ChartWidget
            title="النشاط اليومي"
            type="line"
            data={data.trends.dailyActivity}
            color="var(--primary)"
          />
        ) : (
          <div className="p-6 rounded-xl border shadow-card" style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius)'
          }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>النشاط اليومي</h3>
            <EmptyState
              title="لا توجد بيانات"
              message="لم يتم تسجيل نشاط هذا الشهر"
            />
          </div>
        )}

        {/* Recent Logs */}
        <div className="p-6 rounded-xl border shadow-card" style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)'
        }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>أحدث السجلات</h3>
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
                  className="flex items-start justify-between p-3 rounded-lg transition-fast"
                  style={{
                    backgroundColor: 'var(--surface-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--row-hover)';
                    e.currentTarget.style.borderColor = 'var(--color-border-strong)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{log.action}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>
                      بواسطة {log.actorEmail}
                      {log.target && ` • ${log.target}`}
                    </p>
                  </div>
                  <time className="text-xs" style={{ color: 'var(--muted)' }}>
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
