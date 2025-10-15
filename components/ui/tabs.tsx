'use client';

import { createContext, type ReactNode, useContext, useId, useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

type TabsContextValue = {
  idPrefix: string;
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = createContext<TabsContextValue | null>(null);

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export function Tabs({ defaultValue, children, className }: TabsProps) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();
  const contextValue = useMemo<TabsContextValue>(
    () => ({
      idPrefix: id,
      value,
      setValue,
    }),
    [id, setValue, value],
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = {
  children: ReactNode;
  className?: string;
};

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1',
        className,
      )}
      role="tablist"
    >
      {children}
    </div>
  );
}

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const context = useTabsContext();
  const isActive = context.value === value;

  return (
    <button
      type="button"
      className={cn(
        'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
        isActive
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-600 hover:bg-white/80 hover:text-slate-900',
        className,
      )}
      role="tab"
      aria-selected={isActive}
      aria-controls={contentId(context.idPrefix, value)}
      onClick={() => context.setValue(value)}
    >
      {children}
    </button>
  );
}

type TabsContentProps = {
  value: string;
  children: ReactNode;
  className?: string;
};

export function TabsContent({ value, children, className }: TabsContentProps) {
  const context = useTabsContext();
  const isActive = context.value === value;
  return (
    <div
      id={contentId(context.idPrefix, value)}
      role="tabpanel"
      hidden={!isActive}
      className={cn(!isActive && 'hidden', className)}
    >
      {children}
    </div>
  );
}

function contentId(prefix: string, value: string) {
  return `${prefix}-${value}`;
}

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used inside <Tabs>');
  }
  return context;
}
