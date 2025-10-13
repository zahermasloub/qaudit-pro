"use client";
import { useMemo, useState, useEffect } from "react";
import { Download, Trash2 } from "lucide-react";

function formatSize(n:number|undefined){
  if(!n && n!==0) return "—";
  const kb = n/1024, mb = kb/1024;
  if(mb>=1) return `${mb.toFixed(2)} MB`;
  return `${Math.ceil(kb)} KB`;
}

function Badge({text, tone}:{text:string, tone:"ok"|"warn"|"bad"|"info"}){
  const map:any = { ok:"bg-green-100 text-green-700", warn:"bg-yellow-100 text-yellow-700", bad:"bg-red-100 text-red-700", info:"bg-blue-100 text-blue-700" };
  return <span className={`px-2 py-0.5 rounded-md text-xs ${map[tone]}`}>{text}</span>;
}

export default function EvidenceTable({ engagementId }:{engagementId:string}) {
  const [status, setStatus] = useState<string>("");
  const [q, setQ] = useState<string>("");

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleDownload(row: any) {
    try {
      if (row.storage === "local") {
        window.open(`/api/evidence/${row.id}/download`, "_blank");
        return;
      }
      const r = await fetch(`/api/evidence/${row.id}/presign`);
      const j = await r.json().catch(() => ({}));
      if (j?.ok && j.url) window.open(j.url, "_blank");
      else alert("تعذّر إنشاء رابط التنزيل.");
    } catch { alert("فشل التنزيل."); }
  }

  async function handleDelete(row: any) {
    const yes = window.confirm("هل تريد حذف هذا الدليل نهائيًا؟");
    if (!yes) return;
    try {
      const r = await fetch(`/api/evidence/${row.id}`, { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j?.ok) refetch(); else alert(j?.error || "فشل الحذف");
    } catch { alert("فشل الحذف."); }
  }

  const url = useMemo(()=>{
    const p = new URLSearchParams();
    if(engagementId) p.set("engagementId", engagementId);
    if(status) p.set("status", status);
    if(q) p.set("q", q);
    return `/api/evidence/list?${p.toString()}`;
  }, [engagementId, status, q]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(url);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching evidence data:', error);
        setData({ data: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [url]);

  const refetch = () => {
    const p = new URLSearchParams();
    if(engagementId) p.set("engagementId", engagementId);
    if(status) p.set("status", status);
    if(q) p.set("q", q);
    const newUrl = `/api/evidence/list?${p.toString()}`;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(newUrl);
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching evidence data:', error);
        setData({ data: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  };

  const rows = data?.data || [];

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-3 py-2 text-sm"
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
            aria-label="فلتر الحالة"
          >
            <option value="">{`الحالة: الكل`}</option>
            <option value="pending">قيد الفحص (pending)</option>
            <option value="clean">نظيف (clean)</option>
            <option value="suspected">مشتبه (suspected)</option>
            <option value="blocked">محجوب (blocked)</option>
          </select>
          <input
            placeholder="بحث (الاسم/الفئة)…"
            className="border rounded-md px-3 py-2 text-sm"
            value={q}
            onChange={(e)=>setQ(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>refetch()} className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50">
            تحديث
          </button>
          <span className="text-xs text-gray-500">النتائج: {rows.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap relative w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border bg-white scroll-shadow-x">
        <table className="min-w-full table-fixed text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-right [&>th]:font-semibold">
              <th>المعرف</th>
              <th>الفئة</th>
              <th>الاسم</th>
              <th>النوع</th>
              <th>الحجم</th>
              <th>AV</th>
              <th>OCR</th>
              <th>التخزين</th>
              <th>تاريخ الرفع</th>
              <th className="w-[120px]">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
            {isLoading && (
              <tr><td colSpan={10} className="text-center text-gray-500 py-6">...تحميل</td></tr>
            )}
            {!isLoading && rows.length===0 && (
              <tr><td colSpan={10} className="text-center text-gray-500 py-6">لا توجد أدلة مطابقة</td></tr>
            )}
            {rows.map((r:any)=>(
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="font-mono text-xs">{r.id}</td>
                <td className="break-anywhere">{r.category || "—"}</td>
                <td className="max-w-[220px] truncate break-anywhere" title={r.fileName}>{r.fileName}</td>
                <td className="text-gray-600 break-anywhere">{r.mimeType || "—"}</td>
                <td>{formatSize(r.fileSize)}</td>
                <td>
                  <div className="badge-nowrap">
                    {r.virusScanStatus==="clean" && <Badge text="clean" tone="ok" />}
                    {r.virusScanStatus==="pending" && <Badge text="pending" tone="warn" />}
                    {r.virusScanStatus==="suspected" && <Badge text="suspected" tone="bad" />}
                    {r.virusScanStatus==="blocked" && <Badge text="blocked" tone="bad" />}
                  </div>
                </td>
                <td className="badge-nowrap">{r.ocrTextUrl ? <Badge text="✓" tone="info" /> : "—"}</td>
                <td className="uppercase badge-nowrap">{r.storage}</td>
                <td>{new Date(r.uploadedAt).toLocaleString("ar")}</td>
                <td>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(r)}
                      title="تنزيل"
                      aria-label="تنزيل"
                      className="p-1.5 rounded-md border hover:bg-gray-50"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      title="حذف"
                      aria-label="حذف"
                      className="p-1.5 rounded-md border hover:bg-red-50 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
