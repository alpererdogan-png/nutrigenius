-- fix-affiliate-products.sql
-- Adds 3 iHerb products for each of the 54 supplements missing from affiliate_products.
-- All supplement names exactly match the supplements table.
-- Run this in the Supabase SQL editor.

-- ─── Psyllium Husk ────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Psyllium Husk Caps 500 mg, 200 Capsules', 'https://www.iherb.com/pr/now-foods-psyllium-husk-caps-500-mg-200-capsules?rcode=NUTRIGENIUS', 11.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Psyllium Husk';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Psyllium Husks Fiber 500 mg, 200 Veggie Caps', 'https://www.iherb.com/pr/solgar-psyllium-husks-fiber-500-mg-200-vegetable-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Psyllium Husk';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Gentle Fibers, 16 oz Powder', 'https://www.iherb.com/pr/jarrow-formulas-gentle-fibers-stimulant-free-16-oz-powder?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Psyllium Husk';

-- ─── Vitamin K2 ───────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'MK-7 180 mcg, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-mk-7-180-mcg-60-softgels?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K2';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin K-2 100 mcg, 100 Capsules', 'https://www.iherb.com/pr/now-foods-vitamin-k-2-100-mcg-100-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K2';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Super K with Advanced K2 Complex, 90 Softgels', 'https://www.iherb.com/pr/life-extension-super-k-with-advanced-k2-complex-90-softgels?rcode=NUTRIGENIUS', 19.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K2';

-- ─── Vitamin K1 ───────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin K-1 100 mcg, 100 Tablets', 'https://www.iherb.com/pr/now-foods-vitamin-k-1-100-mcg-100-tablets?rcode=NUTRIGENIUS', 7.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K1';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Vitamin K 100 mcg, 100 Tablets', 'https://www.iherb.com/pr/solgar-vitamin-k-100-mcg-100-tablets?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K1';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Vitamin K1, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-vitamin-k1-60-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin K1';

-- ─── Vitamin A ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin A 10,000 IU, 100 Softgels', 'https://www.iherb.com/pr/now-foods-vitamin-a-10-000-iu-100-softgels?rcode=NUTRIGENIUS', 6.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin A';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Dry Vitamin A 1500 mcg, 100 Tablets', 'https://www.iherb.com/pr/solgar-dry-vitamin-a-1500-mcg-rae-100-tablets?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin A';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Vitamin A 1500 mcg, 100 Softgels', 'https://www.iherb.com/pr/life-extension-vitamin-a-1500-mcg-100-softgels?rcode=NUTRIGENIUS', 8.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin A';

-- ─── Vitamin E ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitamin E-400 Mixed Tocopherols, 100 Softgels', 'https://www.iherb.com/pr/now-foods-vitamin-e-400-mixed-tocopherols-100-softgels?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin E';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Famil-E, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-famil-e-60-softgels?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin E';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Gamma E Mixed Tocopherols, 60 Softgels', 'https://www.iherb.com/pr/life-extension-gamma-e-mixed-tocopherols-60-softgels?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin E';

-- ─── Vitamin B Complex ────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Basic B Complex, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-basic-b-complex-60-capsules?rcode=NUTRIGENIUS', 24.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B Complex';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'B-100, 100 Veg Capsules', 'https://www.iherb.com/pr/now-foods-b-100-100-veg-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B Complex';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'B-Right, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-b-right-100-capsules?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitamin B Complex';

-- ─── Calcium ──────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Calcium Citrate, 240 Tablets', 'https://www.iherb.com/pr/now-foods-calcium-citrate-240-tablets?rcode=NUTRIGENIUS', 11.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Calcium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Calcium Citrate with Vitamin D3, 240 Tablets', 'https://www.iherb.com/pr/solgar-calcium-citrate-with-vitamin-d3-240-tablets?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Calcium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Calcium-Magnesium Malate, 240 Capsules', 'https://www.iherb.com/pr/thorne-research-calcium-magnesium-malate-240-capsules?rcode=NUTRIGENIUS', 32.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Calcium';

-- ─── Selenium ─────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Selenium 200 mcg, 180 Tablets', 'https://www.iherb.com/pr/now-foods-selenium-200-mcg-180-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Selenium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Selenomethionine 200 mcg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-selenomethionine-200-mcg-60-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Selenium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Se-Methyl L-Selenocysteine 200 mcg, 90 Veggie Caps', 'https://www.iherb.com/pr/life-extension-se-methyl-l-selenocysteine-200-mcg-90-veggie-caps?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Selenium';

