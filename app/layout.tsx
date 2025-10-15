
import type { Metadata } from 'next';

import AuthProvider from '@/lib/AuthProvider';
import './globals.css';

// Note: Tajawal font is temporarily disabled due to network restrictions in the build environment
// Uncomment when building in an environment with internet access
// import { Tajawal } from 'next/font/google';
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
