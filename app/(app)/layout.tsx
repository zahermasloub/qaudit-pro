export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <a
              href="/dashboard"
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              لوحة التحكم
            </a>
            <a
              href="/planning"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              التخطيط
            </a>
            <a
              href="/execution"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              التنفيذ
            </a>
            <a
              href="/reporting"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              التقارير
            </a>
          </nav>
        </div>
      </header>
      <main className="flex-1 space-y-4 pt-6">
        <div className="container-custom">{children}</div>
      </main>
    </div>
  );
}
