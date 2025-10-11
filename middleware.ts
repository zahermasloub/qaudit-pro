import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'qaudit_auth'; // كوكي مؤقتة لتمثيل الجلسة

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // مسارات عامة لا تتطلب جلسة
  const publicPaths = ['/auth/login', '/auth/register', '/_next', '/favicon', '/api/public'];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  const hasSession = Boolean(req.cookies.get(AUTH_COOKIE)?.value);

  // مستخدم غير مسجِّل يحاول الوصول لمسار محمي
  if (!isPublic && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('next', pathname); // احتفظ بالوجهة
    return NextResponse.redirect(url);
  }

  // مستخدم مسجِّل يحاول زيارة صفحات auth
  if (isPublic && hasSession && pathname.startsWith('/auth')) {
    const url = req.nextUrl.clone();
    url.pathname = '/shell';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
