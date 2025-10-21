import bcryptjs from 'bcryptjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { userCreateSchema } from '@/features/admin/users/user.schema';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: { roles: { include: { Role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = userCreateSchema.parse(body);
    const hash = await bcryptjs.hash(v.password, 10);
    const user = await prisma.user.create({
      data: {
        name: v.name,
        email: v.email,
        password: hash,
        role: v.role,
        locale: v.locale
      },
    });
    if (v.roleIds?.length) {
      await prisma.userRole.createMany({
        data: v.roleIds.map(rid => ({ userId: user.id, roleId: rid })),
      });
    }
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system',
        action: 'user.create',
        target: `user:${user.id}`,
        payload: { email: user.email },
      },
    });
    return NextResponse.json({ ok: true, id: user.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create user' }, { status: 500 });
  }
}