-- ─── Iodine ───────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Kelp 150 mcg Iodine, 200 Tablets', 'https://www.iherb.com/pr/now-foods-kelp-150-mcg-iodine-200-tablets?rcode=NUTRIGENIUS', 6.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iodine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Sea-Iodine 1,000 mcg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-sea-iodine-1000-mcg-60-capsules?rcode=NUTRIGENIUS', 9.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iodine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Potassium Iodide 130 mg, 60 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-potassium-iodide-130-mg-60-tablets?rcode=NUTRIGENIUS', 11.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Iodine';

-- ─── Biotin ───────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Biotin 5,000 mcg, 120 Veg Capsules', 'https://www.iherb.com/pr/now-foods-biotin-5-000-mcg-120-veg-capsules?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Biotin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Biotin 5000 mcg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-biotin-5000-mcg-100-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Biotin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Biotin 1000 mcg, 250 Tablets', 'https://www.iherb.com/pr/solgar-biotin-1000-mcg-250-tablets?rcode=NUTRIGENIUS', 12.99, true, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Biotin';

-- ─── Quercetin ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Quercetin with Bromelain, 120 Veg Capsules', 'https://www.iherb.com/pr/now-foods-quercetin-with-bromelain-120-veg-capsules?rcode=NUTRIGENIUS', 23.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Quercetin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Quercetin 250 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-quercetin-250-mg-60-veggie-caps?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Quercetin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Quercetin Bromelain, 180 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-quercetin-bromelain-180-veggie-caps?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Quercetin';

-- ─── Alpha-Lipoic Acid ────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Alpha-Lipoic Acid 600 mg, 180 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-alpha-lipoic-acid-600-mg-180-veggie-caps?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Alpha-Lipoic Acid';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Alpha Lipoic Acid 250 mg, 60 Veg Capsules', 'https://www.iherb.com/pr/now-foods-alpha-lipoic-acid-250-mg-60-veg-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Alpha-Lipoic Acid';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Alpha Lipoic Sustain 300 mg, 60 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-alpha-lipoic-sustain-300-mg-60-tablets?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Alpha-Lipoic Acid';

-- ─── Resveratrol ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Natural Resveratrol 200 mg, 120 Veg Caps', 'https://www.iherb.com/pr/now-foods-natural-resveratrol-200-mg-120-veg-caps?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Resveratrol';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Resveratrol 250 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-resveratrol-250-mg-60-veggie-caps?rcode=NUTRIGENIUS', 24.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Resveratrol';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Trans-Resveratrol 100 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-trans-resveratrol-100-mg-60-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Resveratrol';

-- ─── Phosphatidylserine ───────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Phosphatidyl Serine 100 mg, 120 Veg Caps', 'https://www.iherb.com/pr/now-foods-phosphatidyl-serine-100-mg-120-veg-caps?rcode=NUTRIGENIUS', 32.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Phosphatidylserine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'PS 100 Phosphatidylserine, 120 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-ps-100-phosphatidylserine-120-softgels?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Phosphatidylserine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Cognitex Basics, 30 Softgels', 'https://www.iherb.com/pr/life-extension-cognitex-basics-30-softgels?rcode=NUTRIGENIUS', 22.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Phosphatidylserine';

-- ─── 5-HTP ────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', '5-HTP 100 mg, 120 Veg Capsules', 'https://www.iherb.com/pr/now-foods-5-htp-100-mg-120-veg-capsules?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = '5-HTP';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', '5-HTP 50 mg, 90 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-5-htp-50-mg-90-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = '5-HTP';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', '5-HTP 100 mg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-5-htp-100-mg-60-capsules?rcode=NUTRIGENIUS', 13.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = '5-HTP';

-- ─── GABA ─────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'GABA 500 mg, 200 Veg Capsules', 'https://www.iherb.com/pr/now-foods-gaba-500-mg-200-veg-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'GABA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Theanine 200 mg + GABA 100 mg, 60 Caps', 'https://www.iherb.com/pr/jarrow-formulas-theanine-200-gaba-100-60-veggie-caps?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'GABA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Neuro-Mag GABA 750 mg, 60 Capsules', 'https://www.iherb.com/pr/life-extension-gaba-750-mg-60-capsules?rcode=NUTRIGENIUS', 11.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'GABA';

