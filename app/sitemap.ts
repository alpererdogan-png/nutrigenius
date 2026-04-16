import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabase-admin";

const BASE_URL = "https://www.nutrigenius.co";

// Regenerate at most once per hour; force dynamic so crawlers never get a
// build-time-frozen copy of the post list.
export const revalidate = 3600;
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Service-role client bypasses RLS — same approach used on /blog and the
  // homepage's Clinical Knowledge Hub to guarantee published posts surface.
  let blogEntries: MetadataRoute.Sitemap = [];

  try {
    const { data, error } = await supabaseAdmin
      .from("blog_posts")
      .select("slug, published_at, updated_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (error) {
      console.error("[sitemap] blog_posts fetch failed:", error.message);
    } else if (data) {
      blogEntries = data.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at ?? post.published_at ?? Date.now()),
        changeFrequency: "monthly",
        priority: 0.8,
      }));
    }
  } catch (err) {
    console.error("[sitemap] unexpected error:", err);
  }

  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/quiz`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...blogEntries,
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/methodology`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclaimer`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/disclosure`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
