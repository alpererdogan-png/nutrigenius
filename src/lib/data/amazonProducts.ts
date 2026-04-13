// ─── Geo-routed Amazon affiliate stores ──────────────────────────────────────

const AMAZON_STORES: Record<string, { domain: string; tag: string }> = {
  US: { domain: "amazon.com", tag: "clareohealth-20" },
  GB: { domain: "amazon.co.uk", tag: "clareohealth-21" },
  DE: { domain: "amazon.de", tag: "clareohealt01-21" },
  FR: { domain: "amazon.fr", tag: "clareohealt0a-21" },
  IT: { domain: "amazon.it", tag: "clareohealt07-21" },
  ES: { domain: "amazon.es", tag: "clareoheal02a-21" },
  TR: { domain: "amazon.com.tr", tag: "clareohealt03-21" },
  IE: { domain: "amazon.co.uk", tag: "clareohealth-21" },
};

const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "GR",
  "HU", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SE",
  "SI", "SK", "NO", "CH",
];

function getAmazonStore(countryCode?: string): { domain: string; tag: string } {
  if (!countryCode) return AMAZON_STORES.US;
  const upper = countryCode.toUpperCase();
  if (AMAZON_STORES[upper]) return AMAZON_STORES[upper];
  if (EU_COUNTRIES.includes(upper)) return AMAZON_STORES.DE;
  return AMAZON_STORES.US;
}

/** Map quiz country name to ISO 2-letter code */
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "Ireland": "IE", "United Kingdom": "GB", "United States": "US",
  "Canada": "CA", "Australia": "AU", "Germany": "DE", "France": "FR",
  "Spain": "ES", "Italy": "IT", "Netherlands": "NL", "Belgium": "BE",
  "Sweden": "SE", "Denmark": "DK", "Norway": "NO", "Finland": "FI",
  "Austria": "AT", "Switzerland": "CH", "Poland": "PL", "Portugal": "PT",
  "Greece": "GR", "Czech Republic": "CZ", "Romania": "RO", "Hungary": "HU",
  "Croatia": "HR", "Bulgaria": "BG", "Turkey": "TR", "UAE": "AE",
  "Saudi Arabia": "SA", "India": "IN",
};

export function countryNameToCode(name: string): string {
  return COUNTRY_NAME_TO_CODE[name] ?? "US";
}

/**
 * Detect country from navigator.language (client-side fallback).
 * Returns a 2-letter country code.
 */
