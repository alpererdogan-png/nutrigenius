import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { markdownToHtml, extractTOC } from "@/lib/markdown";

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

type RelatedPost = Pick<BlogPost, "id" | "slug" | "title" | "excerpt" | "category" | "read_time" | "author_name" | "published_at" | "tags">;

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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [related, htmlContent] = await Promise.all([
    getRelatedPosts(post),
    Promise.resolve(markdownToHtml(post.content)),
  ]);

  const toc = extractTOC(post.content);
  const style = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES["deep-dive"];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
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

      {/* Hero */}
      <div className="bg-white border-b border-[#E8ECF1]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border mb-4 ${style.tag}`}>
            {formatCategory(post.category)}
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A2332] leading-tight mb-4 max-w-3xl">
            {post.title}
          </h1>
          <p className="text-[#5A6578] text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
            {post.excerpt}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#5A6578]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                {post.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-[#1A2332] text-xs">{post.author_name}</p>
                <p className="text-[10px] text-[#8896A8]">{post.author_title}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.read_time}
            </div>
          </div>
        </div>
      </div>

      {/* Content layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-10">
          {/* Article body */}
          <article>
            {/* Accent bar */}
            <div className={`h-1 w-16 ${style.accent} rounded-full mb-8`} />

            <div
              className="prose-custom"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-[#E8ECF1]">
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
            <div className="mt-10 p-5 bg-white rounded-2xl border border-[#E8ECF1]">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {post.author_name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-[#1A2332]">{post.author_name}</p>
                  <p className="text-sm text-[#0D9488]">{post.author_title}</p>
                  <p className="text-sm text-[#5A6578] mt-2 leading-relaxed">
                    Our editorial team applies rigorous evidence standards to every article. We cite primary research, systematic reviews, and meta-analyses — never anecdote alone.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-8 p-6 bg-gradient-to-br from-teal-50 to-teal-100/60 rounded-2xl border border-teal-200/60">
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

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
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

              {/* Related */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#E8ECF1] p-5">
                  <p className="text-xs font-semibold text-[#8896A8] uppercase tracking-wider mb-3">
                    Related articles
                  </p>
                  <div className="space-y-3">
                    {related.map((rel) => {
                      const relStyle = CATEGORY_STYLES[rel.category] ?? CATEGORY_STYLES["deep-dive"];
                      return (
                        <Link
                          key={rel.id}
                          href={`/blog/${rel.slug}`}
                          className="block group"
                        >
                          <div className={`h-0.5 w-8 ${relStyle.accent} rounded-full mb-1.5`} />
                          <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#0D9488] transition-colors leading-snug line-clamp-2">
                            {rel.title}
                          </p>
                          <p className="text-xs text-[#8896A8] mt-1">{rel.read_time}</p>
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

      {/* Related posts (mobile) */}
      {related.length > 0 && (
        <div className="lg:hidden max-w-5xl mx-auto px-4 sm:px-6 pb-10">
          <h3 className="font-heading font-bold text-[#1A2332] mb-4">Related articles</h3>
          <div className="space-y-3">
            {related.map((rel) => {
              const relStyle = CATEGORY_STYLES[rel.category] ?? CATEGORY_STYLES["deep-dive"];
              return (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="flex gap-3 bg-white rounded-xl border border-[#E8ECF1] p-4 hover:border-[#0D9488]/30 transition-all group"
                >
                  <div className={`w-1 rounded-full ${relStyle.accent} flex-shrink-0`} />
                  <div>
                    <p className="text-sm font-semibold text-[#1A2332] group-hover:text-[#0D9488] transition-colors leading-snug">
                      {rel.title}
                    </p>
                    <p className="text-xs text-[#8896A8] mt-1">{rel.read_time}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
