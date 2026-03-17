import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Science of Healthy Living",
  description:
    "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
  alternates: {
    canonical: "https://nutrigenius-iota.vercel.app/blog",
  },
  openGraph: {
    title: "The Science of Healthy Living | NutriGenius Blog",
    description:
      "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
    type: "website",
    url: "https://nutrigenius-iota.vercel.app/blog",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Science of Healthy Living | NutriGenius Blog",
    description:
      "Evidence-based articles on supplements, nutrition, and health. Written by clinical pharmacology experts.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