export function detectCountryFromLocale(): string {
  if (typeof navigator === "undefined") return "US";
  const lang = navigator.language ?? "";
  // Try region subtag first (e.g. "en-GB" → "GB", "de-DE" → "DE")
  const parts = lang.split("-");
  if (parts.length >= 2) {
    const region = parts[parts.length - 1].toUpperCase();
    if (region.length === 2) return region;
  }
  // Map primary language to most likely country
  const LANG_TO_COUNTRY: Record<string, string> = {
    de: "DE", fr: "FR", it: "IT", es: "ES", tr: "TR",
    ar: "SA", nl: "NL", pt: "PT", pl: "PL", sv: "SE",
  };
  const primary = parts[0].toLowerCase();
  return LANG_TO_COUNTRY[primary] ?? "US";
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AmazonProduct {
  asin: string;
  name: string;
  brand: string;
  description: string; // one-line "why this pick"
}

export interface SupplementProducts {
  /** Matches lowercased supplement name (or alias) from the recommendation engine */
  supplementId: string;
  best: AmazonProduct;
  premium: AmazonProduct;
  budget: AmazonProduct;
}

// ─── Link builders ────────────────────────────────────────────────────────────

/** Direct product link for curated picks (geo-routed) */
export function getAmazonProductLink(asin: string, countryCode?: string): string {
  const store = getAmazonStore(countryCode);
  return `https://www.${store.domain}/dp/${asin}?tag=${store.tag}`;
}

/** Search link fallback for supplements without curated picks (geo-routed) */
export function getAmazonSearchLink(supplementName: string, form?: string, countryCode?: string): string {
  const query = form
    ? `${supplementName} ${form} supplement`
    : `${supplementName} supplement`;
  const store = getAmazonStore(countryCode);
  return `https://www.${store.domain}/s?k=${encodeURIComponent(query)}&tag=${store.tag}`;
}

// ─── Curated picks ────────────────────────────────────────────────────────────

const CURATED: SupplementProducts[] = [
  {
    supplementId: "vitamin-d3",
    best:    { asin: "",           brand: "NOW Foods",          name: "Vitamin D3 5000 IU",               description: "Third-party tested, well-absorbed softgel, great value" },
    premium: { asin: "",           brand: "Thorne",             name: "Vitamin D/K2 Liquid",              description: "Physician-grade D3 + K2 synergy, precise liquid dosing" },
    budget:  { asin: "",           brand: "Nature's Bounty",    name: "Vitamin D3 5000 IU",               description: "Accessible, widely available, trusted brand" },
  },
  {
    supplementId: "magnesium",
    best:    { asin: "B000BD0RT0", brand: "Doctor's Best",      name: "High Absorption Magnesium",        description: "Chelated glycinate, 240 tablets" },
    premium: { asin: "B0058HWJ40", brand: "Pure Encapsulations", name: "Magnesium Glycinate",              description: "Hypoallergenic, superior absorption" },
    budget:  { asin: "B0CMQG5VN1", brand: "Nature Made",        name: "Magnesium Glycinate 200mg",        description: "Affordable, widely available" },
  },
  {
    supplementId: "omega-3",
    best:    { asin: "B002CQU564", brand: "Nordic Naturals",    name: "Ultimate Omega",                   description: "IFOS-certified, high EPA+DHA concentration" },
    premium: { asin: "",           brand: "Thorne",             name: "Super EPA",                        description: "NSF Certified for Sport, clinical-dose EPA/DHA" },
    budget:  { asin: "B004U3Y9FU", brand: "Nature Made",        name: "Fish Oil 1200mg",                  description: "USP verified, 200 softgels, affordable" },
  },
  {
    supplementId: "algae-omega-3",
    best:    { asin: "B015R8BPWA", brand: "Nordic Naturals",    name: "Algae Omega",                      description: "Best-selling vegan omega-3, sustainably sourced" },
    premium: { asin: "B08TBMHVQP", brand: "Performance Lab",   name: "Omega-3",                          description: "Ultra-clean algal DHA+EPA" },
    budget:  { asin: "B00CALOTRI", brand: "Ovega-3",            name: "Vegan Omega-3",                    description: "Affordable plant-based DHA+EPA" },
  },
  {
    supplementId: "vitamin-b12",
    best:    { asin: "B0013OQGO6", brand: "Jarrow Formulas",    name: "Methyl B-12 1000mcg",              description: "Active methylcobalamin, cherry flavor lozenges" },
    premium: { asin: "B001QWOSZM", brand: "Pure Encapsulations", name: "B12 Methylcobalamin",             description: "Hypoallergenic, physician-grade" },
    budget:  { asin: "B002EA99HE", brand: "Nature's Bounty",    name: "B-12 1000mcg",                     description: "Budget sublingual, 200 tablets" },
  },
  {
    supplementId: "ashwagandha",
    best:    { asin: "B078FJ8VLM", brand: "Nootropics Depot",   name: "KSM-66 Ashwagandha",               description: "Gold-standard extract, most studied form" },
    premium: { asin: "B01HCIPBLY", brand: "Jarrow Formulas",    name: "KSM-66 Ashwagandha",               description: "Clinically studied, root-only extract" },
    budget:  { asin: "B0027ACVZS", brand: "Himalaya",           name: "Organic Ashwagandha",              description: "Organic, affordable, well-reviewed" },
  },
  {
    supplementId: "coq10",
    best:    { asin: "B0044E1EX2", brand: "Qunol",              name: "Mega Ubiquinol CoQ10 100mg",       description: "Superior ubiquinol absorption, water-soluble" },
    premium: { asin: "B004QKUU4G", brand: "Jarrow Formulas",    name: "QH-Absorb Ubiquinol 100mg",        description: "Enhanced absorption ubiquinol" },
    budget:  { asin: "B004GW1YLG", brand: "Nature Made",        name: "CoQ10 200mg",                      description: "USP verified, softgels" },
  },
  {
    supplementId: "zinc",
    best:    { asin: "B001ABQSIQ", brand: "Thorne",             name: "Zinc Picolinate 30mg",             description: "Highly absorbable picolinate form" },
    premium: { asin: "B001FS6GFC", brand: "Pure Encapsulations", name: "Zinc 30",                         description: "Hypoallergenic zinc picolinate" },
    budget:  { asin: "B00008I8NT", brand: "Nature Made",        name: "Zinc 30mg",                        description: "Simple, affordable, 100 tablets" },
  },
  {
    supplementId: "folate",
    best:    { asin: "B003B6N40A", brand: "Jarrow Formulas",    name: "Methyl Folate 400mcg",             description: "Quatrefolic branded folate" },
    premium: { asin: "B002GS3K7G", brand: "Thorne",             name: "5-MTHF 1mg",                       description: "Clinical-grade active folate" },
    budget:  { asin: "B001G7QVMK", brand: "Solgar",             name: "Folate (Metafolin) 400mcg",        description: "Quality Metafolin, affordable" },
  },
  {
    supplementId: "curcumin",
    best:    { asin: "B002GS3K86", brand: "Thorne",             name: "Meriva Curcumin Phytosome",        description: "29x better absorption than standard curcumin" },
    premium: { asin: "B078SJ6JX4", brand: "Nootropics Depot",   name: "Longvida Curcumin",                description: "Sustained release, crosses blood-brain barrier" },
    budget:  { asin: "B003DRD3AI", brand: "Nature Made",        name: "Turmeric Curcumin",                description: "With black pepper extract, affordable" },
  },
  {
    supplementId: "probiotics",
    best:    { asin: "",           brand: "Seed",               name: "DS-01 Daily Synbiotic",            description: "24 clinically studied strains + prebiotic capsule-in-capsule" },
    premium: { asin: "",           brand: "Thorne",             name: "FloraMend Prime",                  description: "Physician-grade daily probiotic, well-researched strains" },
    budget:  { asin: "",           brand: "Renew Life",         name: "Ultimate Flora Extra Care",        description: "High CFU multi-strain, widely available" },
  },
  {
    supplementId: "creatine",
    best:    { asin: "B002DYIZEO", brand: "Optimum Nutrition",  name: "Micronized Creatine",              description: "Creapure, micronized for mixing" },
    premium: { asin: "B07L5GRZJV", brand: "Thorne",             name: "Creatine",                         description: "NSF Certified for Sport" },
    budget:  { asin: "B00E9M4XFI", brand: "BulkSupplements",    name: "Creatine Monohydrate",             description: "Pure powder, best price per serving" },
  },
  {
    supplementId: "iron",
    best:    { asin: "B000V7GH1A", brand: "Solgar",             name: "Gentle Iron 25mg",                 description: "Bisglycinate chelate, easy on stomach" },
    premium: { asin: "B005P0W0HC", brand: "Pure Encapsulations", name: "Iron-C",                          description: "Iron + vitamin C for enhanced absorption" },
    budget:  { asin: "B005DKSXOI", brand: "Nature Made",        name: "Iron 65mg",                        description: "Ferrous sulfate, affordable" },
  },
  {
    supplementId: "calcium",
    best:    { asin: "B001G7R8FC", brand: "Citracal",           name: "Petites with D3",                  description: "Small tablets, calcium citrate + D3" },
    premium: { asin: "B0058HWQKK", brand: "Pure Encapsulations", name: "Calcium Citrate",                 description: "Hypoallergenic, no fillers" },
    budget:  { asin: "B004GW1WH2", brand: "Nature Made",        name: "Calcium 500mg + D3",               description: "Affordable combo" },
  },
  {
    supplementId: "l-theanine",
    best:    { asin: "B01DTN6KRI", brand: "Nootropics Depot",   name: "L-Theanine 200mg",                 description: "Pure, well-dosed capsules" },
    premium: { asin: "B00E7GESNG", brand: "Sports Research",    name: "Suntheanine 200mg",                description: "Patented Suntheanine form" },
    budget:  { asin: "B01D1YQBOK", brand: "Nature's Trove",     name: "L-Theanine 200mg",                 description: "Budget-friendly, 120 capsules" },
  },
  {
    supplementId: "nac",
    best:    { asin: "B0013OUQ3S", brand: "NOW Supplements",    name: "NAC 600mg",                        description: "With selenium and molybdenum" },
    premium: { asin: "B002GS3K7M", brand: "Pure Encapsulations", name: "NAC 900mg",                       description: "Higher dose, hypoallergenic" },
    budget:  { asin: "B01HXCFJ1A", brand: "Nutricost",          name: "NAC 600mg",                        description: "Pure, 180 capsules, great value" },
  },
  {
    supplementId: "berberine",
    best:    { asin: "B01JMZBSTW", brand: "Thorne",             name: "Berberine 1000mg",                 description: "Clinical dose, trusted brand" },
    premium: { asin: "B01A59F98S", brand: "Integrative Therapeutics", name: "Berberine",                  description: "Physician-formulated" },
    budget:  { asin: "B07BKYBM5Q", brand: "Sunergetic",         name: "Berberine 1200mg",                 description: "High dose, good value" },
  },
  {
    supplementId: "vitamin-k2",
    best:    { asin: "B00FAPSPFY", brand: "Jarrow Formulas",    name: "MK-7 90mcg",                       description: "MK-7 form, supports bone + heart" },
    premium: { asin: "B004GW07E0", brand: "Life Extension",     name: "Super K",                          description: "K1 + MK-4 + MK-7 complex" },
    budget:  { asin: "B00MOGDZ1C", brand: "NOW Foods",          name: "K-2 100mcg",                       description: "MK-4 form, affordable" },
  },
  {
    supplementId: "selenium",
    best:    { asin: "B00FEF3V40", brand: "Pure Encapsulations", name: "Selenium 200mcg",                 description: "Selenomethionine, hypoallergenic" },
    premium: { asin: "B01CIGRIAM", brand: "Thorne",             name: "Selenomethionine",                 description: "Well-absorbed organic form" },
    budget:  { asin: "B003BVIADO", brand: "NOW Foods",          name: "Selenium 200mcg",                  description: "Yeast-free, 180 capsules" },
  },
  {
    supplementId: "vitamin-c",
    best:    { asin: "B00007L8EY", brand: "NOW Foods",          name: "Vitamin C-1000",                   description: "With rose hips, 250 tablets" },
    premium: { asin: "B01LWNA84G", brand: "LivOn Labs",         name: "Lypo-Spheric Vitamin C",           description: "Liposomal delivery, maximum absorption" },
    budget:  { asin: "B004GW2JWG", brand: "Nature Made",        name: "Vitamin C 1000mg",                 description: "Simple, 100 tablets" },
  },
  {
    supplementId: "iodine",
    best:    { asin: "",           brand: "Thorne",             name: "Iodine & Tyrosine",                description: "Iodine + tyrosine for thyroid support" },
    premium: { asin: "B00F9JXJFI", brand: "Pure Encapsulations", name: "Iodine & Tyrosine",               description: "Hypoallergenic, physician-formulated" },
    budget:  { asin: "",           brand: "NOW Foods",          name: "Kelp 150mcg",                      description: "Whole-food iodine source, affordable" },
  },
  // ─── Added: split magnesium by form ──────────────────────────────────────
  {
    supplementId: "magnesium-glycinate",
    best:    { asin: "B000BD0RT0", brand: "Doctor's Best",      name: "High Absorption Magnesium 200mg", description: "Chelated glycinate, 240 tablets — excellent value" },
    premium: { asin: "B0058HWJ40", brand: "Pure Encapsulations", name: "Magnesium Glycinate 120mg",      description: "Hypoallergenic, physician-trusted, no fillers" },
    budget:  { asin: "",           brand: "NOW Foods",          name: "Magnesium Glycinate 200mg",       description: "Accessible, widely available" },
  },
  {
    supplementId: "magnesium-citrate",
    best:    { asin: "",           brand: "NOW Foods",          name: "Magnesium Citrate 200mg",         description: "Well-absorbed, gentle, budget-friendly" },
    premium: { asin: "",           brand: "Thorne",             name: "Magnesium Citrate",                description: "Clinical-grade magnesium citrate" },
    budget:  { asin: "",           brand: "Natural Vitality",   name: "Calm Magnesium Powder",           description: "Popular flavored magnesium drink" },
  },
  {
    supplementId: "magnesium-l-threonate",
    best:    { asin: "",           brand: "Double Wood",        name: "Magnesium L-Threonate 2000mg",    description: "Crosses the blood–brain barrier for cognition" },
    premium: { asin: "",           brand: "Life Extension",     name: "Neuro-Mag L-Threonate",           description: "Patented Magtein, premium brain support" },
    budget:  { asin: "",           brand: "Source Naturals",    name: "Magnesium L-Threonate",           description: "Budget access to brain-targeted magnesium" },
  },
  {
    supplementId: "vitamin-d3-k2",
    best:    { asin: "",           brand: "Sports Research",    name: "Vitamin D3 + K2",                 description: "5,000 IU D3 with 100mcg MK-7 K2" },
    premium: { asin: "",           brand: "Thorne",             name: "Vitamin D/K2 Liquid",              description: "Physician-grade, liquid, precise dosing" },
    budget:  { asin: "",           brand: "NOW Foods",          name: "MK-7 Vitamin K-2 + D3",           description: "Reliable combo at a low price" },
  },
  {
    supplementId: "b-complex",
    best:    { asin: "",           brand: "Thorne",             name: "Basic B Complex",                  description: "Active/methylated B-vitamin forms" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "B-Complex Plus",                  description: "Hypoallergenic, full active forms" },
    budget:  { asin: "",           brand: "Nature Made",        name: "Super B Complex",                  description: "USP verified, affordable daily B" },
  },
  {
    supplementId: "methylated-b-complex",
    best:    { asin: "",           brand: "Thorne",             name: "Methyl-Guard Plus",                description: "MTHFR-friendly: 5-MTHF + methyl B12 + B6" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "B-Complex Liquid",                description: "Liquid methylated B for sensitive users" },
    budget:  { asin: "",           brand: "Jarrow Formulas",    name: "Methyl B-12 5000mcg",             description: "Active B12 — essential for MTHFR variants" },
  },
  {
    supplementId: "ashwagandha",
    best:    { asin: "",           brand: "Nutricost",          name: "KSM-66 Ashwagandha 600mg",        description: "Clinically studied KSM-66 extract" },
    premium: { asin: "",           brand: "Gaia Herbs",         name: "Ashwagandha Root",                 description: "Organic, whole-root, third-party tested" },
    budget:  { asin: "B0027ACVZS", brand: "Himalaya",           name: "Organic Ashwagandha",              description: "Organic, affordable, well-reviewed" },
  },
  {
    supplementId: "rhodiola",
    best:    { asin: "",           brand: "NOW Foods",          name: "Rhodiola 500mg",                   description: "Standardised 3% rosavins, 1% salidroside" },
    premium: { asin: "",           brand: "Gaia Herbs",         name: "Rhodiola Rosea",                   description: "Whole-root liquid phyto-capsule" },
    budget:  { asin: "",           brand: "Swanson",            name: "Rhodiola Rosea",                   description: "Reliable rhodiola at a low price" },
  },
  {
    supplementId: "creatine",
    best:    { asin: "B002DYIZEO", brand: "Optimum Nutrition",  name: "Micronized Creatine",              description: "Creapure, micronized for mixing" },
    premium: { asin: "B07L5GRZJV", brand: "Thorne",             name: "Creatine",                         description: "NSF Certified for Sport" },
    budget:  { asin: "",           brand: "NOW Sports",         name: "Creatine Monohydrate",             description: "Pure powder, excellent price per serving" },
  },
  {
    supplementId: "whey-protein",
    best:    { asin: "",           brand: "Transparent Labs",   name: "Whey Protein Isolate",             description: "Grass-fed, no artificial sweeteners" },
    premium: { asin: "",           brand: "Thorne",             name: "Whey Protein Isolate",             description: "NSF Certified for Sport, clean label" },
    budget:  { asin: "",           brand: "Optimum Nutrition",  name: "Gold Standard 100% Whey",          description: "Best-selling, reliable, affordable" },
  },
  {
    supplementId: "collagen",
    best:    { asin: "",           brand: "Vital Proteins",     name: "Collagen Peptides",                description: "Grass-fed bovine peptides, mixes easily" },
    premium: { asin: "",           brand: "Thorne",             name: "Collagen Plus",                    description: "Collagen + skin-support cofactors" },
    budget:  { asin: "",           brand: "NOW Sports",         name: "Collagen Peptides",                description: "Budget grass-fed peptides" },
  },
  {
    supplementId: "inositol",
    best:    { asin: "",           brand: "Theralogix",         name: "Ovasitol",                         description: "Clinical 40:1 myo- / D-chiro inositol (PCOS)" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "Inositol Powder",                 description: "Hypoallergenic myo-inositol" },
    budget:  { asin: "",           brand: "Jarrow Formulas",    name: "Inositol Powder",                  description: "Pure, affordable myo-inositol" },
  },
  {
    supplementId: "melatonin",
    best:    { asin: "",           brand: "Life Extension",     name: "Melatonin 3mg",                    description: "Reliable low-dose night-time melatonin" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "Melatonin 0.5mg",                 description: "Hypoallergenic, physiologic micro-dose" },
    budget:  { asin: "",           brand: "Natrol",             name: "Melatonin 3mg",                    description: "Widely available, fast-dissolve" },
  },
  {
    supplementId: "multivitamin",
    best:    { asin: "",           brand: "Thorne",             name: "Basic Nutrients 2/Day",            description: "Clean multi with methylated B & active vitamins" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "O.N.E. Multivitamin",             description: "Once-daily comprehensive, hypoallergenic" },
    budget:  { asin: "",           brand: "Nature Made",        name: "Multi for Him/Her",                description: "USP verified daily multi" },
  },
  {
    supplementId: "multivitamin-prenatal",
    best:    { asin: "",           brand: "Ritual",             name: "Essential Prenatal",               description: "Active folate, delayed-release, traceable" },
    premium: { asin: "",           brand: "Thorne",             name: "Basic Prenatal",                   description: "Physician-grade methylated prenatal" },
    budget:  { asin: "",           brand: "Nature Made",        name: "Prenatal + DHA",                   description: "USP verified, widely available" },
  },
  {
    supplementId: "alpha-lipoic-acid",
    best:    { asin: "",           brand: "Doctor's Best",      name: "Alpha Lipoic Acid 600mg",          description: "Well-dosed standard ALA" },
    premium: { asin: "",           brand: "Life Extension",     name: "Super R-Lipoic Acid",              description: "Stabilised R-form, superior absorption" },
    budget:  { asin: "",           brand: "NOW Foods",          name: "Alpha Lipoic Acid 250mg",          description: "Budget-friendly, vegetarian capsules" },
  },
  {
    supplementId: "adrenal-support",
    best:    { asin: "",           brand: "Gaia Herbs",         name: "Adrenal Health Daily Support",     description: "Whole-herb adaptogen blend" },
    premium: { asin: "",           brand: "Pure Encapsulations", name: "Daily Stress Formula",            description: "Adaptogens + nutrients for stress resilience" },
    budget:  { asin: "",           brand: "NOW Foods",          name: "Adrenal Support",                  description: "Affordable adrenal adaptogen blend" },
  },
];

// ─── Name → supplementId aliases ─────────────────────────────────────────────
// Maps common supplement names (lowercase) to a curated supplementId

const NAME_ALIASES: Record<string, string> = {
  // Vitamin D
  "vitamin d3": "vitamin-d3",
  "vitamin d":  "vitamin-d3",
  "cholecalciferol": "vitamin-d3",
  // Magnesium
  "magnesium":           "magnesium",
  "magnesium malate":    "magnesium",
  // Omega-3
  "omega-3":           "omega-3",
  "omega-3 fatty acids": "omega-3",
  "fish oil":          "omega-3",
  "epa/dha":           "omega-3",
  // Algae omega
  "algae omega-3":     "algae-omega-3",
  "algal dha":         "algae-omega-3",
  "vegan omega-3":     "algae-omega-3",
  // B12
  "vitamin b12":       "vitamin-b12",
  "methylcobalamin":   "vitamin-b12",
  "cyanocobalamin":    "vitamin-b12",
  // Ashwagandha
  "ashwagandha":       "ashwagandha",
  "withania somnifera": "ashwagandha",
  // CoQ10
  "coq10":             "coq10",
  "coenzyme q10":      "coq10",
  "ubiquinol":         "coq10",
  // Zinc
  "zinc":              "zinc",
  "zinc picolinate":   "zinc",
  // Folate
  "folate":            "folate",
  "methylfolate":      "folate",
  "5-mthf":            "folate",
  "folic acid":        "folate",
  // Curcumin
  "curcumin":          "curcumin",
  "turmeric":          "curcumin",
  // Probiotics
  "probiotics":        "probiotics",
  "probiotic":         "probiotics",
  // Creatine
  "creatine":          "creatine",
  "creatine monohydrate": "creatine",
  // Iron
  "iron":              "iron",
  "ferrous bisglycinate": "iron",
  // Calcium
  "calcium":           "calcium",
  "calcium citrate":   "calcium",
  // L-Theanine
  "l-theanine":        "l-theanine",
  "theanine":          "l-theanine",
  // NAC
  "nac":               "nac",
  "n-acetyl cysteine": "nac",
  // Berberine
  "berberine":         "berberine",
  // Vitamin K2
  "vitamin k2":        "vitamin-k2",
  "menaquinone":       "vitamin-k2",
  "mk-7":              "vitamin-k2",
  // Selenium
  "selenium":          "selenium",
  // Vitamin C
  "vitamin c":         "vitamin-c",
  "ascorbic acid":     "vitamin-c",
  // Iodine
  "iodine":            "iodine",
  // Form-specific magnesium (more specific → matched before generic "magnesium")
  "magnesium glycinate":   "magnesium-glycinate",
  "magnesium bisglycinate": "magnesium-glycinate",
  "magnesium citrate":     "magnesium-citrate",
  "magnesium l-threonate": "magnesium-l-threonate",
  "magnesium threonate":   "magnesium-l-threonate",
  "magtein":               "magnesium-l-threonate",
  // Vitamin D3 + K2 combo
  "vitamin d3 + k2":   "vitamin-d3-k2",
  "vitamin d3 k2":     "vitamin-d3-k2",
  "d3/k2":             "vitamin-d3-k2",
  // B-complex variants
  "b-complex":         "b-complex",
  "b complex":         "b-complex",
  "vitamin b complex": "b-complex",
  "methylated b":      "methylated-b-complex",
  "methyl b-complex":  "methylated-b-complex",
  "methyl-guard":      "methylated-b-complex",
  // Adaptogens
  "rhodiola":          "rhodiola",
  "rhodiola rosea":    "rhodiola",
  // Sports / protein
  "whey protein":      "whey-protein",
  "whey isolate":      "whey-protein",
  "collagen":          "collagen",
  "collagen peptides": "collagen",
  // Reproductive / metabolic
  "inositol":          "inositol",
  "myo-inositol":      "inositol",
  "ovasitol":          "inositol",
  // Sleep
  "melatonin":         "melatonin",
  // Multivitamins
  "multivitamin":      "multivitamin",
  "daily multivitamin": "multivitamin",
  "prenatal":          "multivitamin-prenatal",
  "prenatal multivitamin": "multivitamin-prenatal",
  "prenatal vitamin":  "multivitamin-prenatal",
  // Antioxidants
  "alpha lipoic acid": "alpha-lipoic-acid",
  "alpha-lipoic acid": "alpha-lipoic-acid",
  "ala":               "alpha-lipoic-acid",
  "r-lipoic acid":     "alpha-lipoic-acid",
  // Adrenal / stress
  "adrenal support":   "adrenal-support",
  "adrenal health":    "adrenal-support",
};

const CURATED_BY_ID = new Map(CURATED.map((s) => [s.supplementId, s]));

// ─── Public lookup ────────────────────────────────────────────────────────────

/**
 * Returns curated picks for a supplement name (case-insensitive).
 * Returns null if no curated picks exist — caller should use getAmazonSearchLink().
 */
// Pre-sort aliases longest-first so "magnesium glycinate" beats "magnesium"
const ALIASES_BY_LENGTH = Object.entries(NAME_ALIASES).sort(
  (a, b) => b[0].length - a[0].length,
);

// ─── Blog article → supplement mapping ────────────────────────────────────────
// Maps article slug → list of supplementIds to display in "Products Mentioned".
// Slugs are matched exactly; keep in sync with Supabase blog_posts.slug.

const ARTICLE_SUPPLEMENT_MAP: Record<string, string[]> = {
  "the-complete-guide-to-magnesium":              ["magnesium-glycinate", "magnesium-citrate", "magnesium-l-threonate"],
  "5-supplement-myths-your-doctor-didnt-learn":   ["vitamin-d3", "omega-3", "magnesium-glycinate", "vitamin-c", "folate"],
  "supplements-that-dont-mix-critical-interactions": ["omega-3", "vitamin-k2", "multivitamin", "iron", "calcium"],
  "the-pcos-supplement-protocol":                 ["inositol", "vitamin-d3", "berberine", "omega-3", "nac"],
  "vitamin-d-why-80-percent-are-deficient":       ["vitamin-d3", "vitamin-d3-k2", "magnesium-glycinate", "zinc"],
  "your-gut-brain-connection-probiotics-mental-health": ["probiotics", "vitamin-d3", "omega-3", "magnesium-glycinate"],
  "migraine-prevention-supplements":              ["magnesium-glycinate", "coq10", "b-complex"],
  "menopause-supplement-guide":                   ["vitamin-d3-k2", "calcium", "omega-3", "magnesium-glycinate"],
  "fatty-liver-nafld-supplements":                ["alpha-lipoic-acid", "nac", "curcumin", "omega-3", "berberine"],
  "adhd-supplements-clinical-evidence":           ["omega-3", "zinc", "iron", "l-theanine", "magnesium-glycinate"],
  "vegan-supplement-checklist":                   ["vitamin-b12", "vitamin-d3", "algae-omega-3", "iron", "zinc", "iodine", "calcium"],
  "keto-electrolyte-guide":                       ["magnesium-citrate", "magnesium-glycinate"],
  "athlete-recovery-supplements":                 ["creatine", "whey-protein", "magnesium-glycinate", "collagen", "omega-3"],
  "stress-supplements-adaptogens":                ["ashwagandha", "rhodiola", "l-theanine", "adrenal-support", "magnesium-glycinate"],
  "sleep-supplements-pharmacologist-guide":       ["magnesium-glycinate", "l-theanine", "melatonin"],
  "hashimotos-thyroiditis-supplements":           ["selenium", "vitamin-d3", "zinc", "iodine"],
};

/**
 * Returns supplement trios (best / premium / budget) relevant to a blog
 * article. Used to render the "Products Mentioned" block at article end.
 */
export function getProductsForArticle(slug: string): SupplementProducts[] {
  const ids = ARTICLE_SUPPLEMENT_MAP[slug];
  if (!ids) return [];
  return ids
    .map((id) => CURATED_BY_ID.get(id))
    .filter((x): x is SupplementProducts => Boolean(x));
}

export function getProductsForSupplement(name: string): SupplementProducts | null {
  const lower = name.toLowerCase().trim();
  // Direct ID match
  if (CURATED_BY_ID.has(lower)) return CURATED_BY_ID.get(lower)!;
  // Exact alias match
  const id = NAME_ALIASES[lower];
  if (id) return CURATED_BY_ID.get(id) ?? null;
  // Partial alias match, longest alias wins (so "magnesium glycinate 400mg"
  // resolves to magnesium-glycinate, not the generic "magnesium").
  for (const [alias, supplementId] of ALIASES_BY_LENGTH) {
    if (lower.includes(alias)) return CURATED_BY_ID.get(supplementId) ?? null;
  }
  return null;
}
