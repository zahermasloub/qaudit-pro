#!/usr/bin/env node
/**
 * Update a user's password with a proper bcrypt hash
 * and optionally normalise or update their role.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROLE_NORMALIZATION: Record<string, string> = {
  admin: 'Admin',
  'audit manager': 'Audit Manager',
};

const args = process.argv.slice(2);

function getArgValue(flag: string) {
  const match = args.find(arg => arg.startsWith(`${flag}=`));
  return match ? match.replace(`${flag}=`, '').trim() : undefined;
}

async function ensureRoleMapping(userId: string, roleName: string) {
  const normalisedRole = roleName.trim();

  const prismaAny = prisma as any;
  const roleDelegate = prismaAny.role;
  const userRoleDelegate = prismaAny.userRole;

  if (!roleDelegate || !userRoleDelegate) {
    console.warn(
      '[fix-user-password] Prisma client lacks role delegates; skipping role mapping sync.',
    );
    return;
  }

  const role = await roleDelegate.upsert({
    where: { name: normalisedRole },
    update: {},
    create: {
      name: normalisedRole,
      description: 'Created automatically by fix-user-password script.',
    },
  });

  await userRoleDelegate.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      userId,
      roleId: role.id,
    },
  });
}

async function updateUserPassword() {
  try {
    console.log('[fix-user-password] Updating user credentials...');

    const email = getArgValue('--email');
    const password = getArgValue('--password');
    const roleArg = getArgValue('--role');

    if (!email || !password) {
      console.error(
        'Usage: node fix-user-password.ts --email=<email> --password=<password> [--role=<role>]',
      );
      process.exit(1);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!existingUser) {
      console.error(`[fix-user-password] No user found with email: ${email}`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const trimmedRoleArg = roleArg?.trim();
    const roleFromArg =
      trimmedRoleArg && (ROLE_NORMALIZATION[trimmedRoleArg.toLowerCase()] ?? trimmedRoleArg);
    const normalisedExistingRole =
      ROLE_NORMALIZATION[existingUser.role.toLowerCase()] ?? existingUser.role;

    const targetRole = roleFromArg ?? normalisedExistingRole;

    const updateData: { password: string; role?: string } = {
      password: hashedPassword,
    };

    const roleChanged = targetRole && targetRole !== existingUser.role;

    if (roleChanged) {
      updateData.role = targetRole;
    }

    const user = await prisma.user.update({
      where: { email },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (roleChanged && targetRole) {
      await ensureRoleMapping(user.id, targetRole);
    }

    console.log('[fix-user-password] User password updated successfully:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name ?? 'N/A'}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Password (plain for verification): ${password}`);

    if (!roleArg && roleChanged) {
      console.log('[fix-user-password] Note: role was normalised for admin console access.');
    }
  } catch (error) {
    console.error('[fix-user-password] Error updating user password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPassword().catch(console.error);
