import { useMemo } from 'react';

export function useVirtualSwitch(total: number, threshold = 2000) {
  return useMemo(() => total > threshold, [total, threshold]);
}
