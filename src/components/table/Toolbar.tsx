import { Download } from 'lucide-react';

export function Toolbar() {
  return (
    <div className="sticky top-0 z-20 -mb-1 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="flex items-center gap-2 px-3 py-2">
        <input className="px-3 py-2 rounded-lg border w-64 max-w-full" placeholder="بحث..." />
        <button className="px-3 py-2 rounded-lg bg-slate-900 text-white">فلترة</button>
        <div className="ms-auto flex items-center gap-2">
          <button className="px-3 py-2 rounded-lg border flex items-center gap-2">
            <Download size={16} />
            تصدير
          </button>
        </div>
      </div>
    </div>
  );
}
