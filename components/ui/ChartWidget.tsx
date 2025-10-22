'use client';

import { BarChart, LineChart, PieChart } from 'lucide-react';
import React from 'react';
import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLine,
  Pie,
  PieChart as RechartsPie,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { cn } from '@/lib/utils';
import { Skeleton } from './Skeleton';

export type ChartType = 'line' | 'bar' | 'pie';

export interface ChartDataPoint {
  /**
   * التسمية
   */
  label: string;

  /**
   * القيمة
   */
  value: number;

  /**
   * لون اختياري
   */
  color?: string;

  /**
   * Index signature for Recharts compatibility
   */
  [key: string]: string | number | undefined;
}

interface ChartWidgetProps {
  /**
   * العنوان
   */
  title: string;

  /**
   * نوع الرسم البياني
   */
  type: ChartType;

  /**
   * البيانات
   */
  data: ChartDataPoint[];

  /**
   * لون أساسي
   */
  color?: string;

  /**
   * عرض Legend
   */
  showLegend?: boolean;

  /**
   * حالة التحميل
   */
  loading?: boolean;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

/**
 * ChartWidget Component
 * مكون لعرض الرسوم البيانية (Line, Bar, Pie)
 *
 * @example
 * ```tsx
 * const data: ChartDataPoint[] = [
 *   { label: 'يناير', value: 30 },
 *   { label: 'فبراير', value: 45 },
 *   { label: 'مارس', value: 60 },
 * ];
 *
 * <ChartWidget
 *   title="المستخدمين الجدد"
 *   type="line"
 *   data={data}
 *   color="#3b82f6"
 * />
 * ```
 */
export function ChartWidget({
  title,
  type,
  data,
  color = '#3b82f6',
  showLegend = false,
  loading = false,
  className,
}: ChartWidgetProps) {
  if (loading) {
    return (
      <div className={cn('p-6 rounded-xl border border-border-base bg-bg-elevated', className)}>
        <Skeleton variant="text" className="w-1/3 mb-4" />
        <Skeleton variant="rect" className="w-full h-64" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={cn('p-6 rounded-xl border border-border-base bg-bg-elevated', className)}>
        <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>
        <div className="flex flex-col items-center justify-center h-64 text-text-tertiary">
          {type === 'line' && <LineChart size={48} />}
          {type === 'bar' && <BarChart size={48} />}
          {type === 'pie' && <PieChart size={48} />}
          <p className="mt-4 text-sm">لا توجد بيانات</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-6 rounded-xl border border-border-base bg-bg-elevated', className)}>
      <h3 className="text-sm font-semibold text-text-primary mb-4">{title}</h3>

      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' && (
          <RechartsLine data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
            <XAxis
              dataKey="label"
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-base)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </RechartsLine>
        )}

        {type === 'bar' && (
          <RechartsBar data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-base)" />
            <XAxis
              dataKey="label"
              stroke="var(--color-text-tertiary)"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="var(--color-text-tertiary)" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-base)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--color-text-primary)' }}
            />
            {showLegend && <Legend />}
            <Bar dataKey="value" fill={color} radius={[8, 8, 0, 0]} />
          </RechartsBar>
        )}

        {type === 'pie' && (
          <RechartsPie>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={entry => `${entry.label}: ${entry.value}`}
              labelLine={{ stroke: 'var(--color-text-tertiary)' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-base)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            {showLegend && <Legend />}
          </RechartsPie>
        )}
      </ResponsiveContainer>
    </div>
  );
}
