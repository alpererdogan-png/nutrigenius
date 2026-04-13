import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Tag, ShieldCheck,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain, Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { markdownToHtml, extractTOC } from "@/lib/markdown";
import { MobileFooterAd } from "./MobileFooterAd";
import {
  getAmazonSearchLink,
  getProductsForArticle,
} from "@/src/lib/data/amazonProducts";
import { Logo } from "@/src/components/ui/Logo";
import {
  AffiliateTierCard,
  TIER_ORDER,
} from "@/src/components/ui/AffiliateTierCard";


// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  read_time: string;
  author_name: string;
  author_title: string;
  published_at: string;
  updated_at: string;
  tags: string[];
}

type RelatedPost = Pick<BlogPost, "id" | "slug" | "title" | "excerpt" | "category" | "read_time" | "author_name" | "published_at" | "tags">;

interface HardcodedProduct {
  product_name: string;
  brand: string;
  price_usd: number;
  affiliate_url: string;
  note: string;
}

// ─── Category visual config ──────────────────────────────────────────────────

interface CategoryConfig {
  gradient: string;
  decorColor: string;
  icon: LucideIcon;
  tag: string;
  accent: string;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "evidence-review": {
    gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
    decorColor: "bg-teal-400",
    icon: FlaskConical,
    tag: "bg-teal-50 text-teal-700 border-teal-200",
    accent: "bg-teal-500",
  },
  "myth-busting": {
    gradient: "bg-gradient-to-br from-orange-400 to-rose-500",
    decorColor: "bg-orange-300",
    icon: ShieldAlert,
    tag: "bg-orange-50 text-orange-700 border-orange-200",
    accent: "bg-orange-400",
  },
  "safety-alert": {
    gradient: "bg-gradient-to-br from-red-500 to-rose-700",
    decorColor: "bg-red-400",
    icon: AlertTriangle,
    tag: "bg-red-50 text-red-700 border-red-200",
    accent: "bg-red-500",
  },
  "condition-guide": {
    gradient: "bg-gradient-to-br from-purple-500 to-purple-800",
    decorColor: "bg-purple-400",
    icon: HeartPulse,
    tag: "bg-purple-50 text-purple-700 border-purple-200",
    accent: "bg-purple-500",
  },
  "research-update": {
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    decorColor: "bg-blue-400",
    icon: TrendingUp,
    tag: "bg-blue-50 text-blue-700 border-blue-200",
    accent: "bg-blue-500",
  },
  "deep-dive": {
    gradient: "bg-gradient-to-br from-amber-400 to-orange-600",
    decorColor: "bg-amber-300",
    icon: Brain,
    tag: "bg-amber-50 text-amber-700 border-amber-200",
    accent: "bg-amber-500",
  },
};

const DEFAULT_CONFIG = CATEGORY_CONFIG["deep-dive"];

// ─── Hardcoded affiliate product cards ───────────────────────────────────────
// afterParagraph is 1-indexed: 1 = after the 1st paragraph, 4 = after the 4th paragraph

