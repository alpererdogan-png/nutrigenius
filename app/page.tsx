import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { HomeClientHero, HomeClientContent } from "./HomeClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// ─── Blog preview types + config ──────────────────────────────────────────────

interface LandingBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  read_time: string;
}

const BLOG_CATEGORY_PRESET: Record<string, { image: string; tagClass: string }> = {
  "evidence-review": {
    image: "/images/vitamin-macro.jpg",
    tagClass: "bg-teal-50 text-teal-700 border-teal-200",
  },
  "myth-busting": {
    image: "/images/flatlay-supplements.jpg",
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  "safety-alert": {
    image: "/images/hands-capsule.jpg",
    tagClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  "condition-guide": {
    image: "/images/morning-routine.jpg",
    tagClass: "bg-blue-50 text-blue-700 border-blue-200",
  },
  "research-update": {
    image: "/images/lab-science.jpg",
    tagClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  "deep-dive": {
    image: "/images/weekly-organizer.jpg",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const BLOG_FALLBACK_PRESET = {
  image: "/images/capsules-scatter.jpg",
  tagClass: "bg-stone-100 text-stone-700 border-stone-200",
};

function formatBlogCategory(cat: string): string {
  return cat.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "NutriGenius",
  url: "https://www.nutrigenius.co",
  logo: "https://www.nutrigenius.co/icon-512.png",
  description: "AI-powered personalized supplement recommendations backed by clinical evidence",
  parentOrganization: {
    "@type": "Organization",
    name: "Clareo Health",
  },
  sameAs: [],
};

const webSiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "NutriGenius",
  url: "https://www.nutrigenius.co",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.nutrigenius.co/blog?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "NutriGenius",
  url: "https://www.nutrigenius.co",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web",
  description:
    "Free personalized supplement plan backed by science. Drug interaction checks, evidence ratings, and a visual weekly schedule.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does NutriGenius work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "NutriGenius uses a 7-layer algorithm that analyzes your demographics, diet, lifestyle, health conditions, medications, lab results, and genetic variants to generate personalized supplement recommendations. Every recommendation passes through safety checks for drug interactions, dosage limits, and pregnancy safety.",
      },
    },
    {
      "@type": "Question",
      name: "Is NutriGenius free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, NutriGenius is completely free. No account or credit card is required. You get your full personalized supplement protocol with evidence ratings and a visual weekly schedule in about 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "Does NutriGenius check drug interactions?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every supplement recommendation is checked against your current medications for potential interactions. The system flags major, moderate, and minor interactions, and will block or adjust recommendations accordingly to keep you safe.",
      },
    },
    {
      "@type": "Question",
      name: "How long does the assessment take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The health assessment takes about 5 minutes to complete. You'll answer questions about your demographics, diet, lifestyle, health conditions, medications, and optionally provide lab results and genetic data.",
      },
    },
    {
      "@type": "Question",
      name: "Is this medical advice?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. NutriGenius provides educational and informational supplement recommendations only. It is not a medical service and does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before starting any supplement regimen.",
      },
    },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  let blogPosts: LandingBlogPost[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug,title,excerpt,category,read_time")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3);

    if (error) {
      console.error("Landing blog preview:", error.message);
    } else {
      blogPosts = data ?? [];
    }
  } catch (err) {
    console.error("Landing blog preview:", err);
  }

  return (
    <div className="min-h-screen bg-[#f9f7f4] text-[#1A2332]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <HomeClientHero />

      {/* ── Clinical Knowledge Hub — server-rendered for SEO ── */}
      <section className="pt-10 pb-12 sm:pt-12 sm:pb-16 bg-[#f9f7f4]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#bfa785] mb-3">
                Clinical Knowledge Hub
              </p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2c2420] tracking-tight">
                The Science of Healthy Living
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#00685f] hover:text-[#005249] transition-colors"
            >
              Explore All Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {blogPosts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {blogPosts.map((post) => {
                const preset = BLOG_CATEGORY_PRESET[post.category] ?? BLOG_FALLBACK_PRESET;
                return (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden ring-1 ring-[#e5ddd1]/70 hover:-translate-y-0.5 transition-all duration-300"
                    style={{ boxShadow: "0 10px 28px rgba(44,36,32,0.06), 0 2px 6px rgba(44,36,32,0.04)" }}
                  >
                    <div className="relative h-40 sm:h-44 overflow-hidden flex-shrink-0">
                      <Image
                        src={preset.image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 360px"
                        loading="lazy"
                        className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/30 via-transparent to-transparent" />
                      <span className={`absolute bottom-3 left-3 inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border backdrop-blur-sm ${preset.tagClass}`}>
                        {formatBlogCategory(post.category)}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 flex flex-col flex-1">
                      <h3 className="font-heading text-[1.1rem] font-semibold text-[#2c2420] leading-snug mb-2.5 group-hover:text-[#00685f] transition-colors duration-200 line-clamp-3 flex-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-[#5A6578] leading-relaxed line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-[#8b7f6f]">
                          <Clock className="w-3.5 h-3.5" />
                          {post.read_time}
                        </div>
                        <span className="text-xs font-semibold text-[#00685f] group-hover:text-[#005249] flex items-center gap-1 transition-colors">
                          Read <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-[#8896A8] py-12">
              New articles coming soon.
            </p>
          )}
        </div>
      </section>

      <HomeClientContent />
    </div>
  );
}
