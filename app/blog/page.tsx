"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Search, BookOpen } from "lucide-react";
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

const CATEGORY_STYLES: Record<string, { tag: string; accent: string }> = {
  "evidence-review": { tag: "bg-teal-50 text-teal-700 border-teal-200", accent: "bg-teal-500" },
  "myth-busting": { tag: "bg-orange-50 text-orange-700 border-orange-200", accent: "bg-orange-400" },
  "safety-alert": { tag: "bg-red-50 text-red-700 border-red-200", accent: "bg-red-500" },
  "condition-guide": { tag: "bg-purple-50 text-purple-700 border-purple-200", accent: "bg-purple-500" },
  "research-update": { tag: "bg-blue-50 text-blue-700 border-blue-200", accent: "bg-blue-500" },
  "deep-dive": { tag: "bg-amber-50 text-amber-700 border-amber-200", accent: "bg-amber-500" },
};

function formatCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
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

      {/* Filters */}
      <div className="bg-white border-b border-[#E8ECF1] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8896A8]" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAFC] border border-[#E8ECF1] rounded-xl focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]/20 text-[#1A2332] placeholder:text-[#8896A8]"
              />
            </div>
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
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
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8ECF1] overflow-hidden animate-pulse">
                <div className="h-1.5 bg-[#E8ECF1]" />
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => {
              const style = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES["deep-dive"];
              return (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-white border border-[#E8ECF1] rounded-2xl overflow-hidden hover:border-[#0D9488]/30 hover:shadow-lg hover:shadow-teal-500/5 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`h-1.5 w-full ${style.accent} flex-shrink-0`} />
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`self-start inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-3 ${style.tag}`}>
                      {formatCategory(post.category)}
                    </span>
                    <h2 className="font-heading text-[15px] font-bold text-[#1A2332] leading-snug mb-3 group-hover:text-[#0D9488] transition-colors line-clamp-3 flex-1">
                      {post.title}
                    </h2>
                    <p className="text-sm text-[#5A6578] leading-relaxed line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-[#E8ECF1] mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-[#8896A8]">
                        <Clock className="w-3.5 h-3.5" />
                        {post.read_time}
                      </div>
                      <span className="text-xs font-semibold text-[#0D9488] flex items-center gap-1">
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
    </div>
  );
}
