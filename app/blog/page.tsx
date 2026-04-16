import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Clock, BookOpen,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { Logo } from "@/src/components/ui/Logo";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — NutriGenius | Evidence-Based Supplement Science",
  description:
    "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
  alternates: { canonical: "https://www.nutrigenius.co/blog" },
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time: string;
  author_name: string;
  published_at: string;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "all", label: "All Articles" },
  { value: "evidence-review", label: "Evidence Review" },
  { value: "myth-busting", label: "Myth Busting" },
  { value: "safety-alert", label: "Safety Alert" },
  { value: "condition-guide", label: "Condition Guide" },
  { value: "research-update", label: "Research Update" },
  { value: "deep-dive", label: "Deep Dive" },
];

interface CategoryConfig {
  gradient: string;
  decorColor: string;
  icon: LucideIcon;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  "evidence-review": {
    gradient: "bg-gradient-to-br from-teal-500 to-teal-700",
    decorColor: "bg-teal-400",
    icon: FlaskConical,
  },
  "myth-busting": {
    gradient: "bg-gradient-to-br from-orange-400 to-rose-500",
    decorColor: "bg-orange-300",
    icon: ShieldAlert,
  },
  "safety-alert": {
    gradient: "bg-gradient-to-br from-red-500 to-rose-700",
    decorColor: "bg-red-400",
    icon: AlertTriangle,
  },
  "condition-guide": {
    gradient: "bg-gradient-to-br from-purple-500 to-purple-800",
    decorColor: "bg-purple-400",
    icon: HeartPulse,
  },
  "research-update": {
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    decorColor: "bg-blue-400",
    icon: TrendingUp,
  },
  "deep-dive": {
    gradient: "bg-gradient-to-br from-amber-400 to-orange-600",
    decorColor: "bg-amber-300",
    icon: Brain,
  },
};

const DEFAULT_CONFIG = CATEGORY_CONFIG["deep-dive"];

function formatCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "NutriGenius Blog — The Science of Healthy Living",
  description:
    "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
  url: "https://www.nutrigenius.co/blog",
  publisher: {
    "@type": "Organization",
    name: "NutriGenius",
    url: "https://www.nutrigenius.co",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const activeCategory = params.category ?? "all";

  // Fetch with service role — bypasses RLS entirely
  let query = supabaseAdmin
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,read_time,author_name,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }

  const { data: posts, error } = await query;

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* ── Top nav ── */}
      <nav className="bg-white shadow-sm shadow-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity duration-200">
            <Logo size="sm" variant="light" />
          </Link>
          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#00685f] hover:text-[#005249] transition-colors"
          >
            Free Assessment <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ── Page header ── */}
      <header className="bg-[#f0f3ff]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00685f] bg-[#e6f4f3] px-3 py-1 rounded-full">
              <BookOpen className="w-3 h-3" /> Clinical Knowledge Hub
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#1A2332] mb-3">
            The Science of Healthy Living
          </h1>
          <p className="text-[#5A6578] text-sm sm:text-base max-w-xl">
            Expert-written articles on evidence-based nutrition to help you live healthier.
          </p>
        </div>
      </header>

      {/* ── Category filters (plain anchor links, no JS) ── */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm shadow-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap sm:flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <a
                key={cat.value}
                href={cat.value === "all" ? "/blog" : `/blog?category=${cat.value}`}
                className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap ${
                  activeCategory === cat.value
                    ? "bg-[#00685f] text-white"
                    : "bg-[#f0f3ff] text-[#5A6578] hover:bg-[#e6f4f3] hover:text-[#00685f]"
                }`}
              >
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Article grid ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            <p className="font-semibold">Failed to load articles</p>
            <p className="mt-1 text-rose-600">{error.message}</p>
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="text-center py-20 text-[#8896A8]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No articles found</p>
            <p className="text-sm mt-1">Try a different category.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: BlogPost) => {
              const config = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;
              const Icon = config.icon;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5 ring-1 ring-black/[0.04]
                    hover:shadow-xl hover:shadow-black/10 hover:ring-0
                    hover:-translate-y-1 hover:scale-[1.015]
                    transition-all duration-300 ease-out"
                >
                  {/* Gradient header with decorative circles + icon */}
                  <div className={`h-20 sm:h-[120px] ${config.gradient} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
                    <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${config.decorColor} opacity-20`} />
                    <div className={`absolute -left-4 -top-4 w-20 h-20 rounded-full ${config.decorColor} opacity-15`} />
                    <div className={`absolute right-8 top-3 w-8 h-8 rounded-full ${config.decorColor} opacity-10`} />
                    <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white/90 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-white/90 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {formatCategory(post.category)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h2 className="font-heading text-[15px] font-bold text-[#1A2332] leading-snug mb-3 group-hover:text-[#00685f] transition-colors duration-200 line-clamp-3 flex-1">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#5A6578] leading-relaxed line-clamp-2 mb-5">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3.5 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-[#8896A8]">
                        <Clock className="w-3.5 h-3.5" />
                        {post.read_time}
                      </div>
                      <span className="text-xs font-semibold text-[#00685f] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
            <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">Affiliate Disclosure</Link>
            <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
          </div>
          <div className="w-full text-xs text-[#8896A8] space-y-1">
            <p>
              Medical Review:{" "}
              <Link href="/about#medical-reviewer" className="text-[#00685f] hover:underline">
                Dr. Esra Ata, MD
              </Link>
            </p>
            <p>&copy; {new Date().getFullYear()} NutriGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
