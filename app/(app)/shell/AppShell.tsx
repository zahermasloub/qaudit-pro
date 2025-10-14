// QAudit Pro — AppShell + Forms (React Hook Form + Zod) wired to Prisma APIs
// ---------------------------------------------------------------------
// This single canvas file shows a CLEAN CODE structure inlined using
// virtual file separators so your team can copy each block to its path.
// It includes:
// 1) app/(app)/shell/AppShell.tsx  → AppShell with RTL/LTR, RBAC, numbered menu
// 2) components/ui/*     → Reusable FormDialog and form inputs
// 3) features/*          → Feature forms (Engagement Mandate, PBC)
// 4) lib/i18n.ts, lib/rbac.ts, lib/api.ts
// 5) app/api/*           → Route Handlers (POST/GET) backed by Prisma
// 6) prisma/schema.prisma + lib/prisma.ts
// 7) package.json scripts (dev, build, lint, db:push)
// Copy each block to its file path in your Next.js 14 (App Router) repo.

// ========================= FILE: package.json =========================
/*
{
  "name": "qaudit-pro",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start -p 3000",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "tailwindcss-rtl": "^0.9.0",
    "lucide-react": "^0.453.0",
    "zod": "^3.23.8",
    "react-hook-form": "^7.52.0",
    "@hookform/resolvers": "^3.9.0",
    "@prisma/client": "5.19.0"
  },
  "devDependencies": {
    "typescript": "5.4.2",
    "eslint": "8.57.0",
    "eslint-config-next": "14.2.5",
    "prisma": "5.19.0",
    "tailwindcss": "3.4.10",
    "postcss": "8.4.31",
    "autoprefixer": "10.4.17"
  }
}
*/

// ========================= FILE: prisma/schema.prisma =================
/*
// run: npx prisma init (then replace schema) → npm run db:push
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql" // or mysql/sqlite
  url      = env("DATABASE_URL")
}

model Engagement {
  id           String   @id @default(cuid())
  code         String   @unique
  title        String
  objective    String
  scopeJson    Json
  criteriaJson Json
  constraintsJson Json
  auditeeUnitsJson Json
  stakeholdersJson Json
  startDate    DateTime
  endDate      DateTime
  budgetHours  Int
  independenceDisclosureUrl String?
  status       String   @default("planned")
  createdBy    String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  plans        Plan[]
  pbcRequests  PBCRequest[]
}

model Plan {
  id           String   @id @default(cuid())
  engagementId String
  engagement   Engagement @relation(fields: [engagementId], references: [id])
  timelineJson Json
  milestonesJson Json
  communicationCadence String
  dataStrategyJson Json
  raciJson     Json
}

model PBCRequest {
  id           String   @id @default(cuid())
  engagementId String
  engagement   Engagement @relation(fields: [engagementId], references: [id])
  code         String
  description  String
  ownerId      String
  dueDate      DateTime
  status       String   @default("open")
  attachmentsJson Json
  notes        String?
  createdAt    DateTime @default(now())
}
*/

// ========================= FILE: lib/prisma.ts =======================
/*
import { PrismaClient } from "@prisma/client";
export const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") (globalThis as any).prisma = prisma;
*/

// ========================= FILE: lib/api.ts ==========================
/*
export async function apiPost(url: string, data: any) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
*/

// ========================= FILE: lib/i18n.ts =========================
/* export const I18N = { ... }  // moved into AppShell.tsx below for brevity */

// ========================= FILE: lib/rbac.ts =========================
/* export const RBAC = { ... }  // moved into AppShell.tsx below for brevity */

// ========================= FILE: app/api/engagements/route-v2.ts ========
/*
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { engagementMandateSchema } from "@/features/planning/engagement.schema";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = engagementMandateSchema.parse(json);
  const eng = await prisma.engagement.create({ data: {
    code: parsed.engagement_code,
    title: parsed.title,
    objective: parsed.objective,
    scopeJson: parsed.scope,
    criteriaJson: parsed.criteria,
    constraintsJson: parsed.constraints,
    auditeeUnitsJson: parsed.auditee_units,
    stakeholdersJson: parsed.stakeholders,
    startDate: new Date(parsed.start_date),
    endDate: new Date(parsed.end_date),
    budgetHours: parsed.budget_hours,
    independenceDisclosureUrl: parsed.independence_disclosure_url ?? null,
    createdBy: parsed.created_by,
  }});
  return NextResponse.json(eng);
}
*/

// ========================= FILE: app/api/pbc/route-v2.ts ===============
/*
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { pbcSchema } from "@/features/planning/pbc.schema";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = pbcSchema.parse(json);
  const pbc = await prisma.pBCRequest.create({ data: {
    engagementId: parsed.engagement_id,
    code: parsed.pbc_code,
    description: parsed.description,
    ownerId: parsed.owner_id,
    dueDate: new Date(parsed.due_date),
    status: parsed.status,
    attachmentsJson: parsed.attachments ?? [],
    notes: parsed.notes ?? null,
  }});
  return NextResponse.json(pbc);
}
*/

