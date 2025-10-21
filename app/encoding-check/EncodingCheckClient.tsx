'use client';
import React, { useEffect, useState } from 'react';

export default function EncodingCheckClient() {
  const [env, setEnv] = useState<any>({});
  const [api, setApi] = useState<any>(null);

  useEffect(() => {
    setEnv({
      characterSet: document.characterSet,
      dir: document.dir,
      lang: document.documentElement.lang,
      font: getComputedStyle(document.body).fontFamily,
      direction: getComputedStyle(document.body).direction,
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages?.join(', '),
    });
    fetch('/api/encoding-check')
      .then(r => r.json())
      .then(setApi);
  }, []);

  return (
    <section className="bg-gray-50 rounded p-4 mt-4">
      <h2 className="font-semibold mb-2">Runtime Environment</h2>
      <ul className="mb-2 text-sm">
        <li>
          <b>document.characterSet:</b> {env.characterSet}
        </li>
        <li>
          <b>document.dir:</b> {env.dir}
        </li>
        <li>
          <b>document.documentElement.lang:</b> {env.lang}
        </li>
        <li>
          <b>body font-family:</b> {env.font}
        </li>
        <li>
          <b>body direction:</b> {env.direction}
        </li>
        <li>
          <b>navigator.language:</b> {env.language}
        </li>
        <li>
          <b>navigator.languages:</b> {env.languages}
        </li>
        <li>
          <b>navigator.userAgent:</b> {env.userAgent}
        </li>
      </ul>
      <h2 className="font-semibold mb-2">API /api/encoding-check Response</h2>
      <pre className="bg-white border rounded p-2 overflow-x-auto text-xs">
        {api ? JSON.stringify(api, null, 2) : 'Loading...'}
      </pre>
    </section>
  );
}
