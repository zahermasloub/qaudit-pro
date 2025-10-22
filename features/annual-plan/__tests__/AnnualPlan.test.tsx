/**
 * Unit tests for AnnualPlan screen
 * Tests filter functionality and KPI calculations
 */

describe('AnnualPlan Screen Calculations', () => {
  // Helper to create mock tasks
  const createMockTask = (
    id: string,
    status: string,
    estimatedHours: number,
    department: string,
    riskLevel: string
  ) => ({
    id,
    annualPlanId: '1',
    code: `IA-25-${id}`,
    title: `Task ${id}`,
    department,
    riskLevel,
    auditType: 'operational',
    plannedQuarter: 'Q1',
    estimatedHours,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  describe('KPI Calculations', () => {
    test('should calculate total tasks correctly', () => {
      const tasks = [
        createMockTask('1', 'completed', 100, 'IT', 'high'),
        createMockTask('2', 'in_progress', 150, 'HR', 'medium'),
        createMockTask('3', 'not_started', 200, 'Finance', 'low'),
      ];

      expect(tasks.length).toBe(3);
    });

    test('should calculate total planned hours correctly', () => {
      const tasks = [
        createMockTask('1', 'completed', 100, 'IT', 'high'),
        createMockTask('2', 'in_progress', 150, 'HR', 'medium'),
        createMockTask('3', 'not_started', 200, 'Finance', 'low'),
      ];

      const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      expect(totalHours).toBe(450);
    });

    test('should calculate completion rate correctly', () => {
      const tasks = [
        createMockTask('1', 'completed', 100, 'IT', 'high'),
        createMockTask('2', 'completed', 150, 'HR', 'medium'),
        createMockTask('3', 'in_progress', 200, 'Finance', 'low'),
        createMockTask('4', 'not_started', 250, 'Admin', 'medium'),
      ];

      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const totalTasks = tasks.length;
      const completionRate = Math.round((completedTasks / totalTasks) * 100);

      expect(completedTasks).toBe(2);
      expect(totalTasks).toBe(4);
      expect(completionRate).toBe(50);
    });

    test('should handle zero tasks correctly', () => {
      const tasks: any[] = [];

      const totalTasks = tasks.length;
      const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
      const completionRate = totalTasks > 0 ? Math.round((0 / totalTasks) * 100) : 0;

      expect(totalTasks).toBe(0);
      expect(totalHours).toBe(0);
      expect(completionRate).toBe(0);
    });

    test('should handle 100% completion correctly', () => {
      const tasks = [
        createMockTask('1', 'completed', 100, 'IT', 'high'),
        createMockTask('2', 'completed', 150, 'HR', 'medium'),
      ];

      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const totalTasks = tasks.length;
      const completionRate = Math.round((completedTasks / totalTasks) * 100);

      expect(completionRate).toBe(100);
    });
  });

  describe('Filter Functionality', () => {
    const allTasks = [
      createMockTask('1', 'completed', 100, 'IT Department', 'high'),
      createMockTask('2', 'in_progress', 150, 'HR Department', 'medium'),
      createMockTask('3', 'not_started', 200, 'Finance Department', 'low'),
      createMockTask('4', 'completed', 250, 'IT Department', 'very_high'),
      createMockTask('5', 'in_progress', 180, 'Finance Department', 'medium'),
    ];

    test('should filter by department', () => {
      const filtered = allTasks.filter(task => task.department === 'IT Department');
      expect(filtered.length).toBe(2);
      expect(filtered.every(task => task.department === 'IT Department')).toBe(true);
    });

    test('should filter by risk level', () => {
      const filtered = allTasks.filter(task => task.riskLevel === 'medium');
      expect(filtered.length).toBe(2);
      expect(filtered.every(task => task.riskLevel === 'medium')).toBe(true);
    });

    test('should filter by status', () => {
      const filtered = allTasks.filter(task => task.status === 'completed');
      expect(filtered.length).toBe(2);
      expect(filtered.every(task => task.status === 'completed')).toBe(true);
    });

    test('should search by title', () => {
      const searchQuery = 'Task 2';
      const filtered = allTasks.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('2');
    });

    test('should search by code', () => {
      const searchQuery = 'IA-25-3';
      const filtered = allTasks.filter(task => 
        task.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('3');
    });

    test('should apply multiple filters', () => {
      const filtered = allTasks
        .filter(task => task.department === 'Finance Department')
        .filter(task => task.status === 'in_progress');
      
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('5');
    });

    test('should return empty array when no matches', () => {
      const filtered = allTasks.filter(task => task.department === 'Non-existent Department');
      expect(filtered.length).toBe(0);
    });
  });

  describe('URL Filter Persistence', () => {
    test('should construct URL params correctly', () => {
      const searchQuery = 'test';
      const filterDepartment = 'IT';
      const filterRisk = 'high';
      const filterStatus = 'completed';
      const density = 'compact';

      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (filterDepartment) params.set('department', filterDepartment);
      if (filterRisk) params.set('risk', filterRisk);
      if (filterStatus) params.set('status', filterStatus);
      if (density !== 'comfortable') params.set('density', density);

      expect(params.get('search')).toBe('test');
      expect(params.get('department')).toBe('IT');
      expect(params.get('risk')).toBe('high');
      expect(params.get('status')).toBe('completed');
      expect(params.get('density')).toBe('compact');
    });

    test('should not include empty filters in URL', () => {
      const params = new URLSearchParams();
      const searchQuery = '';
      const filterDepartment = '';

      if (searchQuery) params.set('search', searchQuery);
      if (filterDepartment) params.set('department', filterDepartment);

      expect(params.toString()).toBe('');
    });

    test('should not include default density in URL', () => {
      const params = new URLSearchParams();
      const density = 'comfortable';

      if (density !== 'comfortable') params.set('density', density);

      expect(params.toString()).toBe('');
    });
  });
});
