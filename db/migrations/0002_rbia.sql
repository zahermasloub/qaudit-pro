-- ============================================================================
-- Migration: 0002_rbia.sql
-- Purpose: Risk-Based Internal Audit (RBIA) Schema Implementation
-- Date: 2025-10-20
-- Description: Adds tables and structures for RBIA methodology including
--              audit universe, risk assessments, annual plans, and baselines
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create audit schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================================================
-- 1) audit.AuditUniverse
-- Represents the complete universe of auditable entities
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.AuditUniverse (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    category text,
    owner text,
    strategy_importance smallint,
    system_refs text,
    last_audit_date date,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for case-insensitive name searches
CREATE INDEX IF NOT EXISTS idx_au_name_lower
    ON audit.AuditUniverse (lower(name));

-- ============================================================================
-- 2) audit.RiskCriteria
-- Defines risk criteria and their weights for risk assessment
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.RiskCriteria (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    weight numeric(5,2) CHECK (weight BETWEEN 0 AND 100),
    description text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for case-insensitive name searches
CREATE INDEX IF NOT EXISTS idx_rc_name_lower
    ON audit.RiskCriteria (lower(name));

-- ============================================================================
-- 3) audit.RiskAssessments
-- Stores risk assessments for audit universe entities
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.RiskAssessments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    au_id uuid NOT NULL REFERENCES audit.AuditUniverse(id) ON DELETE CASCADE,
    likelihood smallint CHECK (likelihood BETWEEN 1 AND 5),
    impact smallint CHECK (impact BETWEEN 1 AND 5),
    weight numeric(5,2) CHECK (weight BETWEEN 0 AND 100),
    score numeric(6,2),
    residual_score numeric(6,2),
    evidence text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for audit universe lookups
CREATE INDEX IF NOT EXISTS idx_ra_au
    ON audit.RiskAssessments (au_id);

-- Index for score-based queries
CREATE INDEX IF NOT EXISTS idx_ra_score
    ON audit.RiskAssessments (score DESC NULLS LAST);

-- ============================================================================
-- 4) audit.AnnualPlans
-- Master table for annual audit plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.AnnualPlans (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    year int NOT NULL,
    version text DEFAULT 'v1',
    status text DEFAULT 'draft',
    baseline_hash text,
    baseline_date timestamptz,
    baseline_by uuid,
    owner_id uuid,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_plan_year_version UNIQUE (year, version)
);

-- Index for status-based queries
CREATE INDEX IF NOT EXISTS idx_plan_status
    ON audit.AnnualPlans (status);

-- Index for year-based queries
CREATE INDEX IF NOT EXISTS idx_plan_year
    ON audit.AnnualPlans (year DESC);

-- ============================================================================
-- 5) audit.AnnualPlanItems
-- Individual audit items within an annual plan
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.AnnualPlanItems (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid NOT NULL REFERENCES audit.AnnualPlans(id) ON DELETE CASCADE,
    au_id uuid NOT NULL REFERENCES audit.AuditUniverse(id),
    type text,
    priority text,
    scope_brief text,
    effort_days numeric(6,2),
    team_json jsonb,
    period_start date,
    period_end date,
    deliverable_type text,
    risk_score numeric(6,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_planitem_plan
    ON audit.AnnualPlanItems (plan_id);

-- Index for priority-based filtering
CREATE INDEX IF NOT EXISTS idx_planitem_priority
    ON audit.AnnualPlanItems (priority);

-- Index for risk score sorting
CREATE INDEX IF NOT EXISTS idx_planitem_risk
    ON audit.AnnualPlanItems (risk_score DESC NULLS LAST);

-- Index for audit universe reference
CREATE INDEX IF NOT EXISTS idx_planitem_au
    ON audit.AnnualPlanItems (au_id);

-- ============================================================================
-- 6) audit.ResourceCapacity
-- Tracks available resources for audit planning
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.ResourceCapacity (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    year int NOT NULL,
    total_auditors int,
    available_days int,
    buffer_pct numeric(5,2),
    training_days int,
    budget numeric(12,2),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT uq_capacity_year UNIQUE (year)
);

-- Index for year-based queries
CREATE INDEX IF NOT EXISTS idx_capacity_year
    ON audit.ResourceCapacity (year DESC);

-- ============================================================================
-- 7) audit.PlanApprovals
-- Audit trail for plan approval workflow
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.PlanApprovals (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid REFERENCES audit.AnnualPlans(id) ON DELETE CASCADE,
    actor uuid,
    role text,
    action text,
    comment text,
    at timestamptz DEFAULT now()
);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_approvals_plan
    ON audit.PlanApprovals (plan_id);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_approvals_at
    ON audit.PlanApprovals (at DESC);