const ARTICLE_PRODUCTS: Record<string, Array<{ afterParagraph: number; product: HardcodedProduct }>> = {
  "the-complete-guide-to-magnesium": [
    {
      afterParagraph: 1,
      product: {
        product_name: "NOW Foods Magnesium Glycinate",
        brand: "NOW Foods",
        price_usd: 12.99,
        affiliate_url: getAmazonSearchLink("Magnesium Glycinate", "NOW Foods"),
        note: "Highest bioavailability — ideal for sleep & anxiety",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Magnesium L-Threonate",
        brand: "Life Extension",
        price_usd: 29.99,
        affiliate_url: getAmazonSearchLink("Magnesium L-Threonate", "Neuro-Mag"),
        note: "Crosses the blood-brain barrier — top choice for cognition",
      },
    },
  ],
  "supplements-that-dont-mix-critical-interactions": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Vitamin D3 + K2 Liquid",
        brand: "Thorne",
        price_usd: 24.99,
        affiliate_url: getAmazonSearchLink("Vitamin D3 K2", "Thorne liquid"),
        note: "D3 + K2 combined — optimal for safe use alongside anticoagulants",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Ultimate Omega Fish Oil",
        brand: "Nordic Naturals",
        price_usd: 33.99,
        affiliate_url: getAmazonSearchLink("Omega-3 fish oil", "Nordic Naturals"),
        note: "IFOS 5-star certified — pharmaceutical-grade purity",
      },
    },
  ],
  "vitamin-d-why-80-percent-are-deficient": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Vitamin D3 5000 IU",
        brand: "NOW Foods",
        price_usd: 11.99,
        affiliate_url: getAmazonSearchLink("Vitamin D3 5000 IU", "NOW Foods"),
        note: "Third-party tested · excellent value for daily deficiency correction",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Vitamin D 5000 IU",
        brand: "Thorne",
        price_usd: 19.99,
        affiliate_url: getAmazonSearchLink("Vitamin D3 5000 IU", "Thorne"),
        note: "NSF Certified · premium pharmaceutical-grade formulation",
      },
    },
  ],
  "the-pcos-supplement-protocol": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Myo-Inositol + D-Chiro Inositol",
        brand: "Wholesome Story",
        price_usd: 23.99,
        affiliate_url: getAmazonSearchLink("Myo-Inositol D-Chiro Inositol PCOS"),
        note: "Clinically studied 40:1 myo:D-chiro inositol ratio",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "NAC N-Acetyl Cysteine",
        brand: "Jarrow Formulas",
        price_usd: 15.99,
        affiliate_url: getAmazonSearchLink("NAC N-Acetyl Cysteine", "Jarrow"),
        note: "Sustained-release NAC — antioxidant & insulin-sensitising support",
      },
    },
  ],
  "your-gut-brain-connection-probiotics-mental-health": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Dr. Formulated Probiotics",
        brand: "Garden of Life",
        price_usd: 34.99,
        affiliate_url: getAmazonSearchLink("Probiotics mental health", "Garden of Life"),
        note: "Clinician-formulated psychobiotic blend — Lactobacillus + Bifidobacterium",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Saccharomyces Boulardii",
        brand: "Jarrow Formulas",
        price_usd: 14.99,
        affiliate_url: getAmazonSearchLink("Saccharomyces Boulardii probiotic"),
        note: "Evidence-backed probiotic yeast for gut microbiome restoration",
      },
    },
  ],
  "5-supplement-myths-your-doctor-didnt-learn": [
    {
      afterParagraph: 1,
      product: {
        product_name: "B-Complex Plus",
        brand: "Pure Encapsulations",
        price_usd: 24.99,
        affiliate_url: getAmazonSearchLink("B-Complex supplement", "Pure Encapsulations"),
        note: "Hypoallergenic · all active B-vitamin forms for maximum absorption",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Buffered Vitamin C",
        brand: "Life Extension",
        price_usd: 10.99,
        affiliate_url: getAmazonSearchLink("Buffered Vitamin C supplement"),
        note: "High-potency buffered vitamin C with bioflavonoids",
      },
    },
  ],
  "migraine-prevention-supplements": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Magnesium Glycinate 400mg",
        brand: "Doctor's Best",
        price_usd: 14.99,
        affiliate_url: getAmazonSearchLink("Magnesium Glycinate 400mg", "Doctor's Best"),
        note: "High-absorption chelated magnesium — top choice for migraine prevention",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Riboflavin (B2) 400mg",
        brand: "NOW Foods",
        price_usd: 9.99,
        affiliate_url: getAmazonSearchLink("Riboflavin B2 400mg"),
        note: "Clinical-dose riboflavin for migraine frequency reduction",
      },
    },
  ],
  "menopause-supplement-guide": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Black Cohosh Root 540mg",
        brand: "Nature's Way",
        price_usd: 12.99,
        affiliate_url: getAmazonSearchLink("Black Cohosh menopause", "Nature's Way"),
        note: "Standardized extract for hot flash relief — most studied herbal for menopause",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Calcium + D3 + K2",
        brand: "Garden of Life",
        price_usd: 29.99,
        affiliate_url: getAmazonSearchLink("Calcium D3 K2 bone health", "Garden of Life"),
        note: "Complete bone support formula with plant-sourced calcium",
      },
    },
  ],
  "fatty-liver-nafld-supplements": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Ultimate Omega 2X",
        brand: "Nordic Naturals",
        price_usd: 39.99,
        affiliate_url: getAmazonSearchLink("Omega-3 high dose EPA DHA", "Nordic Naturals"),
        note: "Therapeutic-dose omega-3 — IFOS 5-star certified purity",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Milk Thistle (Silymarin)",
        brand: "Jarrow Formulas",
        price_usd: 14.99,
        affiliate_url: getAmazonSearchLink("Milk Thistle Silymarin", "Jarrow"),
        note: "Standardized 80% silymarin extract for liver support",
      },
    },
  ],
  "adhd-supplements-clinical-evidence": [
    {
      afterParagraph: 1,
      product: {
        product_name: "DHA Xtra",
        brand: "Nordic Naturals",
        price_usd: 27.99,
        affiliate_url: getAmazonSearchLink("DHA omega-3 supplement", "Nordic Naturals"),
        note: "High-DHA formula — the specific omega-3 with strongest ADHD evidence",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Zinc Picolinate 30mg",
        brand: "Thorne",
        price_usd: 15.99,
        affiliate_url: getAmazonSearchLink("Zinc Picolinate", "Thorne"),
        note: "Highly bioavailable zinc — commonly deficient in ADHD",
      },
    },
  ],
  "vegan-supplement-checklist": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Methylcobalamin B12 5000mcg",
        brand: "Jarrow Formulas",
        price_usd: 13.99,
        affiliate_url: getAmazonSearchLink("Vegan B12 Methylcobalamin", "Jarrow"),
        note: "Active-form B12 — non-negotiable for every vegan",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Algae Omega DHA+EPA",
        brand: "Nordic Naturals",
        price_usd: 33.99,
        affiliate_url: getAmazonSearchLink("Algae Omega DHA EPA vegan", "Nordic Naturals"),
        note: "Plant-based omega-3 from microalgae — superior to flax conversion",
      },
    },
  ],
  "keto-electrolyte-guide": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Electrolyte Powder (Keto)",
        brand: "LMNT",
        price_usd: 39.99,
        affiliate_url: getAmazonSearchLink("LMNT electrolyte keto"),
        note: "Formulated for low-carb diets — sodium, potassium, magnesium",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Magnesium Glycinate 400mg",
        brand: "Doctor's Best",
        price_usd: 14.99,
        affiliate_url: getAmazonSearchLink("Magnesium Glycinate 400mg", "Doctor's Best"),
        note: "High-absorption magnesium — critical for keto electrolyte balance",
      },
    },
  ],
  "athlete-recovery-supplements": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Creatine Monohydrate Powder",
        brand: "Thorne",
        price_usd: 29.99,
        affiliate_url: getAmazonSearchLink("Creatine Monohydrate", "Thorne"),
        note: "NSF Certified for Sport — the gold standard in creatine",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Tart Cherry Extract",
        brand: "Sports Research",
        price_usd: 21.99,
        affiliate_url: getAmazonSearchLink("Tart Cherry Extract recovery"),
        note: "Concentrated Montmorency cherry — clinically shown to reduce DOMS",
      },
    },
  ],
  "stress-supplements-adaptogens": [
    {
      afterParagraph: 1,
      product: {
        product_name: "KSM-66 Ashwagandha",
        brand: "Jarrow Formulas",
        price_usd: 18.99,
        affiliate_url: getAmazonSearchLink("KSM-66 Ashwagandha", "Jarrow"),
        note: "Full-spectrum root extract — the most clinically studied ashwagandha",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "L-Theanine 200mg",
        brand: "NOW Foods",
        price_usd: 12.99,
        affiliate_url: getAmazonSearchLink("L-Theanine 200mg", "NOW Foods"),
        note: "Calm focus without drowsiness — works in 30–60 minutes",
      },
    },
  ],
  "sleep-supplements-pharmacologist-guide": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Magnesium Glycinate",
        brand: "NOW Foods",
        price_usd: 15.99,
        affiliate_url: getAmazonSearchLink("Magnesium Glycinate sleep", "NOW Foods"),
        note: "The specific magnesium form preferred for sleep — calming glycine carrier",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Glycine Powder",
        brand: "BulkSupplements",
        price_usd: 14.99,
        affiliate_url: getAmazonSearchLink("Glycine powder sleep"),
        note: "3g before bed lowers core body temperature to initiate sleep",
      },
    },
  ],
  "hashimotos-thyroiditis-supplements": [
    {
      afterParagraph: 1,
      product: {
        product_name: "Selenium 200mcg (Selenomethionine)",
        brand: "Pure Encapsulations",
        price_usd: 16.99,
        affiliate_url: getAmazonSearchLink("Selenium Selenomethionine 200mcg", "Pure Encapsulations"),
        note: "Selenomethionine form — the best-studied form for TPO antibody reduction",
      },
    },
    {
      afterParagraph: 4,
      product: {
        product_name: "Vitamin D3 5000 IU",
        brand: "Thorne",
        price_usd: 19.99,
        affiliate_url: getAmazonSearchLink("Vitamin D3 5000 IU", "Thorne"),
        note: "Autoimmune-supportive dose — commonly deficient in Hashimoto's",
      },
    },
  ],
};

