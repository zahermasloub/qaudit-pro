'use client';

import * as Drawer from '@radix-ui/react-drawer';

export function StagesBottomBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 bg-white shadow lg:hidden z-40">
      <div className="flex gap-2 overflow-x-auto p-2">
        <Drawer.Root>
          <Drawer.Trigger className="px-3 py-1.5 rounded-lg bg-slate-100">
            تفاصيل المراحل
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/20" />
            <Drawer.Content className="fixed inset-x-0 bottom-0 bg-white rounded-t-2xl p-4">
              <Drawer.Close className="mt-2">إغلاق</Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </div>
  );
}
