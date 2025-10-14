# Admin Suite - Complete Documentation

## Overview

This admin suite provides comprehensive user and system management capabilities for QAudit Pro, including:

- User management with role-based access control (RBAC)
- Role and permission management
- System settings configuration
- Activity log monitoring with time-based filtering
- Backup management and scheduling

## Architecture

### Database Models

The admin suite uses the following Prisma models:

- **User**: Extended with `roles` relation for many-to-many role assignments
- **Role**: Contains role definitions with permissions
- **Permission**: Individual permission keys (e.g., "admin.users.read")
- **UserRole**: Junction table for user-role relationships
- **SystemSetting**: Key-value store for system configuration
- **AuditLog**: Activity logs with time-based indexing
- **BackupJob**: Tracks backup execution history
- **BackupSchedule**: Manages automated backup schedules using cron expressions

### API Routes

All admin APIs are located under `/api/admin/`:

- `GET/POST /api/admin/users` - User CRUD operations
- `GET/POST /api/admin/roles` - Role and permission management
- `GET/POST /api/admin/settings` - System settings
- `GET /api/admin/logs` - Activity logs with filtering (q, from, to, take)
- `GET/POST /api/admin/backups` - Backup job management
- `GET/POST /api/admin/backups/schedule` - Backup scheduling

### Pages

All admin pages are accessible under `/admin/`:

- `/admin/dashboard` - Overview with KPIs
- `/admin/users` - User management with create dialog
- `/admin/roles` - Role and permission assignment
- `/admin/settings` - System configuration
- `/admin/logs` - Activity logs with time filtering
- `/admin/backups` - Backup management and scheduling

## Setup Instructions

### 1. Database Migration

Run Prisma migrations to create the admin tables:

```bash
npm run prisma:generate
npm run db:push
```

### 2. Seed Initial Data

Populate initial permissions and roles:

```bash
npx tsx scripts/seed-admin.ts
```

This creates:

- 11 admin permissions
- Admin role (full access)
- Viewer role (read-only access)

### 3. Environment Variables

No additional environment variables are required. The admin suite uses the existing `DATABASE_URL`.

## Features

### 1. User Management (`/admin/users`)

- View all users with their roles and creation dates
- Add new users with email, password, locale selection
- Assign multiple roles to users
- Role-based filtering (future enhancement)

**Dialog Features:**

- Name, email, password fields with validation
- Locale selection (Arabic/English)
- Role assignment (future enhancement)

### 2. Roles & Permissions (`/admin/roles`)

- View all roles with their assigned permissions
- Create new roles with description
- Multi-select permission assignment
- Permission grouping by category

**Dialog Features:**

- Role name and description
- Checkbox list of all available permissions
- Visual permission badges

### 3. System Settings (`/admin/settings`)

- Key-value configuration store
- Type selection (string, number, boolean, json)
- Last updated timestamp
- Upsert functionality (create or update)

**Dialog Features:**

- Key input with mono font
- Value input
- Type dropdown
- Automatic timestamp tracking

### 4. Activity Logs (`/admin/logs`)

- Real-time activity monitoring
- Time-based filtering (from/to datetime)
- Search by action, actor, or target
- Indexed for performance

**Filtering:**

- Search query (action, actorEmail, target)
- Date range (from/to)
- Configurable result limit (default 100)

### 5. Backup Management (`/admin/backups`)

- Manual backup execution
- Automated backup scheduling
- Status tracking (pending, running, success, failed)
- Storage location selection (local/S3)

**Features:**

- Run backup now with storage selection
- Create backup schedules with cron expressions
- View backup history with status
- Enable/disable schedules

## Permissions

### Available Permissions

```typescript
ADMIN_DASHBOARD_READ; // View dashboard
ADMIN_USERS_READ; // View users
ADMIN_USERS_WRITE; // Create/edit users
ADMIN_ROLES_READ; // View roles
ADMIN_ROLES_WRITE; // Create/edit roles
ADMIN_SETTINGS_READ; // View settings
ADMIN_SETTINGS_WRITE; // Create/edit settings
ADMIN_LOGS_READ; // View activity logs
ADMIN_BACKUPS_READ; // View backups
ADMIN_BACKUPS_EXEC; // Execute backups
ADMIN_BACKUPS_SCHEDULE; // Schedule backups
```

