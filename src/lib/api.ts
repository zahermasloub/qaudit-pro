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

export async function fetchPlanTasks(
  planId: string,
  offset: number,
  limit: number,
  sort?: string,
  filters?: string,
): Promise<TasksResponse> {
  const qs = new URLSearchParams();
  if (sort) qs.set('sort', sort);
  if (filters) qs.set('filters', filters);

  const url = `/api/annual-plans/${planId}${qs.size ? `?${qs.toString()}` : ''}`;

  const res = await fetch(url, {
    credentials: 'include',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error('Failed to fetch tasks');
  }

  const json = (await res.json()) as PlanPayload;
  const tasks = json.plan?.auditTasks ?? [];

  const rows = tasks.slice(offset, offset + limit).map<PlanRow>((task) => {
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
}