// ========================= FILE: features/planning/engagement.schema.ts
/*
import { z } from "zod";
export const engagementMandateSchema = z.object({
  engagement_code: z.string().min(3),
  title: z.string().min(3),
  objective: z.string().min(5),
  scope: z.array(z.string()).default([]),
  criteria: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  auditee_units: z.array(z.string()).default([]),
  stakeholders: z.array(z.string()).default([]),
  start_date: z.string(),
  end_date: z.string(),
  budget_hours: z.number().int().nonnegative(),
  independence_disclosure_url: z.string().url().optional(),
  created_by: z.string().email(),
});
export type EngagementMandateInput = z.infer<typeof engagementMandateSchema>;
*/

// ========================= FILE: features/planning/pbc.schema.ts =====
/*
import { z } from "zod";
export const pbcSchema = z.object({
  engagement_id: z.string().min(1),
  pbc_code: z.string().min(1),
  description: z.string().min(3),
  owner_id: z.string().min(1),
  due_date: z.string(),
  status: z.enum(["open","partial","complete"]).default("open"),
  attachments: z.array(z.any()).optional(),
  notes: z.string().optional(),
});
export type PBCInput = z.infer<typeof pbcSchema>;
*/

// ========================= FILE: components/ui/FormDialog.tsx ========
/*
'use client';
import React from 'react';

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: ()=>void; title: string; children: React.ReactNode; }){
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode; }){
  return (
    <label className="block mb-3">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}
*/

// ========================= FILE: features/planning/EngagementForm.tsx
/*
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { engagementMandateSchema, type EngagementMandateInput } from './engagement.schema';
import { Dialog, Field } from '@/components/ui/FormDialog';
import { apiPost } from '@/lib/api';

export function EngagementForm({ onCreated }: { onCreated: (id: string)=>void }){
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<EngagementMandateInput>({
    resolver: zodResolver(engagementMandateSchema),
    defaultValues: {
      engagement_code: 'IA-2025-001',
      title: '', objective: '', scope: [], criteria: [], constraints: [],
      auditee_units: [], stakeholders: [], start_date: '', end_date: '', budget_hours: 40,
      created_by: 'lead@gov.sa'
    }
  });

  async function onSubmit(values: EngagementMandateInput){
    const res = await apiPost('/api/engagements', values);
    reset(); setOpen(false); onCreated(res.id);
  }

  return (
    <>
      <button className="rounded-xl bg-blue-600 text-white text-sm px-3 py-2" onClick={()=>setOpen(true)}>إنشاء خطة / Mandate</button>
      <Dialog open={open} onClose={()=>setOpen(false)} title="Engagement Mandate">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Code">
            <input {...register('engagement_code')} className="w-full rounded-lg border px-3 py-2" />
            {errors.engagement_code && <span className="text-xs text-red-600">{errors.engagement_code.message}</span>}
          </Field>
          <Field label="Title">
            <input {...register('title')} className="w-full rounded-lg border px-3 py-2" />
          </Field>
          <Field label="Objective"><textarea {...register('objective')} className="w-full rounded-lg border px-3 py-2" /></Field>
          <Field label="Scope (comma)"><input {...register('scope',{ setValueAs:v=>String(v).split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Criteria (comma)"><input {...register('criteria',{ setValueAs:v=>String(v).split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Constraints (comma)"><input {...register('constraints',{ setValueAs:v=>String(v).split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Auditee Units (comma)"><input {...register('auditee_units',{ setValueAs:v=>String(v).split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Stakeholders (comma)"><input {...register('stakeholders',{ setValueAs:v=>String(v).split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Start Date"><input type="date" {...register('start_date')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="End Date"><input type="date" {...register('end_date')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Budget Hours"><input type="number" {...register('budget_hours',{ valueAsNumber:true })} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Independence URL"><input {...register('independence_disclosure_url')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Created By (email)"><input {...register('created_by')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={()=>setOpen(false)} className="rounded-lg border px-3 py-2">Cancel</button>
            <button disabled={isSubmitting} className="rounded-lg bg-blue-600 text-white px-3 py-2">{isSubmitting? 'Saving…':'Save'}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
*/

