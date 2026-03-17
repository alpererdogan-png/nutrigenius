import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, Clock, Calendar, Tag, ExternalLink,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { markdownToHtml, extractTOC } from "@/lib/markdown";

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

interface AffiliateProduct {
  id: string;
  product_name: string;
  brand: string;
  price_usd: number;
  affiliate_url: string;
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

// ─── Per-article affiliate product slots ─────────────────────────────────────
// paraIndex = 0-based count of </p> tags — injection happens AFTER that paragraph

interface ProductSlot {
  paraIndex: number;
  supplementName: string;
  note: string;
}

const ARTICLE_PRODUCT_SLOTS: Record<string, ProductSlot[]> = {
  "the-complete-guide-to-magnesium": [
    { paraIndex: 0, supplementName: "Magnesium Glycinate", note: "Highest bioavailability — ideal for sleep & anxiety" },
    { paraIndex: 6, supplementName: "Magnesium L-Threonate", note: "Crosses the blood-brain barrier for cognitive support" },
  ],
  "5-supplement-myths-your-doctor-didnt-learn": [
    { paraIndex: 1, supplementName: "Vitamin D3", note: "Third-party verified D3 + K2 formula" },
    { paraIndex: 5, supplementName: "Omega-3 Fish Oil", note: "IFOS 5-star certified ultra-pure fish oil" },
  ],
  "supplements-that-dont-mix-critical-interactions": [
    { paraIndex: 1, supplementName: "Omega-3 Fish Oil", note: "Pharmaceutical-grade omega-3 — tested for purity" },
    { paraIndex: 5, supplementName: "Magnesium Glycinate", note: "Safe with most medications — well-tolerated chelated form" },
  ],
  "the-pcos-supplement-protocol": [
    { paraIndex: 0, supplementName: "Myo-Inositol", note: "Clinically studied 40:1 myo:D-chiro inositol ratio" },
    { paraIndex: 5, supplementName: "Vitamin D3", note: "Essential for PCOS hormone balance & insulin sensitivity" },
    { paraIndex: 9, supplementName: "Berberine", note: "Evidence-backed AMPK activator — comparable to metformin" },
  ],
  "vitamin-d-why-80-percent-are-deficient": [
    { paraIndex: 0, supplementName: "Vitamin D3", note: "D3 + K2 combination for optimal calcium direction" },
    { paraIndex: 6, supplementName: "Vitamin K2", note: "MK-7 form — highest bioavailability, once-daily dosing" },
  ],
  "your-gut-brain-connection-probiotics-mental-health": [
    { paraIndex: 0, supplementName: "Probiotic Complex", note: "Multi-strain Lactobacillus + Bifidobacterium psychobiotic" },
    { paraIndex: 6, supplementName: "Omega-3 Fish Oil", note: "Anti-inflammatory support for the gut-brain axis" },
  ],
};

// In-article ad placement (paragraph indices — skipped if affiliate card present at same index)
const AD_PARAGRAPH_INDICES = [2, 7, 12];

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

async function getAffiliateProducts(slug: string): Promise<Map<string, AffiliateProduct>> {
  const slots = ARTICLE_PRODUCT_SLOTS[slug] ?? [];
  if (slots.length === 0) return new Map();

  const supplementNames = [...new Set(slots.map((s) => s.supplementName))];
  const supabase = await createClient();

  const { data } = await supabase
    .from("affiliate_products")
    .select("id, product_name, brand, price_usd, affiliate_url, supplements!inner(name)")
    .in("supplements.name", supplementNames)
    .order("quality_verified", { ascending: false })
    .order("price_usd", { ascending: true });

  const map = new Map<string, AffiliateProduct>();
  for (const row of data ?? []) {
    const name = (row.supplements as unknown as { name: string })?.name;
    if (name && !map.has(name)) {
      const { supplements: _, ...product } = row;
      map.set(name, product as AffiliateProduct);
    }
  }
  return map;
}

// ─── Content injection helpers ────────────────────────────────────────────────

function splitByParagraphs(html: string): string[] {
  const segments: string[] = [];
  let remaining = html;
  while (remaining) {
    const idx = remaining.indexOf("</p>");
    if (idx === -1) {
      if (remaining.trim()) segments.push(remaining);
      break;
    }
    segments.push(remaining.slice(0, idx + 4));
    remaining = remaining.slice(idx + 4);
  }
  return segments;
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function AffiliateCard({ product, note }: { product: AffiliateProduct; note: string }) {
  return (
    <div className="my-6 flex items-stretch gap-0 bg-white rounded-xl border border-[#E8ECF1] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="w-1 bg-[#0D9488] flex-shrink-0" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 flex-1">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-[#0D9488] uppercase tracking-wider mb-0.5">
            Recommended Product
          </p>
          <p className="text-sm font-bold text-[#1A2332] leading-snug truncate">{product.product_name}</p>
          <p className="text-xs text-[#5A6578] mt-0.5">{product.brand}</p>
          <p className="text-xs text-[#8896A8] mt-1 leading-relaxed">{note}</p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
          <span className="text-base font-bold text-[#1A2332]">${product.price_usd.toFixed(2)}</span>
          <a
            href={product.affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Shop on iHerb <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function InlineAdSlot({ type = "rectangle" }: { type?: "leaderboard" | "rectangle" }) {
  const isLeaderboard = type === "leaderboard";
  return (
    <div
      className={`my-6 flex items-center justify-center border border-dashed border-[#CBD5E1] bg-[#F8FAFC] rounded-xl ${
        isLeaderboard ? "h-[90px] w-full max-w-[728px] mx-auto" : "h-[250px] sm:h-[200px]"
      }`}
    >
      <div className="text-center">
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Advertisement</p>
        <p className="text-[10px] text-[#CBD5E1] mt-0.5">{isLeaderboard ? "728×90" : "300×250"}</p>
      </div>
    </div>
  );
}

function SidebarAdSlot() {
  return (
    <div className="h-[280px] flex items-center justify-center border border-dashed border-[#CBD5E1] bg-[#F8FAFC] rounded-xl">
      <div className="text-center">
        <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">Advertisement</p>
        <p className="text-[10px] text-[#CBD5E1] mt-0.5">300×250</p>
      </div>
    </div>
  );
}

function formatCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article Not Found" };
  return {
    title: `${post.title} | NutriGenius`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.published_at,
      authors: [post.author_name],
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

  const [related, affiliateProducts, htmlContent] = await Promise.all([
    getRelatedPosts(post),
    getAffiliateProducts(slug),
    Promise.resolve(markdownToHtml(post.content)),
  ]);

  const toc = extractTOC(post.content);
  const slots = ARTICLE_PRODUCT_SLOTS[slug] ?? [];

  // Build injection map: paraIndex → ReactNode
  const affiliateIndices = new Set(slots.map((s) => s.paraIndex));
  const injectionEntries: Array<{ paraIndex: number; type: "affiliate" | "ad"; slotIndex?: number }> = [];

  slots.forEach((slot, i) => {
    injectionEntries.push({ paraIndex: slot.paraIndex, type: "affiliate", slotIndex: i });
  });
  AD_PARAGRAPH_INDICES.forEach((idx) => {
    if (!affiliateIndices.has(idx)) {
      injectionEntries.push({ paraIndex: idx, type: "ad" });
    }
  });

  // Create a map for quick lookup
  type InjectionEntry = { type: "affiliate"; slot: ProductSlot } | { type: "ad" };
  const injectionMap = new Map<number, InjectionEntry>();
  injectionEntries.forEach(({ paraIndex, type, slotIndex }) => {
    if (type === "affiliate" && slotIndex !== undefined) {
      injectionMap.set(paraIndex, { type: "affiliate", slot: slots[slotIndex] });
    } else if (type === "ad") {
      injectionMap.set(paraIndex, { type: "ad" });
    }
  });

  const contentSegments = splitByParagraphs(htmlContent);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 lg:pb-0">
      {/* Back nav */}
      <div className="bg-white border-b border-[#E8ECF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[#5A6578] hover:text-[#0D9488] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to articles
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

      {/* Title + excerpt (no author here) */}
      <div className="bg-white border-b border-[#E8ECF1]">
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
            {/* Affiliate disclosure */}
            <p className="text-xs text-[#8896A8] mb-4">
              This article may contain affiliate links.{" "}
              <Link href="/blog" className="underline hover:text-[#0D9488] transition-colors">
                See our disclosure.
              </Link>
            </p>

            {/* Leaderboard ad slot */}
            <InlineAdSlot type="leaderboard" />

            {/* Article content with injected cards/ads */}
            <div className="prose-custom">
              {contentSegments.map((seg, i) => {
                const injection = injectionMap.get(i);
                return (
                  <div key={i}>
                    <div dangerouslySetInnerHTML={{ __html: seg }} />
                    {injection?.type === "affiliate" && (() => {
                      const product = affiliateProducts.get(injection.slot.supplementName);
                      return product ? (
                        <AffiliateCard product={product} note={injection.slot.note} />
                      ) : null;
                    })()}
                    {injection?.type === "ad" && <InlineAdSlot type="rectangle" />}
                  </div>
                );
              })}
            </div>

            {/* Author / date — at bottom */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6578] mt-10 pt-8 border-t border-[#E8ECF1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {post.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332] text-xs">{post.author_name}</p>
                  <p className="text-[10px] text-[#8896A8]">{post.author_title}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.published_at)}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Clock className="w-3.5 h-3.5" />
                {post.read_time}
              </div>
            </div>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-5">
                <Tag className="w-4 h-4 text-[#8896A8] mt-0.5" />
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

            {/* Author bio */}
            <div className="mt-8 p-5 bg-white rounded-2xl border border-[#E8ECF1]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {post.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332]">{post.author_name}</p>
                  <p className="text-sm text-[#0D9488]">{post.author_title}</p>
                  <p className="text-sm text-[#5A6578] mt-2 leading-relaxed">
                    Our editorial team applies rigorous evidence standards to every article — citing primary research, systematic reviews, and meta-analyses, never anecdote alone.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-6 p-6 bg-gradient-to-br from-teal-50 to-teal-100/60 rounded-2xl border border-teal-200/60">
              <h3 className="font-heading font-bold text-[#1A2332] mb-2">Get your personalised supplement plan</h3>
              <p className="text-sm text-[#5A6578] mb-4">
                Take our 5-minute assessment to discover which supplements are right for your specific health goals, medications, and lifestyle.
              </p>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Start free assessment
              </Link>
            </div>
          </article>

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {/* TOC */}
              {toc.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8ECF1] p-5">
                  <p className="text-xs font-semibold text-[#8896A8] uppercase tracking-wider mb-3">
                    In this article
                  </p>
                  <nav className="space-y-1">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-sm text-[#5A6578] hover:text-[#0D9488] transition-colors py-0.5 leading-snug ${
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
                <div className="bg-white rounded-2xl border border-[#E8ECF1] p-5">
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
                            <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#0D9488] transition-colors leading-snug line-clamp-2">
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
                  className="flex gap-3 bg-white rounded-xl border border-[#E8ECF1] p-4 hover:border-[#0D9488]/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl ${relConfig.gradient} flex items-center justify-center flex-shrink-0`}>
                    <RelIcon className="w-5 h-5 text-white/90" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#0D9488] transition-colors leading-snug">
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

      {/* Mobile sticky footer ad */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-center h-[50px] border-t border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
        <div className="text-center">
          <p className="text-[10px] font-medium text-[#94A3B8] uppercase tracking-wider">Advertisement</p>
          <p className="text-[9px] text-[#CBD5E1]">320×50</p>
        </div>
      </div>
    </div>
  );
}
