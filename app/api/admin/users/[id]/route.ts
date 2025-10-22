import bcryptjs from 'bcryptjs';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import prisma from '@/lib/prisma';

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.string().optional(),
  locale: z.string().optional(),
  roleIds: z.array(z.string()).optional(),
});

// GET /api/admin/users/[id] - جلب مستخدم واحد
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { roles: { include: { Role: true } } },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // لا نرسل كلمة المرور
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ ok: true, user: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ ok: false, error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PATCH /api/admin/users/[id] - تحديث مستخدم
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const v = userUpdateSchema.parse(body);

    // تحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // تحضير البيانات للتحديث
    const updateData: any = {};
    if (v.name) updateData.name = v.name;
    if (v.email) updateData.email = v.email;
    if (v.role) updateData.role = v.role;
    if (v.locale) updateData.locale = v.locale;
    if (v.password) {
      updateData.password = await bcryptjs.hash(v.password, 10);
    }

    // تحديث المستخدم
    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    // تحديث الأدوار إذا تم تحديدها
    if (v.roleIds !== undefined) {
      // حذف الأدوار القديمة
      await prisma.userRole.deleteMany({
        where: { userId: params.id },
      });

      // إضافة الأدوار الجديدة
      if (v.roleIds.length > 0) {
        await prisma.userRole.createMany({
          data: v.roleIds.map(rid => ({ userId: params.id, roleId: rid })),
        });
      }
    }

    // تسجيل في audit log
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system', // TODO: استخدام session.user.email
        action: 'user.update',
        target: `user:${params.id}`,
        payload: { email: user.email, updatedFields: Object.keys(updateData) },
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { ok: false, error: 'Validation error', details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json({ ok: false, error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - حذف مستخدم
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // تحقق من وجود المستخدم
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json({ ok: false, error: 'User not found' }, { status: 404 });
    }

    // حذف المستخدم (سيتم حذف UserRoles تلقائياً بسبب onDelete: Cascade)
    await prisma.user.delete({
      where: { id: params.id },
    });

    // تسجيل في audit log
    await prisma.auditLog.create({
      data: {
        actorEmail: 'system', // TODO: استخدام session.user.email
        action: 'user.delete',
        target: `user:${params.id}`,
        payload: { email: existingUser.email },
      },
    });

    return NextResponse.json({ ok: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ ok: false, error: 'Failed to delete user' }, { status: 500 });
  }
}
