CREATE TABLE IF NOT EXISTS compliance_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name text NOT NULL,
  industry text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS compliance_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES compliance_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert dummy data for testing
DO $$
DECLARE
  new_profile_id uuid;
BEGIN
  INSERT INTO compliance_profiles (business_name, industry)
  VALUES ('GovMind Demo Corp', 'Technology / SaaS')
  RETURNING id INTO new_profile_id;

  INSERT INTO compliance_tasks (profile_id, title, description, status)
  VALUES 
    (new_profile_id, 'GST Registration', 'Register for Goods and Services Tax and obtain a GSTIN.', 'completed'),
    (new_profile_id, 'Shop & Establishment Act', 'Register under the local Shop and Establishment Act within 30 days of commencing operations.', 'pending'),
    (new_profile_id, 'Fire Safety NOC', 'Obtain a No Objection Certificate from the local fire department for the commercial premises.', 'pending'),
    (new_profile_id, 'MSME Udyam Registration', 'Register on the Udyam portal to avail MSME benefits and subsidies.', 'completed');
END $$;
