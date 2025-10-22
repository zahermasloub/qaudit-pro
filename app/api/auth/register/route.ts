import bcrypt from 'bcrypt';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    const name = String(body?.name || '').trim();
    const password = String(body?.password || '');
    const roleName = String(body?.role || 'User').trim();

    if (!email || !password) {
      return Response.json({ ok: false, error: 'email/password required' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ ok: false, error: 'invalid_email_format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 6) {
      return Response.json({ ok: false, error: 'password_too_short' }, { status: 400 });
    }

    const exists = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });

    if (exists) {
      return Response.json({ ok: false, error: 'user_exists' }, { status: 409 });
    }

    // Get or create the role (Admin or User)
    let dbRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!dbRole) {
      dbRole = await prisma.role.create({
        data: { name: roleName, description: roleName + ' role' },
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email,
        password: hash,
        role: roleName,
        locale: 'ar',
        roles: {
          create: [{ roleId: dbRole.id }],
        },
      },
      select: { id: true, email: true, name: true, role: true, locale: true, createdAt: true },
    });

    return Response.json({ ok: true, user }, { status: 201 });
  } catch (e: any) {
    console.error('Registration error:', e);
    return Response.json({ ok: false, error: e?.message ?? 'register_failed' }, { status: 500 });
  }
}
