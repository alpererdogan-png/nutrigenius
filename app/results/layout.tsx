import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Personalized Supplement Plan",
  description:
    "Your evidence-based supplement protocol with doses, timing, drug interaction checks, and a downloadable weekly schedule.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Your Personalized Supplement Plan | NutriGenius",
    description:
      "Your evidence-based supplement protocol with doses, timing, drug interaction checks, and a downloadable weekly schedule.",
    type: "website",
    siteName: "NutriGenius",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Personalized Supplement Plan | NutriGenius",
    description:
      "Your evidence-based supplement protocol with doses, timing, drug interaction checks, and a downloadable weekly schedule.",
  },
};

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
