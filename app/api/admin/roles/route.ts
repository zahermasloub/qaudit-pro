import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { roleSchema } from '@/features/admin/roles/role.schema';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { createdAt: 'desc' },
    });
    const perms = await prisma.permission.findMany({ orderBy: { key: 'asc' } });
    return NextResponse.json({ ok: true, roles, perms });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch roles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const v = roleSchema.parse(body);
    const role = await prisma.role.create({
      data: { name: v.name, description: v.description },
    });
    if (v.permissionKeys?.length) {
      const ps = await prisma.permission.findMany({
        where: { key: { in: v.permissionKeys } },
      });
      await prisma.role.update({
        where: { id: role.id },
        data: { permissions: { connect: ps.map(p => ({ id: p.id })) } },
      });
    }
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system',
        action: 'role.create',
        target: `role:${role.id}`,
        payload: v,
      },
    });
    return NextResponse.json({ ok: true, id: role.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create role' }, { status: 500 });
  }
}
