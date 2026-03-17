-- affiliate_products seed data
-- 76 products across 20 supplements, looked up by name from supplements table

-- Vitamin D3
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin D-3, 5,000 IU, 240 Softgels', 'https://www.iherb.com/pr/now-foods-vitamin-d-3-5-000-iu-240-softgels?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin D3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Vitamin D/K2 Liquid, 1 fl oz', 'https://www.iherb.com/pr/thorne-research-vitamin-d-k2-liquid-1-fl-oz?rcode=NUTRIGENIUS', 24.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin D3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Vitamin D3, 5,000 IU, 720 Softgels', 'https://www.iherb.com/pr/doctor-s-best-vitamin-d3-5000-iu-720-softgels?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin D3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Pure Encapsulations', 'Vitamin D3, 5,000 IU, 120 Capsules', 'https://www.iherb.com/pr/pure-encapsulations-vitamin-d3-5-000-iu-120-capsules?rcode=NUTRIGENIUS', 22.50, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin D3';

-- Magnesium
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'High Absorption Magnesium, 240 Tablets', 'https://www.iherb.com/pr/doctor-s-best-high-absorption-magnesium-240-tablets?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Magnesium';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Magnesium Glycinate, 180 Tablets', 'https://www.iherb.com/pr/now-foods-magnesium-glycinate-180-tablets?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Magnesium';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Magnesium Bisglycinate Powder, 6.7 oz', 'https://www.iherb.com/pr/thorne-research-magnesium-bisglycinate-powder?rcode=NUTRIGENIUS', 29.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Magnesium';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Pure Encapsulations', 'Magnesium Glycinate, 180 Capsules', 'https://www.iherb.com/pr/pure-encapsulations-magnesium-glycinate-180-capsules?rcode=NUTRIGENIUS', 31.40, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Magnesium';

-- Omega-3
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Nordic Naturals', 'Ultimate Omega, 1280 mg, 60 Soft Gels', 'https://www.iherb.com/pr/nordic-naturals-ultimate-omega-1280-mg-60-soft-gels?rcode=NUTRIGENIUS', 36.95, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Omega-3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Ultra Omega-3, 180 Softgels', 'https://www.iherb.com/pr/now-foods-ultra-omega-3-180-softgels?rcode=NUTRIGENIUS', 20.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Omega-3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Max DHA, 90 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-max-dha-90-softgels?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Omega-3';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Super Omega-3, 120 Softgels', 'https://www.iherb.com/pr/life-extension-super-omega-3-epa-dha-120-softgels?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Omega-3';

-- Vitamin B12
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Methyl B-12, 1,000 mcg, 100 Lozenges', 'https://www.iherb.com/pr/jarrow-formulas-methyl-b-12-1000-mcg-100-lozenges?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B12';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Methyl B-12, 1,000 mcg, 100 Lozenges', 'https://www.iherb.com/pr/now-foods-methyl-b-12-1-000-mcg-100-lozenges?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B12';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Sublingual Vitamin B12, 1,000 mcg, 250 Nuggets', 'https://www.iherb.com/pr/solgar-sublingual-vitamin-b12-1000-mcg-250-nuggets?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B12';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'B-Complex #12, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-b-complex-12-60-capsules?rcode=NUTRIGENIUS', 24.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B12';

-- Iron
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Iron Bisglycinate, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-iron-bisglycinate-60-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iron';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Gentle Iron, 25 mg, 180 Veggie Caps', 'https://www.iherb.com/pr/solgar-gentle-iron-25-mg-180-vegetable-capsules?rcode=NUTRIGENIUS', 16.29, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iron';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Easy to Absorb Iron, 25 mg, 120 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-easy-to-absorb-iron-25mg-120-veggie-caps?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iron';

