export const PERMISSIONS = [
  'ADMIN_DASHBOARD_READ',
  'ADMIN_USERS_READ',
  'ADMIN_USERS_WRITE',
  'ADMIN_ROLES_READ',
  'ADMIN_ROLES_WRITE',
  'ADMIN_SETTINGS_READ',
  'ADMIN_SETTINGS_WRITE',
  'ADMIN_LOGS_READ',
  'ADMIN_BACKUPS_READ',
  'ADMIN_BACKUPS_EXEC',
  'ADMIN_BACKUPS_SCHEDULE',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMS: Record<Permission, Permission> = PERMISSIONS.reduce(
  (acc, permission) => {
    acc[permission] = permission;
    return acc;
  },
  {} as Record<Permission, Permission>,
);

export const ADMIN_MENU_PERMS: Permission[] = [
  'ADMIN_DASHBOARD_READ',
  'ADMIN_USERS_READ',
  'ADMIN_ROLES_READ',
  'ADMIN_SETTINGS_READ',
  'ADMIN_LOGS_READ',
  'ADMIN_BACKUPS_READ',
];

export function hasPerm(perms: ReadonlyArray<string> | undefined, permission: Permission) {
  return !!perms?.includes(permission);
}

type SessionLike =
  | {
      user?: {
        permissions?: string[];
      };
    }
  | null
  | undefined;

export function canSeeAdmin(session: SessionLike) {
  const perms = session?.user?.permissions ?? [];
  return ADMIN_MENU_PERMS.some(permission => perms.includes(permission));
}
