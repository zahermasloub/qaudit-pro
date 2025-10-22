'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

export interface UndoAction {
  id: string;
  type: 'delete' | 'update' | 'create';
  entityType: 'user' | 'role' | 'log' | 'attachment';
  entityId: string;
  data: any;
  timestamp: number;
  description: string;
}

interface UndoContextType {
  /**
   * تسجيل إجراء قابل للتراجع
   */
  registerAction: (action: Omit<UndoAction, 'id' | 'timestamp'>) => void;

  /**
   * التراجع عن آخر إجراء
   */
  undo: () => Promise<void>;

  /**
   * الحصول على آخر إجراء
   */
  getLastAction: () => UndoAction | null;

  /**
   * مسح سجل الإجراءات
   */
  clearHistory: () => void;
}

const UndoContext = createContext<UndoContextType | undefined>(undefined);

interface UndoProviderProps {
  children: ReactNode;
  /**
   * مدة عرض زر التراجع (بالمللي ثانية)
   * الافتراضي: 5000 (5 ثوان)
   */
  undoTimeout?: number;
}

/**
 * UndoProvider
 * Context Provider لإدارة إجراءات Undo/Redo
 *
 * يسمح للمستخدمين بالتراجع عن الإجراءات مثل الحذف والتحديث
 */
export function UndoProvider({ children, undoTimeout = 5000 }: UndoProviderProps) {
  const [actionHistory, setActionHistory] = useState<UndoAction[]>([]);
  const [activeToastId, setActiveToastId] = useState<string | number | null>(null);

  const registerAction = useCallback(
    (action: Omit<UndoAction, 'id' | 'timestamp'>) => {
      const undoAction: UndoAction = {
        ...action,
        id: `undo-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };

      setActionHistory(prev => [...prev, undoAction]);

      // عرض toast مع زر التراجع
      const toastId = toast.success(action.description, {
        duration: undoTimeout,
        action: {
          label: 'تراجع',
          onClick: async () => {
            await undo();
          },
        },
      });

      setActiveToastId(toastId);

      // إزالة الإجراء من التاريخ بعد انتهاء المهلة
      setTimeout(() => {
        setActionHistory(prev => prev.filter(a => a.id !== undoAction.id));
        if (activeToastId === toastId) {
          setActiveToastId(null);
        }
      }, undoTimeout);
    },
    [undoTimeout, activeToastId],
  );

  const undo = useCallback(async () => {
    if (actionHistory.length === 0) {
      toast.error('لا توجد إجراءات للتراجع عنها');
      return;
    }

    const lastAction = actionHistory[actionHistory.length - 1];

    try {
      // تنفيذ التراجع حسب نوع الإجراء
      if (lastAction.type === 'delete') {
        // استعادة العنصر المحذوف
        await restoreDeletedItem(lastAction);
      } else if (lastAction.type === 'update') {
        // استعادة القيم القديمة
        await restoreOldValues(lastAction);
      } else if (lastAction.type === 'create') {
        // حذف العنصر المنشأ
        await deleteCreatedItem(lastAction);
      }

      // إزالة الإجراء من التاريخ
      setActionHistory(prev => prev.filter(a => a.id !== lastAction.id));

      // إغلاق الـ toast النشط
      if (activeToastId) {
        toast.dismiss(activeToastId);
        setActiveToastId(null);
      }

      toast.success('تم التراجع بنجاح');
    } catch (error) {
      console.error('Error undoing action:', error);
      toast.error('فشل التراجع عن الإجراء');
    }
  }, [actionHistory, activeToastId]);

  const getLastAction = useCallback(() => {
    if (actionHistory.length === 0) return null;
    return actionHistory[actionHistory.length - 1];
  }, [actionHistory]);

  const clearHistory = useCallback(() => {
    setActionHistory([]);
    if (activeToastId) {
      toast.dismiss(activeToastId);
      setActiveToastId(null);
    }
  }, [activeToastId]);

  return (
    <UndoContext.Provider
      value={{
        registerAction,
        undo,
        getLastAction,
        clearHistory,
      }}
    >
      {children}
    </UndoContext.Provider>
  );
}

/**
 * useUndo Hook
 * للوصول إلى Undo context
 *
 * @example
 * ```tsx
 * const { registerAction, undo } = useUndo();
 *
 * // بعد حذف مستخدم
 * registerAction({
 *   type: 'delete',
 *   entityType: 'user',
 *   entityId: user.id,
 *   data: user,
 *   description: `تم حذف ${user.email}`,
 * });
 * ```
 */
export function useUndo() {
  const context = useContext(UndoContext);
  if (context === undefined) {
    throw new Error('useUndo must be used within UndoProvider');
  }
  return context;
}

// ==================== Helper Functions ====================

async function restoreDeletedItem(action: UndoAction) {
  const { entityType, entityId, data } = action;

  let endpoint = '';
  switch (entityType) {
    case 'user':
      endpoint = '/api/admin/users';
      break;
    case 'role':
      endpoint = '/api/admin/roles';
      break;
    case 'log':
      endpoint = '/api/admin/logs';
      break;
    case 'attachment':
      endpoint = '/api/admin/attachments';
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, restoredFromUndo: true }),
  });

  if (!response.ok) {
    throw new Error('Failed to restore item');
  }

  // إعادة تحميل الصفحة لتحديث البيانات
  window.location.reload();
}

async function restoreOldValues(action: UndoAction) {
  const { entityType, entityId, data } = action;

  let endpoint = '';
  switch (entityType) {
    case 'user':
      endpoint = `/api/admin/users/${entityId}`;
      break;
    case 'role':
      endpoint = `/api/admin/roles/${entityId}`;
      break;
    case 'log':
      endpoint = `/api/admin/logs/${entityId}`;
      break;
    case 'attachment':
      endpoint = `/api/admin/attachments/${entityId}`;
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to restore old values');
  }

  // إعادة تحميل الصفحة لتحديث البيانات
  window.location.reload();
}

async function deleteCreatedItem(action: UndoAction) {
  const { entityType, entityId } = action;

  let endpoint = '';
  switch (entityType) {
    case 'user':
      endpoint = `/api/admin/users/${entityId}`;
      break;
    case 'role':
      endpoint = `/api/admin/roles/${entityId}`;
      break;
    case 'log':
      endpoint = `/api/admin/logs/${entityId}`;
      break;
    case 'attachment':
      endpoint = `/api/admin/attachments/${entityId}`;
      break;
    default:
      throw new Error(`Unknown entity type: ${entityType}`);
  }

  const response = await fetch(endpoint, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete created item');
  }

  // إعادة تحميل الصفحة لتحديث البيانات
  window.location.reload();
}
