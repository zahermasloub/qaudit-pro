'use client';

import { ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  /**
   * التسمية
   */
  label: string;

  /**
   * الرابط
   */
  href?: string;

  /**
   * هل هو العنصر الحالي
   */
  current?: boolean;
}

interface BreadcrumbsProps {
  /**
   * عناصر التنقل
   */
  items: BreadcrumbItem[];

  /**
   * عرض أيقونة Home
   */
  showHome?: boolean;

  /**
   * رابط الصفحة الرئيسية
   */
  homeHref?: string;

  /**
   * CSS classes إضافية
   */
  className?: string;
}

/**
 * Breadcrumbs Component
 * مسار التنقل (Breadcrumb Navigation)
 *
 * @example
 * ```tsx
 * const items: BreadcrumbItem[] = [
 *   { label: 'لوحة التحكم', href: '/admin/dashboard' },
 *   { label: 'المستخدمين', href: '/admin/users' },
 *   { label: 'تعديل مستخدم', current: true },
 * ];
 *
 * <Breadcrumbs items={items} showHome />
 * ```
 */
export function Breadcrumbs({
  items,
  showHome = true,
  homeHref = '/admin/dashboard',
  className,
}: BreadcrumbsProps) {
  return (
    <nav
      aria-label="مسار التنقل"
      className={cn('flex items-center gap-2 text-sm', className)}
    >
      {/* Home Link */}
      {showHome && (
        <>
          <Link
            href={homeHref}
            className="
              flex items-center gap-1 px-2 py-1 rounded-lg
              text-text-secondary hover:text-brand-600 hover:bg-bg-subtle
              transition-fast focus-ring
            "
            aria-label="الصفحة الرئيسية"
          >
            <Home size={16} />
          </Link>
          <ChevronLeft size={16} className="text-text-tertiary" aria-hidden="true" />
        </>
      )}

      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isCurrent = item.current || isLast;

        return (
          <React.Fragment key={index}>
            {item.href && !isCurrent ? (
              <Link
                href={item.href}
                className="
                  px-2 py-1 rounded-lg
                  text-text-secondary hover:text-brand-600 hover:bg-bg-subtle
                  transition-fast focus-ring
                "
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="px-2 py-1 text-text-primary font-medium"
                aria-current={isCurrent ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}

            {!isLast && (
              <ChevronLeft size={16} className="text-text-tertiary" aria-hidden="true" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
