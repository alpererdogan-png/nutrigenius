"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight, Clock, Search, BookOpen,
  FlaskConical, ShieldAlert, AlertTriangle,
  HeartPulse, TrendingUp, Brain,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdSense } from "@/components/AdSense";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
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

// ─── Category constants ────────────────────────────────────────────────────────

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

// ─── Feed ad unit ──────────────────────────────────────────────────────────────

const FEED_AD_SLOTS = ["5566778899", "6677889900", "7788990011", "8899001122"];

function FeedAd({ index }: { index: number }) {
  const slot = FEED_AD_SLOTS[index % FEED_AD_SLOTS.length];
  return (
    <div className="col-span-full">
      <div className="bg-[#f0f3ff] rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-2">Advertisement</p>
        <AdSense
          slot={slot}
          format="auto"
          responsive
          className="block"
          style={{ minHeight: "90px" }}
        />
      </div>
    </div>
  );
}

// ─── Article card ──────────────────────────────────────────────────────────────

function ArticleCard({ post }: { post: BlogPost }) {
  const config = CATEGORY_CONFIG[post.category] ?? DEFAULT_CONFIG;
  const Icon = config.icon;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm shadow-black/5 ring-1 ring-black/[0.04]
        hover:shadow-xl hover:shadow-black/10 hover:ring-0
        hover:-translate-y-1 hover:scale-[1.015]
        transition-all duration-300 ease-out"
    >
      <div className={`h-20 sm:h-[120px] ${config.gradient} flex items-center justify-center relative overflow-hidden flex-shrink-0`}>
        <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${config.decorColor} opacity-20`} />
        <div className={`absolute -left-4 -top-4 w-20 h-20 rounded-full ${config.decorColor} opacity-15`} />
        <div className={`absolute right-8 top-3 w-8 h-8 rounded-full ${config.decorColor} opacity-10`} />
        <Icon className="w-9 h-9 sm:w-11 sm:h-11 text-white/90 relative z-10 drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
        <span className="absolute bottom-3 left-3 text-[10px] font-semibold text-white/90 bg-black/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
          {formatCategory(post.category)}
        </span>
      </div>
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
}

// ─── Article grid with ad interleaving ─────────────────────────────────────────

function ArticleGrid({ posts }: { posts: BlogPost[] }) {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const chunkSize = isDesktop ? 4 : 3;
  const elements: React.ReactNode[] = [];
  let adIndex = 0;

  for (let i = 0; i < posts.length; i += chunkSize) {
    const chunk = posts.slice(i, i + chunkSize);
    elements.push(
      ...chunk.map((post) => <ArticleCard key={post.id} post={post} />)
    );
    const isLastChunk = i + chunkSize >= posts.length;
    if (!isLastChunk && posts.length > chunkSize) {
      elements.push(<FeedAd key={`ad-${adIndex}`} index={adIndex} />);
      adIndex++;
    }
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {elements}
    </div>
  );
}

// ─── Main client component ─────────────────────────────────────────────────────

export function BlogClient({ posts }: { posts: BlogPost[] }) {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Client-side filtering over server-fetched posts
  const filtered = useMemo(() => {
    let result = posts;
    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }
    return result;
  }, [posts, category, search]);

  return (
    <>
      {/* Sticky filters */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-10 shadow-sm shadow-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="flex-1 min-w-0 overflow-x-auto sm:overflow-visible no-scrollbar">
            <div className="flex flex-nowrap sm:flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap ${
                    category === cat.value
                      ? "bg-[#00685f] text-white"
                      : "bg-[#f0f3ff] text-[#5A6578] hover:bg-[#e6f4f3] hover:text-[#00685f]"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className="relative flex-shrink-0 w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896A8]" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#f0f3ff] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00685f]/20 text-[#1A2332] placeholder:text-[#8896A8]"
            />
          </div>
        </div>
      </div>

      {/* Article grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-[#8896A8]">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">No articles found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <ArticleGrid posts={filtered} />
        )}
      </div>
    </>
  );
}
