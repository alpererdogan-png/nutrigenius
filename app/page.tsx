import { createClient } from "@/lib/supabase-server";
import { HomeClient } from "./HomeClient";
import type { LandingBlogPost } from "./HomeClient";

export default async function Home() {
  let blogPosts: LandingBlogPost[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("slug,title,excerpt,category,read_time")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(6);

    // ── DEBUG: remove after confirming articles render ──
    console.log("[home/page] data count:", data?.length ?? "null", "error:", JSON.stringify(error));

    if (error) {
      console.error("Landing blog preview: Supabase query failed:", error.message, error.code, error.details);
    } else {
      blogPosts = data ?? [];
    }
  } catch (err) {
    console.error("Landing blog preview: unexpected error:", err);
  }

  return <HomeClient blogPosts={blogPosts} />;
}
