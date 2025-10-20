'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * نوع الـSkeleton
   */
  variant?: 'text' | 'rect' | 'circle';

  /**
   * العرض (CSS value)
   */
  width?: string | number;

  /**
   * الارتفاع (CSS value)
   */
  height?: string | number;

  /**
   * عدد السطور (للنص)
   */
  lines?: number;
}

/**
 * Skeleton Component
 * يُعرض أثناء تحميل البيانات
 *
 * @example
 * ```tsx
 * // نص
 * <Skeleton variant="text" width="60%" />
 *
 * // مستطيل (بطاقة)
 * <Skeleton variant="rect" width="100%" height="200px" />
 *
 * // دائرة (صورة شخصية)
 * <Skeleton variant="circle" width="48px" height="48px" />
 *
 * // عدة سطور
 * <Skeleton variant="text" lines={3} />
 * ```
 */
export function Skeleton({
  variant = 'rect',
  width,
  height,
  lines = 1,
  className,
  ...props
}: SkeletonProps) {
  const baseClass = 'animate-pulse bg-bg-muted';

  const variantClasses = {
    text: 'rounded h-4',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  // إن كان نص وعدة سطور
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" role="status" aria-label="جارِ التحميل">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(baseClass, variantClasses.text, className)}
            style={{
              width: i === lines - 1 ? '80%' : '100%',
              ...style,
            }}
            {...props}
          />
        ))}
        <span className="sr-only">جارِ التحميل...</span>
      </div>
    );
  }

  return (
    <div
      className={cn(baseClass, variantClasses[variant], className)}
      style={style}
      role="status"
      aria-label="جارِ التحميل"
      {...props}
    >
      <span className="sr-only">جارِ التحميل...</span>
    </div>
  );
}

/**
 * SkeletonTable — Skeleton لجدول بيانات
 */
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full" role="status" aria-label="جارِ تحميل الجدول">
      {/* Header */}
      <div className="flex gap-4 mb-4 pb-3 border-b border-border-base">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} variant="text" width={i === 0 ? '30%' : '100%'} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={`cell-${rowIdx}-${colIdx}`} variant="text" width="100%" />
          ))}
        </div>
      ))}

      <span className="sr-only">جارِ تحميل بيانات الجدول...</span>
    </div>
  );
}

/**
 * SkeletonCard — Skeleton لبطاقة
 */
export function SkeletonCard() {
  return (
    <div className="bg-bg-elevated border border-border-base rounded-2xl p-6" role="status">
      <Skeleton variant="text" width="60%" className="mb-4" />
      <Skeleton variant="text" lines={3} />
      <div className="flex gap-3 mt-6">
        <Skeleton variant="rect" width="100px" height="32px" />
        <Skeleton variant="rect" width="80px" height="32px" />
      </div>
      <span className="sr-only">جارِ تحميل البطاقة...</span>
    </div>
  );
}
