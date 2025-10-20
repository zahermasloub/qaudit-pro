/**
 * plan-metrics.ts
 *
 * Library for calculating KPI metrics for annual audit plans.
 * Provides functions to fetch plan items and compute completion percentage,
 * total hours, item count, and plan status.
 *
 * @module plan-metrics
 */

import prisma from '@/lib/prisma';

/**
 * Represents a single audit plan item (AuditTask)
 */
export interface PlanItem {
  id: string;
  annualPlanId: string;
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  auditType: string;
  objectiveAndScope?: string | null;
  plannedQuarter: string;
  estimatedHours: number;
  leadAuditor?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * KPI metrics for an annual plan
 */
export interface PlanKpis {
  completionPct: number;    // Percentage of completed items (0-100)
  totalHours: number;       // Sum of effort_hours for all items
  itemsCount: number;       // Total number of plan items
  status: string;           // Overall plan status
}

/**
 * Fetch all plan items for a given plan ID
 *
 * @param planId - UUID of the annual plan
 * @returns Array of plan items or empty array if none found
 *
 * @example
 * ```typescript
 * const items = await getPlanItems('550e8400-e29b-41d4-a716-446655440000');
 * console.log(`Found ${items.length} items`);
 * ```
 */
export async function getPlanItems(planId: string): Promise<PlanItem[]> {
  try {
    const tasks = await prisma.auditTask.findMany({
      where: {
        annualPlanId: planId,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return tasks as PlanItem[];
  } catch (error) {
    console.error('خطأ في جلب بنود الخطة:', error);
    return [];
  }
}

/**
 * Calculate KPI metrics from an array of plan items
 *
 * @param items - Array of plan items
 * @returns KPI metrics object with completion %, total hours, count, and status
 *
 * @example
 * ```typescript
 * const items = await getPlanItems(planId);
 * const kpis = calcKpis(items);
 * console.log(`Completion: ${kpis.completionPct}%`);
 * console.log(`Total Hours: ${kpis.totalHours}`);
 * ```
 */
export function calcKpis(items: PlanItem[]): PlanKpis {
  if (!items || items.length === 0) {
    return {
      completionPct: 0,
      totalHours: 0,
      itemsCount: 0,
      status: 'draft',
    };
  }

  const itemsCount = items.length;

  // Calculate total effort hours
  const totalHours = items.reduce(
    (sum, item) => sum + (item.estimatedHours || 0),
    0
  );

  // Count completed items (status = 'completed' or 'done')
  const completedCount = items.filter(
    (item) => item.status === 'completed' || item.status === 'done'
  ).length;

  // Calculate completion percentage
  const completionPct = itemsCount > 0
    ? Math.round((completedCount / itemsCount) * 100)
    : 0;

  // Determine overall status based on completion
  let status = 'draft';
  if (completionPct === 0) {
    status = 'draft';
  } else if (completionPct < 50) {
    status = 'in_progress';
  } else if (completionPct < 100) {
    status = 'nearly_complete';
  } else {
    status = 'completed';
  }

  return {
    completionPct,
    totalHours,
    itemsCount,
    status,
  };
}

/**
 * Fetch plan items and calculate KPIs in one call
 *
 * @param planId - UUID of the annual plan
 * @returns KPI metrics for the plan
 *
 * @example
 * ```typescript
 * const kpis = await getPlanKpis('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getPlanKpis(planId: string): Promise<PlanKpis> {
  const items = await getPlanItems(planId);
  return calcKpis(items);
}
