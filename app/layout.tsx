import type { Metadata } from 'next';

import AuthProvider from '@/lib/AuthProvider';

// import { Tajawal } from 'next/font/google';
import './globals.css';

// const tajawal = Tajawal({
//   subsets: ['arabic', 'latin'],
//   weight: ['300', '400', '500', '700'],
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: 'QAudit Pro - نظام إدارة التدقيق الاحترافي',
  description: 'نظام شامل لإدارة عمليات التدقيق والمراجعة',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // لا تضبط dir/lang هنا لتفادي التعارض مع AppShell
  return (
    <html suppressHydrationWarning>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