// ─── Key Takeaways per article ────────────────────────────────────────────────

const KEY_TAKEAWAYS: Record<string, string[]> = {
  "the-complete-guide-to-magnesium": [
    "Magnesium deficiency affects ~70% of the population despite its role in 300+ enzymatic reactions.",
    "Magnesium glycinate is superior for sleep and anxiety; L-threonate crosses the blood-brain barrier for cognitive support.",
    "Most people need 300–420 mg/day; absorption is blocked by calcium, alcohol, and chronic stress.",
    "Modern soil depletion means dietary sources are significantly less reliable than 50 years ago.",
  ],
  "supplements-that-dont-mix-critical-interactions": [
    "Fish oil combined with high-dose vitamin E can dangerously thin the blood — avoid with anticoagulants.",
    "Calcium blocks iron and magnesium absorption — never take these simultaneously.",
    "St. John's Wort interacts with 50+ medications including contraceptives and antidepressants.",
    "Always disclose all supplements to your prescriber before starting new medications.",
  ],
  "vitamin-d-why-80-percent-are-deficient": [
    "Blood levels below 30 ng/mL are deficient; the optimal range is 40–60 ng/mL.",
    "Vitamin D requires cofactors — K2, magnesium, and zinc — to activate properly in the body.",
    "Sunscreen with SPF 15+ blocks 93% of vitamin D synthesis from sunlight exposure.",
    "D3 raises blood levels 87% more effectively than D2 — form matters enormously.",
  ],
  "the-pcos-supplement-protocol": [
    "Myo-inositol (4g/day) improves insulin sensitivity and helps restore ovarian function.",
    "NAC reduces androgen levels and improves egg quality according to multiple clinical trials.",
    "Vitamin D and magnesium deficiency are near-universal in women with PCOS.",
    "Supplement timing and food pairing dramatically affect how well each compound works.",
  ],
  "your-gut-brain-connection-probiotics-mental-health": [
    "90% of serotonin is produced in the gut, not the brain — gut health directly shapes mood.",
    "Lactobacillus rhamnosus and Bifidobacterium longum have the strongest evidence for anxiety reduction.",
    "The gut-brain axis communicates bidirectionally via the vagus nerve.",
    "Psychobiotics typically take 4–8 weeks of consistent use to show measurable mood effects.",
  ],
  "5-supplement-myths-your-doctor-didnt-learn": [
    "Natural doesn't mean safe — many herbal supplements have serious drug interactions.",
    "The 'you'll pee out excess vitamins' myth is dangerous for fat-soluble vitamins A, D, E, and K.",
    "Form matters enormously: magnesium oxide has ~4% absorption vs. ~80% for glycinate.",
    "Expensive supplements rarely outperform evidence-backed low-cost alternatives.",
  ],
  "migraine-prevention-supplements": [
    "Magnesium (400 mg citrate/glycinate) reduces migraine frequency by up to 50% in multiple RCTs.",
    "Riboflavin (B2) at 400 mg/day is one of the cheapest, safest, and most underrated migraine preventives.",
    "CoQ10 at 300 mg/day shows moderate benefit, particularly in patients with low baseline levels.",
    "These supplements are preventive — they reduce frequency over weeks, not acute pain during an attack.",
  ],
  "menopause-supplement-guide": [
    "Black cohosh is the most studied herbal for hot flashes, with multiple meta-analyses supporting its use.",
    "Calcium + D3 + K2 is essential post-menopause for bone protection — osteoporosis risk doubles after menopause.",
    "Maca root (2–3 g/day) shows promise for energy and libido in Peruvian clinical studies.",
    "HRT remains first-line for many women — supplements complement but don't replace medical treatment.",
  ],
  "fatty-liver-nafld-supplements": [
    "Omega-3 at therapeutic doses (2,000–4,000 mg/day) has strong evidence for reducing liver fat in NAFLD.",
    "Vitamin E (400–800 IU) improved liver histology in the landmark PIVENS trial for NASH patients.",
    "Weight loss of just 5–10% body weight is more effective than any supplement for fatty liver.",
    "Liver enzyme levels (ALT/AST) alone don't tell the full story — imaging and fibrosis markers matter more.",
  ],
  "adhd-supplements-clinical-evidence": [
    "Omega-3 fatty acids (especially DHA) have the strongest nutritional evidence for ADHD symptom improvement.",
    "Ferritin levels below 30 ng/mL are associated with worse ADHD symptoms — iron testing is critical.",
    "Zinc and magnesium are commonly deficient in ADHD patients and may improve symptoms when corrected.",
    "Supplements are adjunctive — they support but do not replace behavioral therapy or medication.",
  ],
  "vegan-supplement-checklist": [
    "B12 supplementation is non-negotiable on a vegan diet — no plant food provides adequate B12.",
    "Algae-based omega-3 (DHA/EPA) is essential because flaxseed conversion to DHA is below 5%.",
    "Vegans need ~50% more zinc and iron due to phytates and non-heme iron absorption differences.",
    "The BCMO1 gene variant means some people cannot efficiently convert beta-carotene to vitamin A.",
  ],
  "keto-electrolyte-guide": [
    "The 'keto flu' is primarily an electrolyte imbalance, not carbohydrate withdrawal.",
    "Sodium needs on keto are 3–5 g/day — far higher than standard dietary recommendations.",
    "Magnesium is rapidly depleted on keto through increased renal excretion — supplement 300–400 mg/day.",
    "Simply adding salt is insufficient — potassium and magnesium must be addressed simultaneously.",
  ],
  "athlete-recovery-supplements": [
    "Creatine monohydrate is the most studied supplement in sports science — 5 g/day, no loading or cycling needed.",
    "Collagen + vitamin C taken 30–60 minutes pre-exercise stimulates tendon and ligament synthesis.",
    "Tart cherry extract reduces delayed-onset muscle soreness (DOMS) by 13–25% in multiple trials.",
    "Sleep is the #1 recovery tool — supplements support recovery but cannot compensate for poor sleep.",
  ],
  "stress-supplements-adaptogens": [
    "Ashwagandha (KSM-66) reduced serum cortisol by ~30% in randomized controlled trials.",
    "L-theanine produces calm focus within 30–60 minutes without sedation — ideal for acute stress.",
    "Adaptogens work best when cycled (6 weeks on, 1 week off) to maintain receptor sensitivity.",
    "The COMT gene variant affects how individuals metabolize stress compounds — not all adaptogens suit everyone.",
  ],
  "sleep-supplements-pharmacologist-guide": [
    "Melatonin at 0.5–1 mg works better than 5–10 mg — higher doses can paradoxically worsen sleep quality.",
    "Glycine (3 g before bed) lowers core body temperature, which is the physiological trigger for sleep onset.",
    "Sleep hygiene must come first — no supplement can override blue light, caffeine, or irregular schedules.",
    "Sleep supplements interact with benzodiazepines, SSRIs, and antihistamines — always check for interactions.",
  ],
  "hashimotos-thyroiditis-supplements": [
    "Selenium 200 mcg/day reduces TPO antibodies — the strongest supplement evidence in Hashimoto's management.",
    "High-dose iodine and kelp supplements can worsen Hashimoto's — this is one of the most common mistakes.",
    "Levothyroxine must be taken 4 hours apart from calcium, iron, and magnesium to avoid absorption interference.",
    "Monitoring TPO antibodies (not just TSH) is essential to track autoimmune disease activity.",
  ],
};


