-- Citizen Intelligence: Scheme Registry Table + Seed Data
-- Stores government scheme eligibility rules as typed columns for deterministic matching.
-- Nullable columns mean "no restriction on this dimension".

CREATE TABLE IF NOT EXISTS scheme_registry (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 text NOT NULL,
  ministry             text NOT NULL,
  description          text NOT NULL,
  min_age              integer,          -- NULL = no lower age bound
  max_age              integer,          -- NULL = no upper age bound
  max_income_bracket   text,             -- NULL = no income restriction (uses ladder order below)
  eligible_categories  text[],           -- NULL = all categories eligible
  eligible_occupations text[],           -- NULL = all occupations eligible
  eligible_genders     text[],           -- NULL = all genders eligible
  created_at           timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Income bracket ladder (ordered low to high, for "max income" checks):
-- '0-2.5L', '2.5L-5L', '5L-8L', '8L-12L', '12L+'

-- ─────────────────────────────────────────────────────────────────────────────
-- SEED DATA — representative schemes for AC-2 test coverage
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO scheme_registry (id, name, ministry, description, min_age, max_age, max_income_bracket, eligible_categories, eligible_occupations, eligible_genders) VALUES

-- Will match AC-2 profile (age=22, General, student, 0-2.5L, Male)
(gen_random_uuid(), 'National Scholarship Portal (NSP) - Central Sector',
 'Ministry of Education',
 'Scholarships for meritorious students from low-income families to pursue higher education.',
 15, 30, '2.5L-5L',
 ARRAY['General', 'OBC', 'SC', 'ST', 'EWS'],
 ARRAY['student'],
 NULL),

-- Will match AC-2 profile (General, student, open income)
(gen_random_uuid(), 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
 'Ministry of Skill Development and Entrepreneurship',
 'Free short-term skill training and certification for youth to improve employability.',
 15, 35, NULL,
 ARRAY['General', 'OBC', 'SC', 'ST', 'EWS'],
 ARRAY['student', 'unemployed', 'other'],
 NULL),

-- Will NOT match AC-2 (farmer only — occupation mismatch)
(gen_random_uuid(), 'PM-KISAN Samman Nidhi',
 'Ministry of Agriculture and Farmers Welfare',
 'Income support of ₹6,000/year directly to small and marginal farmer families.',
 18, NULL, NULL,
 NULL,
 ARRAY['farmer'],
 NULL),

-- Will NOT match AC-2 (female only — gender mismatch)
(gen_random_uuid(), 'Beti Bachao Beti Padhao',
 'Ministry of Women and Child Development',
 'Scheme to address the declining Child Sex Ratio and promote girl child education and welfare.',
 NULL, 18, NULL,
 NULL,
 NULL,
 ARRAY['Female']),

-- Will match SC/ST/OBC/EWS profiles (NOT General — demonstrates category filtering)
(gen_random_uuid(), 'Post-Matric Scholarship for SC Students',
 'Ministry of Social Justice and Empowerment',
 'Financial assistance to SC students studying at post-matriculation or post-secondary stages.',
 NULL, 35, '5L-8L',
 ARRAY['SC'],
 ARRAY['student'],
 NULL),

-- Will match employed/self-employed, any income (demonstrates occupation match)
(gen_random_uuid(), 'Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)',
 'Ministry of Finance',
 'Life insurance cover of ₹2 lakh for accidental death at a renewable annual premium of ₹436.',
 18, 50, NULL,
 NULL,
 ARRAY['employed', 'self-employed', 'farmer'],
 NULL),

-- Will match EWS + income restricted
(gen_random_uuid(), 'Pradhan Mantri Awas Yojana - Urban (PMAY-U)',
 'Ministry of Housing and Urban Affairs',
 'Credit-linked subsidy for housing loans for EWS and low-income group beneficiaries.',
 21, NULL, '5L-8L',
 ARRAY['EWS', 'OBC', 'SC', 'ST'],
 NULL,
 NULL),

-- Will match young entrepreneurs (self-employed)
(gen_random_uuid(), 'PM Employment Generation Programme (PMEGP)',
 'Ministry of MSME',
 'Credit-linked subsidy for setting up new micro-enterprises in non-farm sector to generate employment.',
 18, 35, '5L-8L',
 NULL,
 ARRAY['unemployed', 'self-employed', 'other'],
 NULL);
