import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const COUNTRIES = ["US","GB","IE","DE","FR","ES","IT","NL","TR","AE","SA","AU","CA"];

const PRODUCTS = [
  // ── Vitamin D3 ──────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin D3", brand: "NOW Foods",           product_name: "Vitamin D-3, 5,000 IU, 240 Softgels",           affiliate_url: "https://www.iherb.com/pr/now-foods-vitamin-d-3-5-000-iu-240-softgels?rcode=NUTRIGENIUS",           price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Thorne",              product_name: "Vitamin D/K2 Liquid, 1 fl oz",                   affiliate_url: "https://www.iherb.com/pr/thorne-research-vitamin-d-k2-liquid-1-fl-oz?rcode=NUTRIGENIUS",              price_usd: 24.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Doctor's Best",       product_name: "Vitamin D3, 5,000 IU, 720 Softgels",            affiliate_url: "https://www.iherb.com/pr/doctor-s-best-vitamin-d3-5000-iu-720-softgels?rcode=NUTRIGENIUS",            price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Pure Encapsulations", product_name: "Vitamin D3, 5,000 IU, 120 Capsules",            affiliate_url: "https://www.iherb.com/pr/pure-encapsulations-vitamin-d3-5-000-iu-120-capsules?rcode=NUTRIGENIUS",        price_usd: 22.50, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── Magnesium ────────────────────────────────────────────────────────────────
  { supplement_name: "Magnesium",  brand: "Doctor's Best",       product_name: "High Absorption Magnesium, 240 Tablets",         affiliate_url: "https://www.iherb.com/pr/doctor-s-best-high-absorption-magnesium-240-tablets?rcode=NUTRIGENIUS",        price_usd: 14.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "NOW Foods",           product_name: "Magnesium Glycinate, 180 Tablets",               affiliate_url: "https://www.iherb.com/pr/now-foods-magnesium-glycinate-180-tablets?rcode=NUTRIGENIUS",                price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "Thorne",              product_name: "Magnesium Bisglycinate Powder, 6.7 oz",          affiliate_url: "https://www.iherb.com/pr/thorne-research-magnesium-bisglycinate-powder?rcode=NUTRIGENIUS",             price_usd: 29.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "Pure Encapsulations", product_name: "Magnesium Glycinate, 180 Capsules",              affiliate_url: "https://www.iherb.com/pr/pure-encapsulations-magnesium-glycinate-180-capsules?rcode=NUTRIGENIUS",       price_usd: 31.40, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── Omega-3 ──────────────────────────────────────────────────────────────────
  { supplement_name: "Omega-3",    brand: "Nordic Naturals",     product_name: "Ultimate Omega, 1280 mg, 60 Soft Gels",          affiliate_url: "https://www.iherb.com/pr/nordic-naturals-ultimate-omega-1280-mg-60-soft-gels?rcode=NUTRIGENIUS",        price_usd: 36.95, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "NOW Foods",           product_name: "Ultra Omega-3, 180 Softgels",                    affiliate_url: "https://www.iherb.com/pr/now-foods-ultra-omega-3-180-softgels?rcode=NUTRIGENIUS",                    price_usd: 20.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "Jarrow Formulas",     product_name: "Max DHA, 90 Softgels",                          affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-max-dha-90-softgels?rcode=NUTRIGENIUS",                       price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "Life Extension",      product_name: "Super Omega-3, 120 Softgels",                   affiliate_url: "https://www.iherb.com/pr/life-extension-super-omega-3-epa-dha-120-softgels?rcode=NUTRIGENIUS",          price_usd: 18.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Vitamin B12 ──────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin B12", brand: "Jarrow Formulas",    product_name: "Methyl B-12, 1,000 mcg, 100 Lozenges",          affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-methyl-b-12-1000-mcg-100-lozenges?rcode=NUTRIGENIUS",          price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "NOW Foods",          product_name: "Methyl B-12, 1,000 mcg, 100 Lozenges",          affiliate_url: "https://www.iherb.com/pr/now-foods-methyl-b-12-1-000-mcg-100-lozenges?rcode=NUTRIGENIUS",              price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "Solgar",             product_name: "Sublingual Vitamin B12, 1,000 mcg, 250 Nuggets", affiliate_url: "https://www.iherb.com/pr/solgar-sublingual-vitamin-b12-1000-mcg-250-nuggets?rcode=NUTRIGENIUS",        price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "Thorne",             product_name: "B-Complex #12, 60 Capsules",                    affiliate_url: "https://www.iherb.com/pr/thorne-research-b-complex-12-60-capsules?rcode=NUTRIGENIUS",                  price_usd: 24.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Iron ─────────────────────────────────────────────────────────────────────
  { supplement_name: "Iron",        brand: "Thorne",             product_name: "Iron Bisglycinate, 60 Capsules",                 affiliate_url: "https://www.iherb.com/pr/thorne-research-iron-bisglycinate-60-capsules?rcode=NUTRIGENIUS",              price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Iron",        brand: "Solgar",             product_name: "Gentle Iron, 25 mg, 180 Veggie Caps",           affiliate_url: "https://www.iherb.com/pr/solgar-gentle-iron-25-mg-180-vegetable-capsules?rcode=NUTRIGENIUS",           price_usd: 16.29, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Iron",        brand: "Doctor's Best",      product_name: "Easy to Absorb Iron, 25 mg, 120 Veggie Caps",   affiliate_url: "https://www.iherb.com/pr/doctor-s-best-easy-to-absorb-iron-25mg-120-veggie-caps?rcode=NUTRIGENIUS",   price_usd: 10.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Zinc ─────────────────────────────────────────────────────────────────────
  { supplement_name: "Zinc",        brand: "Thorne",             product_name: "Zinc Picolinate 15 mg, 60 Capsules",            affiliate_url: "https://www.iherb.com/pr/thorne-research-zinc-picolinate-15-mg-60-capsules?rcode=NUTRIGENIUS",          price_usd: 10.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "NOW Foods",          product_name: "Zinc 50 mg, 250 Tablets",                       affiliate_url: "https://www.iherb.com/pr/now-foods-zinc-50-mg-250-tablets?rcode=NUTRIGENIUS",                          price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "Doctor's Best",      product_name: "PepsiZinc (Zinc-Carnosine), 120 Veggie Caps",   affiliate_url: "https://www.iherb.com/pr/doctor-s-best-pepsizinc-zinc-carnosine-120-veggie-caps?rcode=NUTRIGENIUS",   price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "Jarrow Formulas",    product_name: "Zinc Balance, 100 Capsules",                    affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-zinc-balance-100-capsules?rcode=NUTRIGENIUS",                  price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Vitamin C ────────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin C",   brand: "NOW Foods",          product_name: "Vitamin C-1000, 100 Tablets",                   affiliate_url: "https://www.iherb.com/pr/now-foods-vitamin-c-1-000-100-tablets?rcode=NUTRIGENIUS",                      price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin C",   brand: "Solgar",             product_name: "Ester-C Plus 1,000 mg, 180 Tablets",           affiliate_url: "https://www.iherb.com/pr/solgar-ester-c-plus-vitamin-c-1000-mg-180-tablets?rcode=NUTRIGENIUS",         price_usd: 26.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin C",   brand: "Thorne",             product_name: "Ascorbic Acid, 250 Veggie Caps",                affiliate_url: "https://www.iherb.com/pr/thorne-research-ascorbic-acid-250-veggie-caps?rcode=NUTRIGENIUS",             price_usd: 20.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Probiotics ───────────────────────────────────────────────────────────────
  { supplement_name: "Probiotics",  brand: "Garden of Life",     product_name: "Dr. Formulated Once Daily Probiotics, 30 ct",   affiliate_url: "https://www.iherb.com/pr/garden-of-life-dr-formulated-probiotics-once-daily-30-ct?rcode=NUTRIGENIUS",  price_usd: 29.99, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "Jarrow Formulas",    product_name: "Jarro-Dophilus EPS, 120 Capsules",              affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-jarro-dophilus-eps-120-capsules?rcode=NUTRIGENIUS",            price_usd: 32.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "NOW Foods",          product_name: "Probiotic-10, 25 Billion, 50 Veg Caps",         affiliate_url: "https://www.iherb.com/pr/now-foods-probiotic-10-25-billion-50-veg-capsules?rcode=NUTRIGENIUS",           price_usd: 20.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "Solgar",             product_name: "Advanced Multi-Billion Dophilus, 120 Veg Caps", affiliate_url: "https://www.iherb.com/pr/solgar-advanced-multi-billion-dophilus-120-veggie-caps?rcode=NUTRIGENIUS",     price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Ashwagandha ──────────────────────────────────────────────────────────────
  { supplement_name: "Ashwagandha", brand: "NOW Foods",          product_name: "Ashwagandha 450 mg, 90 Capsules",               affiliate_url: "https://www.iherb.com/pr/now-foods-ashwagandha-450-mg-90-capsules?rcode=NUTRIGENIUS",                  price_usd: 14.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Jarrow Formulas",    product_name: "Sensoril Ashwagandha 225 mg, 120 Caps",         affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-sensoril-ashwagandha-225-mg-120-veggie-caps?rcode=NUTRIGENIUS",price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Life Extension",     product_name: "Optimized Ashwagandha, 60 Capsules",            affiliate_url: "https://www.iherb.com/pr/life-extension-optimized-ashwagandha-60-capsules?rcode=NUTRIGENIUS",          price_usd: 15.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Doctor's Best",      product_name: "Ashwagandha with Sensoril, 60 Veggie Caps",     affiliate_url: "https://www.iherb.com/pr/doctor-s-best-ashwagandha-with-sensoril-60-veggie-caps?rcode=NUTRIGENIUS",    price_usd: 18.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── CoQ10 ────────────────────────────────────────────────────────────────────
  { supplement_name: "CoQ10",       brand: "Doctor's Best",      product_name: "High Absorption CoQ10 with BioPerine, 100 mg, 120 Softgels", affiliate_url: "https://www.iherb.com/pr/doctor-s-best-high-absorption-coq10-100-mg-120-softgels?rcode=NUTRIGENIUS",  price_usd: 28.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "NOW Foods",          product_name: "CoQ10, 100 mg, 180 Softgels",                   affiliate_url: "https://www.iherb.com/pr/now-foods-coq10-100-mg-180-softgels?rcode=NUTRIGENIUS",                         price_usd: 34.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "Life Extension",     product_name: "Super Ubiquinol CoQ10, 100 mg, 60 Softgels",    affiliate_url: "https://www.iherb.com/pr/life-extension-super-ubiquinol-coq10-100-mg-60-softgels?rcode=NUTRIGENIUS",     price_usd: 44.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "Jarrow Formulas",    product_name: "QH-Absorb, 200 mg, 60 Softgels",               affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-qh-absorb-200-mg-60-softgels?rcode=NUTRIGENIUS",                price_usd: 34.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Curcumin ─────────────────────────────────────────────────────────────────
  { supplement_name: "Curcumin",    brand: "Doctor's Best",      product_name: "Curcumin C3 Complex 500 mg, 120 Tablets",       affiliate_url: "https://www.iherb.com/pr/doctor-s-best-high-absorption-curcumin-500-mg-120-tablets?rcode=NUTRIGENIUS",  price_usd: 21.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "Jarrow Formulas",    product_name: "Curcumin Phytosome Meriva 500 mg, 120 Caps",    affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-curcumin-phytosome-meriva-500-mg-120-capsules?rcode=NUTRIGENIUS",price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "NOW Foods",          product_name: "Curcumin Extract, 665 mg, 60 Softgels",         affiliate_url: "https://www.iherb.com/pr/now-foods-curcumin-extract-665-mg-60-softgels?rcode=NUTRIGENIUS",               price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "Life Extension",     product_name: "Super Bio-Curcumin 400 mg, 60 Veggie Caps",     affiliate_url: "https://www.iherb.com/pr/life-extension-super-bio-curcumin-400-mg-60-veggie-caps?rcode=NUTRIGENIUS",    price_usd: 27.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Folate / Methylfolate ────────────────────────────────────────────────────
  { supplement_name: "Folate",      brand: "Jarrow Formulas",    product_name: "Methyl Folate 400 mcg, 60 Capsules",            affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-methyl-folate-400-mcg-60-capsules?rcode=NUTRIGENIUS",           price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "Thorne",             product_name: "5-MTHF 1 mg, 60 Capsules",                     affiliate_url: "https://www.iherb.com/pr/thorne-research-5-methyltetrahydrofolate-5-mthf-1-mg-60-capsules?rcode=NUTRIGENIUS", price_usd: 18.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "NOW Foods",          product_name: "Methylfolate 1,000 mcg, 90 Veg Caps",          affiliate_url: "https://www.iherb.com/pr/now-foods-methylfolate-1-000-mcg-90-veg-capsules?rcode=NUTRIGENIUS",             price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "Pure Encapsulations", product_name: "Folate 400 mcg, 90 Capsules",                 affiliate_url: "https://www.iherb.com/pr/pure-encapsulations-folate-400-mcg-90-capsules?rcode=NUTRIGENIUS",               price_usd: 21.60, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── NAC ──────────────────────────────────────────────────────────────────────
  { supplement_name: "NAC",         brand: "NOW Foods",          product_name: "NAC 600 mg, 250 Veg Caps",                      affiliate_url: "https://www.iherb.com/pr/now-foods-nac-n-acetyl-cysteine-600-mg-250-veg-capsules?rcode=NUTRIGENIUS",     price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Jarrow Formulas",    product_name: "NAC 500 mg, 100 Capsules",                      affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-nac-n-acetyl-l-cysteine-500-mg-100-capsules?rcode=NUTRIGENIUS", price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Life Extension",     product_name: "NAC 600 mg, 60 Capsules",                       affiliate_url: "https://www.iherb.com/pr/life-extension-nac-n-acetyl-l-cysteine-600-mg-60-capsules?rcode=NUTRIGENIUS",  price_usd: 12.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Doctor's Best",      product_name: "NAC Detox Regulators, 60 Capsules",             affiliate_url: "https://www.iherb.com/pr/doctor-s-best-nac-detox-regulators-60-capsules?rcode=NUTRIGENIUS",             price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── L-Theanine ───────────────────────────────────────────────────────────────
  { supplement_name: "L-Theanine",  brand: "NOW Foods",          product_name: "L-Theanine 200 mg, 120 Veg Caps",               affiliate_url: "https://www.iherb.com/pr/now-foods-l-theanine-200-mg-120-veg-capsules?rcode=NUTRIGENIUS",               price_usd: 17.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Jarrow Formulas",    product_name: "L-Theanine 100 mg, 60 Capsules",                affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-l-theanine-100-mg-60-capsules?rcode=NUTRIGENIUS",              price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Doctor's Best",      product_name: "L-Theanine 150 mg, 90 Veggie Caps",             affiliate_url: "https://www.iherb.com/pr/doctor-s-best-l-theanine-150-mg-90-veggie-caps?rcode=NUTRIGENIUS",            price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Life Extension",     product_name: "L-Theanine 100 mg, 60 Capsules",                affiliate_url: "https://www.iherb.com/pr/life-extension-l-theanine-100-mg-60-capsules?rcode=NUTRIGENIUS",              price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Melatonin ────────────────────────────────────────────────────────────────
  { supplement_name: "Melatonin",   brand: "NOW Foods",          product_name: "Melatonin 3 mg, 180 Capsules",                  affiliate_url: "https://www.iherb.com/pr/now-foods-melatonin-3-mg-180-capsules?rcode=NUTRIGENIUS",                      price_usd: 10.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Melatonin",   brand: "Solgar",             product_name: "Melatonin 3 mg, 120 Nuggets",                   affiliate_url: "https://www.iherb.com/pr/solgar-melatonin-3-mg-120-nuggets?rcode=NUTRIGENIUS",                          price_usd: 13.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Melatonin",   brand: "Life Extension",     product_name: "Melatonin 1 mg, 60 Capsules",                   affiliate_url: "https://www.iherb.com/pr/life-extension-melatonin-1-mg-60-capsules?rcode=NUTRIGENIUS",                  price_usd: 7.00,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Collagen ─────────────────────────────────────────────────────────────────
  { supplement_name: "Collagen",    brand: "Garden of Life",     product_name: "Grass Fed Collagen Beauty Powder, 12 oz",       affiliate_url: "https://www.iherb.com/pr/garden-of-life-grass-fed-collagen-beauty-vanilla-12-oz-powder?rcode=NUTRIGENIUS",price_usd: 33.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Collagen",    brand: "NOW Foods",          product_name: "Hydrolyzed Collagen Powder, 12 oz",             affiliate_url: "https://www.iherb.com/pr/now-foods-hydrolyzed-collagen-natural-unflavored-12-oz-powder?rcode=NUTRIGENIUS",price_usd: 24.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Collagen",    brand: "Solgar",             product_name: "Collagen Hyaluronic Acid Complex, 120 Tablets", affiliate_url: "https://www.iherb.com/pr/solgar-collagen-hyaluronic-acid-complex-120-tablets?rcode=NUTRIGENIUS",         price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Berberine ────────────────────────────────────────────────────────────────
  { supplement_name: "Berberine",   brand: "Doctor's Best",      product_name: "Berberine HCl 500 mg, 60 Veggie Caps",          affiliate_url: "https://www.iherb.com/pr/doctor-s-best-berberine-hcl-500-mg-60-veggie-caps?rcode=NUTRIGENIUS",          price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "Life Extension",     product_name: "Optimized Berberine 1,200 mg, 60 Veggie Caps",  affiliate_url: "https://www.iherb.com/pr/life-extension-optimized-berberine-1200-mg-60-veggie-caps?rcode=NUTRIGENIUS",  price_usd: 25.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "Jarrow Formulas",    product_name: "Berberine 500 mg, 60 Capsules",                 affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-berberine-500-mg-60-capsules?rcode=NUTRIGENIUS",                price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "NOW Foods",          product_name: "Berberine Glucose Support, 90 Veg Caps",        affiliate_url: "https://www.iherb.com/pr/now-foods-berberine-glucose-support-90-veg-capsules?rcode=NUTRIGENIUS",         price_usd: 26.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Rhodiola ─────────────────────────────────────────────────────────────────
  { supplement_name: "Rhodiola",    brand: "NOW Foods",          product_name: "Rhodiola 300 mg, 60 Veg Caps",                  affiliate_url: "https://www.iherb.com/pr/now-foods-rhodiola-300-mg-60-veg-capsules?rcode=NUTRIGENIUS",                  price_usd: 13.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Life Extension",     product_name: "Rhodiola Extract 250 mg, 60 Veggie Caps",       affiliate_url: "https://www.iherb.com/pr/life-extension-rhodiola-extract-250-mg-60-vegetarian-capsules?rcode=NUTRIGENIUS",price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Jarrow Formulas",    product_name: "Rhodiola Rosea 500 mg, 60 Capsules",            affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-rhodiola-rosea-500-mg-60-capsules?rcode=NUTRIGENIUS",           price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Doctor's Best",      product_name: "RhodiolaHP 250 mg, 60 Capsules",                affiliate_url: "https://www.iherb.com/pr/doctor-s-best-rhodiolahp-250-mg-60-capsules?rcode=NUTRIGENIUS",                 price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Lion's Mane ──────────────────────────────────────────────────────────────
  { supplement_name: "Lion's Mane", brand: "NOW Foods",          product_name: "Lion's Mane 500 mg, 60 Veg Caps",               affiliate_url: "https://www.iherb.com/pr/now-foods-lion-s-mane-500-mg-60-veg-capsules?rcode=NUTRIGENIUS",               price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Life Extension",     product_name: "Lion's Mane Mushroom 500 mg, 60 Veggie Caps",   affiliate_url: "https://www.iherb.com/pr/life-extension-lion-s-mane-mushroom-500-mg-60-veggie-caps?rcode=NUTRIGENIUS",  price_usd: 19.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Jarrow Formulas",    product_name: "Lion's Mane 500 mg, 60 Capsules",               affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-lion-s-mane-500-mg-60-capsules?rcode=NUTRIGENIUS",             price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Solgar",             product_name: "Lion's Mane Mushroom, 60 Vegetable Capsules",   affiliate_url: "https://www.iherb.com/pr/solgar-lion-s-mane-mushroom-60-vegetable-capsules?rcode=NUTRIGENIUS",           price_usd: 23.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Myo-Inositol ─────────────────────────────────────────────────────────────
  { supplement_name: "Myo-Inositol", brand: "NOW Foods",         product_name: "Inositol Powder 4 oz",                          affiliate_url: "https://www.iherb.com/pr/now-foods-inositol-powder-4-oz?rcode=NUTRIGENIUS",                             price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Jarrow Formulas",   product_name: "Inositol 750 mg, 100 Capsules",                 affiliate_url: "https://www.iherb.com/pr/jarrow-formulas-inositol-750-mg-100-capsules?rcode=NUTRIGENIUS",               price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Life Extension",    product_name: "InositolCaps 1,000 mg, 360 Capsules",           affiliate_url: "https://www.iherb.com/pr/life-extension-inositolcaps-1000-mg-360-capsules?rcode=NUTRIGENIUS",          price_usd: 19.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Pure Encapsulations", product_name: "Inositol 500 mg, 180 Capsules",               affiliate_url: "https://www.iherb.com/pr/pure-encapsulations-inositol-500-mg-180-capsules?rcode=NUTRIGENIUS",          price_usd: 30.70, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },
];

export async function POST() {
  try {
    const supabase = await createClient();

    // Check if already seeded
    const { count } = await supabase
      .from("affiliate_products")
      .select("*", { count: "exact", head: true });

    if (count && count >= PRODUCTS.length) {
      return NextResponse.json({ message: `Already seeded (${count} products)`, seeded: false });
    }

    // Upsert all products (deduplicate by affiliate_url)
    const { error, count: inserted } = await supabase
      .from("affiliate_products")
      .upsert(PRODUCTS, { onConflict: "affiliate_url" });

    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Seeded ${PRODUCTS.length} affiliate products`,
      seeded: true,
      count: PRODUCTS.length,
    });
  } catch (err) {
    console.error("Seed route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
