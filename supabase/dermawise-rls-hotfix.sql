-- ============================================================================
-- DermaWise: RLS hotfix — run this in the SAME Supabase project
-- ============================================================================
--
-- WHY THIS EXISTS
--   The NutriGenius RLS script (supabase-rls-setup.sql) originally had a
--   catch-all that enabled RLS on EVERY table in the public schema —
--   including Dermawise's `dw_*` tables — while dropping any policies they
--   had. Result: Dermawise reads started failing with RLS deny-all.
--
--   The NutriGenius script has since been scoped to skip `dw_*` tables, so
--   future re-runs won't repeat the problem. This file restores the minimum
--   policies Dermawise needs to function.
--
-- ARCHITECTURE ASSUMPTION
--   Dermawise mirrors NutriGenius:
--     • dw_blog_posts           → public read (anon + authenticated)
--     • dw_newsletter_subscribers → anon INSERT only; authenticated SELECT/UPDATE
--   If Dermawise's real access pattern differs, edit before running.
--
-- SAFETY
--   Idempotent — drops any existing policies on these two tables first
--   (scoped narrowly — does NOT touch non-dw policies), then re-creates
--   them.
-- ============================================================================


-- ─── 1. Drop existing policies on dw_* tables (scoped, idempotent) ─────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename LIKE 'dw\_%' ESCAPE '\'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;


-- ─── 2. Ensure RLS is enabled on dw_* tables ───────────────────────────────

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename LIKE 'dw\_%' ESCAPE '\'
  ) LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;


-- ─── 3. dw_blog_posts — public read ────────────────────────────────────────

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'dw_blog_posts'
  ) THEN
    CREATE POLICY "Public read: dw_blog_posts"
      ON public.dw_blog_posts FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;


-- ─── 4. dw_newsletter_subscribers — anon INSERT, authenticated SELECT/UPDATE ──

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'dw_newsletter_subscribers'
  ) THEN
    CREATE POLICY "Anon can subscribe: dw_newsletter_subscribers"
      ON public.dw_newsletter_subscribers FOR INSERT
      TO anon
      WITH CHECK (true);

    CREATE POLICY "Authenticated read: dw_newsletter_subscribers"
      ON public.dw_newsletter_subscribers FOR SELECT
      TO authenticated
      USING (true);

    CREATE POLICY "Authenticated update: dw_newsletter_subscribers"
      ON public.dw_newsletter_subscribers FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;


-- ─── 5. Verify ──────────────────────────────────────────────────────────────

SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename LIKE 'dw\_%' ESCAPE '\'
ORDER BY tablename, cmd, policyname;


-- ============================================================================
-- After running: confirm the Dermawise site loads its blog and that the
-- newsletter signup form succeeds. If either fails, the access pattern
-- differs from NutriGenius — paste the failing query and we can adjust.
-- ============================================================================
