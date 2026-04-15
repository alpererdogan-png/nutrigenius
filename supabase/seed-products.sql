-- ============================================================================
-- NutriGenius: Affiliate products seed (76 rows across 20 supplements)
-- ============================================================================
-- Ported from app/api/seed-products/route.ts (deleted). Run this manually in
-- the Supabase SQL Editor if the affiliate_products table ever needs to be
-- repopulated.
--
-- Prerequisites:
--   • The `supplements` table must already contain rows with names matching
--     the `supplement_name` values in the VALUES list below. Supplements
--     that can't be resolved are silently skipped.
--
-- Safety:
--   • Idempotent — uses WHERE NOT EXISTS keyed on (brand, product_name), so
--     re-running the script inserts nothing on rows that already exist and
--     only fills in anything missing.
--   • No table mutation other than INSERTs into affiliate_products.
--
-- Affiliate URL:
--   Each row's affiliate_url is computed the same way the old route did via
--   getAmazonLink(supplementName, brand) in lib/amazon-affiliate.ts:
--     'https://www.amazon.com/s?k=<supplement + brand + " supplement">&tag=clareohealth-20'
--   URL-encoding is a simple space→%20 replacement; no other characters in
--   the current dataset require encoding.
-- ============================================================================

WITH products (supplement_name, brand, product_name, price_usd, halal_certified, quality_verified) AS (
  VALUES
    -- Vitamin D3
    ('Vitamin D3',     'NOW Foods',           'Vitamin D-3, 5,000 IU, 240 Softgels',                          9.99::numeric,  false, true),
    ('Vitamin D3',     'Thorne',              'Vitamin D/K2 Liquid, 1 fl oz',                                24.00::numeric, false, true),
    ('Vitamin D3',     'Doctor''s Best',      'Vitamin D3, 5,000 IU, 720 Softgels',                          12.99::numeric, false, true),
    ('Vitamin D3',     'Pure Encapsulations', 'Vitamin D3, 5,000 IU, 120 Capsules',                          22.50::numeric, true,  true),

    -- Magnesium
    ('Magnesium',      'Doctor''s Best',      'High Absorption Magnesium, 240 Tablets',                      14.99::numeric, false, true),
    ('Magnesium',      'NOW Foods',           'Magnesium Glycinate, 180 Tablets',                            19.99::numeric, false, true),
    ('Magnesium',      'Thorne',              'Magnesium Bisglycinate Powder, 6.7 oz',                       29.00::numeric, false, true),
    ('Magnesium',      'Pure Encapsulations', 'Magnesium Glycinate, 180 Capsules',                           31.40::numeric, true,  true),

    -- Omega-3
    ('Omega-3',        'Nordic Naturals',     'Ultimate Omega, 1280 mg, 60 Soft Gels',                       36.95::numeric, false, true),
    ('Omega-3',        'NOW Foods',           'Ultra Omega-3, 180 Softgels',                                 20.99::numeric, false, true),
    ('Omega-3',        'Jarrow Formulas',     'Max DHA, 90 Softgels',                                        22.99::numeric, false, true),
    ('Omega-3',        'Life Extension',      'Super Omega-3, 120 Softgels',                                 18.00::numeric, false, true),

    -- Vitamin B12
    ('Vitamin B12',    'Jarrow Formulas',     'Methyl B-12, 1,000 mcg, 100 Lozenges',                         9.99::numeric, false, true),
    ('Vitamin B12',    'NOW Foods',           'Methyl B-12, 1,000 mcg, 100 Lozenges',                         8.99::numeric, false, true),
    ('Vitamin B12',    'Solgar',              'Sublingual Vitamin B12, 1,000 mcg, 250 Nuggets',              15.99::numeric, false, true),
    ('Vitamin B12',    'Thorne',              'B-Complex #12, 60 Capsules',                                  24.00::numeric, false, true),

    -- Iron
    ('Iron',           'Thorne',              'Iron Bisglycinate, 60 Capsules',                              14.00::numeric, false, true),
    ('Iron',           'Solgar',              'Gentle Iron, 25 mg, 180 Veggie Caps',                         16.29::numeric, false, true),
    ('Iron',           'Doctor''s Best',      'Easy to Absorb Iron, 25 mg, 120 Veggie Caps',                 10.99::numeric, false, true),

    -- Zinc
    ('Zinc',           'Thorne',              'Zinc Picolinate 15 mg, 60 Capsules',                          10.00::numeric, false, true),
    ('Zinc',           'NOW Foods',           'Zinc 50 mg, 250 Tablets',                                      9.99::numeric, false, true),
    ('Zinc',           'Doctor''s Best',      'PepsiZinc (Zinc-Carnosine), 120 Veggie Caps',                 19.99::numeric, false, true),
    ('Zinc',           'Jarrow Formulas',     'Zinc Balance, 100 Capsules',                                   8.99::numeric, false, true),

    -- Vitamin C
    ('Vitamin C',      'NOW Foods',           'Vitamin C-1000, 100 Tablets',                                  9.99::numeric, false, true),
    ('Vitamin C',      'Solgar',              'Ester-C Plus 1,000 mg, 180 Tablets',                          26.99::numeric, false, true),
    ('Vitamin C',      'Thorne',              'Ascorbic Acid, 250 Veggie Caps',                              20.00::numeric, false, true),

    -- Probiotics
    ('Probiotics',     'Garden of Life',      'Dr. Formulated Once Daily Probiotics, 30 ct',                 29.99::numeric, true,  true),
    ('Probiotics',     'Jarrow Formulas',     'Jarro-Dophilus EPS, 120 Capsules',                            32.99::numeric, false, true),
    ('Probiotics',     'NOW Foods',           'Probiotic-10, 25 Billion, 50 Veg Caps',                       20.99::numeric, false, true),
    ('Probiotics',     'Solgar',              'Advanced Multi-Billion Dophilus, 120 Veg Caps',               29.99::numeric, false, true),

    -- Ashwagandha
    ('Ashwagandha',    'NOW Foods',           'Ashwagandha 450 mg, 90 Capsules',                             14.99::numeric, false, true),
    ('Ashwagandha',    'Jarrow Formulas',     'Sensoril Ashwagandha 225 mg, 120 Caps',                       22.99::numeric, false, true),
    ('Ashwagandha',    'Life Extension',      'Optimized Ashwagandha, 60 Capsules',                          15.00::numeric, false, true),
    ('Ashwagandha',    'Doctor''s Best',      'Ashwagandha with Sensoril, 60 Veggie Caps',                   18.99::numeric, false, true),

    -- CoQ10
    ('CoQ10',          'Doctor''s Best',      'High Absorption CoQ10 with BioPerine, 100 mg, 120 Softgels',  28.99::numeric, false, true),
    ('CoQ10',          'NOW Foods',           'CoQ10, 100 mg, 180 Softgels',                                 34.99::numeric, false, true),
    ('CoQ10',          'Life Extension',      'Super Ubiquinol CoQ10, 100 mg, 60 Softgels',                  44.00::numeric, false, true),
    ('CoQ10',          'Jarrow Formulas',     'QH-Absorb, 200 mg, 60 Softgels',                              34.99::numeric, false, true),

    -- Curcumin
    ('Curcumin',       'Doctor''s Best',      'Curcumin C3 Complex 500 mg, 120 Tablets',                     21.99::numeric, false, true),
    ('Curcumin',       'Jarrow Formulas',     'Curcumin Phytosome Meriva 500 mg, 120 Caps',                  29.99::numeric, false, true),
    ('Curcumin',       'NOW Foods',           'Curcumin Extract, 665 mg, 60 Softgels',                       19.99::numeric, false, true),
    ('Curcumin',       'Life Extension',      'Super Bio-Curcumin 400 mg, 60 Veggie Caps',                   27.00::numeric, false, true),

    -- Folate / Methylfolate
    ('Folate',         'Jarrow Formulas',     'Methyl Folate 400 mcg, 60 Capsules',                           8.99::numeric, false, true),
    ('Folate',         'Thorne',              '5-MTHF 1 mg, 60 Capsules',                                    18.00::numeric, false, true),
    ('Folate',         'NOW Foods',           'Methylfolate 1,000 mcg, 90 Veg Caps',                         12.99::numeric, false, true),
    ('Folate',         'Pure Encapsulations', 'Folate 400 mcg, 90 Capsules',                                 21.60::numeric, true,  true),

    -- NAC
    ('NAC',            'NOW Foods',           'NAC 600 mg, 250 Veg Caps',                                    19.99::numeric, false, true),
    ('NAC',            'Jarrow Formulas',     'NAC 500 mg, 100 Capsules',                                    12.99::numeric, false, true),
    ('NAC',            'Life Extension',      'NAC 600 mg, 60 Capsules',                                     12.00::numeric, false, true),
    ('NAC',            'Doctor''s Best',      'NAC Detox Regulators, 60 Capsules',                           16.99::numeric, false, true),

    -- L-Theanine
    ('L-Theanine',     'NOW Foods',           'L-Theanine 200 mg, 120 Veg Caps',                             17.99::numeric, false, true),
    ('L-Theanine',     'Jarrow Formulas',     'L-Theanine 100 mg, 60 Capsules',                              12.99::numeric, false, true),
    ('L-Theanine',     'Doctor''s Best',      'L-Theanine 150 mg, 90 Veggie Caps',                           15.99::numeric, false, true),
    ('L-Theanine',     'Life Extension',      'L-Theanine 100 mg, 60 Capsules',                              14.00::numeric, false, true),

    -- Melatonin
    ('Melatonin',      'NOW Foods',           'Melatonin 3 mg, 180 Capsules',                                10.99::numeric, false, true),
    ('Melatonin',      'Solgar',              'Melatonin 3 mg, 120 Nuggets',                                 13.99::numeric, false, true),
    ('Melatonin',      'Life Extension',      'Melatonin 1 mg, 60 Capsules',                                  7.00::numeric, false, true),

    -- Collagen
    ('Collagen',       'Garden of Life',      'Grass Fed Collagen Beauty Powder, 12 oz',                     33.99::numeric, false, true),
    ('Collagen',       'NOW Foods',           'Hydrolyzed Collagen Powder, 12 oz',                           24.99::numeric, false, true),
    ('Collagen',       'Solgar',              'Collagen Hyaluronic Acid Complex, 120 Tablets',               29.99::numeric, false, true),

    -- Berberine
    ('Berberine',      'Doctor''s Best',      'Berberine HCl 500 mg, 60 Veggie Caps',                        19.99::numeric, false, true),
    ('Berberine',      'Life Extension',      'Optimized Berberine 1,200 mg, 60 Veggie Caps',                25.00::numeric, false, true),
    ('Berberine',      'Jarrow Formulas',     'Berberine 500 mg, 60 Capsules',                               22.99::numeric, false, true),
    ('Berberine',      'NOW Foods',           'Berberine Glucose Support, 90 Veg Caps',                      26.99::numeric, false, true),

    -- Rhodiola
    ('Rhodiola',       'NOW Foods',           'Rhodiola 300 mg, 60 Veg Caps',                                13.99::numeric, false, true),
    ('Rhodiola',       'Life Extension',      'Rhodiola Extract 250 mg, 60 Veggie Caps',                     14.00::numeric, false, true),
    ('Rhodiola',       'Jarrow Formulas',     'Rhodiola Rosea 500 mg, 60 Capsules',                          15.99::numeric, false, true),
    ('Rhodiola',       'Doctor''s Best',      'RhodiolaHP 250 mg, 60 Capsules',                              16.99::numeric, false, true),

    -- Lion's Mane
    ('Lion''s Mane',   'NOW Foods',           'Lion''s Mane 500 mg, 60 Veg Caps',                            16.99::numeric, false, true),
    ('Lion''s Mane',   'Life Extension',      'Lion''s Mane Mushroom 500 mg, 60 Veggie Caps',                19.00::numeric, false, true),
    ('Lion''s Mane',   'Jarrow Formulas',     'Lion''s Mane 500 mg, 60 Capsules',                            19.99::numeric, false, true),
    ('Lion''s Mane',   'Solgar',              'Lion''s Mane Mushroom, 60 Vegetable Capsules',                23.99::numeric, false, true),

    -- Myo-Inositol
    ('Myo-Inositol',   'NOW Foods',           'Inositol Powder 4 oz',                                         9.99::numeric, false, true),
    ('Myo-Inositol',   'Jarrow Formulas',     'Inositol 750 mg, 100 Capsules',                               12.99::numeric, false, true),
    ('Myo-Inositol',   'Life Extension',      'InositolCaps 1,000 mg, 360 Capsules',                         19.00::numeric, false, true),
    ('Myo-Inositol',   'Pure Encapsulations', 'Inositol 500 mg, 180 Capsules',                               30.70::numeric, true,  true)
)
INSERT INTO affiliate_products (
  supplement_id, brand, product_name, affiliate_url,
  price_usd, halal_certified, quality_verified, available_countries
)
SELECT
  s.id,
  p.brand,
  p.product_name,
  'https://www.amazon.com/s?k='
    || replace(p.supplement_name || ' ' || p.brand || ' supplement', ' ', '%20')
    || '&tag=clareohealth-20',
  p.price_usd,
  p.halal_certified,
  p.quality_verified,
  ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']
FROM products p
JOIN supplements s ON s.name = p.supplement_name
WHERE NOT EXISTS (
  SELECT 1
  FROM affiliate_products ap
  WHERE ap.brand = p.brand AND ap.product_name = p.product_name
);

-- Verify row count
SELECT count(*) AS affiliate_products_total FROM affiliate_products;