-- ─── Glycine ──────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Glycine Pure Powder, 1 lb', 'https://www.iherb.com/pr/now-foods-glycine-pure-powder-1-lb?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glycine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Glycine 1000 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-glycine-1000-mg-100-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glycine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Glycine 1000 mg, 180 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-glycine-1000-mg-180-veggie-caps?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glycine';

-- ─── Taurine ──────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Taurine 1000 mg, 250 Veg Capsules', 'https://www.iherb.com/pr/now-foods-taurine-1-000-mg-250-veg-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Taurine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Taurine 1000 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-taurine-1000-mg-100-capsules?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Taurine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Taurine 1000 mg, 90 Capsules', 'https://www.iherb.com/pr/life-extension-taurine-1000-mg-90-capsules?rcode=NUTRIGENIUS', 9.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Taurine';

-- ─── Milk Thistle ─────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Silymarin Milk Thistle Extract 300 mg, 200 Veg Caps', 'https://www.iherb.com/pr/now-foods-silymarin-milk-thistle-extract-300-mg-200-veg-caps?rcode=NUTRIGENIUS', 23.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Milk Thistle';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Silymarin Milk Thistle Extract, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-silymarin-milk-thistle-extract-60-veggie-caps?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Milk Thistle';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Milk Thistle 150 mg, 200 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-milk-thistle-150-mg-200-capsules?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Milk Thistle';

-- ─── Elderberry ───────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Elderberry 500 mg, 60 Veg Capsules', 'https://www.iherb.com/pr/now-foods-elderberry-500-mg-60-veg-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Elderberry';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Elderberry Syrup, 5.1 oz', 'https://www.iherb.com/pr/jarrow-formulas-elderberry-syrup-5-1-fl-oz?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Elderberry';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Standardized Elderberry Extract, 60 Capsules', 'https://www.iherb.com/pr/life-extension-standardized-elderberry-extract-60-capsules?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Elderberry';

-- ─── Echinacea ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Echinacea 400 mg, 250 Veg Capsules', 'https://www.iherb.com/pr/now-foods-echinacea-400-mg-250-veg-capsules?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Echinacea';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Echinacea Herb Extract, 60 Veggie Caps', 'https://www.iherb.com/pr/solgar-echinacea-herb-extract-60-vegetable-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Echinacea';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Echinacea Elite, 30 Capsules', 'https://www.iherb.com/pr/life-extension-echinacea-elite-30-capsules?rcode=NUTRIGENIUS', 12.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Echinacea';

-- ─── Spirulina ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Spirulina 500 mg, 200 Tablets', 'https://www.iherb.com/pr/now-foods-spirulina-500-mg-200-tablets?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Spirulina';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Spirulina 600 mg, 100 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-spirulina-600-mg-100-tablets?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Spirulina';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Pure Hawaiian Spirulina 500 mg, 180 Tablets', 'https://www.iherb.com/pr/doctor-s-best-pure-hawaiian-spirulina-500-mg-180-tablets?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Spirulina';

-- ─── Glucosamine ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Glucosamine & MSM, 240 Veg Capsules', 'https://www.iherb.com/pr/now-foods-glucosamine-msm-240-veg-capsules?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glucosamine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Glucosamine/Chondroitin/MSM, 240 Caps', 'https://www.iherb.com/pr/doctor-s-best-glucosamine-chondroitin-msm-240-caps?rcode=NUTRIGENIUS', 32.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glucosamine';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Glucosamine HCl 1000 mg, 60 Tablets', 'https://www.iherb.com/pr/solgar-glucosamine-hcl-1000-mg-60-tablets?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Glucosamine';

-- ─── Chondroitin ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Chondroitin Sulfate 600 mg, 120 Caps', 'https://www.iherb.com/pr/now-foods-chondroitin-sulfate-600-mg-120-caps?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chondroitin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Chondroitin 600 mg, 60 Capsules', 'https://www.iherb.com/pr/solgar-chondroitin-600-mg-60-capsules?rcode=NUTRIGENIUS', 27.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chondroitin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Glucosamine Chondroitin MSM with OptiMSM, 360 Caps', 'https://www.iherb.com/pr/doctor-s-best-glucosamine-chondroitin-msm-with-optimsm-360-caps?rcode=NUTRIGENIUS', 44.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chondroitin';

