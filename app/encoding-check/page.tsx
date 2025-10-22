'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [info, setInfo] = useState<any>({});
  const [api, setApi] = useState<any>({});
  useEffect(() => {
    setInfo({
      charset: document.characterSet,
      lang: document.documentElement.lang,
      dir: document.documentElement.dir,
      ua: navigator.userAgent,
      navLang: navigator.language,
    });
    fetch('/api/encoding-check')
      .then(r => r.json())
      .then(setApi)
      .catch(e => setApi({ error: String(e) }));
  }, []);
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-bold">اختبار الترميز UTF-8</h1>
      <p>مرحبًا بكم في لوحة التدقيق الداخلي — هذا نص عربي لاختبار الحروف.</p>
      <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(info, null, 2)}</pre>
      <h2 className="font-semibold">API Response</h2>
      <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(api, null, 2)}</pre>
    </main>
  );
}