### Using Permissions

```typescript
import { PERMS, hasPerm } from '@/lib/rbac';

// Check permission
if (hasPerm(user.permissions, PERMS.ADMIN_USERS_WRITE)) {
  // Allow user creation
}
```

## Audit Logging

All admin actions are automatically logged to the `AuditLog` table:

```typescript
await prisma.auditLog.create({
  data: {
    actorEmail: session.user.email,
    action: 'user.create',
    target: `user:${userId}`,
    payload: { email: userData.email },
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  },
});
```

## Backup Scheduling

### Cron Expression Examples

```
0 3 * * 1     // Every Monday at 3:00 AM
0 0 * * *     // Daily at midnight
0 */6 * * *   // Every 6 hours
0 2 * * 0     // Every Sunday at 2:00 AM
```

### Backup Implementation

The current implementation queues backup jobs. To implement actual backup:

1. Create a worker process using `node-cron`:

```typescript
import cron from 'node-cron';

cron.schedule('0 3 * * 1', async () => {
  // Execute backup logic
  await performBackup();
});
```

2. Or use BullMQ for better job management:

```typescript
import { Queue } from 'bullmq';

const backupQueue = new Queue('backups');
await backupQueue.add('backup', { storage: 'local' });
```

## i18n Support

All admin UI is bilingual (Arabic/English):

```typescript
// Arabic
menu.admin = 'الإدارة';
menu.admin_users = 'المستخدمون';

// English
menu.admin = 'Admin';
menu.admin_users = 'Users';
```

## Security Considerations

1. **Authentication**: All admin routes should be protected with NextAuth middleware
2. **Authorization**: Implement permission checks in API routes
3. **Input Validation**: All inputs validated with Zod schemas
4. **Audit Trail**: All actions logged with actor, timestamp, and payload
5. **Password Security**: bcryptjs hashing with salt rounds of 10

## Future Enhancements

1. **Drag & Drop Role Ordering**: Implement with @dnd-kit/sortable
2. **Bulk User Operations**: Import/export CSV, bulk role assignment
3. **Advanced Filtering**: Multi-field filters, saved filter presets
4. **Real-time Updates**: WebSocket integration for live activity feed
5. **Backup Restoration**: UI for restoring from backup files
6. **Permission Hierarchy**: Parent-child permission relationships
7. **User Impersonation**: Admin ability to view as another user
8. **Two-Factor Authentication**: TOTP/SMS for admin accounts

## Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL in .env
echo $DATABASE_URL

# Test connection
npx prisma db push
```

### Missing Permissions

```bash
# Re-run seed
npx tsx scripts/seed-admin.ts
```

### Build Errors

```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## API Examples

### Create User

```typescript
const response = await fetch('/api/admin/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secure123',
    locale: 'en',
    roleIds: ['role_id_1', 'role_id_2'],
  }),
});
```

### Create Role with Permissions

```typescript
const response = await fetch('/api/admin/roles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Manager',
    description: 'Department manager',
    permissionKeys: ['admin.users.read', 'admin.logs.read'],
  }),
});
```

### Filter Activity Logs

```typescript
const params = new URLSearchParams({
  q: 'user.create',
  from: '2024-01-01T00:00:00',
  to: '2024-12-31T23:59:59',
  take: '50',
});
const response = await fetch(`/api/admin/logs?${params}`);
```

## Contributing

When adding new admin features:

1. Define permissions in `lib/rbac.ts`
2. Add i18n keys to `lib/i18n.ts`
3. Create Zod schema in `features/admin/{feature}/`
4. Implement API route in `app/api/admin/{feature}/`
5. Create page component in `app/(app)/admin/{feature}/`
6. Add audit logging for all mutations
7. Update this documentation

## License

Part of QAudit Pro - Internal use only
