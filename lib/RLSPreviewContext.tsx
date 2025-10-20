'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PreviewUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface RLSPreviewContextType {
  /**
   * حالة Preview Mode
   */
  isPreviewMode: boolean;

  /**
   * المستخدم المختار للمعاينة
   */
  previewUser: PreviewUser | null;

  /**
   * تفعيل Preview Mode مع مستخدم
   */
  enablePreview: (user: PreviewUser) => void;

  /**
   * إيقاف Preview Mode
   */
  disablePreview: () => void;

  /**
   * التبديل بين Preview Mode
   */
  togglePreview: () => void;
}

const RLSPreviewContext = createContext<RLSPreviewContextType | undefined>(undefined);

interface RLSPreviewProviderProps {
  children: ReactNode;
}

/**
 * RLSPreviewProvider
 * Context Provider لإدارة حالة RLS Preview Mode
 *
 * يسمح للمسؤولين بمعاينة البيانات كما يراها مستخدم آخر
 * للتحقق من صحة Row-Level Security policies
 */
export function RLSPreviewProvider({ children }: RLSPreviewProviderProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewUser, setPreviewUser] = useState<PreviewUser | null>(null);

  const enablePreview = useCallback((user: PreviewUser) => {
    setPreviewUser(user);
    setIsPreviewMode(true);
  }, []);

  const disablePreview = useCallback(() => {
    setIsPreviewMode(false);
    setPreviewUser(null);
  }, []);

  const togglePreview = useCallback(() => {
    if (isPreviewMode) {
      disablePreview();
    }
  }, [isPreviewMode, disablePreview]);

  return (
    <RLSPreviewContext.Provider
      value={{
        isPreviewMode,
        previewUser,
        enablePreview,
        disablePreview,
        togglePreview,
      }}
    >
      {children}
    </RLSPreviewContext.Provider>
  );
}

/**
 * useRLSPreview Hook
 * للوصول إلى RLS Preview context
 *
 * @example
 * ```tsx
 * const { isPreviewMode, previewUser, enablePreview } = useRLSPreview();
 * ```
 */
export function useRLSPreview() {
  const context = useContext(RLSPreviewContext);
  if (context === undefined) {
    throw new Error('useRLSPreview must be used within RLSPreviewProvider');
  }
  return context;
}