-- Zinc
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Zinc Picolinate 15 mg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-zinc-picolinate-15-mg-60-capsules?rcode=NUTRIGENIUS', 10.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Zinc';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Zinc 50 mg, 250 Tablets', 'https://www.iherb.com/pr/now-foods-zinc-50-mg-250-tablets?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Zinc';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'PepsiZinc (Zinc-Carnosine), 120 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-pepsizinc-zinc-carnosine-120-veggie-caps?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Zinc';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Zinc Balance, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-zinc-balance-100-capsules?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Zinc';

-- Vitamin C
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin C-1000, 100 Tablets', 'https://www.iherb.com/pr/now-foods-vitamin-c-1-000-100-tablets?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin C';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Ester-C Plus 1,000 mg, 180 Tablets', 'https://www.iherb.com/pr/solgar-ester-c-plus-vitamin-c-1000-mg-180-tablets?rcode=NUTRIGENIUS', 26.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin C';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Ascorbic Acid, 250 Veggie Caps', 'https://www.iherb.com/pr/thorne-research-ascorbic-acid-250-veggie-caps?rcode=NUTRIGENIUS', 20.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin C';

-- Probiotics
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Garden of Life', 'Dr. Formulated Once Daily Probiotics, 30 ct', 'https://www.iherb.com/pr/garden-of-life-dr-formulated-probiotics-once-daily-30-ct?rcode=NUTRIGENIUS', 29.99, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Probiotics';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Jarro-Dophilus EPS, 120 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-jarro-dophilus-eps-120-capsules?rcode=NUTRIGENIUS', 32.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Probiotics';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Probiotic-10, 25 Billion, 50 Veg Caps', 'https://www.iherb.com/pr/now-foods-probiotic-10-25-billion-50-veg-capsules?rcode=NUTRIGENIUS', 20.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Probiotics';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Advanced Multi-Billion Dophilus, 120 Veg Caps', 'https://www.iherb.com/pr/solgar-advanced-multi-billion-dophilus-120-veggie-caps?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Probiotics';

-- Ashwagandha
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Ashwagandha 450 mg, 90 Capsules', 'https://www.iherb.com/pr/now-foods-ashwagandha-450-mg-90-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ashwagandha';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Sensoril Ashwagandha 225 mg, 120 Caps', 'https://www.iherb.com/pr/jarrow-formulas-sensoril-ashwagandha-225-mg-120-veggie-caps?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ashwagandha';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Ashwagandha, 60 Capsules', 'https://www.iherb.com/pr/life-extension-optimized-ashwagandha-60-capsules?rcode=NUTRIGENIUS', 15.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ashwagandha';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Ashwagandha with Sensoril, 60 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-ashwagandha-with-sensoril-60-veggie-caps?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ashwagandha';

-- CoQ10
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'High Absorption CoQ10 with BioPerine, 100 mg, 120 Softgels', 'https://www.iherb.com/pr/doctor-s-best-high-absorption-coq10-100-mg-120-softgels?rcode=NUTRIGENIUS', 28.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'CoQ10';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'CoQ10, 100 mg, 180 Softgels', 'https://www.iherb.com/pr/now-foods-coq10-100-mg-180-softgels?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'CoQ10';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Super Ubiquinol CoQ10, 100 mg, 60 Softgels', 'https://www.iherb.com/pr/life-extension-super-ubiquinol-coq10-100-mg-60-softgels?rcode=NUTRIGENIUS', 44.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'CoQ10';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'QH-Absorb, 200 mg, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-qh-absorb-200-mg-60-softgels?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'CoQ10';

-- Curcumin
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Curcumin C3 Complex 500 mg, 120 Tablets', 'https://www.iherb.com/pr/doctor-s-best-high-absorption-curcumin-500-mg-120-tablets?rcode=NUTRIGENIUS', 21.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Curcumin';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Curcumin Phytosome Meriva 500 mg, 120 Caps', 'https://www.iherb.com/pr/jarrow-formulas-curcumin-phytosome-meriva-500-mg-120-capsules?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Curcumin';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Curcumin Extract, 665 mg, 60 Softgels', 'https://www.iherb.com/pr/now-foods-curcumin-extract-665-mg-60-softgels?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Curcumin';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Super Bio-Curcumin 400 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-super-bio-curcumin-400-mg-60-veggie-caps?rcode=NUTRIGENIUS', 27.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Curcumin';

