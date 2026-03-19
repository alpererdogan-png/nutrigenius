"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CookieSettingsLink } from "@/components/CookieConsent";
import {
  ArrowRight, Clock, Search, BookOpen, ArrowUpRight,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { useLanguage } from "@/lib/language-context";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time: string;
  author_name: string;
  published_at: string;
  tags: string[];
}

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

function formatCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function CardBanner({ config }: { config: CategoryConfig }) {
  const Icon = config.icon;
  return (
    <div className={`h-20 sm:h-[120px] ${config.gradient} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
      {/* Decorative circles */}
      <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${config.decorColor} opacity-20`} />
      <div className={`absolute -left-4 -top-4 w-20 h-20 rounded-full ${config.decorColor} opacity-15`} />
      <div className={`absolute right-8 top-3 w-8 h-8 rounded-full ${config.decorColor} opacity-10`} />
      <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white/90 relative z-10 drop-shadow-md" />
    </div>
  );
}

export default function BlogPage() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,category,read_time,author_name,published_at,tags")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (category !== "all") query = query.eq("category", category);
    if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);

    const { data } = await query;
    setPosts(data ?? []);
    setLoading(false);
  }, [category, search]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "NutriGenius Blog — The Science of Healthy Living",
    description:
      "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
    url: "https://nutrigenius.co/blog",
    publisher: {
      "@type": "Organization",
      name: "NutriGenius",
      url: "https://nutrigenius.co",
    },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {/* ── Top nav ── */}
      <div className="bg-white border-b border-[#E8ECF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="font-heading font-bold text-lg text-[#0D9488] hover:text-[#0F766E] transition-colors"
          >
            NutriGenius
          </Link>
          <Link
            href="/quiz"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] hover:text-[#0F766E] transition-colors"
          >
            Free Assessment <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Page header */}
      <div className="bg-white border-b border-[#E8ECF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] bg-teal-50 border border-teal-100 px-3 py-1 rounded-full">
              <BookOpen className="w-3 h-3" /> Clinical Knowledge Hub
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold text-[#1A2332] mb-3">
            {t("blog.title")}
          </h1>
          <p className="text-[#5A6578] text-sm sm:text-base max-w-xl">{t("blog.description")}</p>
        </div>
      </div>

      {/* Sticky filters */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-[#E8ECF1] sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
          {/* Category pills — wrap on desktop, scroll on mobile */}
          <div className="flex-1 min-w-0 overflow-x-auto sm:overflow-visible no-scrollbar">
            <div className="flex flex-nowrap sm:flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 whitespace-nowrap ${
                    category === cat.value
                      ? "bg-[#0D9488] text-white border-[#0D9488]"
                      : "bg-white text-[#5A6578] border-[#E8ECF1] hover:border-[#0D9488]/40 hover:text-[#0D9488]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          {/* Search */}
          <div className="relative flex-shrink-0 w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896A8]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E8ECF1] rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 text-[#1A2332] placeholder:text-[#8896A8]"
            />
          </div>
        </div>
      </div>

      {/* Article grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8ECF1] overflow-hidden animate-pulse shadow-sm">
                <div className="h-20 sm:h-[120px] bg-[#E8ECF1]" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-24 bg-[#F1F5F9] rounded-full" />
                  <div className="h-5 bg-[#F1F5F9] rounded" />
                  <div className="h-5 w-3/4 bg-[#F1F5F9] rounded" />
                  <div className="h-3 bg-[#F1F5F9] rounded" />
                  <div className="h-3 w-5/6 bg-[#F1F5F9] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-[#8896A8]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No articles found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const config = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;
              const Icon = config.icon;
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white border border-[#E8ECF1] rounded-2xl overflow-hidden
                    hover:border-transparent hover:shadow-2xl hover:shadow-black/8
                    hover:-translate-y-1 hover:scale-[1.015]
                    transition-all duration-300 ease-out"
                >
                  {/* Gradient banner */}
                  <div className={`h-20 sm:h-[120px] ${config.gradient} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
                    <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${config.decorColor} opacity-20`} />
                    <div className={`absolute -left-4 -top-4 w-20 h-20 rounded-full ${config.decorColor} opacity-15`} />
                    <div className={`absolute right-8 top-3 w-8 h-8 rounded-full ${config.decorColor} opacity-10`} />
                    <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white/90 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
                    {/* Category pill overlay */}
                    <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-white/90 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {formatCategory(post.category)}
                    </span>
                  </div>

                  {/* Card body */}
                  <div className="p-5 sm:p-6 flex flex-col flex-1">
                    <h2 className="font-heading text-[15px] font-bold text-[#1A2332] leading-snug mb-3 group-hover:text-[#0D9488] transition-colors duration-200 line-clamp-3 flex-1">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#5A6578] leading-relaxed line-clamp-2 mb-5">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3.5 border-t border-[#E8ECF1] mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-[#8896A8]">
                        <Clock className="w-3.5 h-3.5" />
                        {post.read_time}
                      </div>
                      <span className="text-xs font-semibold text-[#0D9488] flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E8ECF1] bg-white py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#0D9488] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0D9488] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#0D9488] transition-colors">Medical Disclaimer</Link>
            <CookieSettingsLink className="hover:text-[#0D9488] transition-colors cursor-pointer" />
          </div>
          <span>© {new Date().getFullYear()} NutriGenius. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
