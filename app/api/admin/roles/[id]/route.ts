import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const roleUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  permissionKeys: z.array(z.string()).optional(),
});

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/admin/roles/[id] - جلب دور واحد
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        users: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error('Error fetching role:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch role' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/roles/[id] - تحديث دور
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // التحقق من صحة البيانات
    const validatedData = roleUpdateSchema.parse(body);

    // التحقق من وجود الدور
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });

    if (!existingRole) {
      return NextResponse.json(
        { ok: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // تحديث الدور
    const updateData: any = {};
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    // تحديث الصلاحيات إذا تم توفيرها
    if (validatedData.permissionKeys !== undefined) {
      // فصل جميع الصلاحيات الحالية
      updateData.permissions = {
        disconnect: existingRole.permissions.map((p) => ({ id: p.id })),
      };

      // ربط الصلاحيات الجديدة
      if (validatedData.permissionKeys.length > 0) {
        const newPermissions = await prisma.permission.findMany({
          where: { key: { in: validatedData.permissionKeys } },
        });

        updateData.permissions.connect = newPermissions.map((p) => ({
          id: p.id,
        }));
      }
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: { permissions: true },
    });

    // تسجيل العملية في سجل التدقيق
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system', // TODO: استخدام المستخدم الحالي
        action: 'role.update',
        target: `role:${id}`,
        payload: validatedData,
      },
    });

    return NextResponse.json({ ok: true, role: updatedRole });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating role:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to update role' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/roles/[id] - حذف دور
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // التحقق من وجود الدور
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!role) {
      return NextResponse.json(
        { ok: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // منع حذف الدور إذا كان له مستخدمين
    if (role.users.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          error: `Cannot delete role with ${role.users.length} assigned users`,
        },
        { status: 400 }
      );
    }

    // حذف الدور (سيتم فصل الصلاحيات تلقائياً بسبب العلاقة many-to-many)
    await prisma.role.delete({
      where: { id },
    });

    // تسجيل العملية في سجل التدقيق
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system', // TODO: استخدام المستخدم الحالي
        action: 'role.delete',
        target: `role:${id}`,
        payload: { name: role.name },
      },
    });

    return NextResponse.json({ ok: true, message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to delete role' },
      { status: 500 }
    );
  }
}