-- Folate
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Methyl Folate 400 mcg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-methyl-folate-400-mcg-60-capsules?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Folate';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', '5-MTHF 1 mg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-5-methyltetrahydrofolate-5-mthf-1-mg-60-capsules?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Folate';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Methylfolate 1,000 mcg, 90 Veg Caps', 'https://www.iherb.com/pr/now-foods-methylfolate-1-000-mcg-90-veg-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Folate';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Pure Encapsulations', 'Folate 400 mcg, 90 Capsules', 'https://www.iherb.com/pr/pure-encapsulations-folate-400-mcg-90-capsules?rcode=NUTRIGENIUS', 21.60, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Folate';

-- NAC
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'NAC 600 mg, 250 Veg Caps', 'https://www.iherb.com/pr/now-foods-nac-n-acetyl-cysteine-600-mg-250-veg-capsules?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'NAC';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'NAC 500 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-nac-n-acetyl-l-cysteine-500-mg-100-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'NAC';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'NAC 600 mg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-nac-n-acetyl-l-cysteine-600-mg-60-capsules?rcode=NUTRIGENIUS', 12.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'NAC';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'NAC Detox Regulators, 60 Capsules', 'https://www.iherb.com/pr/doctor-s-best-nac-detox-regulators-60-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'NAC';

-- L-Theanine
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'L-Theanine 200 mg, 120 Veg Caps', 'https://www.iherb.com/pr/now-foods-l-theanine-200-mg-120-veg-capsules?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'L-Theanine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'L-Theanine 100 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-l-theanine-100-mg-60-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'L-Theanine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'L-Theanine 150 mg, 90 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-l-theanine-150-mg-90-veggie-caps?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'L-Theanine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'L-Theanine 100 mg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-l-theanine-100-mg-60-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'L-Theanine';

-- Melatonin
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Melatonin 3 mg, 180 Capsules', 'https://www.iherb.com/pr/now-foods-melatonin-3-mg-180-capsules?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Melatonin';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Melatonin 3 mg, 120 Nuggets', 'https://www.iherb.com/pr/solgar-melatonin-3-mg-120-nuggets?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Melatonin';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Melatonin 1 mg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-melatonin-1-mg-60-capsules?rcode=NUTRIGENIUS', 7.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Melatonin';

-- Collagen
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Garden of Life', 'Grass Fed Collagen Beauty Powder, 12 oz', 'https://www.iherb.com/pr/garden-of-life-grass-fed-collagen-beauty-vanilla-12-oz-powder?rcode=NUTRIGENIUS', 33.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Collagen';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Hydrolyzed Collagen Powder, 12 oz', 'https://www.iherb.com/pr/now-foods-hydrolyzed-collagen-natural-unflavored-12-oz-powder?rcode=NUTRIGENIUS', 24.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Collagen';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Collagen Hyaluronic Acid Complex, 120 Tablets', 'https://www.iherb.com/pr/solgar-collagen-hyaluronic-acid-complex-120-tablets?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Collagen';

-- Berberine
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Berberine HCl 500 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-berberine-hcl-500-mg-60-veggie-caps?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Berberine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Berberine 1,200 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-berberine-1200-mg-60-veggie-caps?rcode=NUTRIGENIUS', 25.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Berberine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Berberine 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-berberine-500-mg-60-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Berberine';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Berberine Glucose Support, 90 Veg Caps', 'https://www.iherb.com/pr/now-foods-berberine-glucose-support-90-veg-capsules?rcode=NUTRIGENIUS', 26.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Berberine';

