import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth/options';

type AllowedRole = readonly string[] | string[];

export async function requireRole(allowedRoles: AllowedRole) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userRole = (session.user as { role?: string }).role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    redirect('/shell');
  }

  return session;
}
