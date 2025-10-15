import { LogsPanel } from '@/components/admin/LogsPanel';
import { ModulesFlagsPanel } from '@/components/admin/ModulesFlagsPanel';
import { OverviewPanel } from '@/components/admin/OverviewPanel';
import { UsersRolesPanel } from '@/components/admin/UsersRolesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requireRole } from '@/lib/auth/requireRole';

const ALLOWED_ROLES = ['Admin', 'Audit Manager'] as const;

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'regulations', label: 'Regulations' },
  { key: 'mapping', label: 'Compliance Mapping' },
  { key: 'modules', label: 'Modules' },
  { key: 'users', label: 'Users' },
  { key: 'logs', label: 'Logs' },
] as const;

export default async function AdminConsolePage() {
  await requireRole(ALLOWED_ROLES);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-stroke bg-surface shadow-soft">
        <div className="px-6 pt-6">
          <h2 className="text-xl font-semibold text-brand-900 md:text-2xl">لوحة التحكم الموحّدة</h2>
          <p className="mt-1 text-sm text-neutral-600">
            إدارة موحّدة لأعمال فريق التدقيق، مع وصول سريع للوحدات الأساسية وسجلات المتابعة.
          </p>
        </div>

        <div className="px-4 pb-4 md:px-6">
          <Tabs defaultValue="overview" className="mt-4">
            <TabsList className="flex flex-wrap items-center gap-2 rounded-full bg-muted p-1">
              {TABS.map(tab => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="rounded-full px-4 py-2 text-sm transition data-[state=active]:bg-surface data-[state=active]:text-brand-700 data-[state=active]:shadow-soft hover:bg-surface/70"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="overview" className="p-4 md:p-6">
              <OverviewPanel />
            </TabsContent>

            <TabsContent value="regulations" className="p-4 md:p-6">
              <div className="rounded-2xl border border-dashed border-stroke bg-muted p-6 text-center text-sm text-neutral-600">
                سيتم ربط لوائح الجهات الرقابية (SOCPA، CBOK، وغيرها) هنا مع جداول المتابعة. شارك فريق الامتثال
                بالمستندات المحدثة ليتم إدراجها في المرحلة القادمة.
              </div>
            </TabsContent>

            <TabsContent value="mapping" className="p-4 md:p-6">
              <div className="rounded-2xl border border-dashed border-stroke bg-muted p-6 text-center text-sm text-neutral-600">
                خريطة الامتثال قيد البناء. قريبًا سترى مصفوفة تربط اللوائح بالأدلة والمالكين لمساعدتك على متابعة
                الثغرات وإغلاقها.
              </div>
            </TabsContent>

            <TabsContent value="modules" className="p-4 md:p-6">
              <ModulesFlagsPanel />
            </TabsContent>

            <TabsContent value="users" className="p-4 md:p-6">
              <UsersRolesPanel />
            </TabsContent>

            <TabsContent value="logs" className="p-4 md:p-6">
              <LogsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
