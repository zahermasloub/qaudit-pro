/**
 * Table columns definition for Annual Plan tasks
 */

import { ColumnDef } from '@tanstack/react-table';
import { AuditTask } from '@/src/lib/api';

type Locale = 'ar' | 'en';

export function getColumns(locale: Locale = 'ar'): ColumnDef<AuditTask>[] {
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: locale === 'ar' ? 'مسودة' : 'Draft',
      under_review: locale === 'ar' ? 'قيد المراجعة' : 'Under Review',
      approved: locale === 'ar' ? 'معتمدة' : 'Approved',
      cancelled: locale === 'ar' ? 'ملغاة' : 'Cancelled',
      completed: locale === 'ar' ? 'مكتملة' : 'Completed',
      not_started: locale === 'ar' ? 'لم تبدأ' : 'Not Started',
      in_progress: locale === 'ar' ? 'قيد التنفيذ' : 'In Progress',
    };
    return labels[status] || status;
  };

  const getRiskLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      very_high: locale === 'ar' ? 'عالية جداً' : 'Very High',
      high: locale === 'ar' ? 'عالية' : 'High',
      medium: locale === 'ar' ? 'متوسطة' : 'Medium',
      low: locale === 'ar' ? 'منخفضة' : 'Low',
    };
    return labels[level] || level;
  };

  const getAuditTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      financial: locale === 'ar' ? 'تدقيق مالي' : 'Financial',
      operational: locale === 'ar' ? 'تدقيق تشغيلي' : 'Operational',
      compliance: locale === 'ar' ? 'تدقيق التزام' : 'Compliance',
      it_systems: locale === 'ar' ? 'تدقيق نظم معلومات' : 'IT Systems',
      performance: locale === 'ar' ? 'تدقيق أداء' : 'Performance',
      advisory: locale === 'ar' ? 'مهمة استشارية' : 'Advisory',
    };
    return labels[type] || type;
  };

  const getRiskLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      very_high: 'bg-red-600 text-white',
      high: 'bg-red-500 text-white',
      medium: 'bg-orange-500 text-white',
      low: 'bg-green-500 text-white',
    };
    return colors[level] || 'bg-gray-500 text-white';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      not_started: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return [
    {
      accessorKey: 'code',
      header: locale === 'ar' ? 'الرمز' : 'Code',
      size: 100,
      cell: ({ getValue }) => (
        <span className="font-medium text-sm text-gray-900 cell-token">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'title',
      header: locale === 'ar' ? 'عنوان المهمة' : 'Task Title',
      size: 260,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-900 cell-text leading-relaxed">
          {getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: 'department',
      header: locale === 'ar' ? 'الإدارة' : 'Department',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 cell-text">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'riskLevel',
      header: locale === 'ar' ? 'المخاطر' : 'Risk',
      size: 120,
      cell: ({ getValue }) => {
        const risk = getValue() as string;
        return (
          <span className={`status-badge ${getRiskLevelColor(risk)}`}>
            {getRiskLevelLabel(risk)}
          </span>
        );
      },
    },
    {
      accessorKey: 'auditType',
      header: locale === 'ar' ? 'النوع' : 'Type',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 cell-text">
          {getAuditTypeLabel(getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: 'plannedQuarter',
      header: locale === 'ar' ? 'الربع' : 'Quarter',
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 cell-token">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'estimatedHours',
      header: locale === 'ar' ? 'الساعات' : 'Hours',
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-600 cell-token text-center">
          {getValue() as number}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: locale === 'ar' ? 'الحالة' : 'Status',
      size: 120,
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span className={`status-badge ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </span>
        );
      },
    },
  ];
}
