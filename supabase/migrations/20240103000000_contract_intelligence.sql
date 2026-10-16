-- Migration: Rights & Contract Intelligence
-- Stores analyzed legal agreements, extracted clauses, risk ratings, and missing protections.

CREATE TABLE IF NOT EXISTS contract_analyses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_uuid        uuid NOT NULL,
  contract_name       text NOT NULL,
  contract_type       text NOT NULL, -- 'employment', 'tenancy', 'loan', 'vendor', 'general'
  risk_score          text NOT NULL, -- 'high', 'moderate', 'low'
  summary             text NOT NULL,
  clauses             jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_protections jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at          timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index by session_uuid for fast user session retrieval
CREATE INDEX IF NOT EXISTS idx_contract_analyses_session_uuid ON contract_analyses(session_uuid);