-- ─── MSM ──────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'MSM 1000 mg, 240 Capsules', 'https://www.iherb.com/pr/now-foods-msm-1000-mg-240-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'MSM';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'MSM with OptiMSM 1500 mg, 120 Tablets', 'https://www.iherb.com/pr/doctor-s-best-msm-with-optimsm-1500-mg-120-tablets?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'MSM';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'MSM Sulfur 1000 mg, 200 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-msm-sulfur-1000-mg-200-capsules?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'MSM';

-- ─── Lutein & Zeaxanthin ──────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Lutein & Zeaxanthin, 60 Softgels', 'https://www.iherb.com/pr/now-foods-lutein-zeaxanthin-60-softgels?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lutein & Zeaxanthin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Lutein/Zeaxanthin 20 mg, 60 Softgels', 'https://www.iherb.com/pr/life-extension-lutein-zeaxanthin-20-mg-60-softgels?rcode=NUTRIGENIUS', 16.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lutein & Zeaxanthin';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Lutein 20 mg, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-lutein-20-mg-60-softgels?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Lutein & Zeaxanthin';

-- ─── Digestive Enzymes ────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Super Enzymes, 180 Capsules', 'https://www.iherb.com/pr/now-foods-super-enzymes-180-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Digestive Enzymes';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Digestive Enzymes, 90 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-digestive-enzymes-90-veggie-caps?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Digestive Enzymes';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Jarro-Zymes Plus, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-jarro-zymes-plus-100-capsules?rcode=NUTRIGENIUS', 20.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Digestive Enzymes';

-- ─── Cranberry Extract ────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Cranberry Concentrate 700 mg, 100 Veg Caps', 'https://www.iherb.com/pr/now-foods-cranberry-concentrate-700-mg-100-veg-caps?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Cranberry Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Cranberry Extract, 30 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-cranberry-extract-30-veggie-caps?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Cranberry Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Cranberry Concentrate, 60 Veggie Caps', 'https://www.iherb.com/pr/solgar-cranberry-concentrate-60-veggie-capsules?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Cranberry Extract';

-- ─── D-Mannose ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'D-Mannose 500 mg, 120 Veg Capsules', 'https://www.iherb.com/pr/now-foods-d-mannose-500-mg-120-veg-capsules?rcode=NUTRIGENIUS', 24.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'D-Mannose';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'D-Mannose 1,000 mg, 90 Veggie Caps', 'https://www.iherb.com/pr/life-extension-d-mannose-1000-mg-90-veggie-caps?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'D-Mannose';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'D-Mannose + FOS, 2.5 oz Powder', 'https://www.iherb.com/pr/jarrow-formulas-d-mannose-fos-2-5-oz-powder?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'D-Mannose';

-- ─── Garlic Extract ───────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Odorless Garlic 50 mg, 250 Softgels', 'https://www.iherb.com/pr/now-foods-odorless-garlic-50-mg-250-softgels?rcode=NUTRIGENIUS', 11.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Garlic Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Kyolic Aged Garlic 600 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-kyolic-aged-garlic-extract-600-mg-100-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Garlic Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Garlic 200 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-garlic-200-mg-60-veggie-caps?rcode=NUTRIGENIUS', 12.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Garlic Extract';

-- ─── Saw Palmetto ─────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Saw Palmetto Extract 160 mg, 120 Softgels', 'https://www.iherb.com/pr/now-foods-saw-palmetto-extract-160-mg-120-softgels?rcode=NUTRIGENIUS', 18.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Saw Palmetto';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Saw Palmetto 160 mg, 60 Softgels', 'https://www.iherb.com/pr/jarrow-formulas-saw-palmetto-160-mg-60-softgels?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Saw Palmetto';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Saw Palmetto Extract, 60 Softgels', 'https://www.iherb.com/pr/life-extension-saw-palmetto-extract-60-softgels?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Saw Palmetto';

-- ─── Fenugreek ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Fenugreek 500 mg, 100 Capsules', 'https://www.iherb.com/pr/now-foods-fenugreek-500-mg-100-capsules?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Fenugreek';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Fenugreek 500 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-fenugreek-500-mg-100-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Fenugreek';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Fenugreek Seed Extract 500 mg, 30 Veggie Caps', 'https://www.iherb.com/pr/life-extension-fenugreek-seed-extract-500-mg-30-veggie-caps?rcode=NUTRIGENIUS', 11.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Fenugreek';

