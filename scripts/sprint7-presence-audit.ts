import fs from 'fs';
import path from 'path';

type Check = { label: string; exists: boolean; hint?: string };
type Find = { label: string; ok: boolean; hint?: string };

const root = process.cwd();
const p = (...x: string[]) => path.resolve(root, ...x);
const exists = (...x: string[]) => fs.existsSync(p(...x));
const read = (...x: string[]) => {
  const f = p(...x);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
};

function mdRow(k: string, v: string) {
  return `| ${k} | ${v} |`;
}
function hr() {
  return '-'.repeat(60);
}

const filesPresence: Check[] = [
  {
    label: 'Zod: run.schema.ts',
    exists: exists('features', 'fieldwork', 'run', 'run.schema.ts'),
    hint: 'أنشئ features/fieldwork/run/run.schema.ts',
  },
  {
    label: 'Zod: evidence.schema.ts',
    exists: exists('features', 'evidence', 'evidence.schema.ts'),
    hint: 'أنشئ features/evidence/evidence.schema.ts',
  },

  {
    label: 'API: /api/fieldwork/runs',
    exists: exists('app', 'api', 'fieldwork', 'runs', 'route.ts'),
    hint: 'أنشئ app/api/fieldwork/runs/route.ts',
  },
  {
    label: 'API: /api/evidence/upload',
    exists: exists('app', 'api', 'evidence', 'upload', 'route.ts'),
    hint: 'أنشئ app/api/evidence/upload/route.ts',
  },
  {
    label: 'API: /api/evidence/[id]/download',
    exists: exists('app', 'api', 'evidence', '[id]', 'download', 'route.ts'),
    hint: 'أنشئ app/api/evidence/[id]/download/route.ts',
  },

  {
    label: 'Helper: lib/storage.ts',
    exists: exists('lib', 'storage.ts'),
    hint: 'أنشئ lib/storage.ts (حفظ محلي + SHA256)',
  },
  {
    label: 'Helper: lib/storage-s3.ts (اختياري)',
    exists: exists('lib', 'storage-s3.ts'),
    hint: 'أنشئ lib/storage-s3.ts لو كان S3',
  },

  {
    label: 'AppShell موجود',
    exists: exists('app', '(app)', 'shell', 'AppShell.tsx'),
    hint: 'أنشئ app/(app)/shell/AppShell.tsx',
  },
  {
    label: 'E2E: scripts/sprint7-e2e.test.ts',
    exists: exists('scripts', 'sprint7-e2e.test.ts'),
    hint: 'أنشئ scripts/sprint7-e2e.test.ts',
  },

  {
    label: '.env.local موجود',
    exists: exists('.env.local'),
    hint: 'انسخ من .env.example ثم حدّث المتغيرات',
  },
];

const envFinds: Find[] = (() => {
  const env = read('.env.local');
  return [
    {
      label: 'STORAGE_PROVIDER',
      ok: /(^|\n)\s*STORAGE_PROVIDER\s*=/.test(env),
      hint: 'أضِف STORAGE_PROVIDER=local أو s3',
    },
    {
      label: 'UPLOAD_DIR (عند local)',
      ok: /(^|\n)\s*UPLOAD_DIR\s*=/.test(env) || /STORAGE_PROVIDER\s*=\s*s3/i.test(env),
      hint: 'أضِف UPLOAD_DIR=./uploads للرفع المحلي',
    },
    {
      label: 'AWS vars (عند s3)',
      ok: /STORAGE_PROVIDER\s*=\s*s3/i.test(env)
        ? /AWS_ACCESS_KEY_ID|AWS_SECRET_ACCESS_KEY|AWS_REGION|S3_BUCKET/.test(env)
        : true,
      hint: 'أكمل AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/AWS_REGION/S3_BUCKET',
    },
  ];
})();

