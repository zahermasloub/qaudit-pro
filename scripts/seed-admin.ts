import prisma from '@/lib/prisma';
import { PERMS } from '@/lib/rbac';

async function seedPermissions() {
  console.log('🌱 Seeding admin permissions...');

  const permissions = [
    { key: PERMS.ADMIN_DASHBOARD_READ, label: 'قراءة لوحة الأدمن' },
    { key: PERMS.ADMIN_USERS_READ, label: 'قراءة المستخدمين' },
    { key: PERMS.ADMIN_USERS_WRITE, label: 'كتابة المستخدمين' },
    { key: PERMS.ADMIN_ROLES_READ, label: 'قراءة الأدوار' },
    { key: PERMS.ADMIN_ROLES_WRITE, label: 'كتابة الأدوار' },
    { key: PERMS.ADMIN_SETTINGS_READ, label: 'قراءة الإعدادات' },
    { key: PERMS.ADMIN_SETTINGS_WRITE, label: 'كتابة الإعدادات' },
    { key: PERMS.ADMIN_LOGS_READ, label: 'قراءة السجلات' },
    { key: PERMS.ADMIN_BACKUPS_READ, label: 'قراءة النسخ الاحتياطية' },
    { key: PERMS.ADMIN_BACKUPS_EXEC, label: 'تنفيذ النسخ الاحتياطية' },
    { key: PERMS.ADMIN_BACKUPS_SCHEDULE, label: 'جدولة النسخ الاحتياطية' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { key: perm.key },
      update: { label: perm.label },
      create: { key: perm.key, label: perm.label },
    });
  }

  console.log('✅ Seeded', permissions.length, 'permissions');

  // Create admin role with all permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: {
      name: 'Admin',
      description: 'مدير النظام - صلاحيات كاملة',
    },
  });

  // Connect all permissions to admin role
  const allPerms = await prisma.permission.findMany();
  await prisma.role.update({
    where: { id: adminRole.id },
    data: {
      permissions: {
        set: allPerms.map(p => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Created Admin role with all permissions');

  // Create viewer role with read-only permissions
  const viewerRole = await prisma.role.upsert({
    where: { name: 'Viewer' },
    update: {},
    create: {
      name: 'Viewer',
      description: 'عرض فقط - بدون صلاحيات تعديل',
    },
  });

  const readPerms = await prisma.permission.findMany({
    where: {
      key: {
        contains: 'read',
      },
    },
  });

  await prisma.role.update({
    where: { id: viewerRole.id },
    data: {
      permissions: {
        set: readPerms.map(p => ({ id: p.id })),
      },
    },
  });

  console.log('✅ Created Viewer role with read-only permissions');
}

seedPermissions()
  .then(() => {
    console.log('🎉 Admin seed completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
