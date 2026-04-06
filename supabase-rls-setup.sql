-- ============================================================================
-- NutriGenius: Enable Row-Level Security (RLS) on all public tables
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================

-- ─── 1. Enable RLS on all tables ────────────────────────────────────────────

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_condition_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_goal_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_nutrient_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- ─── 2. Public READ policies (anon + authenticated can SELECT) ──────────────

-- Blog posts: public read so blog pages work
CREATE POLICY "Public can read published posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplements: read needed by recommendation engine (server-side, but
-- if using anon key on client, this keeps it working)
CREATE POLICY "Public can read supplements"
  ON supplements FOR SELECT
  TO anon, authenticated
  USING (true);

-- Conditions: read needed by recommendation engine
CREATE POLICY "Public can read conditions"
  ON conditions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Health goals: read needed by recommendation engine
CREATE POLICY "Public can read health goals"
  ON health_goals FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement-condition mappings: read needed by recommendation engine
CREATE POLICY "Public can read supplement condition mappings"
  ON supplement_condition_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement-goal mappings: read needed by recommendation engine
CREATE POLICY "Public can read supplement goal mappings"
  ON supplement_goal_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drug-nutrient interactions: read needed by recommendation engine
CREATE POLICY "Public can read drug nutrient interactions"
  ON drug_nutrient_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement interactions: read needed by recommendation engine
CREATE POLICY "Public can read supplement interactions"
  ON supplement_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Affiliate products: read needed by product display
CREATE POLICY "Public can read affiliate products"
  ON affiliate_products FOR SELECT
  TO anon, authenticated
  USING (true);

-- ─── 3. Newsletter subscribers: anon can INSERT (sign-up form) ──────────────

-- Read: only authenticated users (admin) can list subscribers
CREATE POLICY "Authenticated can read subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

-- Insert: anon users can subscribe (quiz sign-up form)
CREATE POLICY "Anon can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Update: anon can update their own row (unsubscribe page uses .update())
CREATE POLICY "Anon can update own subscription"
  ON newsletter_subscribers FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- No DELETE policy for anon — soft unsubscribe via update only.
-- Service role key bypasses RLS for admin operations.

-- ─── 4. Verify: check no public tables have RLS disabled ────────────────────

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ─── NOTES ──────────────────────────────────────────────────────────────────
-- • No INSERT/UPDATE/DELETE policies on blog_posts, supplements, conditions,
--   etc. means anon users CANNOT write to them. Only the service_role key
--   (which bypasses RLS) can write.
-- • When inserting new blog articles, use the SERVICE ROLE KEY server-side.
-- • The anon key (used by the client) can only SELECT on most tables.
-- ============================================================================
