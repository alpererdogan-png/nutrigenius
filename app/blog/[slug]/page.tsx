import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Tag,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain, Lightbulb,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { markdownToHtml, extractTOC } from "@/lib/markdown";
import { MobileFooterAd } from "./MobileFooterAd";
import {
  getProductsForSupplement,
  getAmazonProductLink,
  getAmazonSearchLink,
} from "@/src/lib/data/amazonProducts";
import { Logo } from "@/src/components/ui/Logo";

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
};

// ─── Supplements mentioned per article (for "Supplements Mentioned" section) ──

const ARTICLE_SUPPLEMENTS: Record<string, string[]> = {
  "the-complete-guide-to-magnesium": [
    "Magnesium",
    "Vitamin D3",
    "Vitamin B12",
  ],
  "supplements-that-dont-mix-critical-interactions": [
    "Vitamin D3",
    "Vitamin K2",
    "Omega-3",
    "Iron",
    "Calcium",
  ],
  "vitamin-d-why-80-percent-are-deficient": [
    "Vitamin D3",
    "Vitamin K2",
    "Magnesium",
    "Zinc",
  ],
  "the-pcos-supplement-protocol": [
    "Berberine",
    "NAC",
    "Vitamin D3",
    "Magnesium",
    "Folate",
  ],
  "your-gut-brain-connection-probiotics-mental-health": [
    "Probiotics",
    "Vitamin D3",
    "Omega-3",
    "Magnesium",
  ],
  "5-supplement-myths-your-doctor-didnt-learn": [
    "Magnesium",
    "Vitamin C",
    "Vitamin D3",
    "Folate",
    "CoQ10",
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
  return `<div class="my-6 flex items-stretch bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
  <div class="w-1.5 flex-shrink-0" style="background:#00685f"></div>
  <div class="p-4 flex-1 min-w-0">
    <p class="text-[10px] font-semibold uppercase tracking-wider mb-1" style="color:#00685f;margin:0">Recommended Product</p>
    <p class="text-sm font-bold leading-snug" style="color:#1A2332;margin:0 0 2px">${esc(product.product_name)}</p>
    <p class="text-xs" style="color:#5A6578;margin:0 0 6px">${esc(product.brand)}</p>
    <p class="text-xs leading-relaxed" style="color:#8896A8;margin:0 0 10px">${esc(product.note)}</p>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px">
      <span class="text-base font-bold" style="color:#1A2332">$${product.price_usd.toFixed(2)}</span>
      <a href="${esc(product.affiliate_url)}" target="_blank" rel="noopener noreferrer nofollow"
         style="display:inline-flex;align-items:center;gap:5px;background:#00685f;color:#fff;font-size:12px;font-weight:600;padding:7px 14px;border-radius:8px;text-decoration:none;white-space:nowrap">
        Find on Amazon &rarr;
      </a>
    </div>
    <p style="font-size:10px;color:#B0BAC9;margin:8px 0 0">Amazon affiliate link &mdash; as an Amazon Associate, Clareo Health earns from qualifying purchases.</p>
  </div>
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
      name: "NutriGenius Clinical Team",
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
          <p className="text-[#5A6578] text-base sm:text-lg leading-relaxed max-w-2xl">
            {post.excerpt}
          </p>
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

            {/* Supplements Mentioned */}
            {(ARTICLE_SUPPLEMENTS[slug] ?? []).length > 0 && (
              <div className="mt-8 pt-6 border-t border-[#f0f3ff]">
                <h3 className="font-heading font-bold text-[#1A2332] text-base mb-4">
                  Supplements Mentioned in This Article
                </h3>
                <div className="space-y-3">
                  {(ARTICLE_SUPPLEMENTS[slug] ?? []).map((suppName) => {
                    const picks = getProductsForSupplement(suppName);
                    if (!picks) {
                      return (
                        <div key={suppName} className="flex items-center justify-between bg-[#f9f9ff] rounded-xl px-4 py-3 ring-1 ring-black/[0.04]">
                          <span className="text-sm font-medium text-[#1A2332]">{suppName}</span>
                          <a
                            href={getAmazonSearchLink(suppName)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="text-xs font-semibold text-[#00685f] hover:text-[#005249] inline-flex items-center gap-1 transition-colors flex-shrink-0"
                          >
                            Find on Amazon →
                          </a>
                        </div>
                      );
                    }
                    const best = picks.best;
                    return (
                      <div key={suppName} className="bg-[#f9f9ff] rounded-xl px-4 py-3 ring-1 ring-black/[0.04]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-[#1A2332]">{suppName}</p>
                            <p className="text-xs text-[#5A6578] mt-0.5">
                              <span className="font-medium">{best.brand}</span> · {best.name}
                            </p>
                            <p className="text-[11px] text-[#8896A8] mt-0.5">{best.description}</p>
                          </div>
                          <a
                            href={getAmazonProductLink(best.asin)}
                            target="_blank"
                            rel="noopener noreferrer sponsored"
                            className="flex-shrink-0 text-xs font-semibold text-[#00685f] hover:text-[#005249] border border-[#00685f]/30 hover:border-[#00685f]/60 bg-white px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            Amazon →
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[#C4CDD8] mt-3 leading-relaxed">
                  As an Amazon Associate, Clareo Health earns from qualifying purchases. This does not affect the price you pay or our recommendations.
                </p>
              </div>
            )}

            {/* Affiliate disclosure */}
            <p className="text-[11px] text-[#C4CDD8] mt-4 mb-0 leading-relaxed">
              As an Amazon Associate, Clareo Health earns from qualifying purchases at no extra cost to you. This does not influence our editorial recommendations.
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

      {/* Legal footer */}
      <footer className="border-t border-[#E8ECF1] bg-white py-8 px-4 sm:px-6 mt-8">
        <div className="max-w-3xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
          </div>
          <span>© {new Date().getFullYear()} NutriGenius. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
