'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = React.PropsWithChildren<{
  defaultValue: string;
  className?: string;
}>;

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={cn(className)}>{children}</div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div role="tablist" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const context = useTabsContext();
  const isActive = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabs-${value}`}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn('transition-colors focus-visible:outline-none', className)}
      onClick={() => context.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const context = useTabsContext();
  if (context.value !== value) {
    return null;
  }

  return (
    <div id={`tabs-${value}`} role="tabpanel" className={cn(className)} {...props}>
      {children}
    </div>
  );
}

function useTabsContext() {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used inside <Tabs>');
  }
  return context;
}
