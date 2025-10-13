import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/login',
  },
});

export const config = {
  matcher: [
    // Protect all routes except:
    // - API auth routes
    // - Registration page
    // - Static files
    // - API routes (for E2E testing)
    '/((?!api/auth|api/fieldwork|api/evidence|auth/register|_next/static|_next/image|favicon.ico).*)'
  ],
};
