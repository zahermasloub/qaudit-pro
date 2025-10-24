/**
 * StageDrawer - Drawer component for stage details
 * Uses Radix Dialog as a drawer alternative
 */

'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';

type StageDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  locale?: 'ar' | 'en';
};

export function StageDrawer({
  open,
  onOpenChange,
  title,
  children,
  locale = 'ar',
}: StageDrawerProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
              />
            </Dialog.Overlay>

            {/* Drawer Content */}
            <Dialog.Content asChild>
              <motion.div
                initial={{ x: locale === 'ar' ? '100%' : '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: locale === 'ar' ? '100%' : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className={`fixed top-0 ${
                  locale === 'ar' ? 'left-0' : 'right-0'
                } h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col`}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <Dialog.Title className="text-lg font-bold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <Dialog.Close asChild>
                    <button
                      className="p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={locale === 'ar' ? 'إغلاق' : 'Close'}
                    >
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </Dialog.Close>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">{children}</div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