-- ─── DIM ──────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'DIM (Diindolylmethane) 200 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-dim-diindolylmethane-200-mg-90-veg-capsules?rcode=NUTRIGENIUS', 23.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DIM';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'DIM (Diindolylmethane) 100 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-dim-diindolylmethane-100-mg-60-veggie-caps?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DIM';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'DIM + CDG 400 mg, 30 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-dim-cdg-400-mg-30-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DIM';

-- ─── Vitex ────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vitex (Chaste Tree Berry) 400 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-vitex-chaste-tree-berry-400-mg-90-veg-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitex';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Vitex (Chaste Berry) Extract, 60 Veggie Caps', 'https://www.iherb.com/pr/solgar-vitex-chaste-berry-extract-60-vegetable-capsules?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitex';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Vitex Extract 750 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-vitex-extract-750-mg-60-veggie-caps?rcode=NUTRIGENIUS', 16.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vitex';

-- ─── Black Cohosh ─────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Black Cohosh Extract 80 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-black-cohosh-extract-80-mg-90-veg-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Black Cohosh';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Black Cohosh Root Extract, 60 Veggie Caps', 'https://www.iherb.com/pr/solgar-black-cohosh-root-extract-60-vegetable-capsules?rcode=NUTRIGENIUS', 17.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Black Cohosh';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Black Cohosh Extract 60 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-black-cohosh-extract-60-mg-60-veggie-caps?rcode=NUTRIGENIUS', 13.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Black Cohosh';

-- ─── Astragalus ───────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Astragalus 500 mg, 100 Veg Capsules', 'https://www.iherb.com/pr/now-foods-astragalus-500-mg-100-veg-capsules?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Astragalus';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Astragalus 400 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-astragalus-400-mg-100-capsules?rcode=NUTRIGENIUS', 15.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Astragalus';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Astragalus Extract 500 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-astragalus-extract-500-mg-60-veggie-caps?rcode=NUTRIGENIUS', 16.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Astragalus';

-- ─── Chlorella ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Chlorella 1000 mg, 120 Tablets', 'https://www.iherb.com/pr/now-foods-chlorella-1000-mg-120-tablets?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chlorella';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Chlorella 200 mg, 200 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-chlorella-200-mg-200-tablets?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chlorella';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Sun Chlorella A, 30 Packs', 'https://www.iherb.com/pr/doctor-s-best-sun-chlorella-a-30-packs?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chlorella';

-- ─── Chromium ─────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Chromium Picolinate 200 mcg, 250 Capsules', 'https://www.iherb.com/pr/now-foods-chromium-picolinate-200-mcg-250-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chromium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Chromium with Crominex 3+ 500 mcg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-chromium-with-crominex-3-500-mcg-60-veggie-caps?rcode=NUTRIGENIUS', 10.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chromium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'ChromeMate GTF Chromium, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-chromemate-gtf-chromium-60-capsules?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Chromium';

-- ─── Potassium ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Potassium Gluconate 99 mg, 250 Tablets', 'https://www.iherb.com/pr/now-foods-potassium-gluconate-99-mg-250-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Potassium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Potassium 99 mg, 100 Tablets', 'https://www.iherb.com/pr/solgar-potassium-99-mg-100-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Potassium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Potassium with Extend-Release Magnesium, 60 Capsules', 'https://www.iherb.com/pr/life-extension-potassium-with-extend-release-magnesium-60-capsules?rcode=NUTRIGENIUS', 11.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Potassium';

-- ─── Manganese ────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Manganese 10 mg, 250 Tablets', 'https://www.iherb.com/pr/now-foods-manganese-10-mg-250-tablets?rcode=NUTRIGENIUS', 7.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Manganese';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Chelated Manganese 8.3 mg, 100 Tablets', 'https://www.iherb.com/pr/solgar-chelated-manganese-8-3-mg-100-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Manganese';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Manganese Bisglycinate 15 mg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-manganese-bisglycinate-15-mg-60-capsules?rcode=NUTRIGENIUS', 12.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Manganese';

