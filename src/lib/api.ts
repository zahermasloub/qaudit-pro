// ===================================================
// API Configuration & Utilities
// ===================================================

/**
 * Base API URL - يمكن تعيينه من متغيرات البيئة أو استخدام المصدر الحالي
 * في التطوير: http://localhost:3001/api
 * في الإنتاج: يُستخدم window.location.origin تلقائيًا
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

// ===================================================
// Type Definitions
// ===================================================

export type PlanRow = {
  id: string;
  title: string;
  dept: string;
  type: string;
  start: string;
  end: string;
  code: string;
};

export type TasksResponse = {
  rows: PlanRow[];
  total: number;
};

type RawAuditTask = {
  id: string;
  code: string;
  title: string;
  department?: string | null;
  auditType?: string | null;
  plannedQuarter?: string | null;
  scheduledQuarter?: string | null;
};

type PlanPayload = {
  ok: boolean;
  plan?: {
    auditTasks?: RawAuditTask[] | null;
  };
};

// ===================================================
// Helper Functions
// ===================================================

/**
 * بناء URL كامل مع المعاملات
 */
function buildUrl(path: string, params?: Record<string, string>): string {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(path, base);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * توليد بيانات تجريبية للـ fallback أثناء التطوير
 */
function generateMockRows(offset: number, limit: number): PlanRow[] {
  return Array.from({ length: limit }, (_, i) => ({
    id: `dev-${offset + i + 1}`,
    code: `T-${String(offset + i + 1).padStart(3, '0')}`,
    title: `مهمة تجريبية ${offset + i + 1} - فحص الامتثال المالي`,
    dept: ['الإدارة العامة', 'المالية', 'الموارد البشرية', 'تقنية المعلومات'][i % 4] || 'الإدارة العامة',
    type: ['compliance', 'financial', 'operational', 'it-audit'][i % 4] || 'compliance',
    start: `2025-Q${(i % 4) + 1}`,
    end: `2025-Q${(i % 4) + 1}`,
  }));
}

// ===================================================
// Main API Functions
// ===================================================

export async function fetchPlanTasks(opts: {
  planId: string;
  offset: number;
  limit: number;
  sort?: string;
  filters?: Record<string, unknown>;
}): Promise<TasksResponse> {
  // بناء المسار - يمكن تعديله حسب بنية الـ API الخاصة بك
  // الخيار 1: /api/plans/:id/tasks
  // const path = `/api/plans/${opts.planId}/tasks`;

  // الخيار 2: /api/annual-plans/:id (المستخدم حالياً)
  const path = `/api/annual-plans/${opts.planId}`;

  // بناء المعاملات
  const params: Record<string, string> = {
    offset: String(opts.offset),
    limit: String(opts.limit),
  };

  if (opts.sort) params.sort = opts.sort;
  if (opts.filters) params.filters = JSON.stringify(opts.filters);

  const url = buildUrl(path, params);

  try {
    const res = await fetch(url, {
      credentials: 'include', // لإرسال الكوكيز والتصاريح
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as PlanPayload;
    const tasks = json.plan?.auditTasks ?? [];

    const rows = tasks.slice(opts.offset, opts.offset + opts.limit).map<PlanRow>((task) => {
      const quarter = task.plannedQuarter ?? task.scheduledQuarter ?? '—';
      return {
        id: task.id,
        title: task.title,
        dept: task.department ?? '—',
        type: task.auditType ?? '—',
        start: quarter,
        end: quarter,
        code: task.code,
      };
    });

    return {
      rows,
      total: tasks.length,
    };
  } catch (error) {
    // ===================================================
    // Fallback للتطوير - بيانات وهمية لتجنب توقف الواجهة
    // ⚠️ احذف هذا القسم في الإنتاج أو عطّله بشرط NODE_ENV
    // ===================================================
    console.warn('⚠️ fetchPlanTasks fallback to mock data due to:', error);

    // فقط في بيئة التطوير
    if (process.env.NODE_ENV === 'development') {
      const rows = generateMockRows(opts.offset, opts.limit);
      return {
        rows,
        total: 2500, // إجمالي افتراضي للاختبار مع pagination
      };
    }

    // في الإنتاج، نرمي الخطأ
    throw error;
  }
}
