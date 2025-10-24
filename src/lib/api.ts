/**
 * API Adapter for Annual Plan
 * Adapts the existing API to the new component structure
 */

export type AuditTask = {
  id: string;
  annualPlanId: string;
  code: string;
  title: string;
  department: string;
  riskLevel: string;
  auditType: string;
  objectiveAndScope?: string;
  plannedQuarter: string;
  estimatedHours: number;
  leadAuditor?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type AnnualPlan = {
  id: string;
  title: string;
  fiscalYear: number;
  version: string;
  status: string;
  introduction?: string;
  totalAvailableHours?: number;
  plannedTaskHours?: number;
  advisoryHours?: number;
  emergencyHours?: number;
  followUpHours?: number;
  trainingHours?: number;
  administrativeHours?: number;
  estimatedBudget?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  auditTasks?: AuditTask[];
};

/**
 * Fetch annual plan by ID
 */
export async function fetchPlan(planId: string): Promise<AnnualPlan | null> {
  try {
    const response = await fetch(`/api/annual-plans/${planId}`);
    const data = await response.json();
    
    if (data.ok && data.plan) {
      return data.plan;
    }
    return null;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
}

/**
 * Fetch all annual plans
 */
export async function fetchAllPlans(): Promise<AnnualPlan[]> {
  try {
    const response = await fetch('/api/annual-plans');
    const data = await response.json();
    
    if (data.ok && data.plans) {
      return data.plans;
    }
    return [];
  } catch (error) {
    console.error('Error fetching plans:', error);
    return [];
  }
}

/**
 * Fetch tasks for a plan
 */
export async function fetchTasks(planId: string): Promise<AuditTask[]> {
  try {
    const plan = await fetchPlan(planId);
    return plan?.auditTasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
}

/**
 * Delete a task
 */
export async function deleteTask(planId: string, taskId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/annual-plans/${planId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
}

/**
 * Create a new task
 */
export async function createTask(planId: string, task: Partial<AuditTask>): Promise<AuditTask | null> {
  try {
    const response = await fetch(`/api/annual-plans/${planId}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const data = await response.json();
    return data.ok ? data.task : null;
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
}

/**
 * Update a task
 */
export async function updateTask(
  planId: string,
  taskId: string,
  updates: Partial<AuditTask>
): Promise<AuditTask | null> {
  try {
    const response = await fetch(`/api/annual-plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return data.ok ? data.task : null;
  } catch (error) {
    console.error('Error updating task:', error);
    return null;
  }
}
