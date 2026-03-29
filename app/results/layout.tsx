import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Personalized Protocol — NutriGenius",
  description:
    "Your evidence-based supplement recommendations with optimal doses, timing schedule, and drug interaction safety checks.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Your Personalized Protocol — NutriGenius",
    description:
      "Your evidence-based supplement recommendations with optimal doses, timing schedule, and drug interaction safety checks.",
    type: "website",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Personalized Protocol — NutriGenius",
    description:
      "Your evidence-based supplement recommendations with optimal doses, timing schedule, and drug interaction safety checks.",
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
