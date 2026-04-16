import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { CookieSettingsLink } from "@/components/CookieConsent";
import { createClient } from "@/lib/supabase-server";
import { Logo } from "@/src/components/ui/Logo";
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

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog — NutriGenius | Evidence-Based Supplement Science",
  description:
    "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
  alternates: {
    canonical: "https://www.nutrigenius.co/blog",
  },
};

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

export default async function BlogPage() {
  let posts: BlogPost[] = [];
  let fetchError: string | null = null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id,slug,title,excerpt,category,read_time,author_name,published_at,tags")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    // ── DEBUG: remove after confirming articles render ──
    console.log("[blog/page] data count:", data?.length ?? "null", "error:", JSON.stringify(error));

    if (error) {
      fetchError = error.message;
      console.error("Blog page: Supabase query failed:", error.message, error.code, error.details);
    } else {
      posts = data ?? [];
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : "Unknown error";
    console.error("Blog page: unexpected error:", err);
  }

  if (process.env.NODE_ENV === 'production') {
    console.log('SUPABASE URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL?.slice(0, 30));
  }

  return (
    <div className="min-h-screen bg-[#f9f9ff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />

      {/* ── Top nav ── */}
      <div className="bg-white shadow-sm shadow-black/5">
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
      </div>

      {/* Page header */}
      <div className="bg-[#f0f3ff]">
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
      </div>

      {/* Diagnostic banner — visible on the rendered page */}
      {fetchError ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            <p className="font-semibold">Failed to load articles</p>
            <p className="mt-1 text-rose-600">{fetchError}</p>
          </div>
        </div>
      ) : posts.length === 0 ? (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
            <p className="font-semibold">No articles returned</p>
            <p className="mt-1 text-amber-600">
              Supabase query succeeded but returned 0 rows. Check that blog_posts
              has rows with is_published = true, and that the anon SELECT policy exists.
            </p>
          </div>
        </div>
      ) : null}

      {/* Inline diagnostic render — no client component */}
      <div style={{ padding: "20px" }}>
        <p>Post count: {posts.length}</p>
        {posts.map((post) => (
          <div key={post.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="bg-white py-8 px-4 sm:px-6 mt-12">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[#8896A8]">
          <div className="flex flex-wrap gap-5">
            <Link href="/privacy" className="hover:text-[#00685f] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#00685f] transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-[#00685f] transition-colors">Medical Disclaimer</Link>
            <Link href="/disclosure" className="hover:text-[#00685f] transition-colors">Affiliate Disclosure</Link>
            <Link href="/about" className="hover:text-[#00685f] transition-colors">About</Link>
            <CookieSettingsLink className="hover:text-[#00685f] transition-colors cursor-pointer" />
          </div>
          <div className="w-full text-xs text-[#8896A8] space-y-1">
            <p>Medical Review: <Link href="/about#medical-reviewer" className="text-[#00685f] hover:underline">Dr. Esra Ata, MD</Link></p>
            <p>&copy; {new Date().getFullYear()} NutriGenius. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
