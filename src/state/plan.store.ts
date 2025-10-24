import { create } from 'zustand';

type Sort = { id: string; desc: boolean } | null;
export type ViewMode = 'table' | 'cards';

type PlanState = {
  sidebarCollapsed: boolean;
  view: ViewMode;
  pageIndex: number;
  pageSize: number;
  sort: Sort;
  filters: Record<string, string>;
  selectedRows: Set<string>;
  
  // Actions
  toggleSidebar: () => void;
  setView: (view: ViewMode) => void;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setSort: (sort: Sort) => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  toggleRowSelection: (id: string) => void;
  clearSelection: () => void;
  selectAll: (ids: string[]) => void;
};

export const usePlanStore = create<PlanState>((set) => ({
  sidebarCollapsed: false,
  view: 'table',
  pageIndex: 0,
  pageSize: 20,
  sort: null,
  filters: {},
  selectedRows: new Set(),

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setView: (view) => set({ view }),
  
  setPageIndex: (pageIndex) => set({ pageIndex }),
  
  setPageSize: (pageSize) => set({ pageSize, pageIndex: 0 }),
  
  setSort: (sort) => set({ sort }),
  
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pageIndex: 0,
    })),
  
  clearFilters: () => set({ filters: {}, pageIndex: 0 }),
  
  toggleRowSelection: (id) =>
    set((state) => {
      const newSelection = new Set(state.selectedRows);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return { selectedRows: newSelection };
    }),
  
  clearSelection: () => set({ selectedRows: new Set() }),
  
  selectAll: (ids) => set({ selectedRows: new Set(ids) }),
}));
