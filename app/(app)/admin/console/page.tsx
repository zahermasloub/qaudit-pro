import { LogsPanel } from '@/components/admin/LogsPanel';
import { ModulesFlagsPanel } from '@/components/admin/ModulesFlagsPanel';
import { OverviewPanel } from '@/components/admin/OverviewPanel';
import { UsersRolesPanel } from '@/components/admin/UsersRolesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth/requireRole';

const ALLOWED_ROLES = ['Admin', 'Audit Manager'] as const;

export default async function AdminConsolePage() {
  await requireRole(ALLOWED_ROLES);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Admin Console</h2>
        <p className="text-sm text-slate-600">
          إدارة موحّدة لأهم عمليات فريق التدقيق. استخدم التبويبات للتنقّل بين اللوحات المختلفة.
        </p>
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="mapping">Compliance Mapping</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewPanel />
        </TabsContent>

        <TabsContent value="regulations">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            سيتم ربط لوائح الجهات الرقابية (SOCPA، CBOK، إلخ) في مرحلة لاحقة. شارك فريق الامتثال بالمستندات
            المطلوبة وسنربطها هنا.
          </div>
        </TabsContent>

        <TabsContent value="mapping">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            خريطة الامتثال قيد التحضير. سترى لاحقًا مصفوفة تربط اللوائح بالدلائل وأصحاب المهام.
          </div>
        </TabsContent>

        <TabsContent value="modules">
          <ModulesFlagsPanel />
        </TabsContent>

        <TabsContent value="users">
          <UsersRolesPanel />
        </TabsContent>

        <TabsContent value="logs">
          <LogsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
