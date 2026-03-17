import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  "evidence-review": { bg: "#F0FDFA", accent: "#0D9488", label: "Evidence Review" },
  "myth-busting": { bg: "#FFF7ED", accent: "#F97316", label: "Myth Busting" },
  "safety-alert": { bg: "#FEF2F2", accent: "#EF4444", label: "Safety Alert" },
  "condition-guide": { bg: "#FAF5FF", accent: "#A855F7", label: "Condition Guide" },
  "research-update": { bg: "#EFF6FF", accent: "#3B82F6", label: "Research Update" },
  "deep-dive": { bg: "#FFFBEB", accent: "#F59E0B", label: "Deep Dive" },
};

async function loadFont(weight: 400 | 700): Promise<ArrayBuffer | undefined> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Inter:wght@${weight}&display=swap`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1)" } }
    ).then((r) => r.text());
    const urls = [...css.matchAll(/url\((.+?\.woff2)\)/g)].map((m) => m[1]);
    const url = urls[urls.length - 1];
    if (!url) return undefined;
    return fetch(url).then((r) => r.arrayBuffer());
  } catch {
    return undefined;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let title = "NutriGenius Blog";
  let excerpt = "Evidence-based articles on supplements and nutrition.";
  let category = "deep-dive";

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${slug}&is_published=eq.true&select=title,excerpt,category`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        next: { revalidate: 86400 },
      }
    );
    const posts = await res.json();
    if (posts?.[0]) {
      title = posts[0].title ?? title;
      excerpt = posts[0].excerpt ?? excerpt;
      category = posts[0].category ?? category;
    }
  } catch {
    /* use defaults */
  }

  const colors = CATEGORY_COLORS[category] ?? CATEGORY_COLORS["deep-dive"];

  const [fontRegular, fontBold] = await Promise.all([loadFont(400), loadFont(700)]);
  type OGFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };
  const fonts: OGFont[] = [];
  if (fontRegular) fonts.push({ name: "Inter", data: fontRegular, weight: 400, style: "normal" });
  if (fontBold) fonts.push({ name: "Inter", data: fontBold, weight: 700, style: "normal" });

  const truncTitle = title.length > 72 ? title.slice(0, 72) + "…" : title;
  const truncExcerpt = excerpt.length > 130 ? excerpt.slice(0, 130) + "…" : excerpt;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          background: colors.bg,
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Category accent bar */}
        <div style={{ display: "flex", height: 12, background: colors.accent, width: "100%" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            padding: "52px 80px",
            justifyContent: "space-between",
          }}
        >
          {/* Category badge */}
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                background: colors.accent,
                color: "white",
                borderRadius: 100,
                padding: "8px 22px",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {colors.label}
            </div>
          </div>

          {/* Title + excerpt */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                color: "#1A2332",
                lineHeight: 1.1,
              }}
            >
              {truncTitle}
            </div>
            <div style={{ fontSize: 22, color: "#5A6578", fontWeight: 400, lineHeight: 1.4 }}>
              {truncExcerpt}
            </div>
          </div>

          {/* Footer branding */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  display: "flex",
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: colors.accent,
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                🌿
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#1A2332" }}>NutriGenius</div>
            </div>
            <div style={{ fontSize: 18, color: "#8896A8", fontWeight: 400 }}>
              nutrigenius-iota.vercel.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