// Ad slots: rectangle ads after these paragraph numbers (1-indexed)
const RECT_AD_AFTER_PARAGRAPHS = [2, 6];

// ─── HTML content injection ───────────────────────────────────────────────────
// All injections are done directly on the HTML string so they reliably appear
// inline in the article — no dependency on paragraph splitting in React.

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function affiliateCardHtml(product: HardcodedProduct): string {
  return `<div class="my-6" style="display:flex;align-items:center;gap:12px;background:#fff;border-radius:12px;padding:14px 16px;box-shadow:0 1px 2px rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.06)">
  <div style="flex:1;min-width:0">
    <p style="font-size:13px;font-weight:600;color:#1A2332;margin:0;line-height:1.4">${esc(product.product_name)}</p>
    <p style="font-size:12px;color:#5A6578;margin:2px 0 0">${esc(product.brand)}</p>
    <p style="font-size:11px;color:#8896A8;margin:2px 0 0;line-height:1.4">${esc(product.note)}</p>
  </div>
  <a href="${esc(product.affiliate_url)}" target="_blank" rel="noopener noreferrer nofollow"
     style="display:inline-flex;align-items:center;gap:5px;background:#fff;color:#111c2c;font-size:12px;font-weight:500;padding:8px 16px;border-radius:9999px;text-decoration:none;white-space:nowrap;border:1px solid rgba(0,0,0,0.08);flex-shrink:0;transition:background 0.15s">
    View on
    <svg viewBox="0 0 60 18" aria-label="Amazon" style="height:14px;width:auto;flex-shrink:0" fill="currentColor">
      <text x="0" y="14" font-size="14" font-family="Arial, sans-serif" font-weight="bold" fill="#FF9900">amazon</text>
      <path d="M3 16 Q17 21 37 16" stroke="#FF9900" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M35 14 L38 17 L35 17" stroke="#FF9900" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    &rarr;
  </a>
</div>`;
}

