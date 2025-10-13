import type { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      locale: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
    locale: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    locale?: string;
  }
}
