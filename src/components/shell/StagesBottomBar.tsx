'use client';

import * as Dialog from '@radix-ui/react-dialog';

export function StagesBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-white shadow lg:hidden z-40">
      <div className="flex gap-2 overflow-x-auto p-2">
        <Dialog.Root>
          <Dialog.Trigger className="px-3 py-1.5 rounded-lg bg-slate-100">
            تفاصيل المراحل
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/20" />
            <Dialog.Content className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4">
              <Dialog.Close className="mt-2">إغلاق</Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
