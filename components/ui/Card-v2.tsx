import React from 'react';

import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl shadow-soft p-4 sm:p-6 bg-white border border-gray-200',
        className,
      )}
    >
      {children}
    </div>
  );
}
