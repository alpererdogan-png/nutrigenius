import { createClient } from "@/lib/supabase-server";
import { HomeClient } from "./HomeClient";
import type { LandingBlogPost } from "./HomeClient";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt,category,read_time")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Landing blog preview fetch failed:", error.message);
  }

  const blogPosts: LandingBlogPost[] = data ?? [];

  return <HomeClient blogPosts={blogPosts} />;
}