-- Rhodiola
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Rhodiola 300 mg, 60 Veg Caps', 'https://www.iherb.com/pr/now-foods-rhodiola-300-mg-60-veg-capsules?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Rhodiola';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Rhodiola Extract 250 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-rhodiola-extract-250-mg-60-vegetarian-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Rhodiola';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Rhodiola Rosea 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-rhodiola-rosea-500-mg-60-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Rhodiola';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'RhodiolaHP 250 mg, 60 Capsules', 'https://www.iherb.com/pr/doctor-s-best-rhodiolahp-250-mg-60-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Rhodiola';

-- Lion's Mane
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Lion''s Mane 500 mg, 60 Veg Caps', 'https://www.iherb.com/pr/now-foods-lion-s-mane-500-mg-60-veg-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lion''s Mane';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Lion''s Mane Mushroom 500 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-lion-s-mane-mushroom-500-mg-60-veggie-caps?rcode=NUTRIGENIUS', 19.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lion''s Mane';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Lion''s Mane 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-lion-s-mane-500-mg-60-capsules?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lion''s Mane';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Lion''s Mane Mushroom, 60 Vegetable Capsules', 'https://www.iherb.com/pr/solgar-lion-s-mane-mushroom-60-vegetable-capsules?rcode=NUTRIGENIUS', 23.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lion''s Mane';

-- Myo-Inositol
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Inositol Powder 4 oz', 'https://www.iherb.com/pr/now-foods-inositol-powder-4-oz?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Myo-Inositol';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Inositol 750 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-inositol-750-mg-100-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Myo-Inositol';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'InositolCaps 1,000 mg, 360 Capsules', 'https://www.iherb.com/pr/life-extension-inositolcaps-1000-mg-360-capsules?rcode=NUTRIGENIUS', 19.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Myo-Inositol';

INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Pure Encapsulations', 'Inositol 500 mg, 180 Capsules', 'https://www.iherb.com/pr/pure-encapsulations-inositol-500-mg-180-capsules?rcode=NUTRIGENIUS', 30.70, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Myo-Inositol';

-- ─── Missing supplements (hardcoded UUIDs — correct DB names) ────────────────
-- Run these to add Omega-3 Fatty Acids, Coenzyme Q10, Collagen Peptides,
-- Rhodiola Rosea, and Lions Mane which were missing from the original seed.

