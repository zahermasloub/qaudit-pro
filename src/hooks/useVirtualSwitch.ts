import { useEffect, useState } from 'react';

/**
 * Hook to handle view switching between table and virtual modes
 * Automatically switches based on data size
 */
export function useVirtualSwitch(
  dataLength: number,
  threshold = 100,
  manualMode?: 'table' | 'virtual'
) {
  const [mode, setMode] = useState<'table' | 'virtual'>('table');

  useEffect(() => {
    if (manualMode) {
      setMode(manualMode);
      return;
    }

    // Auto-switch to virtual scrolling for large datasets
    if (dataLength > threshold) {
      setMode('virtual');
    } else {
      setMode('table');
    }
  }, [dataLength, threshold, manualMode]);

  return { mode, setMode };
}
