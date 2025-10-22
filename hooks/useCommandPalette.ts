'use client';

import { useEffect, useState } from 'react';

/**
 * useCommandPalette Hook
 * Hook لإدارة حالة Command Palette والاستماع للـ keyboard shortcuts
 *
 * @example
 * ```tsx
 * const { isOpen, openPalette, closePalette } = useCommandPalette();
 *
 * return (
 *   <CommandPalette
 *     open={isOpen}
 *     onClose={closePalette}
 *     actions={actions}
 *   />
 * );
 * ```
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const openPalette = () => setIsOpen(true);
  const closePalette = () => setIsOpen(false);
  const togglePalette = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    openPalette,
    closePalette,
    togglePalette,
  };
}
