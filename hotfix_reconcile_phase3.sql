\c auditdb
SET search_path TO core, public;

-- attachments: ensure critical columns, indexes, and FK exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='core' AND table_name='attachments' AND column_name='engagement_id')
  THEN ALTER TABLE attachments ADD COLUMN engagement_id BIGINT; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='fk_attachments_engagement_id' AND conrelid='core.attachments'::regclass)
  THEN ALTER TABLE attachments ADD CONSTRAINT fk_attachments_engagement_id FOREIGN KEY(engagement_id) REFERENCES engagements(engagement_id) ON DELETE CASCADE; END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='ix_attachments_eng') THEN CREATE INDEX ix_attachments_eng ON attachments(engagement_id); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='ix_attachments_sha') THEN CREATE INDEX ix_attachments_sha ON attachments(sha256); END IF;
END$$;
