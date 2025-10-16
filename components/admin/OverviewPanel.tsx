import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ITEMS = [
  { title: "Dashboard", desc: "ملخّص مؤشرات العمل وفِعالية الفريق", href: "/admin/dashboard" },
  { title: "Users", desc: "إدارة أعضاء الفريق وأدوارهم", href: "/admin/users" },
  { title: "Roles", desc: "تحديث الصلاحيات وتوزيعها", href: "/admin/roles" },
  { title: "Settings", desc: "الإعدادات العامة وسياسات الحفظ", href: "/admin/settings" },
  { title: "Logs", desc: "سجل الأحداث وتدقيق السجلات", href: "/admin/logs" },
  { title: "Backups", desc: "إدارة النسخ الاحتياطية واسترجاعها", href: "/admin/backups" },
] as const;

export async function OverviewPanel() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {ITEMS.map(item => (
        <Card
          key={item.href}
          className="rounded-2xl border border-border/70 bg-background/95 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-lg dark:bg-neutral-900/70"
        >
          <CardHeader className="space-y-2 pb-3">
            <CardTitle className="text-lg font-semibold text-foreground">{item.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p className="prose-wrap mb-4 leading-relaxed">{item.desc}</p>
            <Link
              className="font-medium text-brand-600 underline underline-offset-4 transition hover:text-brand-700"
              href={item.href}
            >
              الانتقال الآن →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
