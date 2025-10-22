import Link from 'next/link';

import { ComplianceMappingPanel } from '@/components/admin/ComplianceMappingPanel';
import { LogsPanel } from '@/components/admin/LogsPanel';
import { ModulesFlagsPanel } from '@/components/admin/ModulesFlagsPanel';
import { OverviewPanel } from '@/components/admin/OverviewPanel';
import { RegulationsPanel } from '@/components/admin/RegulationsPanel';
import { UsersRolesPanel } from '@/components/admin/UsersRolesPanel';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth/requireRole';

const TAB_ITEMS = [
  { key: 'overview', label: 'نظرة عامة', content: <OverviewPanel /> },
  { key: 'regulations', label: 'اللوائح', content: <RegulationsPanel /> },
  { key: 'mapping', label: 'المواءمة', content: <ComplianceMappingPanel /> },
  { key: 'modules', label: 'الوحدات', content: <ModulesFlagsPanel /> },
  { key: 'users', label: 'المستخدمون', content: <UsersRolesPanel /> },
  { key: 'logs', label: 'السجلات', content: <LogsPanel /> },
] as const;

export default async function AdminConsolePage() {
  await requireRole(['Admin', 'Audit Manager']);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">وحدة التحكم</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">الإدارة</h1>
        </div>

        <Link href="/admin" className="self-start sm:self-auto">
          <Button variant="secondary" size="sm" className="rounded-2xl px-4 py-2">
            العودة للواجهة السابقة →
          </Button>
        </Link>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="-mx-2 overflow-x-auto px-2 no-scrollbar">
          <TabsList
            dir="ltr"
            className="inline-flex min-w-max gap-2 rounded-2xl border border-border/60 bg-background/90 p-1 text-sm font-medium shadow-sm backdrop-blur-sm"
          >
            {TAB_ITEMS.map(tab => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="rounded-2xl px-4 py-2 text-muted-foreground transition data-[state=active]:bg-brand-600 data-[state=active]:text-white data-[state=active]:shadow"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {TAB_ITEMS.map(tab => (
          <TabsContent key={tab.key} value={tab.key} className="focus-visible:outline-none">
            <section className="rounded-3xl border border-border/60 bg-background/95 p-6 shadow-soft backdrop-blur-sm dark:bg-neutral-900/60">
              {tab.content}
            </section>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
