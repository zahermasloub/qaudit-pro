import '@fontsource/tajawal/400.css';
import '@fontsource/tajawal/700.css';
import type { Metadata } from 'next';
import AuthProvider from '@/lib/AuthProvider';
import { ThemeProvider } from '@/lib/ThemeProvider';
import { Toaster } from '@/components/ui/Toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'QAudit Pro',
  description: 'نظام شامل لإدارة عمليات التدقيق والمراجعة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="font-arabic antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