// ========================= FILE: features/planning/PBCForm.tsx =======
/*
'use client';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pbcSchema, type PBCInput } from './pbc.schema';
import { Dialog, Field } from '@/components/ui/FormDialog';
import { apiPost } from '@/lib/api';

export function PBCForm({ engagementId, onCreated }: { engagementId: string; onCreated: (id: string)=>void }){
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PBCInput>({
    resolver: zodResolver(pbcSchema),
    defaultValues: { engagement_id: engagementId, pbc_code: 'PBC-001', description:'', owner_id:'', due_date:'', status:'open' }
  });
  async function onSubmit(values: PBCInput){
    const res = await apiPost('/api/pbc', values);
    reset(); setOpen(false); onCreated(res.id);
  }
  return (
    <>
      <button className="rounded-xl bg-blue-600 text-white text-sm px-3 py-2" onClick={()=>setOpen(true)}>طلب PBC</button>
      <Dialog open={open} onClose={()=>setOpen(false)} title="PBC Request">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="PBC Code"><input {...register('pbc_code')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Owner ID"><input {...register('owner_id')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Description"><textarea {...register('description')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Due Date"><input type="date" {...register('due_date')} className="w-full rounded-lg border px-3 py-2"/></Field>
          <Field label="Status">
            <select {...register('status')} className="w-full rounded-lg border px-3 py-2">
              <option value="open">open</option><option value="partial">partial</option><option value="complete">complete</option>
            </select>
          </Field>
          <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
            <button type="button" onClick={()=>setOpen(false)} className="rounded-lg border px-3 py-2">Cancel</button>
            <button disabled={isSubmitting} className="rounded-lg bg-blue-600 text-white px-3 py-2">{isSubmitting? 'Saving…':'Save'}</button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
*/

// ========================= FILE: app/(app)/shell/AppShell.tsx =========
'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertTriangle,
  BadgeCheck,
  BookCheck,
  ClipboardList,
  Database,
  FileCheck,
  FileText,
  FlaskConical,
  LayoutDashboard,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

import { ToastProvider } from '@/components/ui/Toast-v2';
import AnnualPlanForm from '@/features/annual-plan/annual-plan.form';
import EvidenceForm from '@/features/evidence/evidence.form';
import EvidenceUploaderForm from '@/features/evidence/forms/EvidenceUploader.form';
import TestExecutionForm from '@/features/fieldwork/forms/TestExecution.form';
import RunForm from '@/features/fieldwork/run/run.form';
import { EngagementForm } from '@/features/planning/engagement/Engagement.form-v2';
import PBCForm from '@/features/planning/pbc/Pbc.form-v2';
import SamplingForm from '@/features/program/sampling/Sampling.form-v2';
import TestForm from '@/features/program/tests/Test.form-v2';
import { type Locale, useI18n } from '@/lib/i18n';
import { canSeeAdmin } from '@/lib/rbac';

import DashboardView from './DashboardView';
import {
  AnnualPlanScreen,
  FieldworkScreen,
  PlanningScreen,
  ProcessRiskScreen,
  ProgramScreen,
} from './ScreenComponents';

const clsx = (...xs: Array<string | false | null | undefined>) => xs.filter(Boolean).join(' ');

type Route =
  | 'login'
  | 'register'
  | 'dashboard'
  | 'annualPlan'
  | 'planning'
  | 'processRisk'
  | 'program'
  | 'fieldwork'
  | 'agile'
  | 'findings'
  | 'reporting'
  | 'followup'
  | 'closeout'
  | 'qa';
type Role = 'IA_Manager' | 'IA_Lead' | 'IA_Auditor' | 'Process_Owner' | 'Viewer';

const RBAC: Record<Route, Role[]> = {
  login: ['IA_Manager', 'IA_Lead', 'IA_Auditor', 'Process_Owner', 'Viewer'],
  register: ['IA_Manager', 'IA_Lead', 'IA_Auditor', 'Process_Owner', 'Viewer'],
  dashboard: ['IA_Manager', 'IA_Lead', 'IA_Auditor', 'Process_Owner', 'Viewer'],
  annualPlan: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  planning: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  processRisk: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  program: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  fieldwork: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  agile: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  findings: ['IA_Manager', 'IA_Lead', 'IA_Auditor'],
  reporting: ['IA_Manager', 'IA_Lead'],
  followup: ['IA_Manager', 'IA_Lead', 'Process_Owner'],
  closeout: ['IA_Manager', 'IA_Lead'],
  qa: ['IA_Manager', 'IA_Lead'],
};

// Toolbar configurations by route
const TOOLBARS: Record<
  Route,
  { action: string; roles: Role[]; variant?: 'primary' | 'secondary' }[]
