import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getAmazonLink } from "@/lib/amazon-affiliate";

const COUNTRIES = ["US","GB","IE","DE","FR","ES","IT","NL","TR","AE","SA","AU","CA"];

const PRODUCTS = [
  // ── Vitamin D3 ──────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin D3", brand: "NOW Foods",           product_name: "Vitamin D-3, 5,000 IU, 240 Softgels",           price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Thorne",              product_name: "Vitamin D/K2 Liquid, 1 fl oz",              price_usd: 24.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Doctor's Best",       product_name: "Vitamin D3, 5,000 IU, 720 Softgels",            price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin D3", brand: "Pure Encapsulations", product_name: "Vitamin D3, 5,000 IU, 120 Capsules",        price_usd: 22.50, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── Magnesium ────────────────────────────────────────────────────────────────
  { supplement_name: "Magnesium",  brand: "Doctor's Best",       product_name: "High Absorption Magnesium, 240 Tablets",        price_usd: 14.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "NOW Foods",           product_name: "Magnesium Glycinate, 180 Tablets",                price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "Thorne",              product_name: "Magnesium Bisglycinate Powder, 6.7 oz",             price_usd: 29.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Magnesium",  brand: "Pure Encapsulations", product_name: "Magnesium Glycinate, 180 Capsules",       price_usd: 31.40, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── Omega-3 ──────────────────────────────────────────────────────────────────
  { supplement_name: "Omega-3",    brand: "Nordic Naturals",     product_name: "Ultimate Omega, 1280 mg, 60 Soft Gels",        price_usd: 36.95, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "NOW Foods",           product_name: "Ultra Omega-3, 180 Softgels",                    price_usd: 20.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "Jarrow Formulas",     product_name: "Max DHA, 90 Softgels",                       price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Omega-3",    brand: "Life Extension",      product_name: "Super Omega-3, 120 Softgels",          price_usd: 18.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Vitamin B12 ──────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin B12", brand: "Jarrow Formulas",    product_name: "Methyl B-12, 1,000 mcg, 100 Lozenges",          price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "NOW Foods",          product_name: "Methyl B-12, 1,000 mcg, 100 Lozenges",              price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "Solgar",             product_name: "Sublingual Vitamin B12, 1,000 mcg, 250 Nuggets",        price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin B12", brand: "Thorne",             product_name: "B-Complex #12, 60 Capsules",                  price_usd: 24.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Iron ─────────────────────────────────────────────────────────────────────
  { supplement_name: "Iron",        brand: "Thorne",             product_name: "Iron Bisglycinate, 60 Capsules",              price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Iron",        brand: "Solgar",             product_name: "Gentle Iron, 25 mg, 180 Veggie Caps",           price_usd: 16.29, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Iron",        brand: "Doctor's Best",      product_name: "Easy to Absorb Iron, 25 mg, 120 Veggie Caps",   price_usd: 10.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Zinc ─────────────────────────────────────────────────────────────────────
  { supplement_name: "Zinc",        brand: "Thorne",             product_name: "Zinc Picolinate 15 mg, 60 Capsules",          price_usd: 10.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "NOW Foods",          product_name: "Zinc 50 mg, 250 Tablets",                          price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "Doctor's Best",      product_name: "PepsiZinc (Zinc-Carnosine), 120 Veggie Caps",   price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Zinc",        brand: "Jarrow Formulas",    product_name: "Zinc Balance, 100 Capsules",                  price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Vitamin C ────────────────────────────────────────────────────────────────
  { supplement_name: "Vitamin C",   brand: "NOW Foods",          product_name: "Vitamin C-1000, 100 Tablets",                      price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin C",   brand: "Solgar",             product_name: "Ester-C Plus 1,000 mg, 180 Tablets",         price_usd: 26.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Vitamin C",   brand: "Thorne",             product_name: "Ascorbic Acid, 250 Veggie Caps",             price_usd: 20.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Probiotics ───────────────────────────────────────────────────────────────
  { supplement_name: "Probiotics",  brand: "Garden of Life",     product_name: "Dr. Formulated Once Daily Probiotics, 30 ct",  price_usd: 29.99, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "Jarrow Formulas",    product_name: "Jarro-Dophilus EPS, 120 Capsules",            price_usd: 32.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "NOW Foods",          product_name: "Probiotic-10, 25 Billion, 50 Veg Caps",           price_usd: 20.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Probiotics",  brand: "Solgar",             product_name: "Advanced Multi-Billion Dophilus, 120 Veg Caps",     price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Ashwagandha ──────────────────────────────────────────────────────────────
  { supplement_name: "Ashwagandha", brand: "NOW Foods",          product_name: "Ashwagandha 450 mg, 90 Capsules",                  price_usd: 14.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Jarrow Formulas",    product_name: "Sensoril Ashwagandha 225 mg, 120 Caps",price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Life Extension",     product_name: "Optimized Ashwagandha, 60 Capsules",          price_usd: 15.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Ashwagandha", brand: "Doctor's Best",      product_name: "Ashwagandha with Sensoril, 60 Veggie Caps",    price_usd: 18.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── CoQ10 ────────────────────────────────────────────────────────────────────
  { supplement_name: "CoQ10",       brand: "Doctor's Best",      product_name: "High Absorption CoQ10 with BioPerine, 100 mg, 120 Softgels",  price_usd: 28.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "NOW Foods",          product_name: "CoQ10, 100 mg, 180 Softgels",                         price_usd: 34.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "Life Extension",     product_name: "Super Ubiquinol CoQ10, 100 mg, 60 Softgels",     price_usd: 44.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "CoQ10",       brand: "Jarrow Formulas",    product_name: "QH-Absorb, 200 mg, 60 Softgels",                price_usd: 34.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Curcumin ─────────────────────────────────────────────────────────────────
  { supplement_name: "Curcumin",    brand: "Doctor's Best",      product_name: "Curcumin C3 Complex 500 mg, 120 Tablets",  price_usd: 21.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "Jarrow Formulas",    product_name: "Curcumin Phytosome Meriva 500 mg, 120 Caps",price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "NOW Foods",          product_name: "Curcumin Extract, 665 mg, 60 Softgels",               price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Curcumin",    brand: "Life Extension",     product_name: "Super Bio-Curcumin 400 mg, 60 Veggie Caps",    price_usd: 27.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Folate / Methylfolate ────────────────────────────────────────────────────
  { supplement_name: "Folate",      brand: "Jarrow Formulas",    product_name: "Methyl Folate 400 mcg, 60 Capsules",           price_usd: 8.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "Thorne",             product_name: "5-MTHF 1 mg, 60 Capsules", price_usd: 18.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "NOW Foods",          product_name: "Methylfolate 1,000 mcg, 90 Veg Caps",             price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Folate",      brand: "Pure Encapsulations", product_name: "Folate 400 mcg, 90 Capsules",               price_usd: 21.60, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },

  // ── NAC ──────────────────────────────────────────────────────────────────────
  { supplement_name: "NAC",         brand: "NOW Foods",          product_name: "NAC 600 mg, 250 Veg Caps",     price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Jarrow Formulas",    product_name: "NAC 500 mg, 100 Capsules", price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Life Extension",     product_name: "NAC 600 mg, 60 Capsules",  price_usd: 12.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "NAC",         brand: "Doctor's Best",      product_name: "NAC Detox Regulators, 60 Capsules",             price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── L-Theanine ───────────────────────────────────────────────────────────────
  { supplement_name: "L-Theanine",  brand: "NOW Foods",          product_name: "L-Theanine 200 mg, 120 Veg Caps",               price_usd: 17.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Jarrow Formulas",    product_name: "L-Theanine 100 mg, 60 Capsules",              price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Doctor's Best",      product_name: "L-Theanine 150 mg, 90 Veggie Caps",            price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "L-Theanine",  brand: "Life Extension",     product_name: "L-Theanine 100 mg, 60 Capsules",              price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Melatonin ────────────────────────────────────────────────────────────────
  { supplement_name: "Melatonin",   brand: "NOW Foods",          product_name: "Melatonin 3 mg, 180 Capsules",                      price_usd: 10.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Melatonin",   brand: "Solgar",             product_name: "Melatonin 3 mg, 120 Nuggets",                          price_usd: 13.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Melatonin",   brand: "Life Extension",     product_name: "Melatonin 1 mg, 60 Capsules",                  price_usd: 7.00,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Collagen ─────────────────────────────────────────────────────────────────
  { supplement_name: "Collagen",    brand: "Garden of Life",     product_name: "Grass Fed Collagen Beauty Powder, 12 oz",price_usd: 33.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Collagen",    brand: "NOW Foods",          product_name: "Hydrolyzed Collagen Powder, 12 oz",price_usd: 24.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Collagen",    brand: "Solgar",             product_name: "Collagen Hyaluronic Acid Complex, 120 Tablets",         price_usd: 29.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Berberine ────────────────────────────────────────────────────────────────
  { supplement_name: "Berberine",   brand: "Doctor's Best",      product_name: "Berberine HCl 500 mg, 60 Veggie Caps",          price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "Life Extension",     product_name: "Optimized Berberine 1,200 mg, 60 Veggie Caps",  price_usd: 25.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "Jarrow Formulas",    product_name: "Berberine 500 mg, 60 Capsules",                price_usd: 22.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Berberine",   brand: "NOW Foods",          product_name: "Berberine Glucose Support, 90 Veg Caps",         price_usd: 26.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Rhodiola ─────────────────────────────────────────────────────────────────
  { supplement_name: "Rhodiola",    brand: "NOW Foods",          product_name: "Rhodiola 300 mg, 60 Veg Caps",                  price_usd: 13.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Life Extension",     product_name: "Rhodiola Extract 250 mg, 60 Veggie Caps",price_usd: 14.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Jarrow Formulas",    product_name: "Rhodiola Rosea 500 mg, 60 Capsules",           price_usd: 15.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Rhodiola",    brand: "Doctor's Best",      product_name: "RhodiolaHP 250 mg, 60 Capsules",                 price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Lion's Mane ──────────────────────────────────────────────────────────────
  { supplement_name: "Lion's Mane", brand: "NOW Foods",          product_name: "Lion's Mane 500 mg, 60 Veg Caps",               price_usd: 16.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Life Extension",     product_name: "Lion's Mane Mushroom 500 mg, 60 Veggie Caps",  price_usd: 19.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Jarrow Formulas",    product_name: "Lion's Mane 500 mg, 60 Capsules",             price_usd: 19.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Lion's Mane", brand: "Solgar",             product_name: "Lion's Mane Mushroom, 60 Vegetable Capsules",           price_usd: 23.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },

  // ── Myo-Inositol ─────────────────────────────────────────────────────────────
  { supplement_name: "Myo-Inositol", brand: "NOW Foods",         product_name: "Inositol Powder 4 oz",                             price_usd: 9.99,  halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Jarrow Formulas",   product_name: "Inositol 750 mg, 100 Capsules",               price_usd: 12.99, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Life Extension",    product_name: "InositolCaps 1,000 mg, 360 Capsules",          price_usd: 19.00, halal_certified: false, quality_verified: true,  available_countries: COUNTRIES },
  { supplement_name: "Myo-Inositol", brand: "Pure Encapsulations", product_name: "Inositol 500 mg, 180 Capsules",          price_usd: 30.70, halal_certified: true,  quality_verified: true,  available_countries: COUNTRIES },
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

    // Resolve supplement names → IDs
    const uniqueNames = [...new Set(PRODUCTS.map((p) => p.supplement_name))];
    const { data: suppRows, error: suppError } = await supabase
      .from("supplements")
      .select("id, name")
      .in("name", uniqueNames);

    if (suppError) {
      return NextResponse.json({ error: suppError.message }, { status: 500 });
    }

    const suppIdByName = new Map((suppRows ?? []).map((s) => [s.name as string, s.id as string]));

    // Build insert rows with supplement_id and computed Amazon affiliate URL
    const rows = PRODUCTS.flatMap((p) => {
      const supplement_id = suppIdByName.get(p.supplement_name);
      if (!supplement_id) return []; // skip if supplement not found in DB
      const { supplement_name: _, ...rest } = p;
      return [{ ...rest, supplement_id, affiliate_url: getAmazonLink(p.supplement_name, p.brand) }];
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: "No matching supplements found in DB. Seed the supplements table first." }, { status: 400 });
    }

    const { error } = await supabase
      .from("affiliate_products")
      .insert(rows);

    if (error) {
      console.error("Seed error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Seeded ${rows.length} affiliate products`,
      seeded: true,
      count: rows.length,
    });
  } catch (err) {
    console.error("Seed route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
