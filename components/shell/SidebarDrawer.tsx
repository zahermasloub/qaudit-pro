'use client';

import React from 'react';

type SidebarDrawerProps = {
  open: boolean;
  onClose: () => void;
  dir?: 'ltr' | 'rtl';
  children: React.ReactNode;
};

const clsx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export default function SidebarDrawer({ open, onClose, dir = 'ltr', children }: SidebarDrawerProps) {
  const anchor = dir === 'rtl' ? 'right-0' : 'left-0';
  const closedTransform = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';
  const openTransform = 'translate-x-0';

  return (
    <div
      className={['fixed inset-0 z-drawer transition', open ? 'pointer-events-auto' : 'pointer-events-none'].join(
        ' ',
      )}
      aria-hidden={!open}
    >
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/50 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          'absolute top-0 bottom-0 w-[82vw] max-w-[320px] bg-white border border-slate-200 shadow-xl transition-transform duration-200 ease-in-out',
          anchor,
          open ? openTransform : closedTransform,
        )}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
