-- fix_users_pk_and_fk.sql
-- الغرض: إصلاح تعارض اسم العمود الأساسي في core.users وتحديث جميع القيود المرجعية المرتبطة به.
-- التشغيل: psql -U postgres -d auditdb -f fix_users_pk_and_fk.sql

SET search_path TO core, public;

-- 1. حذف جميع القيود المرجعية (FKs) التي تشير إلى users(id)
ALTER TABLE IF EXISTS user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE IF EXISTS audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
ALTER TABLE IF EXISTS attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;
ALTER TABLE IF EXISTS user_teams DROP CONSTRAINT IF EXISTS user_teams_user_id_fkey;
ALTER TABLE IF EXISTS status_history DROP CONSTRAINT IF EXISTS status_history_changed_by_fkey;

-- 2. حذف المفتاح الأساسي القديم
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;

-- 3. إعادة تسمية العمود id إلى user_id إذا كان موجودًا
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='users' AND column_name='id') THEN
    ALTER TABLE users RENAME COLUMN id TO user_id;
  END IF;
END$$;

-- 4. إعادة إنشاء المفتاح الأساسي على user_id
ALTER TABLE users ADD PRIMARY KEY (user_id);

-- 5. إعادة إنشاء جميع القيود المرجعية (FKs) لتشير إلى user_id
ALTER TABLE user_roles ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id);
ALTER TABLE attachments ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(user_id);
ALTER TABLE user_teams ADD CONSTRAINT user_teams_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE;
ALTER TABLE status_history ADD CONSTRAINT status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES users(user_id);
