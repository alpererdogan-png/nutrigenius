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
    best:    { asin: "B00GB85JR4", brand: "NatureWise",         name: "Vitamin D3 5000 IU (360 ct)",      description: "Best seller, organic olive oil base, NSF certified" },
    premium: { asin: "B0017Q948U", brand: "Pure Encapsulations", name: "Vitamin D3 5000 IU",               description: "Hypoallergenic, physician-trusted, no fillers" },
    budget:  { asin: "B00I07Z4TC", brand: "Nature Made",        name: "Vitamin D3 2000 IU (100 ct)",      description: "#1 pharmacist recommended, USP verified" },
  },
  {
    supplementId: "magnesium",
    best:    { asin: "B000BD0RT0", brand: "Doctor's Best",      name: "High Absorption Magnesium",        description: "Chelated glycinate, 240 tablets" },
    premium: { asin: "B0058HWJ40", brand: "Pure Encapsulations", name: "Magnesium Glycinate",              description: "Hypoallergenic, superior absorption" },
    budget:  { asin: "B0CMQG5VN1", brand: "Nature Made",        name: "Magnesium Glycinate 200mg",        description: "Affordable, widely available" },
  },
  {
    supplementId: "omega-3",
    best:    { asin: "B002CQU564", brand: "Nordic Naturals",    name: "Ultimate Omega",                   description: "Third-party tested, high EPA+DHA concentration" },
    premium: { asin: "B001LF39RO", brand: "Carlson Labs",       name: "The Very Finest Fish Oil",         description: "Award-winning purity, lemon flavor" },
    budget:  { asin: "B004U3Y9FU", brand: "Nature Made",        name: "Fish Oil 1200mg",                  description: "USP verified, 200 softgels" },
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
    best:    { asin: "B000IMYJGG", brand: "Culturelle",         name: "Daily Probiotic",                  description: "LGG strain, #1 clinically studied probiotic" },
    premium: { asin: "B00CP4E5QU", brand: "Visbiome",           name: "High Potency Probiotic",           description: "450 billion CFU, clinical strength" },
    budget:  { asin: "B07HBCRL8K", brand: "Align",              name: "Daily Probiotic",                  description: "Gastroenterologist recommended" },
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
    best:    { asin: "B001AYPD0G", brand: "Life Extension",     name: "Sea-Iodine 1000mcg",               description: "Natural kelp-derived iodine" },
    premium: { asin: "B00F9JXJFI", brand: "Pure Encapsulations", name: "Iodine & Tyrosine",               description: "Iodine + thyroid amino acid support" },
    budget:  { asin: "B005P0X8RK", brand: "NOW Foods",          name: "Potassium Iodide 225mcg",          description: "Simple, affordable" },
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
  "magnesium glycinate": "magnesium",
  "magnesium citrate":   "magnesium",
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
};

const CURATED_BY_ID = new Map(CURATED.map((s) => [s.supplementId, s]));

// ─── Public lookup ────────────────────────────────────────────────────────────

/**
 * Returns curated picks for a supplement name (case-insensitive).
 * Returns null if no curated picks exist — caller should use getAmazonSearchLink().
 */
export function getProductsForSupplement(name: string): SupplementProducts | null {
  const lower = name.toLowerCase().trim();
  // Direct ID match
  if (CURATED_BY_ID.has(lower)) return CURATED_BY_ID.get(lower)!;
  // Alias match
  const id = NAME_ALIASES[lower];
  if (id) return CURATED_BY_ID.get(id) ?? null;
  // Partial alias match (e.g. "Magnesium Glycinate 400mg" → "magnesium")
  for (const [alias, supplementId] of Object.entries(NAME_ALIASES)) {
    if (lower.includes(alias)) return CURATED_BY_ID.get(supplementId) ?? null;
  }
  return null;
}