// Slot IDs — replace with actual values from Google AdSense dashboard
const INLINE_AD_SLOT = "1234567890"; // TODO: replace with real slot ID

const rectangleAdHtml = `<div class="my-6">
  <ins class="adsbygoogle"
    style="display:block"
    data-ad-client="ca-pub-1364229532852275"
    data-ad-slot="${INLINE_AD_SLOT}"
    data-ad-format="rectangle"
    data-full-width-responsive="true"></ins>
</div>`;

/** Insert `insertion` after the nth occurrence of `</p>` in `html` (1-indexed). */
function insertAfterNthParagraph(html: string, n: number, insertion: string): string {
  let count = 0;
  let pos = 0;
  while (pos < html.length) {
    const idx = html.indexOf("</p>", pos);
    if (idx === -1) break;
    count++;
    if (count === n) {
      return html.slice(0, idx + 4) + "\n" + insertion + html.slice(idx + 4);
    }
    pos = idx + 4;
  }
  return html; // paragraph n not found — return unchanged
}

/** Build the final article HTML with all affiliate cards and ads injected inline. */
function buildArticleHtml(
  baseHtml: string,
  productSlots: Array<{ afterParagraph: number; product: HardcodedProduct }>,
  adParagraphs: number[],
): string {
  // Collect all injections; sort descending so earlier insertions don't shift later positions
  const injections: Array<{ afterParagraph: number; html: string }> = [];

  const productParas = new Set(productSlots.map((s) => s.afterParagraph));

  for (const slot of productSlots) {
    injections.push({ afterParagraph: slot.afterParagraph, html: affiliateCardHtml(slot.product) });
  }
  for (const para of adParagraphs) {
    // Skip if an affiliate card is already at this paragraph
    if (!productParas.has(para)) {
      injections.push({ afterParagraph: para, html: rectangleAdHtml });
    }
  }

  injections.sort((a, b) => b.afterParagraph - a.afterParagraph);

  let result = baseHtml;
  for (const { afterParagraph, html } of injections) {
    result = insertAfterNthParagraph(result, afterParagraph, html);
  }
  return result;
}

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ?? null;
}

