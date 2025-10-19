\c auditdb
DO $$
DECLARE t TEXT; arr TEXT[]:=ARRAY['roles','users','user_roles','orgs','depts','audits','engagements','attachments','audit_logs'];
BEGIN
  FOREACH t IN ARRAY arr LOOP
    IF to_regclass('public.'||t) IS NOT NULL AND to_regclass('core.'||t) IS NULL THEN
      EXECUTE format('ALTER TABLE public.%I SET SCHEMA core;', t);
    END IF;
  END LOOP;
END$$;