-- ─── Copper ───────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Copper 3 mg, 100 Tablets', 'https://www.iherb.com/pr/now-foods-copper-3-mg-100-tablets?rcode=NUTRIGENIUS', 5.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Copper';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Chelated Copper 2.5 mg, 250 Tablets', 'https://www.iherb.com/pr/solgar-chelated-copper-2-5-mg-250-tablets?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Copper';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Copper Bisglycinate 2 mg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-copper-bisglycinate-2-mg-60-capsules?rcode=NUTRIGENIUS', 11.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Copper';

-- ─── Boron ────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Boron 3 mg, 250 Capsules', 'https://www.iherb.com/pr/now-foods-boron-3-mg-250-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Boron';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Boron 3 mg, 100 Veggie Caps', 'https://www.iherb.com/pr/life-extension-boron-3-mg-100-veggie-caps?rcode=NUTRIGENIUS', 7.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Boron';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'FruiteX-B OsteoBoron 6 mg, 100 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-fruitex-b-osteoboron-6-mg-100-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Boron';

-- ─── Shilajit ─────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Shilajit 250 mg, 60 Veg Capsules', 'https://www.iherb.com/pr/now-foods-shilajit-250-mg-60-veg-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Shilajit';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Shilajit Fulvic Acid Complex 250 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-shilajit-fulvic-acid-complex-250-mg-60-capsules?rcode=NUTRIGENIUS', 24.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Shilajit';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Standardized PrimaVie Shilajit 250 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-shilajit-250-mg-60-veggie-caps?rcode=NUTRIGENIUS', 22.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Shilajit';

-- ─── Tribulus Terrestris ──────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Tribulus 500 mg, 100 Capsules', 'https://www.iherb.com/pr/now-foods-tribulus-500-mg-100-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Tribulus Terrestris';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Tribulus 750 mg, 90 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-tribulus-750-mg-90-tablets?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Tribulus Terrestris';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Optimized Tribulus with Standardized Lignans, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-optimized-tribulus-with-standardized-lignans-60-veggie-caps?rcode=NUTRIGENIUS', 17.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Tribulus Terrestris';

-- ─── DHEA ─────────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'DHEA 25 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-dhea-25-mg-90-veg-capsules?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DHEA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'DHEA 15 mg, 100 Capsules', 'https://www.iherb.com/pr/life-extension-dhea-15-mg-100-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DHEA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'DHEA 25 mg, 90 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-7-keto-dhea-25-mg-90-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'DHEA';

-- ─── Betaine HCl ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Betaine HCl 648 mg, 120 Capsules', 'https://www.iherb.com/pr/now-foods-betaine-hcl-648-mg-120-capsules?rcode=NUTRIGENIUS', 10.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Betaine HCl';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Betaine HCl + Pepsin, 120 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-betaine-hcl-pepsin-120-tablets?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Betaine HCl';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Betaine HCl Pepsin Gentian Bitters, 120 Caps', 'https://www.iherb.com/pr/doctor-s-best-betaine-hcl-pepsin-gentian-bitters-120-caps?rcode=NUTRIGENIUS', 16.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Betaine HCl';

-- ─── Ox Bile ──────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Bile Acids Factors, 60 Capsules', 'https://www.iherb.com/pr/now-foods-bile-acids-factors-60-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ox Bile';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Bile Acid Factors, 90 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-bile-acid-factors-90-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ox Bile';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'Digestive Enzymes with Ox Bile, 90 Caps', 'https://www.iherb.com/pr/doctor-s-best-digestive-enzymes-ox-bile-90-caps?rcode=NUTRIGENIUS', 19.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Ox Bile';

-- ─── Olive Leaf Extract ───────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Olive Leaf Extract 500 mg, 60 Veg Capsules', 'https://www.iherb.com/pr/now-foods-olive-leaf-extract-500-mg-60-veg-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Olive Leaf Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Olive Leaf 500 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-olive-leaf-500-mg-60-capsules?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Olive Leaf Extract';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Standardized European Olive Leaf Extract, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-standardized-european-olive-leaf-extract-60-veggie-caps?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Olive Leaf Extract';

