-- Citizen Intelligence: Citizen Profiles Table
-- Stores baseline citizen context used for eligibility matching and LLM context injection.
-- Supports anonymous usage via session_uuid (stored in localStorage client-side).
-- user_id is nullable to allow future linkage to Supabase Auth without breaking anonymous flows.

CREATE TABLE IF NOT EXISTS citizen_profiles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_uuid    uuid UNIQUE NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  age             integer NOT NULL CHECK (age >= 1 AND age <= 120),
  state           text NOT NULL,
  occupation      text NOT NULL,
  income_bracket  text NOT NULL,
  social_category text NOT NULL,
  gender          text NOT NULL,
  created_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast session-based lookups (primary access pattern)
CREATE INDEX IF NOT EXISTS citizen_profiles_session_uuid_idx ON citizen_profiles (session_uuid);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_citizen_profiles_updated_at ON citizen_profiles;
CREATE TRIGGER update_citizen_profiles_updated_at
  BEFORE UPDATE ON citizen_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
