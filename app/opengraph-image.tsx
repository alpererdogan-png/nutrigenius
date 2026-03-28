import { ImageResponse } from "next/og";

export const alt = "NutriGenius — Free Personalized Supplement Recommendations";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 86400;

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

export default async function Image() {
  const [fontRegular, fontBold] = await Promise.all([loadFont(400), loadFont(700)]);

  type OGFont = { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" };
  const fonts: OGFont[] = [];
  if (fontRegular) fonts.push({ name: "Inter", data: fontRegular, weight: 400, style: "normal" });
  if (fontBold) fonts.push({ name: "Inter", data: fontBold, weight: 700, style: "normal" });

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #00685f 0%, #065F46 100%)",
          padding: "60px 80px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
            }}
          >
            🌿
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: "white" }}>NutriGenius</div>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.15)",
              borderRadius: 100,
              padding: "8px 20px",
              fontSize: 18,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 400,
              alignSelf: "flex-start",
            }}
          >
            Free · Evidence-Based · Clinician-Designed
          </div>

          <div
            style={{
              fontSize: 62,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Personalized Supplement Recommendations
          </div>

          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.7)", fontWeight: 400 }}>
            Drug interaction checks · Evidence ratings · Visual weekly schedule
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