> = {
  dashboard: [
    { action: 'newEng', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' },
    { action: 'exportCSV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    {
      action: 'refresh',
      roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor', 'Process_Owner', 'Viewer'],
    },
  ],
  annualPlan: [
    { action: 'createAnnualPlan', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' },
    { action: 'addAuditTask', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'importCSV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'exportCSV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
  ],
  planning: [
    { action: 'createPlan', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' },
    { action: 'newPBC', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'importCSV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'exportCSV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
  ],
  processRisk: [
    { action: 'addRisk', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'], variant: 'primary' },
    { action: 'addControl', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'linkTest', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
  ],
  program: [
    { action: 'newTest', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'], variant: 'primary' },
    { action: 'drawSample', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'importPopulation', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
  ],
  fieldwork: [
    { action: 'uploadEv', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'], variant: 'primary' },
    { action: 'runTest', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'scanAV', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
    { action: 'linkTo', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'] },
  ],
  agile: [
    { action: 'addTask', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'], variant: 'primary' },
    { action: 'assignOwner', roles: ['IA_Manager', 'IA_Lead'] },
  ],
  findings: [
    { action: 'newFinding', roles: ['IA_Manager', 'IA_Lead', 'IA_Auditor'], variant: 'primary' },
    { action: 'genCCER', roles: ['IA_Manager', 'IA_Lead'] },
  ],
  reporting: [
    { action: 'preview', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' },
    { action: 'exportPDF', roles: ['IA_Manager', 'IA_Lead'] },
    { action: 'sendSign', roles: ['IA_Manager'] },
  ],
  followup: [
    { action: 'newCheck', roles: ['IA_Manager', 'IA_Lead', 'Process_Owner'], variant: 'primary' },
    { action: 'remindOwners', roles: ['IA_Manager', 'IA_Lead'] },
    { action: 'followReport', roles: ['IA_Manager', 'IA_Lead'] },
  ],
  closeout: [{ action: 'closeFile', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' }],
  qa: [{ action: 'qaReview', roles: ['IA_Manager', 'IA_Lead'], variant: 'primary' }],
  login: [],
  register: [],
};

function canAccess(route: Route, role: Role): boolean {
  return RBAC[route]?.includes(role) || false;
}

function Topbar({
  locale,
  setLocale,
  onLogout,
  role,
  route,
  onToolbarAction,
  showAdminLink,
  onAdminNavigate,
  onOpenSidebar,
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  onLogout: () => void;
  role: Role;
  route: Route;
  onToolbarAction: (action: string) => void;
  showAdminLink: boolean;
  onAdminNavigate: () => void;
  onOpenSidebar: () => void;
}) {
  const i18n = useI18n(locale);
  const toolbarActions = TOOLBARS[route]?.filter(tool => tool.roles.includes(role)) || [];

  return (
    <header className="header-dark sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-sm">
      <div className="container-shell">
        <div className="flex items-center justify-between h-12">
          {/* Mobile Sidebar Button + العنوان/اللوجو */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Open sidebar"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20"
              onClick={onOpenSidebar}
            >
              <span className="text-xl leading-none">☰</span>
            </button>
            <h1 className="text-sm font-semibold tracking-wide text-white select-none">
              {i18n.app.title}
              <span className="text-xs text-white/70 mx-2">•</span>
              <span className="text-sm text-white/90">
                {(i18n.sections as any)[route] || route}
              </span>
              <span className="text-xs text-white/70 ml-2 hidden sm:inline">
                ({role.replace('_', ' ')})
              </span>
            </h1>
          </div>

          {/* Toolbar Actions */}
          {toolbarActions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto max-w-full mx-4">
              {toolbarActions.map(tool => (
                <button
                  key={tool.action}
                  onClick={() => onToolbarAction(tool.action)}
                  className={clsx(
                    'px-3 py-1.5 text-sm rounded-md border font-medium transition-colors whitespace-nowrap',
                    tool.variant === 'primary'
                      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                      : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20 hover:text-white',
                  )}
                >
                  {i18n.actions[tool.action as keyof typeof i18n.actions] || tool.action}
                </button>
              ))}
            </div>
          )}

          {/* User controls */}
          <div className="flex items-center gap-2 rtl:space-x-reverse">
            {showAdminLink && (
              <button
                type="button"
                onClick={onAdminNavigate}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white focus-visible:ring-offset-slate-900"
              >
                {i18n.menu.admin}
              </button>
            )}
            <button className="rounded-full bg-blue-600 text-white text-sm px-3 py-1.5 hover:bg-blue-700 transition-colors">
              {i18n.common.alerts} 3
            </button>
            <div className="h-8 w-8 rounded-full bg-white/20 text-white grid place-items-center text-xs font-medium">
              IA
            </div>
            <select
              className="rounded-lg border border-white/20 bg-white/10 text-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              value={locale}
              onChange={e => setLocale(e.target.value as Locale)}
            >
              <option value="ar" className="text-gray-900">
                العربية
              </option>
              <option value="en" className="text-gray-900">
                English
              </option>
            </select>
            <button
              className="text-sm text-white/90 hover:text-white transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-sky-400/60"
              onClick={onLogout}
            >
              {i18n.auth.logout}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

const MENU_SPEC = [
  { key: 'dashboard', icon: LayoutDashboard },
  { key: 'annualPlan', icon: ClipboardList },
  { key: 'planning', icon: ClipboardList },
  { key: 'processRisk', icon: Shield },
  { key: 'program', icon: FlaskConical },
  { key: 'fieldwork', icon: FileCheck },
  { key: 'agile', icon: Database },
  { key: 'findings', icon: AlertTriangle },
  { key: 'reporting', icon: FileText },
  { key: 'followup', icon: RotateCcw },
  { key: 'closeout', icon: BookCheck },
  { key: 'qa', icon: BadgeCheck },
] as const;

function Sidebar({
  locale,
  route,
  setRoute,
  statusBadge,
  role,
  showAdminLink,
  onAdminNavigate,
}: {
  locale: Locale;
  route: Route;
  setRoute: (r: Route) => void;
  statusBadge: string;
  role: Role;
  showAdminLink: boolean;
  onAdminNavigate: () => void;
}) {
  const i18n = useI18n(locale);
  const isRTL = locale === 'ar';

  // Filter menu items based on RBAC
  const allowedMenuItems = MENU_SPEC.filter(item => canAccess(item.key as Route, role));

  return (
    <aside
      className={clsx(
        'bg-white rounded-2xl border border-gray-200 p-3 h-fit',
        isRTL ? 'order-2' : 'order-1',
      )}
    >
      <nav className="space-y-2">
        {allowedMenuItems.map((it, idx) => {
          const Icon = it.icon as any;
          const active = route === it.key;
          return (
            <button
              key={it.key}
              onClick={() => setRoute(it.key as Route)}
              className={clsx(
                'w-full text-[15px] sm:text-sm lg:text-base rounded-xl px-3 py-2.5 text-start border flex items-center gap-2 transition-colors font-medium',
                active
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-900 border-gray-200 hover:bg-gray-50',
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="grow text-start">{(i18n.menu as any)[it.key]}</span>
              {it.key !== 'dashboard' && (
                <span
                  className={clsx(
                    'text-[10px] px-2 py-0.5 rounded-full border',
                    active ? 'border-white' : 'border-gray-300',
                  )}
                >
                  {idx}
                </span>
              )}
              {it.key === 'dashboard' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {statusBadge}
                </span>
              )}
            </button>
          );
        })}
        {showAdminLink && (
          <button
            type="button"
            onClick={onAdminNavigate}
            className="w-full text-[15px] sm:text-sm lg:text-base rounded-xl px-3 py-2.5 text-start border flex items-center gap-2 transition-colors font-medium bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
          >
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="grow text-start">{i18n.menu.admin}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-blue-200 bg-blue-100 text-blue-700">
              {i18n.admin.dashboard}
            </span>
          </button>
        )}
      </nav>

      {/* Role indicator at bottom */}
      <div className="mt-6 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-1">
          {locale === 'ar' ? 'الدور الحالي' : 'Current Role'}
        </div>
        <div className="text-xs font-medium text-gray-700">{role.replace('_', ' ')}</div>
      </div>
    </aside>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">{children}</div>
  );
}
function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

// --- Minimal dialog & forms (inlined for demo) ---
function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm text-gray-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

// --- Forms (React Hook Form + Zod via minimal inline validation) ---
// NOTE: In a real project, import zod & resolvers; here we keep client clean

function EngagementMandateForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      engagement_code: 'IA-2025-001',
      title: '',
      objective: '',
      scope: '',
      criteria: '',
      constraints: '',
      auditee_units: '',
      stakeholders: '',
      start_date: '',
      end_date: '',
      budget_hours: 40,
      created_by: 'lead@gov.sa',
      independence_disclosure_url: '',
    },
  } as any);
  async function onSubmit(values: any) {
    const payload = {
      engagement_code: values.engagement_code,
      title: values.title,
      objective: values.objective,
      scope: String(values.scope)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      criteria: String(values.criteria)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      constraints: String(values.constraints)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      auditee_units: String(values.auditee_units)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      stakeholders: String(values.stakeholders)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      start_date: values.start_date,
      end_date: values.end_date,
      budget_hours: Number(values.budget_hours || 0),
      independence_disclosure_url: values.independence_disclosure_url || undefined,
      created_by: values.created_by,
    };
    await fetch('/api/engagements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    onClose();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field label="Code">
        <input {...register('engagement_code')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Title">
        <input {...register('title')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Objective">
        <textarea {...register('objective')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Scope (comma)">
        <input {...register('scope')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Criteria (comma)">
        <input {...register('criteria')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Constraints (comma)">
        <input {...register('constraints')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Auditee Units (comma)">
        <input {...register('auditee_units')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Stakeholders (comma)">
        <input {...register('stakeholders')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Start">
        <input
          type="date"
          {...register('start_date')}
          className="w-full rounded-lg border px-3 py-2"
        />
      </Field>
      <Field label="End">
        <input
          type="date"
          {...register('end_date')}
          className="w-full rounded-lg border px-3 py-2"
        />
      </Field>
      <Field label="Budget Hours">
        <input
          type="number"
          {...register('budget_hours')}
          className="w-full rounded-lg border px-3 py-2"
        />
      </Field>
      <Field label="Independence URL">
        <input
          {...register('independence_disclosure_url')}
          className="w-full rounded-lg border px-3 py-2"
        />
      </Field>
      <Field label="Created by (email)">
        <input {...register('created_by')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2">
          Cancel
        </button>
        <button className="rounded-lg bg-blue-600 text-white px-3 py-2">Save</button>
      </div>
    </form>
  );
}

function PBCRequestForm({ engagementId, onClose }: { engagementId: string; onClose: () => void }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      pbc_code: 'PBC-001',
      description: '',
      owner_id: '',
      due_date: '',
      status: 'open',
    },
  } as any);
  async function onSubmit(values: any) {
    const payload = { engagement_id: engagementId, ...values };
    await fetch('/api/pbc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    onClose();
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <Field label="PBC Code">
        <input {...register('pbc_code')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Owner ID">
        <input {...register('owner_id')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Description">
        <textarea {...register('description')} className="w-full rounded-lg border px-3 py-2" />
      </Field>
      <Field label="Due Date">
        <input
          type="date"
          {...register('due_date')}
          className="w-full rounded-lg border px-3 py-2"
        />
      </Field>
      <Field label="Status">
        <select {...register('status')} className="w-full rounded-lg border px-3 py-2">
          <option value="open">open</option>
          <option value="partial">partial</option>
          <option value="complete">complete</option>
        </select>
      </Field>
      <div className="md:col-span-2 flex items-center justify-end gap-2 mt-2">
        <button type="button" onClick={onClose} className="rounded-lg border px-3 py-2">
          Cancel
        </button>
        <button className="rounded-lg bg-blue-600 text-white px-3 py-2">Save</button>
      </div>
    </form>
  );
}

// Dashboard component moved to separate file

// Planning screen moved to ScreenComponents.tsx

function PlaceholderScreen({ title }: { title: string }) {
  return (
    <Card>
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-sm text-gray-600">Coming soon…</div>
    </Card>
  );
}

export default function AppShell() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('ar');
  const [route, setRoute] = useState<Route>('dashboard');
  const [role, setRole] = useState<Role>('IA_Manager');
  const [engagementId, _setEngagementId] = useState<string>('TEST-ENG-001');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openEngForm, setOpenEngForm] = useState(false);
  const [openPbc, setOpenPbc] = useState(false);
  const [openTest, setOpenTest] = useState(false);
  const [openSample, setOpenSample] = useState(false);
  const [openTestExecution, setOpenTestExecution] = useState(false);
  const [openEvidenceUploader, setOpenEvidenceUploader] = useState(false);
  const [openRun, setOpenRun] = useState(false);
  const [openEv, setOpenEv] = useState(false);
  const [openAnnualPlan, setOpenAnnualPlan] = useState(false);
  const [currentTestId, _setCurrentTestId] = useState('TEST-001');
  const [currentSampleRef, _setCurrentSampleRef] = useState('SAMPLE-001');
  const isRTL = locale === 'ar';
  const i18n = useI18n(locale);
  const showAdminLink = canSeeAdmin(session);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = isRTL ? 'ar' : 'en';
    }
  }, [isRTL]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    }
  }, [sidebarOpen]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleVirusScanAll = async () => {
    try {
      console.log('� Starting Sprint 7.5 evidence processing...');

      // Call the integrated evidence processing API (AV + OCR + S3)
      const response = await fetch('/api/evidence/virus-scan-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ engagementId }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log(`✅ Sprint 7.5 processing initiated:`, result.services);

        // Show comprehensive processing message
        const servicesList = result.services?.join(' + ') || 'AV Scan + OCR + S3';
        alert(
          `تم بدء معالجة الأدلة الشاملة\n${servicesList}\n\nسيتم الانتهاء من العملية في الخلفية`,
        );
      } else {
        throw new Error(result.error || 'Failed to initiate evidence processing');
      }
    } catch (error) {
      console.error('❌ Evidence processing failed:', error);
      alert('فشل في بدء معالجة الأدلة الشاملة');
    }
  };
  const handleToolbarAction = (action: string) => {
    switch (action) {
      case 'newEng':
        setOpenEngForm(true);
        break;
      case 'createPlan':
        setOpenEngForm(true);
        break;
      case 'createAnnualPlan':
        setOpenAnnualPlan(true);
        break;
      case 'newPBC':
        setOpenPbc(true);
        break;
      case 'newTest':
        setOpenTest(true);
        break;
      case 'drawSample':
        setOpenSample(true);
        break;
      case 'uploadEv':
        setOpenEv(true);
        break;
      case 'runTest':
        setOpenRun(true);
        break;
      case 'scanAV':
        handleVirusScanAll();
        break;
      case 'linkTo':
        console.log('ربط الأدلة بالاختبارات والعينات');
        // TODO: Open evidence linking dialog
        break;
      default:
        console.log(`Action: ${action}`);
    }
  };
  const handleAdminNavigate = () => {
    router.push('/admin/dashboard');
  };

  const allowed = RBAC[route as Route]?.includes(role);

  // Show loading while checking authentication
  if (status === 'loading')
    return (
      <div className="min-h-[100dvh] grid place-items-center bg-[#F5F7FB]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جارٍ التحقق من الهوية...</p>
        </div>
      </div>
    );

  return (
    <ToastProvider>
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 safe-area">
        <div className="container-shell mx-auto w-full px-3 sm:px-4 lg:px-6">
          <Topbar
            locale={locale}
            setLocale={setLocale}
            onLogout={() => signOut({ callbackUrl: '/auth/login' })}
            role={role}
            route={route}
            onToolbarAction={handleToolbarAction}
            showAdminLink={showAdminLink}
            onAdminNavigate={handleAdminNavigate}
            onOpenSidebar={() => setSidebarOpen(true)}
          />

          <div className="mt-3">
            <div className="bg-white rounded-xl border border-gray-200 p-2 text-sm flex flex-wrap items-center gap-2 overflow-x-auto max-w-full">
              <span className="text-gray-600">Role:</span>
              <select
                className="border border-gray-200 rounded-md px-2 py-1"
                value={role}
                onChange={e => setRole(e.target.value as Role)}
              >
                {(['IA_Manager', 'IA_Lead', 'IA_Auditor', 'Process_Owner', 'Viewer'] as Role[]).map(
                  r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ),
                )}
              </select>
              <span className="ms-3 text-gray-600">Lang:</span>
              <select
                className="border border-gray-200 rounded-md px-2 py-1"
                value={locale}
                onChange={e => setLocale(e.target.value as Locale)}
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr] gap-4 lg:gap-6 ultra-grid">
            {/* Desktop Sidebar - hidden on mobile */}
            <aside className="hidden md:block min-w-0 md:min-w-[260px] lg:min-w-[280px]">
              <Sidebar
                locale={locale}
                route={route}
                setRoute={setRoute}
                statusBadge="In-Field"
                role={role}
                showAdminLink={showAdminLink}
                onAdminNavigate={handleAdminNavigate}
              />
            </aside>

            {/* Main Content */}
            <main className="min-w-0">
              {!allowed && (
                <Card>
                  <div className="text-sm text-red-600">Access denied for role: {role}</div>
                </Card>
              )}
              {allowed && (
                <>
                  {route === 'dashboard' && (
                    <DashboardView locale={locale} engagementId={engagementId} />
                  )}
                  {route === 'annualPlan' && <AnnualPlanScreen locale={locale} />}
                  {route === 'planning' && <PlanningScreen locale={locale} />}
                  {route === 'processRisk' && <ProcessRiskScreen locale={locale} />}
                  {route === 'program' && <ProgramScreen locale={locale} />}
                  {route === 'fieldwork' && (
                    <FieldworkScreen locale={locale} engagementId={engagementId} />
                  )}
                  {route === 'agile' && <PlaceholderScreen title={i18n.sections.agile} />}
                  {route === 'findings' && <PlaceholderScreen title={i18n.sections.findings} />}
                  {route === 'reporting' && <PlaceholderScreen title={i18n.sections.reporting} />}
                  {route === 'followup' && <PlaceholderScreen title={i18n.sections.followup} />}
                  {route === 'closeout' && <PlaceholderScreen title={i18n.sections.closeout} />}
                  {route === 'qa' && <PlaceholderScreen title={i18n.sections.qa} />}
                </>
              )}
            </main>
          </div>
        </div>

        {/* Mobile Drawer - slides in from appropriate side based on RTL/LTR */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-40"
              onClick={() => setSidebarOpen(false)}
              aria-hidden="true"
            />
            <div
              role="dialog"
              aria-modal="true"
              className={clsx(
                'fixed top-0 bottom-0 z-50 w-[82vw] max-w-[320px] bg-white border-s shadow-xl',
                'transition-transform duration-200',
                'rtl:right-0 rtl:translate-x-0 ltr:left-0 ltr:translate-x-0',
              )}
            >
              <div className="p-3 border-b flex items-center gap-2">
                <button
                  aria-label="Close"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md border bg-white hover:bg-slate-50"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
                <div className="font-medium">القائمة</div>
              </div>
              <div className="p-3 overflow-y-auto h-full">
                <Sidebar
                  locale={locale}
                  route={route}
                  setRoute={r => {
                    setRoute(r);
                    setSidebarOpen(false);
                  }}
                  statusBadge="In-Field"
                  role={role}
                  showAdminLink={showAdminLink}
                  onAdminNavigate={() => {
                    setSidebarOpen(false);
                    handleAdminNavigate();
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* Modals mounted at root for dashboard shortcuts */}
        <EngagementForm
          open={openEngForm}
          onOpenChange={setOpenEngForm}
          onSuccess={() => {
            console.log('✅ تم حفظ المهمة بنجاح - سيتم تحديث القائمة');
            // TODO: Add toast notification and refresh data
          }}
        />

        <PBCForm
          open={openPbc}
          onOpenChange={setOpenPbc}
          engagementId={engagementId}
          onSuccess={() => {
            console.log('✅ تم حفظ PBC بنجاح - سيتم تحديث القائمة');
            setOpenPbc(false);
            // TODO: Add toast notification and refresh data
          }}
        />

        <TestForm
          open={openTest}
          onOpenChange={setOpenTest}
          engagementId={engagementId}
          onSuccess={() => {
            console.log('✅ تم حفظ الاختبار بنجاح - سيتم تحديث القائمة');
            setOpenTest(false);
            // TODO: Add toast notification and refresh data
          }}
        />

        <SamplingForm
          open={openSample}
          onOpenChange={setOpenSample}
          auditTestId="TEST-001" // TODO: Get from selected test
          populationSize={1000} // TODO: Get from actual population
          onSuccess={() => {
            console.log('✅ تم إنشاء العينة بنجاح - سيتم تحديث القائمة');
            setOpenSample(false);
            // TODO: Add toast notification and refresh data
          }}
        />

        <TestExecutionForm
          open={openTestExecution}
          onOpenChange={setOpenTestExecution}
          engagementId={engagementId}
          auditTestId="TEST-001" // TODO: Get from selected test
          auditTestTitle="اختبار تحقق من صحة البيانات المالية" // TODO: Get from selected test
          onSuccess={runId => {
            console.log('✅ تم تنفيذ الاختبار بنجاح:', runId);
            setOpenTestExecution(false);
            // TODO: Add toast notification and refresh data
          }}
        />

        <EvidenceUploaderForm
          open={openEvidenceUploader}
          onOpenChange={setOpenEvidenceUploader}
          engagementId={engagementId}
          defaultLinks={{
            testId: 'TEST-001', // TODO: Get from context
            sampleRef: 'SAMPLE-001', // TODO: Get from context
            findingId: undefined, // TODO: Get from context if applicable
          }}
          onSuccess={evidenceId => {
            console.log('✅ تم رفع الأدلة بنجاح:', evidenceId);
            setOpenEvidenceUploader(false);
            // TODO: Add toast notification and refresh data
          }}
        />

        {/* Sprint 7 Forms */}
        <RunForm
          open={openRun}
          onOpenChange={setOpenRun}
          engagementId={engagementId}
          auditTestId={currentTestId}
          onSuccess={() => setOpenRun(false)}
        />

        <EvidenceForm
          open={openEv}
          onOpenChange={setOpenEv}
          engagementId={engagementId}
          defaultLinks={{ testId: currentTestId, sampleRef: currentSampleRef }}
          onSuccess={() => setOpenEv(false)}
        />

        {/* Annual Plan Form */}
        <AnnualPlanForm
          open={openAnnualPlan}
          onOpenChange={setOpenAnnualPlan}
          defaultYear={new Date().getFullYear() + 1}
          orgOptions={[
            {
              id: 'FIN',
              name: 'الإدارة المالية',
              depts: [
                { id: 'AR', name: 'الحسابات' },
                { id: 'TR', name: 'الخزينة' },
              ],
            },
            {
              id: 'HR',
              name: 'إدارة الموارد البشرية',
              depts: [
                { id: 'RE', name: 'التوظيف' },
                { id: 'PY', name: 'الرواتب' },
              ],
            },
            {
              id: 'IT',
              name: 'تقنية المعلومات',
              depts: [
                { id: 'DEV', name: 'التطوير' },
                { id: 'SEC', name: 'أمن المعلومات' },
              ],
            },
          ]}
          onSuccess={id => {
            console.log('✅ تم حفظ الخطة السنوية بنجاح:', id);
            setOpenAnnualPlan(false);
            // TODO: Add toast notification and refresh data
          }}
        />
      </div>
    </ToastProvider>
  );
}