-- ─── Oregano Oil ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Oil of Oregano, 2 fl oz', 'https://www.iherb.com/pr/now-foods-oil-of-oregano-2-fl-oz?rcode=NUTRIGENIUS', 13.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Oregano Oil';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'OregaMax 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-oregamax-60-capsules?rcode=NUTRIGENIUS', 14.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Oregano Oil';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Oil of Oregano 150 mg, 60 Softgels', 'https://www.iherb.com/pr/life-extension-oil-of-oregano-150-mg-60-softgels?rcode=NUTRIGENIUS', 16.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Oregano Oil';

-- ─── PEA (Palmitoylethanolamide) ──────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'PEA (Palmitoylethanolamide) 400 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-pea-palmitoylethanolamide-400-mg-90-veg-capsules?rcode=NUTRIGENIUS', 34.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'PEA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Doctor''s Best', 'PEA Mind & Body 400 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/doctor-s-best-pea-mind-body-400-mg-60-veggie-caps?rcode=NUTRIGENIUS', 29.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'PEA';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'PEA 400 mg, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-pea-400-mg-60-veggie-caps?rcode=NUTRIGENIUS', 28.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'PEA';

-- ─── Beta-Glucan ──────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Beta-1,3/1,6-D-Glucan 100 mg, 90 Veg Capsules', 'https://www.iherb.com/pr/now-foods-beta-1-3-1-6-d-glucan-100-mg-90-veg-capsules?rcode=NUTRIGENIUS', 22.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Beta-Glucan';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Beta-Glucan, 60 Veggie Caps', 'https://www.iherb.com/pr/life-extension-beta-glucan-60-veggie-caps?rcode=NUTRIGENIUS', 18.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Beta-Glucan';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Beta-1,3-Glucan 200 mg, 60 Capsules', 'https://www.iherb.com/pr/jarrow-formulas-beta-1-3-glucan-200-mg-60-capsules?rcode=NUTRIGENIUS', 20.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Beta-Glucan';

-- ─── Silica ───────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Silica (from Horsetail Extract) 500 mg, 90 Veg Caps', 'https://www.iherb.com/pr/now-foods-silica-from-horsetail-extract-500-mg-90-veg-caps?rcode=NUTRIGENIUS', 12.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Silica';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'BioSil Advanced Collagen Generator, 60 Caps', 'https://www.iherb.com/pr/jarrow-formulas-biosil-advanced-collagen-generator-60-caps?rcode=NUTRIGENIUS', 26.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Silica';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Silica 5 mg, 30 Veggie Caps', 'https://www.iherb.com/pr/life-extension-silica-5-mg-30-veggie-caps?rcode=NUTRIGENIUS', 9.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Silica';

-- ─── Molybdenum ───────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Molybdenum 150 mcg, 250 Tablets', 'https://www.iherb.com/pr/now-foods-molybdenum-150-mcg-250-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Molybdenum';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Solgar', 'Molybdenum 150 mcg, 100 Veggie Caps', 'https://www.iherb.com/pr/solgar-molybdenum-150-mcg-100-vegetable-capsules?rcode=NUTRIGENIUS', 9.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Molybdenum';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Thorne', 'Molybdenum Glycinate 500 mcg, 60 Capsules', 'https://www.iherb.com/pr/thorne-research-molybdenum-glycinate-500-mcg-60-capsules?rcode=NUTRIGENIUS', 14.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Molybdenum';

-- ─── Vanadium ─────────────────────────────────────────────────────────────────
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'NOW Foods', 'Vanadium 1 mg, 100 Tablets', 'https://www.iherb.com/pr/now-foods-vanadium-with-chromium-100-tablets?rcode=NUTRIGENIUS', 7.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vanadium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Life Extension', 'Vanadyl Sulfate 7.5 mg, 100 Tablets', 'https://www.iherb.com/pr/life-extension-vanadyl-sulfate-7-5-mg-100-tablets?rcode=NUTRIGENIUS', 9.00, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vanadium';
INSERT INTO affiliate_products (supplement_id, brand, product_name, affiliate_url, price_usd, halal_certified, quality_verified, available_countries)
SELECT s.id, 'Jarrow Formulas', 'Vanadium Nicotinate 200 mcg, 100 Tablets', 'https://www.iherb.com/pr/jarrow-formulas-vanadium-nicotinate-glycinate-complex-200-mcg-100-tablets?rcode=NUTRIGENIUS', 8.99, false, true, ARRAY['US','GB','IE','DE','FR','ES','IT','NL','TR','AE','SA','AU','CA'] FROM supplements s WHERE s.name = 'Vanadium';