const prismaChecks: Find[] = (() => {
  const schema = read('prisma', 'schema.prisma');
  return [
    {
      label: 'Model Evidence موجود',
      ok: /model\s+Evidence\s+\{/.test(schema),
      hint: 'أضِف model Evidence إلى schema.prisma',
    },
    {
      label: 'Evidence: storageKey/fileHash/mimeType',
      ok: /storageKey|fileHash|mimeType/.test(schema),
      hint: 'أضِف الحقول الأساسية لميتاداتا الملفات',
    },
    {
      label: 'Evidence: virusScanStatus/ocrTextUrl',
      ok: /virusScanStatus|ocrTextUrl/.test(schema),
      hint: 'أضِف virusScanStatus و ocrTextUrl (Sprint 7.5)',
    },
    {
      label: 'Model TestRun موجود',
      ok: /model\s+TestRun\s+\{/.test(schema),
      hint: 'أضِف model TestRun إلى schema.prisma',
    },
  ];
})();

const appShellFinds: Find[] = (() => {
  const sh = read('app', '(app)', 'shell', 'AppShell.tsx');
  return [
    {
      label: 'استدعاء RunForm أو ما يكافئه',
      ok: /RunForm/i.test(sh),
      hint: 'ضمّن <RunForm .../> في AppShell',
    },
    {
      label: 'استدعاء EvidenceForm أو ما يكافئه',
      ok: /EvidenceForm/i.test(sh),
      hint: 'ضمّن <EvidenceForm .../> في AppShell',
    },
    {
      label: 'حالات فتح Dialogs',
      ok: /useState[\s\S]*openRun|useState[\s\S]*openEv/.test(sh),
      hint: 'أضِف setOpenRun/setOpenEv',
    },
  ];
})();

const s75Optional: Check[] = [
  { label: 'lib/av.ts (اختياري)', exists: exists('lib', 'av.ts') },
  { label: 'lib/ocr.ts (اختياري)', exists: exists('lib', 'ocr.ts') },
  { label: 'lib/queue.ts (اختياري)', exists: exists('lib', 'queue.ts') },
  {
    label: 'workers/evidence.worker.ts (اختياري)',
    exists: exists('workers', 'evidence.worker.ts'),
  },
  {
    label: 'API presign (اختياري)',
    exists: exists('app', 'api', 'evidence', '[id]', 'presign', 'route.ts'),
  },
];

function render() {
  const lines: string[] = [];
  lines.push(`# Sprint 7/7.5 — Presence Audit Report`);
  lines.push(`Date: ${new Date().toISOString()}`);
  lines.push(hr());
  lines.push(`## وجود الملفات الأساسية`);
  lines.push(`| Item | Exists |`);
  lines.push(`|---|---|`);
  filesPresence.forEach(c => lines.push(mdRow(c.label, c.exists ? '✅' : '❌')));
  lines.push('');

  lines.push(`## متغيرات البيئة (.env.local)`);
  lines.push(`| Var | OK |`);
  lines.push(`|---|---|`);
  envFinds.forEach(f => lines.push(mdRow(f.label, f.ok ? '✅' : '❌')));
  lines.push('');

  lines.push(`## Prisma schema`);
  lines.push(`| Check | OK |`);
  lines.push(`|---|---|`);
  prismaChecks.forEach(f => lines.push(mdRow(f.label, f.ok ? '✅' : '❌')));
  lines.push('');

  lines.push(`## AppShell`);
  lines.push(`| Check | OK |`);
  lines.push(`|---|---|`);
  appShellFinds.forEach(f => lines.push(mdRow(f.label, f.ok ? '✅' : '❌')));
  lines.push('');

  lines.push(`## Sprint 7.5 (اختياري)`);
  lines.push(`| Item | Exists |`);
  lines.push(`|---|---|`);
  s75Optional.forEach(c => lines.push(mdRow(c.label, c.exists ? '🟡' : '—')));
  lines.push('');

  // نصائح سريعة
  const missing = [
    ...filesPresence.filter(x => !x.exists).map(x => `- ${x.label}: ${x.hint || ''}`),
    ...envFinds.filter(x => !x.ok).map(x => `- ${x.label}: ${x.hint || ''}`),
    ...prismaChecks.filter(x => !x.ok).map(x => `- ${x.label}: ${x.hint || ''}`),
    ...appShellFinds.filter(x => !x.ok).map(x => `- ${x.label}: ${x.hint || ''}`),
  ];
  lines.push(`## توصيات الإصلاح`);
  lines.push(missing.length ? missing.join('\n') : 'لا توجد نواقص حرجة. ✅ جاهز للبرمبت الأصلي.');
  lines.push('');

  console.log(lines.join('\n'));
}

render();
