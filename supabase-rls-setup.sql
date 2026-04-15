-- ============================================================================
-- NutriGenius: Row-Level Security (RLS) — Full Audit & Lockdown
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query).
-- ============================================================================
--
-- Fixes the Supabase Security Advisor warning:
--   "rls_disabled_in_public — Table publicly accessible"
--
-- This script is IDEMPOTENT — safe to re-run any time.
--
-- WHY THIS APP DOES NOT USE auth.uid() = user_id:
--   NutriGenius has no user accounts. All client traffic uses the anon
--   key; server routes use the service role key (bypasses RLS). There
--   are zero user-scoped tables — every public table is either:
--     • public-readable reference data (blog, supplements, engine data), or
--     • a write-only lead capture table (newsletter_subscribers).
--   Policies are therefore scoped by role (anon / authenticated) rather
--   than by user identity.
--
-- STEPS:
--   1. Run audit query 5a FIRST to see current state
--   2. Run Sections 1–4 to apply RLS
--   3. Run Section 5 to verify
-- ============================================================================


-- ─── 1. DROP EXISTING POLICIES (idempotent — safe to re-run) ────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ─── 2. ENABLE RLS ON EVERY TABLE IN public SCHEMA ──────────────────────────
-- Dynamic catch-all: guarantees the Security Advisor `rls_disabled_in_public`
-- warning clears for every current and future table in public. Tables with
-- no explicit policy below will be deny-all (safe default); if any of them
-- turn out to be used by the app, queries will fail visibly and we can add
-- a targeted policy rather than silently leaking data.

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;


-- ─── 3. READ-ONLY POLICIES FOR PUBLIC/REFERENCE TABLES ──────────────────────
-- anon + authenticated can SELECT. No INSERT/UPDATE/DELETE policies =
-- writes denied. Service role key bypasses RLS entirely (used by server
-- routes for seeding, newsletter send, unsubscribe, etc.).
--
-- `ALTER TABLE IF EXISTS` pattern via DO block so a missing table doesn't
-- abort the whole script.

DO $$
DECLARE
  tbl TEXT;
  public_read_tables TEXT[] := ARRAY[
    'blog_posts',                     -- blog listings + article pages
    'supplements',                    -- recommendation engine
    'conditions',                     -- recommendation engine
    'health_goals',                   -- recommendation engine
    'supplement_condition_mappings',  -- recommendation engine
    'supplement_goal_mappings',       -- recommendation engine
    'drug_nutrient_interactions',     -- safety layer
    'supplement_interactions',        -- safety layer
    'affiliate_products'              -- product cards on /results
  ];
BEGIN
  FOREACH tbl IN ARRAY public_read_tables LOOP
    IF EXISTS (
      SELECT 1 FROM pg_tables
      WHERE schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format(
        'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
        'Public read: ' || tbl,
        tbl
      );
    END IF;
  END LOOP;
END $$;


-- ─── 4. newsletter_subscribers — STRICT LOCKDOWN ────────────────────────────
-- • INSERT only for anon (subscribe form on quiz + landing)
-- • NO SELECT for anon (prevents email-list scraping)
-- • NO UPDATE/DELETE for anon (unsubscribe runs server-side via service role —
--   see app/api/unsubscribe/route.ts, which uses supabaseAdmin)
-- • authenticated role: read + update (reserved for future admin dashboard)
-- • Service role key (server) bypasses RLS entirely

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'newsletter_subscribers'
  ) THEN
    CREATE POLICY "Anon can subscribe"
      ON public.newsletter_subscribers FOR INSERT
      TO anon
      WITH CHECK (true);

    CREATE POLICY "Authenticated read: newsletter_subscribers"
      ON public.newsletter_subscribers FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated update: newsletter_subscribers"
      ON public.newsletter_subscribers FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;


-- ─── 5. VERIFICATION QUERIES ────────────────────────────────────────────────

-- 5a. RLS status on every public table — every row should show rowsecurity = true
SELECT tablename, rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5b. All active policies (who can do what)
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- 5c. Tables with RLS enabled but ZERO policies (deny-all — check if any
--     of these are expected to be app-accessible; if so, add a policy)
SELECT t.tablename
FROM pg_tables t
LEFT JOIN pg_policies p
  ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
  AND t.rowsecurity = true
  AND p.policyname IS NULL
GROUP BY t.tablename
ORDER BY t.tablename;


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
-- Service role key BYPASSES all RLS — used server-side for:
--   • Sending newsletters                        (app/api/send-newsletter)
--   • Unsubscribe/resubscribe operations         (app/api/unsubscribe)
--   • Newsletter signup                          (app/api/subscribe)
-- Seeding affiliate_products is now a manual one-shot run via
--   supabase/seed-products.sql in the SQL Editor.
-- Verified: every write path that RLS would block already uses supabaseAdmin
-- (lib/supabase-admin.ts → SUPABASE_SERVICE_ROLE_KEY).
-- ============================================================================
