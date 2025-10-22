-- Migration: Add 'submitted' status to AnnualPlanStatus enum
-- Date: 2025-10-21
-- Description: Adds 'submitted' status between 'draft' and 'under_review' for the annual plan wizard workflow
-- This is an idempotent migration that safely adds the new status

DO $$ 
BEGIN
    -- Check if 'submitted' value already exists in the enum
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumtypid = 'AnnualPlanStatus'::regtype 
        AND enumlabel = 'submitted'
    ) THEN
        -- Add 'submitted' status after 'draft'
        -- Note: ALTER TYPE ADD VALUE cannot be done inside a transaction block in some PostgreSQL versions
        -- If this fails, run the command directly: ALTER TYPE "AnnualPlanStatus" ADD VALUE 'submitted' AFTER 'draft';
        ALTER TYPE "AnnualPlanStatus" ADD VALUE IF NOT EXISTS 'submitted' AFTER 'draft';
    END IF;
END $$;

-- Verify the new status is available
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_enum 
        WHERE enumtypid = 'AnnualPlanStatus'::regtype 
        AND enumlabel = 'submitted'
    ) THEN
        RAISE NOTICE 'Successfully added "submitted" status to AnnualPlanStatus enum';
    ELSE
        RAISE WARNING 'Failed to add "submitted" status to AnnualPlanStatus enum. Manual intervention may be required.';
    END IF;
END $$;