-- ============================================================================
-- 8) audit.PlanBaselines
-- Stores baseline snapshots of approved plans
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit.PlanBaselines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id uuid REFERENCES audit.AnnualPlans(id) ON DELETE CASCADE,
    snapshot jsonb,
    hash text,
    created_by uuid,
    created_at timestamptz DEFAULT now()
);

-- Index for plan lookups
CREATE INDEX IF NOT EXISTS idx_baseline_plan
    ON audit.PlanBaselines (plan_id);

-- Index for chronological queries
CREATE INDEX IF NOT EXISTS idx_baseline_created
    ON audit.PlanBaselines (created_at DESC);

-- ============================================================================
-- Helper Views (Optional)
-- ============================================================================

-- View: Current year plans with item counts
CREATE OR REPLACE VIEW audit.v_current_plans AS
SELECT
    ap.id,
    ap.year,
    ap.version,
    ap.status,
    ap.owner_id,
    COUNT(api.id) as item_count,
    SUM(api.effort_days) as total_effort_days,
    AVG(api.risk_score) as avg_risk_score,
    ap.created_at,
    ap.updated_at
FROM audit.AnnualPlans ap
LEFT JOIN audit.AnnualPlanItems api ON ap.id = api.plan_id
WHERE ap.year = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY ap.id, ap.year, ap.version, ap.status, ap.owner_id, ap.created_at, ap.updated_at;

-- View: Audit universe with latest risk assessment
CREATE OR REPLACE VIEW audit.v_universe_with_risk AS
SELECT
    au.id,
    au.name,
    au.category,
    au.owner,
    au.strategy_importance,
    au.last_audit_date,
    ra.likelihood,
    ra.impact,
    ra.score as risk_score,
    ra.residual_score,
    ra.updated_at as risk_assessed_at
FROM audit.AuditUniverse au
LEFT JOIN LATERAL (
    SELECT likelihood, impact, score, residual_score, updated_at
    FROM audit.RiskAssessments
    WHERE au_id = au.id
    ORDER BY updated_at DESC
    LIMIT 1
) ra ON true;

-- ============================================================================
-- Grants (adjust based on your role structure)
-- ============================================================================

-- Grant SELECT to authenticated users (adjust as needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        GRANT SELECT ON ALL TABLES IN SCHEMA audit TO authenticated;
    END IF;
END $$;

-- ============================================================================
-- Migration Summary
-- ============================================================================
-- This migration adds comprehensive RBIA (Risk-Based Internal Audit) support:
--
-- 1. AuditUniverse: Master list of auditable entities with categorization
-- 2. RiskCriteria: Configurable risk assessment criteria and weights
-- 3. RiskAssessments: Risk evaluations linked to audit universe items
-- 4. AnnualPlans: Master plans with versioning and baseline tracking
-- 5. AnnualPlanItems: Individual audit assignments within plans
-- 6. ResourceCapacity: Resource planning and capacity management
-- 7. PlanApprovals: Approval workflow audit trail
-- 8. PlanBaselines: Immutable snapshots of approved plans
--
-- All tables use:
-- - UUID primary keys with automatic generation
-- - Proper foreign key constraints with CASCADE deletes
-- - Appropriate indexes for performance
-- - CHECK constraints for data validation
-- - Timestamps for audit trails
--
-- The design is non-destructive and uses IF NOT EXISTS clauses to ensure
-- safe execution even if some structures already exist.
-- ============================================================================
