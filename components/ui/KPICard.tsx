'use client';

import { ArrowDown, ArrowUp, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export interface KPICardProps {
  /**
   * العنوان
   */
  title: string;

  /**
   * القيمة الأساسية
   */
  value: string | number;

  /**
   * نسبة التغيير (%)
   */
  change?: number;

  /**
   * اتجاه التغيير
   */
  trend?: 'up' | 'down' | 'neutral';

  /**
   * وصف إضافي
   */
  description?: string;

  /**
   * أيقونة
   */
  icon?: LucideIcon;

  /**
   * حالة التحميل
   */
  loading?: boolean;

  /**
   * CSS classes إضافية
   */
  className?: string;

  /**
   * دالة عند الضغط
   */
  onClick?: () => void;
}

/**
 * KPICard Component
 * بطاقة لعرض مؤشرات الأداء الرئيسية (KPI) مع نسبة التغيير
 *
 * @example
 * ```tsx
 * <KPICard
 *   title="إجمالي المستخدمين"
 *   value={1234}
 *   change={12.5}
 *   trend="up"
 *   description="مقارنة بالشهر الماضي"
 *   icon={Users}
 * />
 * ```
 */
export function KPICard({
  title,
  value,
  change,
  trend = 'neutral',
  description,
  icon: Icon,
  loading = false,
  className,
  onClick,
}: KPICardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'p-6 rounded-xl border border-border-base bg-bg-elevated',
          className
        )}
      >
        <div className="space-y-3">
          <Skeleton variant="text" className="w-1/3" />
          <Skeleton variant="text" className="w-2/3 h-8" />
          <Skeleton variant="text" className="w-1/2" />
        </div>
      </div>
    );
  }

  const isClickable = Boolean(onClick);

  return (
    <div
      className={cn(
        'p-6 rounded-xl border border-border-base bg-bg-elevated transition-fast',
        isClickable && 'cursor-pointer hover:shadow-md hover:border-brand-300',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-text-secondary">{title}</h3>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950">
            <Icon size={20} className="text-brand-600" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <p className="text-3xl font-bold text-text-primary">{value.toLocaleString('ar-EG')}</p>
      </div>

      {/* Change & Description */}
      <div className="flex items-center justify-between gap-2">
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
              trend === 'up' && 'bg-success-50 text-success-700 dark:bg-success-950 dark:text-success-300',
              trend === 'down' && 'bg-error-50 text-error-700 dark:bg-error-950 dark:text-error-300',
              trend === 'neutral' && 'bg-bg-muted text-text-tertiary'
            )}
          >
            {trend === 'up' && <TrendingUp size={14} />}
            {trend === 'down' && <TrendingDown size={14} />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}

        {description && (
          <p className="text-xs text-text-tertiary flex-1 text-left">{description}</p>
        )}
      </div>
    </div>
  );
}

/**
 * KPICardGrid Component
 * شبكة responsive لعرض مجموعة من KPI Cards
 */
interface KPICardGridProps {
  /**
   * البطاقات
   */
  children: React.ReactNode;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

export function KPICardGrid({ children, className }: KPICardGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
        className
      )}
    >
      {children}
    </div>
  );
}
