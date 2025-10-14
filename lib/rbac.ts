export const PERMS = {
  ADMIN_DASHBOARD_READ: 'admin.dashboard.read',
  ADMIN_USERS_READ: 'admin.users.read',
  ADMIN_USERS_WRITE: 'admin.users.write',
  ADMIN_ROLES_READ: 'admin.roles.read',
  ADMIN_ROLES_WRITE: 'admin.roles.write',
  ADMIN_SETTINGS_READ: 'admin.settings.read',
  ADMIN_SETTINGS_WRITE: 'admin.settings.write',
  ADMIN_LOGS_READ: 'admin.logs.read',
  ADMIN_BACKUPS_READ: 'admin.backups.read',
  ADMIN_BACKUPS_EXEC: 'admin.backups.exec',
  ADMIN_BACKUPS_SCHEDULE: 'admin.backups.schedule',
} as const;

export function hasPerm(perms: string[] | undefined, p: string) {
  return !!perms?.includes(p);
}
