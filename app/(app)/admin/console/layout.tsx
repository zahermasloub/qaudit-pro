export default function AdminConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </main>
  );
}
