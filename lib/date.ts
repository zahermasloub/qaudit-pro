/**
 * Utility functions for date handling and calculations
 */

/**
 * Calculate days until a given date
 * @param iso - ISO date string or Date object
 * @returns Number of days until the date (negative if overdue)
 */
export function daysUntil(iso: string | Date): number {
  const targetDate = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();

  // Reset time to compare only dates
  const target = new Date(targetDate.toDateString());
  const today = new Date(now.toDateString());

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = target.getTime() - today.getTime();

  return Math.floor(diffMs / msPerDay);
}

/**
 * Check if a date is overdue (past today)
 * @param iso - ISO date string or Date object
 * @returns true if the date is overdue
 */
export function isOverdue(iso: string | Date): boolean {
  return daysUntil(iso) < 0;
}

/**
 * Format date for display in Arabic locale
 * @param iso - ISO date string or Date object
 * @returns Formatted date string
 */
export function formatDateAr(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Get due date status for UI styling
 * @param iso - ISO date string or Date object
 * @returns Status string for styling
 */
export function getDueDateStatus(iso: string | Date): 'overdue' | 'urgent' | 'warning' | 'normal' {
  if (isOverdue(iso)) return 'overdue';

  const days = daysUntil(iso);
  if (days <= 3) return 'urgent';
  if (days <= 7) return 'warning';

  return 'normal';
}
