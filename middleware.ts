import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});

export const config = {
  matcher: ['/((?!api/auth|auth/register|_next/static|_next/image|favicon.ico).*)'],
};
