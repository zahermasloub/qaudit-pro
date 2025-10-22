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
        className={cn('p-6 rounded-xl border', className)}
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--radius)',
          boxShadow: 'var(--shadow-card)',
        }}
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
        'p-6 rounded-xl border transition-fast',
        isClickable && 'cursor-pointer',
        className,
      )}
      style={{
        borderColor: 'var(--border)',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => {
        if (isClickable) {
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
          e.currentTarget.style.borderColor = 'var(--primary)';
        }
      }}
      onMouseLeave={e => {
        if (isClickable) {
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
          e.currentTarget.style.borderColor = 'var(--border)';
        }
      }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? e => {
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
          <h3 className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>
            {title}
          </h3>
        </div>
        {Icon && (
          <div
            className="p-2.5 rounded-lg"
            style={{
              backgroundColor: 'var(--color-brand-50)',
              color: 'var(--color-brand-600)',
            }}
            aria-hidden="true"
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-3">
        <p className="text-3xl font-bold" style={{ color: '#111827' }}>
          {value.toLocaleString('ar-EG')}
        </p>
      </div>

      {/* Change & Description */}
      <div className="flex items-center justify-between gap-2">
        {change !== undefined && (
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor:
                trend === 'up'
                  ? 'var(--color-success-50)'
                  : trend === 'down'
                    ? 'var(--color-danger-50)'
                    : 'var(--skeleton-base)',
              color:
                trend === 'up'
                  ? 'var(--color-success-700)'
                  : trend === 'down'
                    ? 'var(--color-danger-700)'
                    : 'var(--muted)',
            }}
            aria-label={`تغيير ${trend === 'up' ? 'إيجابي' : trend === 'down' ? 'سلبي' : 'محايد'} بنسبة ${Math.abs(change)}%`}
          >
            {trend === 'up' && <TrendingUp size={14} aria-hidden="true" />}
            {trend === 'down' && <TrendingDown size={14} aria-hidden="true" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}

        {description && (
          <p className="text-xs flex-1 text-left" style={{ color: 'var(--text-2)' }}>
            {description}
          </p>
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
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6', className)}>
      {children}
    </div>
  );
}
