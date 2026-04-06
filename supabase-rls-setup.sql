-- ============================================================================
-- NutriGenius: Row-Level Security (RLS) — Full Audit & Lockdown
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================================
--
-- STEP 1: Run the audit query first (at the bottom of this file, Section 5)
--         to see current state BEFORE applying changes.
--
-- STEP 2: Run everything from Section 1–4 to apply RLS.
--
-- STEP 3: Run the verification queries in Section 5 to confirm.
-- ============================================================================


-- ─── 1. DROP EXISTING POLICIES (idempotent — safe to re-run) ────────────────
-- If you've already run a previous version of this script, drop old policies
-- first to avoid "already exists" errors.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ─── 2. ENABLE RLS ON ALL PUBLIC TABLES ─────────────────────────────────────

-- PUBLIC CONTENT
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- ADMIN/INTERNAL (recommendation engine data)
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_condition_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_goal_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE drug_nutrient_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_products ENABLE ROW LEVEL SECURITY;

-- USER DATA
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- NOTE: If any of the above tables don't exist yet in your database,
-- comment out the corresponding line. The script will error on the
-- first missing table otherwise.


-- ─── 3. READ-ONLY POLICIES FOR PUBLIC/ADMIN TABLES ──────────────────────────
-- Anon + authenticated can SELECT. No INSERT/UPDATE/DELETE policies =
-- writes are DENIED for anon. Service role key bypasses RLS entirely.

-- Blog posts (public content — blog pages need this)
CREATE POLICY "Public read: blog_posts"
  ON blog_posts FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplements (recommendation engine reads these)
CREATE POLICY "Public read: supplements"
  ON supplements FOR SELECT
  TO anon, authenticated
  USING (true);

-- Conditions (recommendation engine reads these)
CREATE POLICY "Public read: conditions"
  ON conditions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Health goals (recommendation engine reads these)
CREATE POLICY "Public read: health_goals"
  ON health_goals FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement-condition mappings (recommendation engine)
CREATE POLICY "Public read: supplement_condition_mappings"
  ON supplement_condition_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement-goal mappings (recommendation engine)
CREATE POLICY "Public read: supplement_goal_mappings"
  ON supplement_goal_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Drug-nutrient interactions (safety layer)
CREATE POLICY "Public read: drug_nutrient_interactions"
  ON drug_nutrient_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Supplement interactions (safety layer)
CREATE POLICY "Public read: supplement_interactions"
  ON supplement_interactions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Affiliate products (product display on results page)
CREATE POLICY "Public read: affiliate_products"
  ON affiliate_products FOR SELECT
  TO anon, authenticated
  USING (true);


-- ─── 4. NEWSLETTER SUBSCRIBERS — STRICT LOCKDOWN ────────────────────────────
-- • INSERT only for anon (subscribe form)
-- • NO SELECT for anon (prevents email list scraping)
-- • NO UPDATE/DELETE for anon
-- • Service role key (server-side) handles unsubscribe, newsletters, etc.

CREATE POLICY "Anon can subscribe"
  ON newsletter_subscribers FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated users (admin dashboard) can read subscriber list
CREATE POLICY "Authenticated read: newsletter_subscribers"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update (admin operations)
CREATE POLICY "Authenticated update: newsletter_subscribers"
  ON newsletter_subscribers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


-- ─── 5. VERIFICATION QUERIES ────────────────────────────────────────────────

-- 5a. Check RLS status on all public tables (all should show true)
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5b. List all policies
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;


-- ============================================================================
-- SUMMARY OF POLICIES APPLIED
-- ============================================================================
--
-- TABLE                          | SELECT | INSERT | UPDATE | DELETE
-- -------------------------------|--------|--------|--------|-------
-- blog_posts                     | anon   | —      | —      | —
-- supplements                    | anon   | —      | —      | —
-- conditions                     | anon   | —      | —      | —
-- health_goals                   | anon   | —      | —      | —
-- supplement_condition_mappings  | anon   | —      | —      | —
-- supplement_goal_mappings       | anon   | —      | —      | —
-- drug_nutrient_interactions     | anon   | —      | —      | —
-- supplement_interactions        | anon   | —      | —      | —
-- affiliate_products             | anon   | —      | —      | —
-- newsletter_subscribers         | auth   | anon   | auth   | —
--
-- "anon" = anon + authenticated roles
-- "auth" = authenticated role only
-- "—"    = denied (no policy = denied when RLS is enabled)
--
-- Service role key BYPASSES all RLS — use it for:
--   • Inserting blog articles
--   • Seeding supplement data
--   • Sending newsletters (reading subscriber list)
--   • Unsubscribe operations (see note below)
--
-- ⚠ IMPORTANT: The /unsubscribe page currently does a client-side
--   UPDATE on newsletter_subscribers using the anon key. With this
--   strict RLS, that will STOP WORKING. You have two options:
--
--   Option A (recommended): Create a server-side API route
--     POST /api/unsubscribe { email } that uses the service role
--     key to update the subscriber row. Then update the unsubscribe
--     page to call that API instead of Supabase directly.
--
--   Option B (quick fix): Add an anon UPDATE policy:
--     CREATE POLICY "Anon can unsubscribe"
--       ON newsletter_subscribers FOR UPDATE
--       TO anon
--       USING (true)
--       WITH CHECK (subscribed = false);
--     This limits anon to only setting subscribed=false.
--
-- ============================================================================
