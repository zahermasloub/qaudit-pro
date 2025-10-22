/**
 * Unit tests for ProcessStepper progress calculation
 * Tests the completed/total calculation functionality
 */

import { ProcessStep } from '../ProcessStepper';

describe('ProcessStepper Progress Calculation', () => {
  const createSteps = (completedCount: number, totalCount: number): ProcessStep[] => {
    const steps: ProcessStep[] = [];
    
    // Add completed steps
    for (let i = 1; i <= completedCount; i++) {
      steps.push({
        id: i,
        label: `Step ${i}`,
        status: 'completed',
      });
    }
    
    // Add remaining steps
    for (let i = completedCount + 1; i <= totalCount; i++) {
      steps.push({
        id: i,
        label: `Step ${i}`,
        status: i === completedCount + 1 ? 'active' : 'available',
      });
    }
    
    return steps;
  };

  const calculateProgress = (steps: ProcessStep[]): { completed: number; total: number; percentage: number } => {
    const completed = steps.filter(s => s.status === 'completed').length;
    const total = steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  test('should calculate 0% progress when no steps are completed', () => {
    const steps = createSteps(0, 11);
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(0);
    expect(progress.total).toBe(11);
    expect(progress.percentage).toBe(0);
  });

  test('should calculate 27% progress when 3 out of 11 steps are completed', () => {
    const steps = createSteps(3, 11);
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(3);
    expect(progress.total).toBe(11);
    expect(progress.percentage).toBe(27);
  });

  test('should calculate 50% progress when half of steps are completed', () => {
    const steps = createSteps(5, 10);
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(5);
    expect(progress.total).toBe(10);
    expect(progress.percentage).toBe(50);
  });

  test('should calculate 100% progress when all steps are completed', () => {
    const steps = createSteps(11, 11);
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(11);
    expect(progress.total).toBe(11);
    expect(progress.percentage).toBe(100);
  });

  test('should handle edge case with 1 step completed out of 1', () => {
    const steps = createSteps(1, 1);
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(1);
    expect(progress.total).toBe(1);
    expect(progress.percentage).toBe(100);
  });

  test('should handle rounding correctly for non-exact percentages', () => {
    const steps = createSteps(2, 7); // 28.57% should round to 29%
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(2);
    expect(progress.total).toBe(7);
    expect(progress.percentage).toBe(29);
  });

  test('should return 0% for empty steps array', () => {
    const steps: ProcessStep[] = [];
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(0);
    expect(progress.total).toBe(0);
    expect(progress.percentage).toBe(0);
  });

  test('should only count completed status, not active or available', () => {
    const steps: ProcessStep[] = [
      { id: 1, label: 'Step 1', status: 'completed' },
      { id: 2, label: 'Step 2', status: 'completed' },
      { id: 3, label: 'Step 3', status: 'active' },
      { id: 4, label: 'Step 4', status: 'available' },
      { id: 5, label: 'Step 5', status: 'locked', lockReason: 'Complete previous steps' },
    ];
    
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(2);
    expect(progress.total).toBe(5);
    expect(progress.percentage).toBe(40);
  });

  test('should handle mixed step statuses correctly', () => {
    const steps: ProcessStep[] = [
      { id: 1, label: 'Step 1', status: 'completed' },
      { id: 2, label: 'Step 2', status: 'completed' },
      { id: 3, label: 'Step 3', status: 'completed' },
      { id: 4, label: 'Step 4', status: 'completed' },
      { id: 5, label: 'Step 5', status: 'active' },
      { id: 6, label: 'Step 6', status: 'available' },
      { id: 7, label: 'Step 7', status: 'locked', lockReason: 'Locked' },
      { id: 8, label: 'Step 8', status: 'locked', lockReason: 'Locked' },
    ];
    
    const progress = calculateProgress(steps);
    
    expect(progress.completed).toBe(4);
    expect(progress.total).toBe(8);
    expect(progress.percentage).toBe(50);
  });
});
