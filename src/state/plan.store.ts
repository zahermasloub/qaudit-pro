import { create } from 'zustand';

type Sort = { id: string; desc: boolean } | null;
export type ViewMode = 'table' | 'cards';

type PlanState = {
  sidebarCollapsed: boolean;
  view: ViewMode;
  pageIndex: number;
  pageSize: number;
  sort: Sort;
  filters: Record<string, unknown>;
  total: number;
  set: (state: Partial<PlanState>) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  sidebarCollapsed: false,
  view: 'table',
  pageIndex: 0,
  pageSize: 25,
  sort: null,
  filters: {},
  total: 0,
  set: (state) => set(state),
}));