async function getRelatedPosts(post: BlogPost): Promise<RelatedPost[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,read_time,author_name,published_at,tags")
    .eq("is_published", true)
    .eq("category", post.category)
    .neq("id", post.id)
    .limit(3);
  return (data ?? []) as RelatedPost[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// Pretty-print a supplementId ("magnesium-glycinate" → "Magnesium Glycinate",
// "vitamin-d3-k2" → "Vitamin D3 + K2")
function formatSupplementId(id: string): string {
  const map: Record<string, string> = {
    "vitamin-d3": "Vitamin D3",
    "vitamin-d3-k2": "Vitamin D3 + K2",
    "vitamin-b12": "Vitamin B12",
    "vitamin-k2": "Vitamin K2",
    "vitamin-c": "Vitamin C",
    "magnesium-glycinate": "Magnesium Glycinate",
    "magnesium-citrate": "Magnesium Citrate",
    "magnesium-l-threonate": "Magnesium L-Threonate",
    "alpha-lipoic-acid": "Alpha-Lipoic Acid",
    "algae-omega-3": "Algae Omega-3",
    "omega-3": "Omega-3",
    "l-theanine": "L-Theanine",
    "b-complex": "B-Complex",
    "methylated-b-complex": "Methylated B-Complex",
    "adrenal-support": "Adrenal Support",
    "multivitamin-prenatal": "Prenatal Multivitamin",
    "nac": "NAC",
    "coq10": "CoQ10",
  };
  return map[id] ?? id.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// ─── Key Takeaways component ──────────────────────────────────────────────────

function KeyTakeawaysBox({ takeaways }: { takeaways: string[] }) {
  return (
    <div className="my-6 border-l-4 border-[#00685f] bg-[#e6f4f3] rounded-r-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="w-5 h-5 text-teal-600 flex-shrink-0" />
        <h3 className="font-heading font-bold text-[#1A2332] text-base">Key Takeaways</h3>
      </div>
      <ul className="space-y-2">
        {takeaways.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[#3D4B5F] leading-relaxed">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] mt-2 flex-shrink-0" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Ad slot components ───────────────────────────────────────────────────────

// Slot IDs — replace with actual values from Google AdSense dashboard
const SIDEBAR_AD_SLOT = "0987654321"; // TODO: replace with real slot ID

function SidebarAdSlot() {
  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-1364229532852275"
      data-ad-slot={SIDEBAR_AD_SLOT}
      data-ad-format="rectangle"
      data-full-width-responsive="true"
    />
  );
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found" };
  const BASE_URL = "https://www.nutrigenius.co";
  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author_name }],
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url,
      siteName: "NutriGenius",
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      site: "@nutrigenius",
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const config = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;
  const CategoryIcon = config.icon;

  const [related, baseHtml] = await Promise.all([
    getRelatedPosts(post),
    Promise.resolve(markdownToHtml(post.content)),
  ]);

  const toc = extractTOC(post.content);
  const articleSlots = ARTICLE_PRODUCTS[slug] ?? [];
  // First slot goes inline; second slot renders at the end of the article in JSX
  const inlineSlots = articleSlots.slice(0, 1);
  const endProduct = articleSlots[1]?.product ?? null;
  const finalHtml = buildArticleHtml(baseHtml, inlineSlots, RECT_AD_AFTER_PARAGRAPHS);

  // 3-tier affiliate products to render at article end
  const articleProducts = getProductsForArticle(slug);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.nutrigenius.co" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.nutrigenius.co/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: `https://www.nutrigenius.co/blog/${post.slug}` },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.published_at,
    dateModified: post.updated_at ?? post.published_at,
    author: {
      "@type": "Organization",
      name: "NutriGenius Editorial Team",
    },
    reviewedBy: {
      "@type": "Person",
      name: "Dr. Esra Ata",
      jobTitle: "Physician, Functional Medicine Certified",
      url: "https://www.nutrigenius.co/about#medical-reviewer",
    },
    publisher: {
      "@type": "Organization",
      name: "NutriGenius",
      logo: {
        "@type": "ImageObject",
        url: "https://www.nutrigenius.co/icon-512.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.nutrigenius.co/blog/${post.slug}`,
    },
    keywords: post.tags?.join(", "),
    articleSection: post.category,
  };

  const medicalWebPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    about: {
      "@type": "MedicalCondition",
      name: formatCategory(post.category),
    },
    lastReviewed: post.updated_at ?? post.published_at,
    reviewedBy: {
      "@type": "Person",
      name: "Dr. Esra Ata",
      jobTitle: "Physician, Functional Medicine Certified",
      url: "https://www.nutrigenius.co/about#medical-reviewer",
    },
  };

  return (
    <div className="min-h-screen bg-[#f9f9ff] pb-16 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageJsonLd) }}
      />
      {/* ── Top nav ── */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl shadow-sm shadow-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <Logo size="sm" variant="light" />
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#5A6578] hover:text-[#00685f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
        </div>
      </div>

      {/* Full-width gradient banner */}
      <div className={`h-[160px] sm:h-[200px] ${config.gradient} flex flex-col items-center justify-center relative overflow-hidden`}>
        <div className={`absolute -right-12 -bottom-12 w-56 h-56 rounded-full ${config.decorColor} opacity-15`} />
        <div className={`absolute -left-8 -top-8 w-40 h-40 rounded-full ${config.decorColor} opacity-10`} />
        <div className={`absolute right-20 top-6 w-16 h-16 rounded-full ${config.decorColor} opacity-10`} />
        <CategoryIcon className="w-14 h-14 sm:w-16 sm:h-16 text-white/90 relative z-10 drop-shadow-lg mb-3" />
        <span className="relative z-10 text-xs sm:text-sm font-semibold text-white/85 uppercase tracking-widest bg-black/15 backdrop-blur-sm px-3 py-1 rounded-full">
          {formatCategory(post.category)}
        </span>
      </div>

      {/* Title + excerpt */}
      <div className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A2332] leading-tight mb-3 max-w-3xl">
            {post.title}
          </h1>
          <p className="text-[#5A6578] text-base sm:text-lg leading-relaxed max-w-2xl mb-4">
            {post.excerpt}
          </p>
          {/* Medical reviewer badge */}
          <Link
            href="/about#medical-reviewer"
            className="inline-flex items-center gap-2 text-xs text-[#5A6578] bg-[#f0f9f8] border border-[#d1ede9] px-3 py-1.5 rounded-full hover:bg-[#e6f4f3] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00685f]" />
            <span>Medically reviewed by <strong className="text-[#1A2332]">Dr. Esra Ata, MD</strong></span>
          </Link>
        </div>
      </div>

      {/* Main content layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <div className="lg:grid lg:grid-cols-[1fr_268px] lg:gap-10">

          {/* ── Article body ── */}
          <article>
            {/* Key Takeaways box — shown near top of article for articles with defined takeaways */}
            {KEY_TAKEAWAYS[slug] && (
              <KeyTakeawaysBox takeaways={KEY_TAKEAWAYS[slug]} />
            )}
            {/* Article content — affiliate cards and ads are injected directly into the HTML */}
            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: finalHtml }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-8">
                <Tag className="w-4 h-4 text-[#8896A8] mt-0.5 flex-shrink-0" />
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium text-[#5A6578] bg-[#F1F5F9] px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Second affiliate card — end of article */}
            {endProduct && (
              <div
                className="mt-6"
                dangerouslySetInnerHTML={{ __html: affiliateCardHtml(endProduct) }}
              />
            )}

            {/* Products Mentioned — 3-tier cards per supplement */}
            {articleProducts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#f0f3ff]">
                <h3 className="font-heading font-bold text-[#1A2332] text-base mb-1">
                  Products Mentioned in This Article
                </h3>
                <p className="text-xs text-[#8896A8] mb-4">
                  Best Fit · Premium · Budget — curated across 7 Amazon stores.
                </p>
                <div className="space-y-6">
                  {articleProducts.map((trio) => (
                    <div key={trio.supplementId}>
                      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00685f] mb-2">
                        {formatSupplementId(trio.supplementId)}
                      </p>
                      <div className="space-y-2">
                        {TIER_ORDER.map((tier) => (
                          <AffiliateTierCard
                            key={tier}
                            tier={tier}
                            product={trio[tier]}
                            fallbackSearchTerm={`${trio[tier].brand} ${trio[tier].name}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Affiliate disclosure */}
            <p className="text-xs text-gray-400 text-center mt-8">
              As an Amazon Associate, Clareo Health earns from qualifying purchases.
              Recommendations are based on evidence, not commissions.{" "}
              <Link href="/disclosure" className="text-[#00685f] hover:underline">
                Learn more
              </Link>
              .
            </p>

            {/* CTA */}
            <div className="mt-6 p-6 bg-[#e6f4f3] rounded-2xl">
              <h3 className="font-heading font-bold text-[#1A2332] mb-2">Get your personalised supplement plan</h3>
              <p className="text-sm text-[#5A6578] mb-4">
                Take our 5-minute assessment to discover which supplements are right for your specific health goals, medications, and lifestyle.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-[#00685f] hover:bg-[#005249] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start free assessment
              </Link>
            </div>
          </article>

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-[61px] space-y-5">
              {/* TOC */}
              {toc.length > 0 && (
                <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5">
                  <p className="text-xs font-semibold text-[#8896A8] uppercase tracking-wider mb-3">
                    In this article
                  </p>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm text-[#5A6578] hover:text-[#00685f] transition-colors py-0.5 leading-snug ${
                          item.level === 3 ? "pl-3 text-xs" : ""
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Sidebar ad */}
              <SidebarAdSlot />

              {/* Related articles */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl ring-1 ring-black/[0.04] p-5">
                  <p className="text-xs font-semibold text-[#8896A8] uppercase tracking-wider mb-3">
                    Related articles
                  </p>
                  <div className="space-y-4">
                    {related.map((rel) => {
                      const relConfig = CATEGORY_CONFIG[rel.category] ?? DEFAULT_CONFIG;
                      const RelIcon = relConfig.icon;
                      return (
                        <Link
                          key={rel.id}
                          href={`/blog/${rel.slug}`}
                          className="flex gap-3 group"
                        >
                          <div className={`w-10 h-10 rounded-xl ${relConfig.gradient} flex items-center justify-center flex-shrink-0`}>
                            <RelIcon className="w-5 h-5 text-white/90" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#00685f] transition-colors leading-snug line-clamp-2">
                              {rel.title}
                            </p>
                            <p className="text-xs text-[#8896A8] mt-0.5">{rel.read_time}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile: related articles */}
      {related.length > 0 && (
        <div className="lg:hidden max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <h3 className="font-heading font-bold text-[#1A2332] mb-4">Related articles</h3>
          <div className="space-y-3">
            {related.map((rel) => {
              const relConfig = CATEGORY_CONFIG[rel.category] ?? DEFAULT_CONFIG;
              const RelIcon = relConfig.icon;
              return (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="flex gap-3 bg-white rounded-xl ring-1 ring-black/[0.04] p-4 hover:border-[#00685f]/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${relConfig.gradient} flex items-center justify-center flex-shrink-0`}>
                    <RelIcon className="w-5 h-5 text-white/90" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#00685f] transition-colors leading-snug">
                      {rel.title}
                    </p>
                    <p className="text-xs text-[#8896A8] mt-0.5">{rel.read_time}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA: Take the assessment */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-gradient-to-r from-[#00685f] to-[#008577] rounded-2xl p-6 sm:p-8 text-center">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white mb-2">
            Ready to get your personalized protocol?
          </h3>
          <p className="text-white/80 text-sm sm:text-base mb-5 max-w-lg mx-auto">
            Our 5-minute assessment analyzes your health profile and creates an evidence-based supplement plan just for you.
          </p>
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 bg-white text-[#00685f] font-semibold text-sm sm:text-base px-6 py-3 rounded-xl hover:bg-white/90 transition-colors"
          >
            Take the free assessment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Mobile sticky footer ad */}
      <MobileFooterAd />

      {/* Medical reviewer footer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div className="bg-[#f0f9f8] border border-[#d1ede9] rounded-2xl p-5 sm:p-6 flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#00685f] flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-[#1A2332] font-semibold mb-1">Medically Reviewed</p>
            <p className="text-sm text-[#5A6578] leading-relaxed">
              This article was medically reviewed by{" "}
              <strong className="text-[#1A2332]">Dr. Esra Ata, MD</strong> — a physician
              certified in Functional Medicine and the GAPS Protocol. Dr. Ata graduated
              from Uludag University and pursued postgraduate medical education at Istanbul
              University Cerrahpasa.{" "}
              <Link href="/about" className="text-[#00685f] font-semibold hover:underline">
                Learn more about our clinical review process&nbsp;→
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Legal footer */}
      <footer className="border-t border-[#E8ECF1] bg-white py-8 px-4 sm:px-6 mt-8">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">Affiliate Disclosure</Link>
            <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
          </div>
          <span>© {new Date().getFullYear()} NutriGenius. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