-- Omega-3 Fatty Acids (5ce23718-719a-493d-a014-faab4edeb3c4)
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('5ce23718-719a-493d-a014-faab4edeb3c4', 'Nordic Naturals', 'Ultimate Omega, 1280 mg, 60 Soft Gels', 'https://www.iherb.com/pr/nordic-naturals-ultimate-omega-1280-mg-60-soft-gels?rcode=NUTRIGENIUS', 36.95, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('5ce23718-719a-493d-a014-faab4edeb3c4', 'NOW Foods', 'Ultra Omega-3, 180 Softgels', 'https://www.iherb.com/pr/now-foods-ultra-omega-3-180-softgels?rcode=NUTRIGENIUS', 20.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('5ce23718-719a-493d-a014-faab4edeb3c4', 'Jarrow Formulas', 'Max DHA, 90 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-max-dha-90-softgels?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('5ce23718-719a-493d-a014-faab4edeb3c4', 'Life Extension', 'Super Omega-3, 120 Softgels', 'https://www.iherb.com/pr/life-extension-super-omega-3-epa-dha-120-softgels?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);

-- Coenzyme Q10 (8d9db916-47ae-41ad-93e2-8a18f01917a9)
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('8d9db916-47ae-41ad-93e2-8a18f01917a9', 'Doctor''s Best', 'High Absorption CoQ10 with BioPerine, 100 mg, 120 Softgels', 'https://www.iherb.com/pr/doctor-s-best-high-absorption-coq10-100-mg-120-softgels?rcode=NUTRIGENIUS', 28.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('8d9db916-47ae-41ad-93e2-8a18f01917a9', 'NOW Foods', 'CoQ10, 100 mg, 180 Softgels', 'https://www.iherb.com/pr/now-foods-coq10-100-mg-180-softgels?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('8d9db916-47ae-41ad-93e2-8a18f01917a9', 'Life Extension', 'Super Ubiquinol CoQ10, 100 mg, 60 Softgels', 'https://www.iherb.com/pr/life-extension-super-ubiquinol-coq10-100-mg-60-softgels?rcode=NUTRIGENIUS', 44.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('8d9db916-47ae-41ad-93e2-8a18f01917a9', 'Jarrow Formulas', 'QH-Absorb, 200 mg, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-qh-absorb-200-mg-60-softgels?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);

-- Collagen Peptides (f4df255b-d186-4825-8126-ac84bbf125e9)
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('f4df255b-d186-4825-8126-ac84bbf125e9', 'Garden of Life', 'Grass Fed Collagen Beauty Powder, 12 oz', 'https://www.iherb.com/pr/garden-of-life-grass-fed-collagen-beauty-vanilla-12-oz-powder?rcode=NUTRIGENIUS', 33.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('f4df255b-d186-4825-8126-ac84bbf125e9', 'NOW Foods', 'Hydrolyzed Collagen Powder, 12 oz', 'https://www.iherb.com/pr/now-foods-hydrolyzed-collagen-natural-unflavored-12-oz-powder?rcode=NUTRIGENIUS', 24.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('f4df255b-d186-4825-8126-ac84bbf125e9', 'Solgar', 'Collagen Hyaluronic Acid Complex, 120 Tablets', 'https://www.iherb.com/pr/solgar-collagen-hyaluronic-acid-complex-120-tablets?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);

-- Rhodiola Rosea (0558456c-5ec6-4a13-8b61-ad5bca6d0829)
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('0558456c-5ec6-4a13-8b61-ad5bca6d0829', 'NOW Foods', 'Rhodiola 300 mg, 60 Veg Caps', 'https://www.iherb.com/pr/now-foods-rhodiola-300-mg-60-veg-capsules?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('0558456c-5ec6-4a13-8b61-ad5bca6d0829', 'Life Extension', 'Rhodiola Extract 250 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-rhodiola-extract-250-mg-60-vegetarian-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('0558456c-5ec6-4a13-8b61-ad5bca6d0829', 'Jarrow Formulas', 'Rhodiola Rosea 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-rhodiola-rosea-500-mg-60-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('0558456c-5ec6-4a13-8b61-ad5bca6d0829', 'Doctor''s Best', 'RhodiolaHP 250 mg, 60 Capsules', 'https://www.iherb.com/pr/doctor-s-best-rhodiolahp-250-mg-60-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);

-- Lions Mane (1ddf28a8-5f15-4645-8de1-a76497d33dec)
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('1ddf28a8-5f15-4645-8de1-a76497d33dec', 'NOW Foods', 'Lion''s Mane 500 mg, 60 Veg Caps', 'https://www.iherb.com/pr/now-foods-lion-s-mane-500-mg-60-veg-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('1ddf28a8-5f15-4645-8de1-a76497d33dec', 'Life Extension', 'Lion''s Mane Mushroom 500 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-lion-s-mane-mushroom-500-mg-60-veggie-caps?rcode=NUTRIGENIUS', 19.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('1ddf28a8-5f15-4645-8de1-a76497d33dec', 'Jarrow Formulas', 'Lion''s Mane 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-lion-s-mane-500-mg-60-capsules?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries) VALUES ('1ddf28a8-5f15-4645-8de1-a76497d33dec', 'Solgar', 'Lion''s Mane Mushroom, 60 Vegetable Capsules', 'https://www.iherb.com/pr/solgar-lion-s-mane-mushroom-60-vegetable-capsules?rcode=NUTRIGENIUS', 23.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA']);
