import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clinical Knowledge Hub — Evidence-Based Supplement Science",
  description:
    "Expert articles on evidence-based nutrition, supplement science, drug interactions, and personalized health protocols.",
  alternates: {
    canonical: "https://www.nutrigenius.co/blog",
  },
  openGraph: {
    title: "Clinical Knowledge Hub — Evidence-Based Supplement Science | NutriGenius",
    description:
      "Expert articles on evidence-based nutrition, supplement science, drug interactions, and personalized health protocols.",
    type: "website",
    url: "https://www.nutrigenius.co/blog",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clinical Knowledge Hub | NutriGenius",
    description:
      "Expert articles on evidence-based nutrition, supplement science, drug interactions, and personalized health protocols.",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
